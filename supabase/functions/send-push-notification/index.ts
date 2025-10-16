import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// VAPID keys - these must match the public key in pushNotifications.ts
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBroV5VGqq84s6cVRwCg';
const VAPID_PRIVATE_KEY = 'bdSiNzUhUP6PHxtS1-7Zne7WMlmBXXSTlsCgSlMkN7c';

// Base64url decode helper
function base64UrlDecode(input: string): Uint8Array {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = input.length % 4 === 0 ? 0 : 4 - (input.length % 4);
  const base64 = input + '='.repeat(padding);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Base64url encode helper
function base64UrlEncode(input: Uint8Array | ArrayBuffer): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate VAPID JWT for authorization
async function generateVAPIDHeaders(endpoint: string): Promise<{ Authorization: string; 'Crypto-Key'?: string }> {
  const urlParts = new URL(endpoint);
  const audience = `${urlParts.protocol}//${urlParts.host}`;
  
  // JWT header
  const jwtHeader = {
    typ: 'JWT',
    alg: 'ES256'
  };
  
  // JWT payload - expires in 12 hours
  const exp = Math.floor(Date.now() / 1000) + (12 * 60 * 60);
  const jwtPayload = {
    aud: audience,
    exp: exp,
    sub: 'mailto:admin@edupreneurs.com'
  };
  
  // Encode header and payload
  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(jwtHeader)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(jwtPayload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  try {
    // Decode the private key (32 bytes for P-256)
    const privateKeyBytes = base64UrlDecode(VAPID_PRIVATE_KEY);
    
    // Decode the public key to extract x and y coordinates
    // Public key format: 0x04 (1 byte) + x (32 bytes) + y (32 bytes)
    const publicKeyBytes = base64UrlDecode(VAPID_PUBLIC_KEY);
    
    // Extract x and y coordinates (skip first byte which is 0x04)
    const x = publicKeyBytes.slice(1, 33);
    const y = publicKeyBytes.slice(33, 65);
    
    // Create JWK for private key
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      d: base64UrlEncode(privateKeyBytes),
      x: base64UrlEncode(x),
      y: base64UrlEncode(y),
      ext: true
    };
    
    const privateKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'ECDSA',
        namedCurve: 'P-256'
      },
      false,
      ['sign']
    );
    
    // Sign the token
    const signature = await crypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' }
      },
      privateKey,
      encoder.encode(unsignedToken)
    );
    
    // Encode signature
    const signatureB64 = base64UrlEncode(signature);
    const jwt = `${unsignedToken}.${signatureB64}`;
    
    return {
      'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`
    };
  } catch (error) {
    console.error('❌ VAPID key import/signing failed:', error);
    throw error;
  }
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { recipientUserId, title, body, conversationId } = await req.json();

    console.log('📤 Sending push notification to user:', recipientUserId);

    // Get user's push subscription
    const { data: subscriptionData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', recipientUserId)
      .single();

    if (subError || !subscriptionData) {
      console.log('❌ No push subscription found for user:', recipientUserId);
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = subscriptionData.subscription as PushSubscription;
    console.log('✅ Found subscription for user:', recipientUserId);
    console.log('📍 Endpoint:', subscription.endpoint.substring(0, 50) + '...');

    // Create the notification payload
    const payload = JSON.stringify({
      title: title || 'Nouveau message',
      body: body || 'Vous avez reçu un nouveau message',
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        url: conversationId ? `/community?conversation=${conversationId}` : '/community',
        conversationId: conversationId
      }
    });

    console.log('📦 Sending notification payload');

    try {
      // Generate VAPID headers for authentication
      const vapidHeaders = await generateVAPIDHeaders(subscription.endpoint);
      console.log('🔐 Generated VAPID auth headers');
      
      // Send using standard fetch with proper headers including VAPID auth
      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TTL': '86400',
          ...vapidHeaders
        },
        body: payload
      });

      if (response.ok) {
        console.log('✅ Push notification sent successfully to:', recipientUserId);
        console.log('📬 Status:', response.status);

        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Notification sent',
            hasSubscription: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.error('❌ Push send failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error details:', errorText);

        // If subscription is invalid, remove it from database
        if (response.status === 404 || response.status === 410) {
          console.log('🗑️ Removing expired subscription');
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', recipientUserId);
          
          return new Response(
            JSON.stringify({ success: false, message: 'Subscription expired and removed' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Failed to send push notification',
            error: `Status ${response.status}: ${errorText}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    } catch (pushError: any) {
      console.error('❌ Error sending push:', pushError);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to send push notification',
          error: pushError instanceof Error ? pushError.message : 'Unknown error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Error sending push notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
