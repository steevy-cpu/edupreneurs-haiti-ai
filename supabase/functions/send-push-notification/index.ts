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

// Helper to convert base64url to Uint8Array
function base64UrlToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Helper to convert Uint8Array to base64url
function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...Array.from(uint8Array)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Create VAPID Authorization header
async function createVapidAuthHeader(endpoint: string): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  const vapidHeaders = {
    typ: 'JWT',
    alg: 'ES256'
  };
  
  const vapidPayload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hours
    sub: 'mailto:admin@edupreneurs.com'
  };
  
  const encoder = new TextEncoder();
  const headerBase64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(vapidHeaders)));
  const payloadBase64 = uint8ArrayToBase64Url(encoder.encode(JSON.stringify(vapidPayload)));
  const unsignedToken = `${headerBase64}.${payloadBase64}`;
  
  // Convert VAPID keys to JWK format for Web Crypto API
  const publicKeyBytes = base64UrlToUint8Array(VAPID_PUBLIC_KEY);
  // Public key format: 0x04 (1 byte) + x (32 bytes) + y (32 bytes)
  const x = uint8ArrayToBase64Url(publicKeyBytes.slice(1, 33));
  const y = uint8ArrayToBase64Url(publicKeyBytes.slice(33, 65));
  const d = VAPID_PRIVATE_KEY;
  
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: x,
    y: y,
    d: d,
    ext: true
  };
  
  // Import private key as JWK
  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
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
  
  const signatureBase64 = uint8ArrayToBase64Url(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureBase64}`;
  
  return `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { recipientUserId, title, body, conversationId, url, notificationId } = await req.json();

    console.log('📤 Sending push notification to user:', recipientUserId);

    const { data: subscriptionData, error: subError } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', recipientUserId)
      .single();

    if (subError || !subscriptionData) {
      console.log('❌ No push subscription found');
      return new Response(
        JSON.stringify({ success: false, message: 'No subscription found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = subscriptionData.subscription as PushSubscription;
    const isIOSEndpoint = subscription.endpoint.includes('web.push.apple.com');
    const targetUrl = url || (conversationId ? `/community?conversation=${conversationId}` : '/notifications');

    const payload = JSON.stringify(
      isIOSEndpoint 
        ? {
            aps: {
              alert: { title: title || 'EDUPRENEURS', body: body || 'Notification' },
              sound: 'default'
            },
            url: targetUrl,
            conversationId,
            timestamp: Date.now()
          }
        : {
            title: title || 'EDUPRENEURS',
            body: body || 'Notification',
            icon: '/logo.png',
            badge: '/logo.png',
            tag: `notif-${Date.now()}`,
            data: { url: targetUrl, conversationId, timestamp: Date.now() }
          }
    );

    console.log('📦 Sending:', { title, body, isIOSEndpoint, endpoint: subscription.endpoint });

    try {
      // Create VAPID auth header
      const vapidAuth = await createVapidAuthHeader(subscription.endpoint);

      const headers: Record<string, string> = {
        'Authorization': vapidAuth,
        'Content-Type': 'application/json',
        'TTL': '86400',
      };

      if (isIOSEndpoint) {
        const topic = subscription.endpoint.match(/\/([^\/]+)$/)?.[1];
        headers['apns-push-type'] = 'alert';
        headers['apns-priority'] = '10';
        if (topic) headers['apns-topic'] = topic;
      }

      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers,
        body: payload,
      });

      if (response.ok || response.status === 201) {
        console.log('✅ Sent successfully');
        return new Response(
          JSON.stringify({ success: true, message: 'Notification sent' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const responseText = await response.text();
      console.error('❌ Push error:', response.status, responseText);

      if (response.status === 404 || response.status === 410) {
        console.log('🗑️ Subscription expired, deleting...');
        await supabase.from('push_subscriptions').delete().eq('user_id', recipientUserId);
        return new Response(
          JSON.stringify({ success: false, message: 'Subscription expired and deleted' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Push notification failed: ${response.status} - ${responseText}`);
    } catch (pushError: any) {
      console.error('❌ Push exception:', pushError.message);
      throw pushError;
    }
  } catch (error: any) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
