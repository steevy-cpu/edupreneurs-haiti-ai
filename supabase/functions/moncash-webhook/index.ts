/**
 * MonCash Webhook Handler
 * 
 * Receives payment notifications from Bazik.io and updates payment status.
 * Server-to-server only - no CORS headers.
 * 
 * Security:
 * - HMAC-SHA256 signature verification
 * - Input validation
 * - Idempotent updates
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Signature verification using Web Crypto API
async function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    if (!signature || !secret) {
      return false;
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    const calculated = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Timing-safe comparison (length check + character comparison)
    if (signature.length !== calculated.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ calculated.charCodeAt(i);
    }

    return result === 0;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Extract signature from request headers (check multiple common header names)
function extractSignature(headers: Headers): string | null {
  const headerNames = [
    'x-signature',
    'x-webhook-signature',
    'x-moncash-signature',
    'x-bazik-signature',
    'signature'
  ];

  for (const name of headerNames) {
    const value = headers.get(name);
    if (value) {
      return value;
    }
  }

  return null;
}

// Validate webhook payload structure
function validatePayload(data: unknown): { 
  valid: boolean; 
  orderId?: string; 
  transactionId?: string;
  amount?: number;
  payer?: string;
  status?: string;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid payload format' };
  }

  const payload = data as Record<string, unknown>;

  // orderId is required
  if (!payload.orderId || typeof payload.orderId !== 'string') {
    return { valid: false, error: 'Missing or invalid orderId' };
  }

  // Determine status from various possible field names
  const statusField = payload.message || payload.status || payload.state;
  const status = typeof statusField === 'string' 
    ? statusField.toLowerCase() 
    : undefined;

  return {
    valid: true,
    orderId: payload.orderId as string,
    transactionId: (payload.transactionId || payload.transaction_id) as string | undefined,
    amount: typeof payload.amount === 'number' ? payload.amount : undefined,
    payer: (payload.payer || payload.phone || payload.sender) as string | undefined,
    status
  };
}

serve(async (req) => {
  // Only accept POST requests (server-to-server, no OPTIONS needed)
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get webhook secret
    const webhookSecret = Deno.env.get('MONCASH_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('MONCASH_WEBHOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Read raw payload for signature verification
    const rawPayload = await req.text();
    
    if (!rawPayload) {
      console.error('Empty payload received');
      return new Response(
        JSON.stringify({ error: 'Empty payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract and verify signature
    const signature = extractSignature(req.headers);
    
    if (!signature) {
      console.error('No signature header found');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifyHmacSignature(rawPayload, signature, webhookSecret);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Webhook signature verified successfully');

    // Parse and validate payload
    let payload: unknown;
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      console.error('Invalid JSON payload');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const validation = validatePayload(payload);
    
    if (!validation.valid) {
      console.error('Payload validation failed:', validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing webhook for orderId: ${validation.orderId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine payment status
    const successStatuses = ['successful', 'success', 'completed', 'paid', 'approved'];
    const failedStatuses = ['failed', 'failure', 'declined', 'rejected', 'cancelled'];
    
    let newStatus = 'pending';
    if (validation.status && successStatuses.includes(validation.status)) {
      newStatus = 'completed';
    } else if (validation.status && failedStatuses.includes(validation.status)) {
      newStatus = 'failed';
    }

    // Update payment transaction (idempotent - won't fail if already updated)
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('id, status')
      .eq('order_id', validation.orderId)
      .single();

    if (fetchError || !transaction) {
      console.error('Transaction not found:', validation.orderId);
      // Return 200 to prevent webhook retries for unknown orders
      return new Response(
        JSON.stringify({ 
          received: true, 
          message: 'Transaction not found but acknowledged' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only update if status is changing (idempotent)
    if (transaction.status !== newStatus && transaction.status === 'pending') {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add transaction details if provided
      if (validation.transactionId) {
        updateData.transaction_id = validation.transactionId;
      }
      if (validation.payer) {
        updateData.payer_phone = validation.payer;
      }
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('id', transaction.id);

      if (updateError) {
        console.error('Failed to update transaction:', updateError);
        return new Response(
          JSON.stringify({ error: 'Database update failed' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Transaction ${validation.orderId} updated to: ${newStatus}`);
    } else {
      console.log(`Transaction ${validation.orderId} already processed or not pending`);
    }

    // Return 200 OK to acknowledge receipt
    return new Response(
      JSON.stringify({ 
        received: true,
        orderId: validation.orderId,
        status: newStatus
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
