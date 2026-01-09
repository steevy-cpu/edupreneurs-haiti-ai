/**
 * Security-Hardened: MonCash Verify Payment
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Validation schema
const verifySchema = z.object({
  orderId: z.string().max(100).optional(),
  transactionId: z.string().max(100).optional(),
}).refine(data => data.orderId || data.transactionId, {
  message: "orderId or transactionId required"
});

// MonCash API endpoints
const MONCASH_ENDPOINTS = {
  sandbox: {
    auth: 'https://sandbox.moncashbutton.digicelgroup.com/Api/oauth/token',
    retrieveByOrderId: 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment',
    retrieveByTransactionId: 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment',
  },
  live: {
    auth: 'https://moncashbutton.digicelgroup.com/Api/oauth/token',
    retrieveByOrderId: 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment',
    retrieveByTransactionId: 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment',
  }
};

// Get OAuth token from MonCash
async function getMonCashToken(clientId: string, clientSecret: string, mode: string): Promise<string> {
  const endpoints = mode === 'live' ? MONCASH_ENDPOINTS.live : MONCASH_ENDPOINTS.sandbox;
  
  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(endpoints.auth, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: 'scope=read,write&grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('MonCash auth error:', errorText);
    throw new Error(`Failed to authenticate with MonCash: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Retrieve payment by order ID
async function retrievePaymentByOrderId(token: string, orderId: string, mode: string) {
  const endpoints = mode === 'live' ? MONCASH_ENDPOINTS.live : MONCASH_ENDPOINTS.sandbox;
  
  const response = await fetch(endpoints.retrieveByOrderId, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('MonCash retrieve error:', errorText);
    throw new Error(`Failed to retrieve payment: ${response.status}`);
  }

  return await response.json();
}

// Retrieve payment by transaction ID
async function retrievePaymentByTransactionId(token: string, transactionId: string, mode: string) {
  const endpoints = mode === 'live' ? MONCASH_ENDPOINTS.live : MONCASH_ENDPOINTS.sandbox;
  
  const response = await fetch(endpoints.retrieveByTransactionId, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ transactionId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('MonCash retrieve error:', errorText);
    throw new Error(`Failed to retrieve payment: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, ...noCacheHeaders, 'Content-Type': 'application/json' };

  try {
    // Get MonCash credentials from secrets
    const clientId = Deno.env.get('MONCASH_CLIENT_ID');
    const clientSecret = Deno.env.get('MONCASH_CLIENT_SECRET');
    const mode = Deno.env.get('MONCASH_MODE') || 'sandbox';

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

    const { orderId, transactionId } = validation.data;

    console.log(`Verifying MonCash payment: orderId=${orderId}, transactionId=${transactionId}, mode=${mode}`);

    // Get OAuth token
    const token = await getMonCashToken(clientId, clientSecret, mode);
    console.log('MonCash authentication successful');

    // Retrieve payment details
    let paymentData;
    if (orderId) {
      paymentData = await retrievePaymentByOrderId(token, orderId, mode);
    } else {
      paymentData = await retrievePaymentByTransactionId(token, transactionId!, mode);
    }

    console.log('Payment data received:', JSON.stringify(paymentData));

    // Check if payment was successful
    if (paymentData.status !== 'Success') {
      return new Response(
        JSON.stringify({
          success: false,
          error: paymentData.message || 'Payment verification failed',
          data: paymentData,
        }),
        { headers: responseHeaders }
      );
    }

    const payment = paymentData.payment;
    const paymentStatus = payment?.message === 'successful' ? 'completed' : 'failed';

    // Update transaction in database
    const updateData: Record<string, unknown> = {
      status: paymentStatus,
      transaction_id: payment?.transactionId?.toString(),
      payer_phone: payment?.payer,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('order_id', orderId || payment?.orderId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      // Don't fail - the payment is verified, just log the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        payment: {
          transactionId: payment?.transactionId,
          orderId: payment?.orderId,
          amount: payment?.cost,
          payer: payment?.payer,
          message: payment?.message,
        },
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
