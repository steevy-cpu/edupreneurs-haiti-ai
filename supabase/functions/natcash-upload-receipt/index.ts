/**
 * Security-Hardened: NatCash Upload Receipt
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Validation schema
const uploadReceiptSchema = z.object({
  orderId: z.string().min(1).max(100),
  receiptBase64: z.string().max(10000000), // ~7.5MB base64 limit
  fileName: z.string().max(255).optional(),
  natcashPhone: z.string().max(20).optional(),
  natcashReference: z.string().max(100).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, ...noCacheHeaders, 'Content-Type': 'application/json' };

  try {
    console.log('[NatCash Upload Receipt] Starting receipt upload...');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[NatCash Upload Receipt] No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: responseHeaders }
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
        { status: 401, headers: responseHeaders }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.PAYMENT, user.id, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for natcash-upload-receipt user ${user.id}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    console.log('[NatCash Upload Receipt] User authenticated:', user.id);

    // Parse and validate input
    const rawBody = await req.json();
    const validation = uploadReceiptSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('[NatCash Upload Receipt] Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error.issues.map(i => i.message).join(', ') }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { orderId, receiptBase64, fileName, natcashPhone, natcashReference } = validation.data;

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
        { status: 404, headers: responseHeaders }
      );
    }

    if (transaction.status !== 'pending') {
      console.error('[NatCash Upload Receipt] Transaction already processed:', transaction.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Transaction already processed' }),
        { status: 400, headers: responseHeaders }
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
        { status: 500, headers: responseHeaders }
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
        { status: 500, headers: responseHeaders }
      );
    }

    console.log('[NatCash Upload Receipt] Transaction updated successfully');

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
      { headers: responseHeaders }
    );

  } catch (error) {
    console.error('[NatCash Upload Receipt] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
