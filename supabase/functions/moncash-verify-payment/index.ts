/**
 * Security-Hardened: MonCash Verify Payment via Bazik.io
 * 
 * Verifies payment status through Bazik.io API first,
 * falls back to direct MonCash API if needed.
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const BAZIK_API_BASE = 'https://api.bazik.io';

// Validation schema - accepts our internal orderId and optionally Bazik's orderId
const verifySchema = z.object({
  orderId: z.string().max(100).optional(),
  bazikOrderId: z.string().max(100).optional(),
  transactionId: z.string().max(100).optional(),
}).refine(data => data.orderId || data.transactionId || data.bazikOrderId, {
  message: "orderId, bazikOrderId, or transactionId required"
});

// Get Bazik.io access token
async function getBazikToken(userID: string, secretKey: string): Promise<string> {
  const response = await fetch(`${BAZIK_API_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ userID, secretKey }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bazik auth error:', response.status, errorText);
    throw new Error(`Failed to authenticate with Bazik.io: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token || data.token;
}

// Verify payment via Bazik.io
async function verifyViaBazik(
  token: string,
  referenceId: string
): Promise<{ success: boolean; status: string; payment?: Record<string, unknown> }> {
  console.log(`Verifying payment via Bazik.io: referenceId=${referenceId}`);
  
  const response = await fetch(`${BAZIK_API_BASE}/moncash/verify/${referenceId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bazik verify error:', response.status, errorText);
    return { success: false, status: 'unknown' };
  }

  const responseData = await response.json();
  console.log('Bazik verify response:', JSON.stringify(responseData));
  
  const paymentData = responseData.data || responseData;
  
  // Bazik returns status like 'completed', 'pending', 'failed'
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
    // Determine mode and select credentials
    const mode = Deno.env.get('MONCASH_MODE') || 'sandbox';
    const clientId = mode === 'sandbox'
      ? Deno.env.get('MONCASH_SANDBOX_CLIENT_ID')
      : Deno.env.get('MONCASH_CLIENT_ID');
    const clientSecret = mode === 'sandbox'
      ? Deno.env.get('MONCASH_SANDBOX_SECRET_KEY')
      : Deno.env.get('MONCASH_SECRET_KEY');

    console.log(`MonCash verify mode: ${mode}`);

    if (!clientId || !clientSecret) {
      console.error('MonCash credentials not configured');
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
      console.warn(`Rate limit exceeded for moncash-verify-payment from IP ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = verifySchema.safeParse(rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ success: false, error: validation.error.issues.map(i => i.message).join(', ') }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { orderId, bazikOrderId, transactionId } = validation.data;
    // orderId here is our internal EDU-xxx ID
    const internalOrderId = orderId;

    console.log(`Verifying MonCash payment: internalOrderId=${internalOrderId}, bazikOrderId=${bazikOrderId}, transactionId=${transactionId}, mode=${mode}`);

    // Strategy: Try Bazik.io verification first (since payment was created via Bazik)
    let paymentStatus = 'unknown';
    let paymentDetails: Record<string, unknown> = {};

    if (internalOrderId) {
      try {
        const bazikToken = await getBazikToken(clientId, clientSecret);
        // Use our internal orderId (which was sent as referenceId to Bazik)
        const bazikResult = await verifyViaBazik(bazikToken, internalOrderId);
        
        if (bazikResult.success) {
          paymentStatus = bazikResult.status;
          paymentDetails = bazikResult.payment || {};
          console.log(`Bazik verification result: status=${paymentStatus}`);
        }
      } catch (bazikError) {
        console.warn('Bazik verification failed, will try direct MonCash:', bazikError);
      }
    }

    // Fallback: Try direct MonCash API if Bazik didn't give a definitive answer
    if (paymentStatus === 'unknown' && (internalOrderId || transactionId)) {
      try {
        const credentials = btoa(`${clientId}:${clientSecret}`);
        const endpoints = mode === 'live' 
          ? { auth: 'https://moncashbutton.digicelgroup.com/Api/oauth/token', retrieve: 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment' }
          : { auth: 'https://sandbox.moncashbutton.digicelgroup.com/Api/oauth/token', retrieve: 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment' };

        const authResponse = await fetch(endpoints.auth, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: 'scope=read,write&grant_type=client_credentials',
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          const token = authData.access_token;

          const lookupId = transactionId || internalOrderId;
          const endpoint = transactionId 
            ? (mode === 'live' ? 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment' : 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment')
            : endpoints.retrieve;
          const body = transactionId ? { transactionId } : { orderId: lookupId };

          const retrieveResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(body),
          });

          if (retrieveResponse.ok) {
            const retrieveData = await retrieveResponse.json();
            console.log('Direct MonCash verify response:', JSON.stringify(retrieveData));
            
            if (retrieveData.status === 'Success') {
              const payment = retrieveData.payment;
              paymentStatus = payment?.message === 'successful' ? 'completed' : 'failed';
              paymentDetails = {
                transactionId: payment?.transactionId,
                orderId: payment?.orderId,
                amount: payment?.cost,
                payer: payment?.payer,
                message: payment?.message,
              };
            }
          }
        }
      } catch (moncashError) {
        console.warn('Direct MonCash verification also failed:', moncashError);
      }
    }

    // Update transaction in database using our internal order ID
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
        console.log(`Transaction ${dbOrderId} updated to status: ${paymentStatus}`);
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
