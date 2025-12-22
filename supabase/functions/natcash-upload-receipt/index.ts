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
    console.log('[NatCash Upload Receipt] Starting receipt upload...');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[NatCash Upload Receipt] No authorization header');
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
      console.error('[NatCash Upload Receipt] User authentication failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[NatCash Upload Receipt] User authenticated:', user.id);

    // Parse request body
    const { orderId, receiptBase64, fileName, natcashPhone, natcashReference } = await req.json();
    
    if (!orderId) {
      console.error('[NatCash Upload Receipt] Missing orderId');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing orderId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!receiptBase64) {
      console.error('[NatCash Upload Receipt] Missing receipt file');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing receipt file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the transaction exists and belongs to the user
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', user.id)
      .eq('provider', 'natcash')
      .single();

    if (fetchError || !transaction) {
      console.error('[NatCash Upload Receipt] Transaction not found:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (transaction.status !== 'pending') {
      console.error('[NatCash Upload Receipt] Transaction already processed:', transaction.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Transaction already processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[NatCash Upload Receipt] Transaction found:', transaction.id);

    // Decode base64 and upload to storage
    const base64Data = receiptBase64.split(',')[1] || receiptBase64;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Determine file extension
    const extension = fileName?.split('.').pop()?.toLowerCase() || 'png';
    const storagePath = `${user.id}/${orderId}.${extension}`;

    console.log('[NatCash Upload Receipt] Uploading to storage:', storagePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('payment-receipts')
      .upload(storagePath, binaryData, {
        contentType: `image/${extension === 'pdf' ? 'application/pdf' : extension}`,
        upsert: true
      });

    if (uploadError) {
      console.error('[NatCash Upload Receipt] Upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to upload receipt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('payment-receipts')
      .getPublicUrl(storagePath);

    const receiptUrl = urlData.publicUrl;
    console.log('[NatCash Upload Receipt] Upload successful, URL:', receiptUrl);

    // Update transaction with receipt info
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        receipt_url: receiptUrl,
        natcash_phone: natcashPhone || null,
        natcash_reference: natcashReference || null,
        status: 'pending_verification',
        updated_at: new Date().toISOString(),
        metadata: {
          ...transaction.metadata,
          receipt_uploaded_at: new Date().toISOString(),
        }
      })
      .eq('id', transaction.id);

    if (updateError) {
      console.error('[NatCash Upload Receipt] Update error:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[NatCash Upload Receipt] Transaction updated successfully');

    // TODO: Send notification to admin about new receipt for verification

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Receipt uploaded successfully. Awaiting admin verification.',
        messageHt: 'Resi a telechaje avèk siksè. Ap tann verifikasyon admin.',
        transaction: {
          orderId: orderId,
          status: 'pending_verification',
          receiptUrl: receiptUrl
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[NatCash Upload Receipt] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
