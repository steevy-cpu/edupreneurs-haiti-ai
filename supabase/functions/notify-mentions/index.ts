import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { 
  secureJsonResponse, 
  secureErrorResponse, 
  corsPreflightResponse 
} from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "../_shared/rateLimiter.ts";

// Input validation schema
const mentionsSchema = z.object({
  postId: z.string().uuid("Invalid post ID"),
  content: z.string().min(1).max(10000),
  url: z.string().max(500).optional().default('/feed')
}).strict();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the actor
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return secureErrorResponse('Unauthorized', 401);
    }

    // Get the user from the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return secureErrorResponse('Invalid token', 401);
    }

    const actorId = user.id;
    console.log('✅ Actor ID from JWT:', actorId);

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      supabase,
      RATE_LIMITS.GENERAL,
      actorId,
      clientIp
    );

    if (!rateLimitResult.allowed) {
      console.warn('[notify-mentions] Rate limit exceeded for user:', actorId);
      return secureErrorResponse('Too many requests. Please try again later.', 429);
    }

    // Parse and validate input
    const body = await req.json();
    const validation = mentionsSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.error('[notify-mentions] Validation failed:', errors);
      return secureErrorResponse('Invalid input', 400, errors);
    }

    const { postId, content, url } = validation.data;
    console.log('📝 Processing mentions for post:', postId);

    // Extract @mentions from content
    const mentionRegex = /@(\w+)/g;
    const matches = content.matchAll(mentionRegex);
    const nicknames = [...new Set([...matches].map(m => m[1]))];
    
    console.log('🔍 Extracted nicknames:', nicknames);

    if (nicknames.length === 0) {
      console.log('ℹ️ No mentions found in content');
      return secureJsonResponse({ 
        success: true, 
        message: 'No mentions found',
        notificationsCreated: 0 
      });
    }

    // Resolve nicknames to user_ids using case-insensitive ILIKE
    const allProfiles: { user_id: string; nickname: string }[] = [];
    for (const nickname of nicknames) {
      const { data: matchingProfiles, error } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .ilike('nickname', nickname);
      
      if (error) {
        console.error(`❌ Error fetching profile for ${nickname}:`, error);
        continue;
      }
      
      if (matchingProfiles && matchingProfiles.length > 0) {
        allProfiles.push(...matchingProfiles);
      }
    }

    // Deduplicate by user_id
    const uniqueProfiles = allProfiles.reduce((acc, p) => {
      if (!acc.find(x => x.user_id === p.user_id)) {
        acc.push(p);
      }
      return acc;
    }, [] as typeof allProfiles);

    console.log('👥 Resolved profiles:', uniqueProfiles.map(p => ({ nickname: p.nickname, user_id: p.user_id })));

    if (uniqueProfiles.length === 0) {
      console.log('⚠️ No profiles found for nicknames:', nicknames);
      return secureJsonResponse({ 
        success: true, 
        message: 'No matching users found',
        notificationsCreated: 0 
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
      return secureJsonResponse({ 
        success: true, 
        message: 'No notifications needed',
        notificationsCreated: 0 
      });
    }

    // Insert notifications
    const { data: createdNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(notificationsToCreate)
      .select('id, user_id');

    if (insertError) {
      console.error('❌ Error inserting notifications:', insertError);
      return secureErrorResponse('Failed to create notifications', 500);
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

    return secureJsonResponse({ 
      success: true,
      notificationsCreated: createdNotifications?.length || 0,
      pushResults,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Unexpected error:', errorMessage);
    return secureErrorResponse(errorMessage, 500);
  }
});
