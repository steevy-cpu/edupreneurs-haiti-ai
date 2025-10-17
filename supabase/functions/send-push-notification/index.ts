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

// Use dynamic import for web-push
let webpush: any;
try {
  webpush = await import('https://esm.sh/web-push@3.6.7');
  webpush.default.setVapidDetails(
    'mailto:admin@edupreneurs.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (e) {
  console.error('Failed to load web-push:', e);
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
    const targetUrl = url || (conversationId ? `/community?conversation=${conversationId}` : '/notifications');

    const payload = JSON.stringify({
      title: title || 'EDUPRENEURS',
      body: body || 'Notification',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `notif-${Date.now()}`,
      data: { url: targetUrl, conversationId, timestamp: Date.now() }
    });

    console.log('📦 Sending push to:', { title, body, endpoint: subscription.endpoint });

    try {
      // Send using web-push library
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        }
      };

      if (webpush && webpush.default) {
        await webpush.default.sendNotification(pushSubscription, payload);
      } else {
        throw new Error('Web push library not available');
      }

      console.log('✅ Push notification sent successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Notification sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (pushError: any) {
      console.error('❌ Push error:', pushError);

      // Handle expired subscriptions
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        console.log('🗑️ Subscription expired, deleting...');
        await supabase.from('push_subscriptions').delete().eq('user_id', recipientUserId);
        return new Response(
          JSON.stringify({ success: false, message: 'Subscription expired and deleted' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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
