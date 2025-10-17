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

// VAPID keys
const VAPID_PUBLIC_KEY = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
const VAPID_PRIVATE_KEY = 'l8hOAmgFFSaCTcVsqy0D56k5pvTvvMks3M6bbMhGS00';

// Helper to convert base64url to base64
function base64UrlToBase64(base64url: string): string {
  return base64url.replace(/-/g, '+').replace(/_/g, '/');
}

// Helper to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to convert Uint8Array to base64url
function uint8ArrayToBase64Url(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Create VAPID JWT token
async function createVapidAuthToken(endpoint: string): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  // JWT header
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };
  
  // JWT payload
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hours
    sub: 'mailto:admin@edupreneurs.com'
  };
  
  // Encode header and payload
  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  // Convert VAPID keys to JWK format for ES256 signing
  // VAPID public key is 65 bytes: 0x04 + X (32 bytes) + Y (32 bytes)
  const publicKeyBytes = base64ToUint8Array(base64UrlToBase64(VAPID_PUBLIC_KEY));
  const x = uint8ArrayToBase64Url(publicKeyBytes.slice(1, 33));
  const y = uint8ArrayToBase64Url(publicKeyBytes.slice(33, 65));
  const d = VAPID_PRIVATE_KEY; // Already in base64url format
  
  // Create JWK for the private key
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: x,
    y: y,
    d: d,
    ext: true,
    key_ops: ['sign']
  };
  
  // Import private key as JWK
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
    new TextEncoder().encode(unsignedToken)
  );
  
  // Create the complete JWT
  const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Send push notification
async function sendPushNotification(
  subscription: PushSubscription,
  payload: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    // Create VAPID auth token
    const vapidToken = await createVapidAuthToken(subscription.endpoint);
    
    // Send push notification
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`,
        'TTL': '86400',
      },
      body: payload,
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Push failed with status ${response.status}:`, errorText);
      return { 
        success: false, 
        status: response.status,
        error: errorText
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Exception sending push:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
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

    const { recipientUserId, title, body, conversationId, url } = await req.json();

    console.log('📤 Attempting to send push notification to:', recipientUserId);

    // Fetch subscription
    const { data: subscriptionData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', recipientUserId)
      .single();

    if (subError || !subscriptionData) {
      console.log('❌ No subscription found');
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = subscriptionData.subscription as PushSubscription;
    const targetUrl = url || (conversationId ? `/community?conversation=${conversationId}` : '/notifications');

    // Create payload
    const payload = JSON.stringify({
      title: title || 'EDUPRENEURS',
      body: body || 'New notification',
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: targetUrl, conversationId, timestamp: Date.now() }
    });

    console.log('📦 Sending to endpoint:', subscription.endpoint.substring(0, 60) + '...');

    // Send notification
    const result = await sendPushNotification(subscription, payload);

    if (!result.success) {
      // Remove expired subscriptions
      if (result.status === 404 || result.status === 410) {
        console.log('🗑️ Removing expired subscription');
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', recipientUserId);
      }
      
      return new Response(
        JSON.stringify({ success: false, message: result.error || 'Send failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Notification sent successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
