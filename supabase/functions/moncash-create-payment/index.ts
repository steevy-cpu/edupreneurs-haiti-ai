/**
 * MonCash Create Payment via Bazik.io
 * 
 * Uses shared Bazik utilities for authentication and credentials.
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, paymentSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { BAZIK_API_BASE, getBazikToken, getMonCashCredentials } from "../_shared/bazik.ts";

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `EDU-${timestamp}-${randomPart}`.toUpperCase();
}

async function createBazikPayment(
  token: string,
  amount: number,
  orderId: string,
  description: string,
  returnUrl: string
): Promise<{ redirectUrl: string; bazikOrderId?: string }> {
  const response = await fetch(`${BAZIK_API_BASE}/moncash/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      gdes: amount,
      description,
      referenceId: orderId,
      returnUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bazik payment creation error:', response.status, errorText);
    throw new Error(`Failed to create payment via Bazik.io: ${response.status}`);
  }

  const responseData = await response.json();
  const paymentData = responseData.data || responseData;
  const redirectUrl = paymentData.redirectUrl || paymentData.redirect_url;

  if (!redirectUrl) {
    console.error('No redirect URL in Bazik response');
    throw new Error('No redirect URL received from Bazik.io');
  }

  return { redirectUrl, bazikOrderId: paymentData.orderId };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = {
    ...corsHeaders, ...securityHeaders, ...noCacheHeaders,
    'Content-Type': 'application/json',
  };

  try {
    const { mode, userID, secretKey } = getMonCashCredentials();

    if (!userID || !secretKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service de paiement non configuré' }),
        { status: 503, headers: responseHeaders }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Non authentifié' }),
        { status: 401, headers: responseHeaders }
      );
    }

    const supabaseAnon = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentification invalide' }),
        { status: 401, headers: responseHeaders }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.PAYMENT, user.id, clientIp);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Validate input
    const rawBody = await req.json();
    const validation = validateInput(paymentSchema, rawBody);
    if (!validation.success) {
      return validationErrorResponse(validation.errors, responseHeaders);
    }

    const { amount, description } = validation.data;
    const finalOrderId = rawBody.orderId || generateOrderId();

    const siteUrl = Deno.env.get('SITE_URL') || 'https://edupreneurs-haiti-ai.lovable.app';
    const returnUrl = `${siteUrl}/payment/callback?orderId=${finalOrderId}`;

    console.log(`Creating payment: amount=${amount}, orderId=${finalOrderId}, mode=${mode}`);

    const bazikToken = await getBazikToken(userID, secretKey);
    const { redirectUrl, bazikOrderId } = await createBazikPayment(
      bazikToken, amount, finalOrderId,
      description || 'Edupreneurs Payment', returnUrl
    );

    // Store pending transaction
    await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        order_id: finalOrderId,
        amount,
        currency: 'HTG',
        provider: 'moncash',
        status: 'pending',
        payment_token: finalOrderId,
        description: description || 'Edupreneurs Payment',
        metadata: { gateway: 'bazik.io', bazikOrderId },
      });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: finalOrderId,
        redirectUrl,
        bazikOrderId,
      }),
      { headers: responseHeaders }
    );

  } catch (error) {
    console.error('Error in moncash-create-payment:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erreur lors de la création du paiement' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
