import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  orderId: string;
  action: 'approve' | 'reject';
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[NatCash Admin Verify] Starting verification...');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[NatCash Admin Verify] No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[NatCash Admin Verify] User authenticated:', user.id);

    // Check if user is admin
    const { data: adminRole, error: roleError } = await supabase
      .from('content_editor_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !adminRole) {
      console.error('[NatCash Admin Verify] User is not admin:', roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[NatCash Admin Verify] Admin verified');

    // Parse request body
    const { orderId, action, notes }: VerifyRequest = await req.json();
    
    if (!orderId || !action) {
      console.error('[NatCash Admin Verify] Missing required fields');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing orderId or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      console.error('[NatCash Admin Verify] Invalid action:', action);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action. Must be "approve" or "reject"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId)
      .eq('provider', 'natcash')
      .single();

    if (fetchError || !transaction) {
      console.error('[NatCash Admin Verify] Transaction not found:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (transaction.admin_verified) {
      console.error('[NatCash Admin Verify] Transaction already verified');
      return new Response(
        JSON.stringify({ success: false, error: 'Transaction already verified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[NatCash Admin Verify] Transaction', action === 'approve' ? 'approved' : 'rejected');

    // TODO: Send notification to user about verification result

    return new Response(
      JSON.stringify({
        success: true,
        message: action === 'approve' 
          ? 'Payment verified and approved successfully'
          : 'Payment rejected',
        transaction: {
          orderId: orderId,
          status: newStatus,
          verifiedAt: now,
          verifiedBy: user.id
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[NatCash Admin Verify] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
