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

// Note: For WNS (Windows Push Notification Service used by Edge on Windows),
// the authentication is embedded in the endpoint URL itself, so we don't need VAPID


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
        // Firebase Cloud Messaging
        console.log('🔥 Using FCM endpoint');
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
        // Generic Web Push - send as JSON
        console.log('🌐 Using generic Web Push endpoint');
        
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
