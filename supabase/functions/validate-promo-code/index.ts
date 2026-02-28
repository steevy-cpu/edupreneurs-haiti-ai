/**
 * Validate Promo Code
 * 
 * Server-side promo code validation for signup flow.
 * Public endpoint (no JWT) with AUTH rate limiting (5 anon/min).
 *
 * Security: IP-based AUTH rate limit to prevent brute-force code guessing
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateInput, promoCodeSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ── Rate Limiting (IP-based, no JWT — public signup endpoint) ─────────
    const clientIp = getClientIp(req);
    const rlResult = await checkRateLimit(supabase, RATE_LIMITS.AUTH, null, clientIp);
    if (!rlResult.allowed) {
      return rateLimitResponse(rlResult.retryAfter ?? 60, rlResult.remaining, corsHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(promoCodeSchema, rawBody);
    
    if (!validation.success) {
      return validationErrorResponse(validation.errors, responseHeaders);
    }

    const { code } = validation.data;

    console.log('Validating promo code:', code);

    // Look up promo code in database (case-insensitive)
    // maybeSingle() returns null (not an error) when no row is found,
    // allowing us to distinguish "code not found" from genuine DB errors.
    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('id, code, gold_reward, max_uses, current_uses, expires_at, is_active, grants_free_access')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    // Genuine DB error (network failure, RLS block, schema mismatch) —
    // must not be silently swallowed as "invalid code".
    if (error) {
      console.error('DB error validating promo code:', error.message, error.code);
      return new Response(
        JSON.stringify({ error: 'Erreur de base de données' }),
        { status: 500, headers: responseHeaders }
      );
    }

    // No matching row — code doesn't exist or is inactive
    if (!promoCode) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Code promo invalide ou expiré' 
        }),
        { status: 200, headers: responseHeaders }
      );
    }

    // Check if expired
    if (promoCode.expires_at && new Date(promoCode.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Ce code promo a expiré' 
        }),
        { status: 200, headers: responseHeaders }
      );
    }

    // Check if max uses reached
    if (promoCode.max_uses !== null && promoCode.current_uses >= promoCode.max_uses) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Ce code promo a atteint sa limite d\'utilisation' 
        }),
        { status: 200, headers: responseHeaders }
      );
    }

    // Valid promo code - DO NOT increment usage here
    // Usage is tracked in profiles.promo_code_used during signup
    console.log('Promo code validated:', code, 'Gold reward:', promoCode.gold_reward);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        goldReward: promoCode.gold_reward,
        code: promoCode.code,
        grantsFreeAccess: promoCode.grants_free_access || false
      }),
      { status: 200, headers: responseHeaders }
    );

  } catch (error: any) {
    console.error('Error validating promo code:', error.message);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
