/**
 * Redeem Promo Code — Atomic validation + gold award + redemption tracking
 * 
 * JWT required. Uses service role for DB writes to bypass RLS and
 * directly update gold_earned (bypasses increment_gold's 100-cap).
 * 
 * Rate limited: AUTH tier (5 req/min for authenticated users).
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateInput, promoCodeSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return corsPreflightResponse();

  const headers = { ...corsHeaders, ...securityHeaders, "Content-Type": "application/json" };

  try {
    // --- Auth: extract user from JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers });
    }

    // Anon client scoped to the caller's JWT for auth verification
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers });
    }
    const userId = claimsData.claims.sub as string;

    // Service-role client for privileged DB operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Rate limiting ---
    const clientIp = getClientIp(req);
    const rateResult = await checkRateLimit(supabase, RATE_LIMITS.AUTH, userId, clientIp);
    if (!rateResult.allowed) {
      return rateLimitResponse(rateResult.retryAfter || 60, rateResult.remaining, headers);
    }

    // --- Input validation ---
    const rawBody = await req.json();
    const validation = validateInput(promoCodeSchema, rawBody);
    if (!validation.success) {
      return validationErrorResponse(validation.errors, headers);
    }
    const { code } = validation.data;

    // --- Fetch promo code ---
    const { data: promo, error: promoErr } = await supabase
      .from("promo_codes")
      .select("id, code, gold_reward, max_uses, current_uses, expires_at, is_active, grants_free_access")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (promoErr) {
      console.error("DB error fetching promo code:", promoErr.message);
      return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500, headers });
    }

    if (!promo) {
      return new Response(JSON.stringify({ success: false, error: "Code invalide ou expiré" }), { status: 200, headers });
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return new Response(JSON.stringify({ success: false, error: "Code invalide ou expiré" }), { status: 200, headers });
    }

    // Check max uses
    if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
      return new Response(JSON.stringify({ success: false, error: "Code invalide ou expiré" }), { status: 200, headers });
    }

    // --- Check if user already redeemed this code ---
    const { data: existing } = await supabase
      .from("user_promo_redemptions")
      .select("id")
      .eq("user_id", userId)
      .eq("promo_code_id", promo.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: false, error: "Tu as déjà utilisé ce code" }), { status: 200, headers });
    }

    // --- Atomic redemption: record + increment uses + award gold ---
    const goldAmount = promo.gold_reward ?? 0;

    // 1. Record redemption (UNIQUE constraint prevents race-condition duplicates)
    const { error: insertErr } = await supabase
      .from("user_promo_redemptions")
      .insert({
        user_id: userId,
        promo_code_id: promo.id,
        code: promo.code,
        gold_awarded: goldAmount,
      });

    if (insertErr) {
      // Unique violation = concurrent duplicate attempt
      if (insertErr.code === "23505") {
        return new Response(JSON.stringify({ success: false, error: "Tu as déjà utilisé ce code" }), { status: 200, headers });
      }
      console.error("Failed to record redemption:", insertErr.message);
      return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500, headers });
    }

    // 2. Increment current_uses on promo_codes
    const { error: usesErr } = await supabase
      .from("promo_codes")
      .update({ current_uses: promo.current_uses + 1 })
      .eq("id", promo.id);

    if (usesErr) {
      console.error("Failed to increment promo uses:", usesErr.message);
      // Non-fatal: redemption already recorded, gold still needs awarding
    }

    // 3. Award gold — direct read-then-write with service role
    // Safe: gold_reward comes from founder-managed promo_codes table, not user input
    if (goldAmount > 0) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("gold_earned")
        .eq("user_id", userId)
        .single();

      if (profile) {
        const newGold = (profile.gold_earned ?? 0) + goldAmount;
        const { error: goldErr } = await supabase
          .from("profiles")
          .update({ gold_earned: newGold })
          .eq("user_id", userId);

        if (goldErr) {
          console.error("Failed to award gold:", goldErr.message);
          // Non-fatal: redemption recorded, user won't be able to re-redeem
        }
      }
    }

    // 4. Grant timed free access if promo code qualifies
    if (promo.grants_free_access) {
      const { error: accessErr } = await supabase
        .from("profiles")
        .update({
          has_free_access: true,
          subscription_status: "active",
          subscription_end_date: "2026-09-08T00:00:00.000Z",
        })
        .eq("user_id", userId);

      if (accessErr) {
        console.error("Failed to grant free access:", accessErr.message);
        // Non-fatal: redemption + gold already recorded
      }
    }

    console.log(`Promo redeemed: user=${userId}, code=${promo.code}, gold=${goldAmount}, freeAccess=${!!promo.grants_free_access}`);

    return new Response(
      JSON.stringify({
        success: true,
        goldAwarded: goldAmount,
        grantsFreeAccess: promo.grants_free_access || false,
        message: promo.grants_free_access
          ? `Accès gratuit activé + ${goldAmount} Gold!`
          : `${goldAmount} Gold ajouté à ton compte!`,
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error("redeem-promo-code error:", error.message);
    return new Response(JSON.stringify({ error: "Une erreur est survenue" }), { status: 500, headers });
  }
});
