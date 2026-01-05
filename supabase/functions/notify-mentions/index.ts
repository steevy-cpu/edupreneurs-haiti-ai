import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the actor
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the user from the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const actorId = user.id;
    console.log('✅ Actor ID from JWT:', actorId);

    const { postId, content, url = '/feed' } = await req.json();
    console.log('📝 Processing mentions for post:', postId);
    console.log('📝 Content:', content?.substring(0, 100));

    if (!postId || !content) {
      return new Response(JSON.stringify({ error: 'Missing postId or content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract @mentions from content
    const mentionRegex = /@(\w+)/g;
    const matches = content.matchAll(mentionRegex);
    const nicknames = [...new Set([...matches].map(m => m[1]))];
    
    console.log('🔍 Extracted nicknames:', nicknames);

    if (nicknames.length === 0) {
      console.log('ℹ️ No mentions found in content');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No mentions found',
        notificationsCreated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Resolve nicknames to user_ids (case-insensitive)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, nickname')
      .in('nickname', nicknames.map(n => n.toLowerCase()));

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return new Response(JSON.stringify({ error: 'Failed to resolve nicknames' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Also try exact case match
    const { data: profilesExact } = await supabase
      .from('profiles')
      .select('user_id, nickname')
      .in('nickname', nicknames);

    // Combine both results (deduplicated)
    const allProfiles = [...(profiles || []), ...(profilesExact || [])];
    const uniqueProfiles = allProfiles.reduce((acc, p) => {
      if (!acc.find(x => x.user_id === p.user_id)) {
        acc.push(p);
      }
      return acc;
    }, [] as typeof allProfiles);

    console.log('👥 Resolved profiles:', uniqueProfiles.map(p => ({ nickname: p.nickname, user_id: p.user_id })));

    if (uniqueProfiles.length === 0) {
      console.log('⚠️ No profiles found for nicknames:', nicknames);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No matching users found',
        notificationsCreated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notifications for each mentioned user (except self)
    const notificationsToCreate = uniqueProfiles
      .filter(p => p.user_id !== actorId)
      .map(p => ({
        user_id: p.user_id,
        actor_id: actorId,
        post_id: postId,
        type: 'mention',
        content: content.substring(0, 100),
        read: false,
      }));

    console.log('📬 Creating notifications:', notificationsToCreate.length);

    if (notificationsToCreate.length === 0) {
      console.log('ℹ️ No notifications to create (user mentioned themselves)');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No notifications needed',
        notificationsCreated: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert notifications
    const { data: createdNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(notificationsToCreate)
      .select('id, user_id');

    if (insertError) {
      console.error('❌ Error inserting notifications:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create notifications' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Created notifications:', createdNotifications?.length);

    // Send push notifications for each mention
    const pushResults = [];
    for (const notification of createdNotifications || []) {
      try {
        console.log(`📱 Sending push to user ${notification.user_id}...`);
        
        const { data: pushData, error: pushError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            recipientUserId: notification.user_id,
            actorId: actorId,
            type: 'mention',
            entityId: postId,
            url: url,
            notificationId: notification.id,
          }
        });

        if (pushError) {
          console.error(`❌ Push error for ${notification.user_id}:`, pushError);
          pushResults.push({ userId: notification.user_id, success: false, error: pushError.message });
        } else {
          console.log(`✅ Push sent to ${notification.user_id}:`, pushData);
          pushResults.push({ userId: notification.user_id, success: true });
        }
      } catch (err) {
        console.error(`❌ Push exception for ${notification.user_id}:`, err);
        pushResults.push({ userId: notification.user_id, success: false, error: String(err) });
      }
    }

    console.log('📊 Push results:', pushResults);

    return new Response(JSON.stringify({ 
      success: true,
      notificationsCreated: createdNotifications?.length || 0,
      pushResults,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Unexpected error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
