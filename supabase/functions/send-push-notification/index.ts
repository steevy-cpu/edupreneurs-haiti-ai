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

// Use a proper web-push library via CDN
const webPush = await import("https://cdn.skypack.dev/web-push@3.6.7");

// VAPID keys
const VAPID_PUBLIC_KEY = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
const VAPID_PRIVATE_KEY = 'l8hOAmgFFSaCTcVsqy0D56k5pvTvvMks3M6bbMhGS00';

webPush.setVapidDetails(
  'mailto:admin@edupreneurs.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

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
    const targetUrl = url || (conversationId ? `/community?conversation=${conversationId}` : '/community');

    const payload = JSON.stringify(
      isIOSEndpoint 
        ? {
            aps: {
              alert: { title: title || 'EDUPRENEURS', body: body || 'Notification' },
              sound: 'default'
            },
            url: targetUrl
          }
        : {
            title: title || 'EDUPRENEURS',
            body: body || 'Notification',
            icon: '/logo.png',
            data: { url: targetUrl }
          }
    );

    console.log('📦 Sending:', { title, body, isIOSEndpoint });

    try {
      const options: any = { TTL: 86400 };
      if (isIOSEndpoint) {
        const topic = subscription.endpoint.match(/\/([^\/]+)$/)?.[1];
        options.headers = {
          'apns-push-type': 'alert',
          'apns-priority': '10',
          ...(topic && { 'apns-topic': topic })
        };
      }

      await webPush.sendNotification(subscription, payload, options);
      console.log('✅ Sent successfully');

      return new Response(
        JSON.stringify({ success: true, message: 'Notification sent' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (pushError: any) {
      console.error('❌ Push error:', pushError.statusCode, pushError.body);

      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('user_id', recipientUserId);
        return new Response(
          JSON.stringify({ success: false, message: 'Subscription expired' }),
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
