/**
 * MonCash Webhook Handler (Bazik.io Gateway)
 * 
 * Receives payment notifications from Bazik.io and updates payment status.
 * Server-to-server only - no CORS headers.
 * 
 * Security:
 * - HMAC-SHA256 signature verification (Bazik format: v1=hmac(timestamp.eventId.body))
 * - Input validation
 * - Idempotent updates
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Extract Bazik-specific headers
function extractBazikHeaders(headers: Headers): {
  signature: string | null;
  timestamp: string | null;
  eventId: string | null;
  env: string | null;
} {
  return {
    signature: headers.get('x-bazik-signature'),
    timestamp: headers.get('x-bazik-timestamp'),
    eventId: headers.get('x-bazik-event-id'),
    env: headers.get('x-bazik-env'),
  };
}

// Verify Bazik.io webhook signature
// Format: v1=hmac_sha256(timestamp.eventId.rawBody, secret)
async function verifyBazikSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  eventId: string,
  secret: string
): Promise<boolean> {
  try {
    if (!signature || !timestamp || !eventId || !secret) {
      console.error('Missing signature components');
      return false;
    }

    // Build signed payload per Bazik.io docs: timestamp.eventId.rawBody
    const signedPayload = `${timestamp}.${eventId}.${rawBody}`;
    
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
      encoder.encode(signedPayload)
    );

    const calculated = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Bazik uses v1= prefix
    const expected = `v1=${calculated}`;

    // Timing-safe comparison
    if (signature.length !== expected.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
    }

    return result === 0;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Validate Bazik.io webhook payload structure
function validatePayload(data: unknown): { 
  valid: boolean; 
  referenceId?: string;   // Our internal order ID
  bazikOrderId?: string;  // Bazik's order ID
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  eventType?: string;
  error?: string;
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid payload format' };
  }

  const payload = data as Record<string, unknown>;

  // Get event type (e.g., "payment.succeeded", "payment.failed")
  const eventType = payload.type as string | undefined;

  // referenceId is OUR order ID - this is what we passed when creating the payment
  // This is the primary identifier we use to find our transaction
  if (!payload.referenceId || typeof payload.referenceId !== 'string') {
    return { valid: false, error: 'Missing referenceId' };
  }

  return {
    valid: true,
    referenceId: payload.referenceId as string,      // OUR order ID
    bazikOrderId: payload.orderId as string,         // Bazik's internal order ID
    transactionId: payload.transactionId as string,  // Bazik transaction ID
    amount: typeof payload.amount === 'number' ? payload.amount : undefined,
    currency: payload.currency as string | undefined,
    status: payload.status as string | undefined,    // "successful", "failed", etc.
    eventType,                                       // "payment.succeeded", etc.
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

    // Extract Bazik-specific headers
    const { signature, timestamp, eventId, env } = extractBazikHeaders(req.headers);
    
    console.log(`Webhook received from Bazik.io (env: ${env || 'unknown'})`);

    // Verify signature if present
    if (!signature || !timestamp || !eventId) {
      console.error('Missing Bazik signature headers');
      return new Response(
        JSON.stringify({ error: 'Missing signature headers' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const isValid = await verifyBazikSignature(rawPayload, signature, timestamp, eventId, webhookSecret);
    
    if (!isValid) {
      console.error('Invalid Bazik webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Bazik webhook signature verified successfully');

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

    console.log(`Processing webhook: type=${validation.eventType}, referenceId=${validation.referenceId}, status=${validation.status}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine payment status from event type and status field
    const successEvents = ['payment.succeeded', 'payment.completed', 'transfer.completed'];
    const failedEvents = ['payment.failed', 'payment.cancelled', 'transfer.failed'];
    const successStatuses = ['successful', 'success', 'completed', 'paid', 'approved'];
    const failedStatuses = ['failed', 'failure', 'declined', 'rejected', 'cancelled'];
    
    let newStatus = 'pending';
    
    // Check event type first (more reliable)
    if (validation.eventType && successEvents.includes(validation.eventType)) {
      newStatus = 'completed';
    } else if (validation.eventType && failedEvents.includes(validation.eventType)) {
      newStatus = 'failed';
    }
    // Fall back to status field
    else if (validation.status && successStatuses.includes(validation.status.toLowerCase())) {
      newStatus = 'completed';
    } else if (validation.status && failedStatuses.includes(validation.status.toLowerCase())) {
      newStatus = 'failed';
    }

    // Determine if this is a NatCash transfer webhook (payout) or a payment webhook
    const isNatCashTransfer = validation.eventType?.startsWith('transfer.') || 
      (payload as Record<string, unknown>)?.provider === 'natcash';

    // Try to find in natcash_transfers first (for outgoing payouts)
    if (isNatCashTransfer) {
      const { data: natcashTransfer, error: natcashFetchError } = await supabase
        .from('natcash_transfers')
        .select('id, status')
        .eq('reference_id', validation.referenceId)
        .maybeSingle();

      if (natcashTransfer && !natcashFetchError) {
        if (natcashTransfer.status === 'pending' && natcashTransfer.status !== newStatus) {
          const updateData: Record<string, unknown> = {
            status: newStatus,
            updated_at: new Date().toISOString(),
          };
          if (validation.transactionId) {
            updateData.bazik_transaction_id = validation.transactionId;
          }
          if (newStatus === 'completed') {
            updateData.completed_at = new Date().toISOString();
          }

          await supabase
            .from('natcash_transfers')
            .update(updateData)
            .eq('id', natcashTransfer.id);

          console.log(`NatCash transfer ${validation.referenceId} updated to: ${newStatus}`);
        }

        // Return early - this was a transfer webhook, not a payment
        return new Response(
          JSON.stringify({ received: true, type: 'natcash_transfer', referenceId: validation.referenceId, status: newStatus }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Look up transaction by OUR order_id (which is Bazik's referenceId)
    const { data: transaction, error: fetchError } = await supabase
      .from('payment_transactions')
      .select('id, status, user_id')
      .eq('order_id', validation.referenceId)
      .maybeSingle();

    if (fetchError || !transaction) {
      console.error('Transaction not found for referenceId:', validation.referenceId);
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

      // Add Bazik transaction details
      if (validation.transactionId) {
        updateData.transaction_id = validation.transactionId;
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

      console.log(`Transaction ${validation.referenceId} updated to: ${newStatus}`);

      // Auto-extend subscription on completed payment
      if (newStatus === 'completed' && transaction.user_id) {
        try {
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('subscription_end_date')
            .eq('user_id', transaction.user_id)
            .maybeSingle();

          const now = new Date();
          const currentEnd = currentProfile?.subscription_end_date
            ? new Date(currentProfile.subscription_end_date)
            : null;
          const baseDate = (currentEnd && currentEnd > now) ? currentEnd : now;
          const newEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

          await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_end_date: newEnd.toISOString(),
              payment_order_id: validation.referenceId,
            })
            .eq('user_id', transaction.user_id);

          console.log(`Webhook: Subscription extended for user ${transaction.user_id} until ${newEnd.toISOString()}`);
        } catch (subErr) {
          console.error('Webhook: Subscription extension failed:', subErr);
        }
      }
    } else {
      console.log(`Transaction ${validation.referenceId} already processed or not pending`);
    }

    // Return 200 OK to acknowledge receipt
    return new Response(
      JSON.stringify({ 
        received: true,
        referenceId: validation.referenceId,
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
