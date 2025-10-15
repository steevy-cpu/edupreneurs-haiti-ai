import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

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

// Configure web-push with VAPID details
webpush.setVapidDetails(
  'mailto:support@edupreneurs.app',
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

    try {
      // Create the notification payload
      const payload = {
        title: title || 'Nouveau message',
        body: body || 'Vous avez reçu un nouveau message',
        icon: '/logo.png',
        badge: '/logo.png',
        data: {
          url: conversationId ? `/community?conversation=${conversationId}` : '/community',
          conversationId: conversationId
        }
      };

      console.log('📦 Sending notification with web-push library');

      // Use web-push library to send the notification
      const result = await webpush.sendNotification(subscription, JSON.stringify(payload));
      
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
