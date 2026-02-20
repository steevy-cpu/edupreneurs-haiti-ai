import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { 
  secureJsonResponse, 
  secureErrorResponse, 
  corsPreflightResponse 
} from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "../_shared/rateLimiter.ts";

// Input validation schema
const notificationSchema = z.object({
  notificationId: z.string().uuid("Invalid notification ID format")
}).strict();

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      supabase,
      RATE_LIMITS.GENERAL,
      userId,
      clientIp
    );

    if (!rateLimitResult.allowed) {
      console.warn('[mark-notification-read] Rate limit exceeded');
      return secureErrorResponse('Too many requests. Please try again later.', 429);
    }

    // Parse and validate input
    const body = await req.json();
    const validation = notificationSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.error('[mark-notification-read] Validation failed:', errors);
      return secureErrorResponse('Invalid input', 400, errors);
    }

    const { notificationId } = validation.data;

    // Require authentication — prevent anonymous access
    if (!userId) {
      console.warn('[mark-notification-read] Unauthenticated request');
      return secureErrorResponse('Authentication required', 401);
    }

    // Ownership check — verify the notification belongs to this user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', notificationId)
      .maybeSingle();

    if (fetchError) {
      console.error('[mark-notification-read] Fetch error:', fetchError);
      return secureErrorResponse(fetchError.message, 500);
    }

    if (!notification) {
      return secureErrorResponse('Notification not found', 404);
    }

    if (notification.user_id !== userId) {
      console.warn('[mark-notification-read] Ownership mismatch:', { notificationId, userId });
      return secureErrorResponse('Forbidden', 403);
    }

    // Update notification — ownership verified
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('[mark-notification-read] Database error:', error);
      return secureErrorResponse(error.message, 500);
    }

    return secureJsonResponse({ success: true });
  } catch (error: any) {
    console.error('[mark-notification-read] Error:', error);
    return secureErrorResponse(error.message || 'Internal server error', 500);
  }
});
