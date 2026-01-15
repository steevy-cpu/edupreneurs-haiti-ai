/**
 * Send Announcement - Batch Push Notification Sender
 * 
 * Sends targeted push notifications to users based on announcement criteria.
 * Supports targeting: all users, specific grades, or verified users only.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, corsPreflightResponse, secureJsonResponse, secureErrorResponse } from "../_shared/securityHeaders.ts";

// VAPID keys
const VAPID_PUBLIC_KEY = 'BOQ0Fn35WtOTVFKRkrQRxYzb9oRwi2IldpPeSU3VHbHLoiNwheYEpklA2YVBh3Ah3h2De8743ShfRYx61lVhNUM';
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') || '';

// Helper functions for VAPID
function base64UrlToBase64(base64url: string): string {
  return base64url.replace(/-/g, '+').replace(/_/g, '/');
}

function uint8ArrayToBase64Url(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function createVapidAuthToken(endpoint: string): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  const header = { typ: 'JWT', alg: 'ES256' };
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
    x, y,
    d: VAPID_PRIVATE_KEY,
    ext: true,
    key_ops: ['sign']
  };
  
  const privateKey = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );
  
  return `${unsignedToken}.${uint8ArrayToBase64Url(new Uint8Array(signature))}`;
}

interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  if (!VAPID_PRIVATE_KEY) {
    console.error('❌ VAPID_PRIVATE_KEY not configured');
    return secureErrorResponse('Push notification service not configured', 500);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return secureErrorResponse('Authentication required', 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return secureErrorResponse('Invalid authentication', 401);
    }

    // Check if user is a founder
    const { data: isFounder } = await supabase.rpc('is_founder', { check_user_id: user.id });
    if (!isFounder) {
      return secureErrorResponse('Only founders can send announcements', 403);
    }

    const { announcementId } = await req.json();
    
    if (!announcementId) {
      return secureErrorResponse('Announcement ID is required', 400);
    }

    // Fetch announcement details
    const { data: announcement, error: fetchError } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', announcementId)
      .single();

    if (fetchError || !announcement) {
      console.error('Error fetching announcement:', fetchError);
      return secureErrorResponse('Announcement not found', 404);
    }

    // Check if already sent
    if (announcement.status === 'sent') {
      return secureJsonResponse({ success: false, message: 'Announcement already sent' });
    }

    // Update status to sending
    await supabase
      .from('announcements')
      .update({ status: 'sending' })
      .eq('id', announcementId);

    console.log(`📢 Sending announcement: ${announcement.title}`);
    console.log(`   Target: ${announcement.target_type}, Grades: ${announcement.target_grades?.join(', ') || 'N/A'}`);

    // Step 1: Get ALL target user IDs (for in-app notifications)
    let allTargetUserIds: string[] = [];

    if (announcement.target_type === 'all') {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id');
      allTargetUserIds = profiles?.map(p => p.user_id) || [];
    } else if (announcement.target_type === 'grade' && announcement.target_grades?.length) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id')
        .in('academic_grade', announcement.target_grades);
      allTargetUserIds = profiles?.map(p => p.user_id) || [];
    } else if (announcement.target_type === 'verified') {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('verified', true);
      allTargetUserIds = profiles?.map(p => p.user_id) || [];
    }

    // Remove duplicates and exclude the sender
    allTargetUserIds = [...new Set(allTargetUserIds)].filter(id => id !== user.id);
    
    console.log(`📊 Found ${allTargetUserIds.length} total target users`);

    if (allTargetUserIds.length === 0) {
      await supabase
        .from('announcements')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          recipients_count: 0,
          success_count: 0
        })
        .eq('id', announcementId);

      return secureJsonResponse({ success: true, message: 'No recipients found', successCount: 0, totalCount: 0 });
    }

    // Step 2: Create in-app notifications for ALL target users
    console.log(`📝 Creating ${allTargetUserIds.length} in-app notifications...`);

    // Truncate content to prevent UI overflow (max ~200 chars)
    const truncatedContent = announcement.message.length > 180 
      ? `📢 ${announcement.title}: ${announcement.message.substring(0, 150)}...`
      : `📢 ${announcement.title}: ${announcement.message}`;

    const notificationRecords = allTargetUserIds.map(userId => ({
      user_id: userId,
      actor_id: user.id,
      type: 'announcement',
      content: truncatedContent,
      post_id: null,
      read: false
    }));

    // Batch insert notifications (500 at a time)
    const NOTIFICATION_BATCH_SIZE = 500;
    let notifInsertCount = 0;

    for (let i = 0; i < notificationRecords.length; i += NOTIFICATION_BATCH_SIZE) {
      const batch = notificationRecords.slice(i, i + NOTIFICATION_BATCH_SIZE);
      
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(batch);
      
      if (insertError) {
        console.error('Error inserting notification batch:', insertError);
      } else {
        notifInsertCount += batch.length;
      }
    }

    console.log(`✅ Created ${notifInsertCount} in-app notifications`);

    // Step 3: Get push subscriptions for target users
    const { data: allSubscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', allTargetUserIds);

    const subscriptions = allSubscriptions || [];
    console.log(`📱 Total subscriptions to send: ${subscriptions.length}`);

    // Build notification payload
    const notificationPayload = {
      title: announcement.title,
      body: announcement.message,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: `announcement:${announcementId}`,
      renotify: true,
      requireInteraction: false,
      timestamp: Date.now(),
      data: {
        url: '/notifications',
        announcementId,
        category: 'announcement'
      },
      actions: [
        { action: 'open', title: '📱 Ouvrir' }
      ]
    };

    // Send in batches
    const BATCH_SIZE = 10;
    const BATCH_DELAY_MS = 100;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < subscriptions.length; i += BATCH_SIZE) {
      const batch = subscriptions.slice(i, i + BATCH_SIZE);
      
      const results = await Promise.all(batch.map(async (subData) => {
        const subscription = subData.subscription as PushSubscription;
        
        try {
          const vapidToken = await createVapidAuthToken(subscription.endpoint);
          
          const pushResponse = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8',
              'Authorization': `vapid t=${vapidToken}, k=${VAPID_PUBLIC_KEY}`,
              'TTL': '86400',
            },
            body: JSON.stringify(notificationPayload),
          });

          if (pushResponse.ok) {
            return { success: true };
          } else {
            const status = pushResponse.status;
            
            // Remove invalid subscriptions
            if (status === 404 || status === 410) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', subData.id);
            }
            
            return { success: false };
          }
        } catch (error) {
          console.error(`Push error:`, error);
          return { success: false };
        }
      }));

      successCount += results.filter(r => r.success).length;
      failedCount += results.filter(r => !r.success).length;

      // Delay between batches
      if (i + BATCH_SIZE < subscriptions.length) {
        await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    console.log(`✅ Announcement sent: ${successCount}/${subscriptions.length} successful`);

    // Update announcement with results
    // recipients_count = total in-app notifications, success_count = push successes
    await supabase
      .from('announcements')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString(),
        recipients_count: allTargetUserIds.length,
        success_count: successCount
      })
      .eq('id', announcementId);

    return secureJsonResponse({
      success: true,
      successCount,
      failedCount,
      totalCount: subscriptions.length
    });

  } catch (error: any) {
    console.error('❌ Function error:', error);
    return secureErrorResponse('An error occurred', 500);
  }
});
