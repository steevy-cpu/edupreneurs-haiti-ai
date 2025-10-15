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

// Helper to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  const b64 = (base64 + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(b64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Generate VAPID JWT for Web Push authentication
async function generateVAPIDJWT(audience: string): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 43200, // 12 hours
    sub: 'mailto:support@edupreneurs.app'
  };

  // Base64url encode header and payload
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import VAPID private key
  const privateKeyBytes = base64ToUint8Array(VAPID_PRIVATE_KEY);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    privateKeyBytes.buffer as ArrayBuffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  // Convert signature to base64url
  const signatureArray = new Uint8Array(signature);
  const signatureB64 = btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signatureB64}`;
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

    try {
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

      console.log('📦 Payload:', payload);

      // Determine the push service type
      const endpoint = subscription.endpoint;
      let response;

      if (endpoint.includes('fcm.googleapis.com')) {
        // Firebase Cloud Messaging (Chrome, Android)
        console.log('🔥 Using FCM endpoint (Chrome browser)');
        
        const url = new URL(endpoint);
        const audience = `${url.protocol}//${url.host}`;
        const jwt = await generateVAPIDJWT(audience);
        const vapidKey = VAPID_PUBLIC_KEY.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        
        console.log('🔑 Generated VAPID JWT for FCM');
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `vapid t=${jwt}, k=${vapidKey}`,
            'Content-Type': 'application/octet-stream',
            'TTL': '86400'
          },
          body: payload
        });
      } else if (endpoint.includes('notify.windows.com')) {
        // Windows Push Notification Service (Edge on Windows)
        console.log('🪟 Using WNS endpoint (Edge browser)');
        
        // WNS requires different format
        const wnsPayload = `<?xml version="1.0" encoding="utf-8"?>
<toast>
    <visual>
        <binding template="ToastText02">
            <text id="1">${title || 'Nouveau message'}</text>
            <text id="2">${body || 'Vous avez reçu un nouveau message'}</text>
        </binding>
    </visual>
</toast>`;

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/xml',
            'X-WNS-Type': 'wns/toast',
            'X-WNS-RequestForStatus': 'true'
          },
          body: wnsPayload
        });
      } else {
        // Generic Web Push with VAPID
        console.log('🌐 Using generic Web Push endpoint with VAPID');
        
        const url = new URL(endpoint);
        const audience = `${url.protocol}//${url.host}`;
        const jwt = await generateVAPIDJWT(audience);
        const vapidKey = VAPID_PUBLIC_KEY.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `vapid t=${jwt}, k=${vapidKey}`,
            'Content-Type': 'application/octet-stream',
            'TTL': '86400'
          },
          body: payload
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Push service error:', response.status, errorText);
        
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
            message: 'Push service error',
            details: errorText,
            status: response.status 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }

      console.log('✅ Push notification sent successfully to:', recipientUserId);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Notification sent',
          hasSubscription: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (pushError) {
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
