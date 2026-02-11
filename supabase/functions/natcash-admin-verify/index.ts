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
const adminVerifySchema = z.object({
  orderId: z.string().min(1).max(100),
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(1000).optional()
}).strict();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    console.log('[NatCash Admin Verify] Starting verification...');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[NatCash Admin Verify] No authorization header');
      return secureErrorResponse('Unauthorized', 401);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[NatCash Admin Verify] User authentication failed:', userError);
      return secureErrorResponse('Unauthorized', 401);
    }

    console.log('[NatCash Admin Verify] User authenticated:', user.id);

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      supabase,
      RATE_LIMITS.PAYMENT,
      user.id,
      clientIp
    );

    if (!rateLimitResult.allowed) {
      console.warn('[NatCash Admin Verify] Rate limit exceeded for user:', user.id);
      return secureErrorResponse('Too many requests. Please try again later.', 429);
    }

    // Check if user is admin
    const { data: adminRole, error: roleError } = await supabase
      .from('content_editor_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !adminRole) {
      console.error('[NatCash Admin Verify] User is not admin:', roleError);
      return secureErrorResponse('Admin access required', 403);
    }

    console.log('[NatCash Admin Verify] Admin verified');

    // Parse and validate request body
    const body = await req.json();
    const validation = adminVerifySchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.error('[NatCash Admin Verify] Validation failed:', errors);
      return secureErrorResponse('Invalid input', 400, errors);
    }

    const { orderId, action, notes } = validation.data;

    // Get the transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId)
      .eq('provider', 'natcash')
      .single();

    if (fetchError || !transaction) {
      console.error('[NatCash Admin Verify] Transaction not found:', fetchError);
      return secureErrorResponse('Transaction not found', 404);
    }

    if (transaction.admin_verified) {
      console.error('[NatCash Admin Verify] Transaction already verified');
      return secureErrorResponse('Transaction already verified', 400);
    }

    console.log('[NatCash Admin Verify] Transaction found:', transaction.id, 'Action:', action);

    // Update transaction based on action
    const newStatus = action === 'approve' ? 'completed' : 'rejected';
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: newStatus,
        admin_verified: true,
        verified_by: user.id,
        verified_at: now,
        verification_notes: notes || null,
        completed_at: action === 'approve' ? now : null,
        updated_at: now,
        metadata: {
          ...transaction.metadata,
          verified_action: action,
          verified_at: now,
        }
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('[NatCash Admin Verify] Update error:', updateError);
      return secureErrorResponse('Failed to update transaction', 500);
    }

    console.log('[NatCash Admin Verify] Transaction', action === 'approve' ? 'approved' : 'rejected');

    // BUG FIX: Extend subscription when payment is approved (was missing before)
    if (action === 'approve' && transaction.user_id) {
      try {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('subscription_end_date')
          .eq('user_id', transaction.user_id)
          .maybeSingle();

        const currentTime = new Date();
        const currentEnd = currentProfile?.subscription_end_date
          ? new Date(currentProfile.subscription_end_date)
          : null;
        // Stack: if still active, add 30 days from current end; otherwise from now
        const baseDate = (currentEnd && currentEnd > currentTime) ? currentEnd : currentTime;
        const newEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        const { error: subError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_end_date: newEnd.toISOString(),
            payment_order_id: orderId,
          })
          .eq('user_id', transaction.user_id);

        if (subError) {
          console.error('[NatCash Admin Verify] Subscription extension error:', subError);
        } else {
          console.log(`[NatCash Admin Verify] Subscription extended for user ${transaction.user_id} until ${newEnd.toISOString()}`);
        }
      } catch (subExtErr) {
        console.error('[NatCash Admin Verify] Subscription extension failed:', subExtErr);
      }
    }

    return secureJsonResponse({
      success: true,
      message: action === 'approve' 
        ? 'Payment verified, approved, and subscription extended'
        : 'Payment rejected',
      transaction: {
        orderId: orderId,
        status: newStatus,
        verifiedAt: now,
        verifiedBy: user.id
      }
    }, 200, true);

  } catch (error) {
    console.error('[NatCash Admin Verify] Unexpected error:', error);
    return secureErrorResponse('Internal server error', 500);
  }
});
