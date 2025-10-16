import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

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
const VAPID_PUBLIC_KEY = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
const VAPID_PRIVATE_KEY = 'l8hOAmgFFSaCTcVsqy0D56k5pvTvvMks3M6bbMhGS00';

// Configure web-push with VAPID details
webpush.setVapidDetails(
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
      // Send push notification using web-push library
      const result = await webpush.sendNotification(subscription, payload);
      
      console.log('✅ Push notification sent successfully to:', recipientUserId);
      console.log('📬 Status:', result.statusCode);

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Notification sent',
          hasSubscription: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (pushError: any) {
      console.error('❌ Error sending push:', pushError);
      console.error('Error details:', pushError.body);
      
      // If subscription is invalid, remove it from database
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
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
          error: pushError.message || 'Unknown error',
          statusCode: pushError.statusCode
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
