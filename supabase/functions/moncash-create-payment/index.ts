/**
 * Security-Hardened: MonCash Create Payment
 * 
 * Features:
 * - Rate limiting (30 req/min for auth, 5 req/min for anon)
 * - Input validation
 * - Security headers
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, paymentSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

// MonCash API endpoints
const MONCASH_ENDPOINTS = {
  sandbox: {
    auth: 'https://sandbox.moncashbutton.digicelgroup.com/Api/oauth/token',
    payment: 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/CreatePayment',
    redirect: 'https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect?token=',
  },
  live: {
    auth: 'https://moncashbutton.digicelgroup.com/Api/oauth/token',
    payment: 'https://moncashbutton.digicelgroup.com/Api/v1/CreatePayment',
    redirect: 'https://moncashbutton.digicelgroup.com/Moncash-middleware/Payment/Redirect?token=',
  }
};

// Generate unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `EDU-${timestamp}-${randomPart}`.toUpperCase();
}

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
    console.error('MonCash auth error');
    throw new Error(`Failed to authenticate with MonCash: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Create payment with MonCash
async function createMonCashPayment(
  token: string,
  amount: number,
  orderId: string,
  mode: string
): Promise<{ paymentToken: string; redirectUrl: string }> {
  const endpoints = mode === 'live' ? MONCASH_ENDPOINTS.live : MONCASH_ENDPOINTS.sandbox;
  
  const response = await fetch(endpoints.payment, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      amount: amount,
      orderId: orderId,
    }),
  });

  if (!response.ok) {
    console.error('MonCash payment creation error');
    throw new Error(`Failed to create MonCash payment: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'Success') {
    throw new Error(data.message || 'Payment creation failed');
  }

  const paymentToken = data.payment_token?.token;
  if (!paymentToken) {
    throw new Error('No payment token received from MonCash');
  }

  return {
    paymentToken,
    redirectUrl: `${endpoints.redirect}${paymentToken}`,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { 
    ...corsHeaders, 
    ...securityHeaders, 
    ...noCacheHeaders,
    'Content-Type': 'application/json' 
  };

  try {
    // Get MonCash credentials from secrets
    const clientId = Deno.env.get('MONCASH_CLIENT_ID');
    const clientSecret = Deno.env.get('MONCASH_CLIENT_SECRET');
    const mode = Deno.env.get('MONCASH_MODE') || 'sandbox';

    if (!clientId || !clientSecret) {
      console.error('MonCash credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Service de paiement non configuré' 
        }),
        { status: 503, headers: responseHeaders }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Non authentifié' }),
        { status: 401, headers: responseHeaders }
      );
    }

    // Get user from JWT
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

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.PAYMENT, user.id, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for payment from user: ${user.id.substring(0, 8)}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(paymentSchema, rawBody);
    
    if (!validation.success) {
      return validationErrorResponse(validation.errors, responseHeaders);
    }

    const { amount, description } = validation.data;
    const orderId = rawBody.orderId;

    // Generate or use provided order ID
    const finalOrderId = orderId || generateOrderId();

    console.log(`Creating MonCash payment: amount=${amount}, orderId=${finalOrderId}, mode=${mode}`);

    // Get OAuth token
    const token = await getMonCashToken(clientId, clientSecret, mode);
    console.log('MonCash authentication successful');

    // Create payment
    const { paymentToken, redirectUrl } = await createMonCashPayment(token, amount, finalOrderId, mode);
    console.log('MonCash payment created');

    // Store pending transaction in database
    await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        order_id: finalOrderId,
        amount: amount,
        currency: 'HTG',
        provider: 'moncash',
        status: 'pending',
        payment_token: paymentToken,
        description: description || 'Edupreneurs Payment',
        metadata: { mode },
      });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: finalOrderId,
        redirectUrl: redirectUrl,
        paymentToken: paymentToken,
      }),
      { headers: responseHeaders }
    );

  } catch (error) {
    console.error('Error in moncash-create-payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erreur lors de la création du paiement' 
      }),
      { status: 500, headers: responseHeaders }
    );
  }
});
