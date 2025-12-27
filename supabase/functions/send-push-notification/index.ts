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

// VAPID keys - Public key can be in code, private key must be secret
const VAPID_PUBLIC_KEY = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';

// Maximum age for subscriptions (60 days in milliseconds)
const MAX_SUBSCRIPTION_AGE_MS = 60 * 24 * 60 * 60 * 1000;

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
  
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };
  
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60),
    sub: 'mailto:contact@mon-edupreneur.com'
  };
  
  const headerB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;
  
  const publicKeyBuffer = Uint8Array.from(atob(base64UrlToBase64(VAPID_PUBLIC_KEY)), c => c.charCodeAt(0));
  
  const x = uint8ArrayToBase64Url(publicKeyBuffer.slice(1, 33));
  const y = uint8ArrayToBase64Url(publicKeyBuffer.slice(33, 65));
  
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: x,
    y: y,
    d: VAPID_PRIVATE_KEY,
    ext: true,
    key_ops: ['sign']
  };
  
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  const signatureB64 = uint8ArrayToBase64Url(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Notification category mapping helper
function getCategoryFromType(type?: string): string {
  const typeMap: { [key: string]: string } = {
    'message': 'message',
    'group_message': 'message',
    'direct_message': 'message',
    'comment': 'comment',
    'reply': 'comment',
    'like': 'like',
    'share': 'share',
    'new_post': 'post',
    'post': 'post',
    'mention': 'mention',
    'follow_request': 'follow',
    'follow_accepted': 'follow',
    'follow': 'follow',
    'group_invite': 'group',
    'group_deleted': 'group',
    'group_member_added': 'group',
    'group_member_removed': 'group',
    'lesson_comment': 'lesson',
    'system': 'system',
  };
  return typeMap[type || ''] || 'message';
}

// Cleanup old/invalid subscriptions
async function cleanupOldSubscriptions(supabase: any, userId: string): Promise<number> {
  const cutoffDate = new Date(Date.now() - MAX_SUBSCRIPTION_AGE_MS).toISOString();
  
  const { data: oldSubs, error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .lt('last_used_at', cutoffDate)
    .select('id');
  
  if (error) {
    console.error('Error cleaning up old subscriptions:', error);
    return 0;
  }
  
  const count = oldSubs?.length || 0;
  if (count > 0) {
    console.log(`🧹 Cleaned up ${count} old subscriptions for user ${userId}`);
  }
  
  return count;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!VAPID_PRIVATE_KEY) {
    console.error('❌ VAPID_PRIVATE_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'Push notification service not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { recipientUserId, title, body, conversationId, url, notificationId, type, entityId, actorId } = await req.json();

    if (!recipientUserId) {
      return new Response(
        JSON.stringify({ error: 'recipientUserId is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cleanup old subscriptions first
    await cleanupOldSubscriptions(supabase, recipientUserId);

    // Get actor profile for better notification messages
    let actorName = 'Quelqu\'un';
    if (actorId) {
      const { data: actorProfile } = await supabase
        .from('profiles')
        .select('nickname, full_name')
        .eq('user_id', actorId)
        .single();
      
      if (actorProfile) {
        actorName = actorProfile.nickname || actorProfile.full_name;
      }
    }

    // Check user's notification preferences
    const category = getCategoryFromType(type);
    const { data: prefData } = await supabase
      .from('notification_preferences')
      .select('enabled')
      .eq('user_id', recipientUserId)
      .eq('category', category)
      .single();

    if (prefData && !prefData.enabled) {
      console.log(`⏭️ User ${recipientUserId} has disabled ${category} notifications`);
      return new Response(
        JSON.stringify({ success: false, message: 'User has disabled this notification category', skipped: true }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get all user's push subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', recipientUserId);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`⏭️ No push subscriptions found for user ${recipientUserId}`);
      return new Response(
        JSON.stringify({ success: true, message: 'No push subscription found', skipped: true }), 
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Sending push to ${subscriptions.length} device(s) for user ${recipientUserId}`);

    // Build notification payload
    const tag = entityId ? `${category}:${entityId}` : `notif-${Date.now()}`;
    
    let notificationBody = body;
    if (!body && type) {
      switch (type) {
        case 'like':
          notificationBody = `${actorName} a aimé votre publication`;
          break;
        case 'comment':
          notificationBody = `${actorName} a commenté votre publication`;
          break;
        case 'share':
          notificationBody = `${actorName} a partagé votre publication`;
          break;
        case 'message':
        case 'group_message':
          notificationBody = `Nouveau message de ${actorName}`;
          break;
        case 'follow_request':
        case 'follow':
          notificationBody = `${actorName} souhaite vous suivre`;
          break;
        case 'follow_accepted':
          notificationBody = `${actorName} a accepté votre demande de suivi`;
          break;
        case 'new_post':
        case 'post':
          notificationBody = `${actorName} a publié quelque chose`;
          break;
        default:
          notificationBody = body || 'Nouvelle notification';
      }
    }
    
    const notificationPayload = {
      title: title || 'EDUPRENEURS',
      body: notificationBody,
      icon: '/logo.png',
      badge: '/logo.png',
      tag,
      renotify: true,
      requireInteraction: false,
      timestamp: Date.now(),
      data: {
        notificationId: notificationId || null,
        url: url || '/notifications',
        entityId: entityId || null,
        category,
        conversationId: conversationId || null
      },
      actions: [
        { action: 'open', title: '📱 Ouvrir' },
        { action: 'mark_read', title: '✓ Lu' }
      ]
    };

    const results = await Promise.all(subscriptions.map(async (subData) => {
      const subscription = subData.subscription as PushSubscription;

      try {
        const endpoint = subscription.endpoint;
        const vapidToken = await createVapidAuthToken(endpoint);

        const pushResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`,
            'TTL': '86400',
          },
          body: JSON.stringify(notificationPayload),
        });

        if (pushResponse.ok) {
          // Update last_used_at for successful delivery
          await supabase
            .from('push_subscriptions')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', subData.id);
          
          console.log(`✅ Push sent to device ${subData.device_id || 'unknown'}`);
          return { success: true, deviceId: subData.device_id };
        } else {
          const status = pushResponse.status;
          console.error(`❌ Push failed for device ${subData.device_id}: status ${status}`);
          
          // Delete expired/invalid subscriptions
          if (status === 404 || status === 410) {
            console.log(`🗑️ Removing expired subscription ${subData.id}`);
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', subData.id);
          }
          
          return { success: false, deviceId: subData.device_id, error: `Status: ${status}` };
        }
      } catch (error: any) {
        console.error(`❌ Push error for device ${subData.device_id}:`, error.message);
        return { success: false, deviceId: subData.device_id, error: error.message };
      }
    }));

    const successCount = results.filter(r => r.success).length;
    const failedCount = results.length - successCount;

    console.log(`📊 Push results: ${successCount}/${results.length} successful`);
    
    if (failedCount > 0) {
      console.log(`⚠️ ${failedCount} device(s) failed to receive notification`);
    }

    return new Response(
      JSON.stringify({ 
        success: successCount > 0, 
        successCount, 
        totalDevices: results.length, 
        results 
      }), 
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
