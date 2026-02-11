/**
 * MonCash Verify Payment via Bazik.io
 * 
 * Verifies payment status through Bazik.io API only (no dead MonCash fallback).
 * Uses shared Bazik utilities for authentication and credentials.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { BAZIK_API_BASE, getBazikToken, getMonCashCredentials } from "../_shared/bazik.ts";

const verifySchema = z.object({
  orderId: z.string().max(100).optional(),
  bazikOrderId: z.string().max(100).optional(),
  transactionId: z.string().max(100).optional(),
}).refine(data => data.orderId || data.transactionId || data.bazikOrderId, {
  message: "orderId, bazikOrderId, or transactionId required"
});

async function verifyViaBazik(
  token: string,
  referenceId: string
): Promise<{ success: boolean; status: string; payment?: Record<string, unknown> }> {
  const response = await fetch(`${BAZIK_API_BASE}/moncash/verify/${referenceId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Bazik verify error:', response.status);
    return { success: false, status: 'unknown' };
  }

  const responseData = await response.json();
  const paymentData = responseData.data || responseData;
  const paymentStatus = paymentData.status || paymentData.message;

  return {
    success: true,
    status: paymentStatus === 'successful' || paymentStatus === 'completed' ? 'completed' :
            paymentStatus === 'pending' ? 'pending' : 'failed',
    payment: paymentData,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, ...noCacheHeaders, 'Content-Type': 'application/json' };

  try {
    const { mode, userID, secretKey } = getMonCashCredentials();

    if (!userID || !secretKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment gateway not configured' }),
        { status: 503, headers: responseHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.PAYMENT, null, clientIp);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Validate input
    const rawBody = await req.json();
    const validation = verifySchema.safeParse(rawBody);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error.issues.map(i => i.message).join(', ') }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { orderId, bazikOrderId } = validation.data;
    const internalOrderId = orderId;

    console.log(`Verifying payment: internalOrderId=${internalOrderId}, mode=${mode}`);

    // Verify via Bazik.io (sole verification path)
    let paymentStatus = 'unknown';
    let paymentDetails: Record<string, unknown> = {};

    const lookupId = internalOrderId || bazikOrderId;
    if (lookupId) {
      try {
        const bazikToken = await getBazikToken(userID, secretKey);
        const bazikResult = await verifyViaBazik(bazikToken, lookupId);

        if (bazikResult.success) {
          paymentStatus = bazikResult.status;
          paymentDetails = bazikResult.payment || {};
          console.log(`Bazik verification: status=${paymentStatus}`);
        }
      } catch (bazikError) {
        console.error('Bazik verification failed:', bazikError);
      }
    }

    // Update transaction in database
    const dbOrderId = internalOrderId || (paymentDetails as Record<string, unknown>)?.orderId as string;

    if (dbOrderId && paymentStatus !== 'unknown') {
      const updateData: Record<string, unknown> = {
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (paymentDetails.transactionId) {
        updateData.transaction_id = String(paymentDetails.transactionId);
      }
      if (paymentDetails.payer) {
        updateData.payer_phone = String(paymentDetails.payer);
      }
      if (paymentStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('order_id', dbOrderId);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
      } else {
        console.log(`Transaction ${dbOrderId} updated to: ${paymentStatus}`);
      }

      // Extend user subscription by 30 days on completed payment
      if (paymentStatus === 'completed') {
        try {
          const { data: txn } = await supabase
            .from('payment_transactions')
            .select('user_id')
            .eq('order_id', dbOrderId)
            .maybeSingle();

          if (txn?.user_id) {
            const { data: currentProfile } = await supabase
              .from('profiles')
              .select('subscription_end_date')
              .eq('user_id', txn.user_id)
              .maybeSingle();

            const now = new Date();
            const currentEnd = currentProfile?.subscription_end_date
              ? new Date(currentProfile.subscription_end_date)
              : null;
            // Stack: if still active, add 30 days from current end; otherwise from now
            const baseDate = (currentEnd && currentEnd > now) ? currentEnd : now;
            const newEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

            const { error: subError } = await supabase
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_end_date: newEnd.toISOString(),
                payment_order_id: dbOrderId,
              })
              .eq('user_id', txn.user_id);

            if (subError) {
              console.error('Error extending subscription:', subError);
            } else {
              console.log(`Subscription extended for user ${txn.user_id} until ${newEnd.toISOString()}`);
            }
          }
        } catch (subExtErr) {
          console.error('Subscription extension failed:', subExtErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: paymentStatus === 'completed',
        status: paymentStatus,
        payment: paymentDetails,
      }),
      { headers: responseHeaders }
    );

  } catch (error) {
    console.error('Error in moncash-verify-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: responseHeaders }
    );
  }
});
