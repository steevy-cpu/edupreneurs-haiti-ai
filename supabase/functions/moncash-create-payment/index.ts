/**
 * Security-Hardened: MonCash Create Payment via Bazik.io
 * 
 * Features:
 * - Rate limiting (30 req/min for auth, 5 req/min for anon)
 * - Input validation
 * - Security headers
 * - Bazik.io API integration
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, paymentSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

// Bazik.io API configuration
const BAZIK_API_BASE = 'https://api.bazik.io';

// Generate unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `EDU-${timestamp}-${randomPart}`.toUpperCase();
}

// Get Bazik.io access token
async function getBazikToken(userID: string, secretKey: string): Promise<string> {
  console.log('Authenticating with Bazik.io...');
  
  const response = await fetch(`${BAZIK_API_BASE}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      userID,
      secretKey,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bazik auth error:', response.status, errorText);
    throw new Error(`Failed to authenticate with Bazik.io: ${response.status}`);
  }

  const data = await response.json();
  
  const accessToken = data.access_token || data.token;
  if (!accessToken) {
    console.error('No token in Bazik response:', data);
    throw new Error('No access token received from Bazik.io');
  }
  
  console.log('Bazik.io authentication successful');
  return accessToken;
}

// Create payment via Bazik.io MonCash endpoint
async function createBazikPayment(
  token: string,
  amount: number,
  orderId: string,
  description: string
): Promise<{ redirectUrl: string; bazikOrderId?: string }> {
  console.log(`Creating Bazik MonCash payment: amount=${amount}, orderId=${orderId}`);
  
  const response = await fetch(`${BAZIK_API_BASE}/moncash/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      gdes: amount,
      description: description,
      referenceId: orderId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bazik payment creation error:', response.status, errorText);
    throw new Error(`Failed to create payment via Bazik.io: ${response.status}`);
  }

  const responseData = await response.json();
  console.log('Bazik payment response:', JSON.stringify(responseData));
  
  // Bazik.io nests payment data inside a `data` object:
  // { success: true, data: { redirectUrl, orderId, referenceId, ... } }
  const paymentData = responseData.data || responseData;
  const redirectUrl = paymentData.redirectUrl || paymentData.redirect_url;
  
  if (!redirectUrl) {
    console.error('No redirect URL in Bazik response:', responseData);
    throw new Error('No redirect URL received from Bazik.io');
  }

  return {
    redirectUrl,
    bazikOrderId: paymentData.orderId,
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
    // Determine mode and select credentials accordingly
    const mode = Deno.env.get('MONCASH_MODE') || 'sandbox';
    const userID = mode === 'sandbox'
      ? Deno.env.get('MONCASH_SANDBOX_CLIENT_ID')
      : Deno.env.get('MONCASH_CLIENT_ID');
    const secretKey = mode === 'sandbox'
      ? Deno.env.get('MONCASH_SANDBOX_SECRET_KEY')
      : Deno.env.get('MONCASH_SECRET_KEY');

    console.log(`MonCash mode: ${mode}`);

    if (!userID || !secretKey) {
      console.error('Bazik.io credentials not configured');
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

    console.log(`Processing payment request: amount=${amount}, orderId=${finalOrderId}`);

    // Step 1: Get Bazik.io access token
    const bazikToken = await getBazikToken(userID, secretKey);

    // Step 2: Create payment via Bazik.io
    const { redirectUrl, bazikOrderId } = await createBazikPayment(
      bazikToken,
      amount,
      finalOrderId,
      description || 'Edupreneurs Payment'
    );
    
    console.log('Payment created successfully, redirectUrl:', redirectUrl);

    // Store pending transaction in database
    await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        order_id: finalOrderId,  // Our internal order ID (sent as referenceId to Bazik)
        amount: amount,
        currency: 'HTG',
        provider: 'moncash',
        status: 'pending',
        payment_token: finalOrderId,
        description: description || 'Edupreneurs Payment',
        metadata: { 
          gateway: 'bazik.io',
          bazikOrderId,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        orderId: finalOrderId,
        redirectUrl: redirectUrl,
        bazikOrderId: bazikOrderId,
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
