/**
 * MonCash Gift Payment - Creates a MonCash payment for a gift subscription token
 * 
 * PUBLIC endpoint (no auth required - the family member is not a user).
 * Accepts: { token: string }
 * Returns: { success: boolean, redirectUrl: string }
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { BAZIK_API_BASE, getBazikToken, getMonCashCredentials } from "../_shared/bazik.ts";

const MONCASH_GIFT_AMOUNT = 200; // HTG

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  const responseHeaders = {
    ...corsHeaders, ...securityHeaders, ...noCacheHeaders,
    "Content-Type": "application/json",
  };

  try {
    const { mode, userID, secretKey } = getMonCashCredentials();
    if (!userID || !secretKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Service de paiement non configuré" }),
        { status: 503, headers: responseHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit by IP
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.PAYMENT, `gift-mc-${clientIp}`, clientIp);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.length < 16) {
      return new Response(
        JSON.stringify({ success: false, error: "Token invalide" }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Look up gift subscription
    const { data: gift, error: giftError } = await supabase
      .from("gift_subscriptions")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (giftError || !gift) {
      return new Response(
        JSON.stringify({ success: false, error: "Lien introuvable" }),
        { status: 404, headers: responseHeaders }
      );
    }

    // Validate state
    if (gift.status === "completed") {
      return new Response(
        JSON.stringify({ success: false, error: "Ce paiement a déjà été effectué" }),
        { status: 400, headers: responseHeaders }
      );
    }

    if (gift.payment_gateway !== "moncash") {
      return new Response(
        JSON.stringify({ success: false, error: "Ce lien n'est pas un lien MonCash" }),
        { status: 400, headers: responseHeaders }
      );
    }

    if (new Date(gift.expires_at) < new Date()) {
      await supabase
        .from("gift_subscriptions")
        .update({ status: "expired" })
        .eq("id", gift.id);
      return new Response(
        JSON.stringify({ success: false, error: "Ce lien a expiré. Demandez à l'étudiant d'en générer un nouveau." }),
        { status: 400, headers: responseHeaders }
      );
    }

    // If already has a moncash_order_id (payment already initiated), check if still pending
    if (gift.moncash_order_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Un paiement est déjà en cours pour ce lien" }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Create Bazik payment
    const siteUrl = Deno.env.get("SITE_URL") || "https://edupreneurs-haiti-ai.lovable.app";
    const orderId = `GIFT-MC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
    const returnUrl = `${siteUrl}/gift/moncash/callback?orderId=${orderId}&token=${token}`;

    console.log(`Creating MonCash gift payment: token=${token}, amount=${MONCASH_GIFT_AMOUNT}, orderId=${orderId}`);

    const bazikToken = await getBazikToken(userID, secretKey);

    const paymentResponse = await fetch(`${BAZIK_API_BASE}/moncash/token`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${bazikToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        gdes: MONCASH_GIFT_AMOUNT,
        description: `Abonnement Edupreneurs pour ${gift.student_name}`,
        referenceId: orderId,
        returnUrl,
      }),
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("Bazik gift payment error:", paymentResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors de la création du paiement MonCash" }),
        { status: 500, headers: responseHeaders }
      );
    }

    const responseData = await paymentResponse.json();
    const paymentData = responseData.data || responseData;
    const redirectUrl = paymentData.redirectUrl || paymentData.redirect_url;

    if (!redirectUrl) {
      console.error("No redirect URL in Bazik response for gift payment");
      return new Response(
        JSON.stringify({ success: false, error: "Erreur technique du service de paiement" }),
        { status: 500, headers: responseHeaders }
      );
    }

    // Save moncash_order_id to the gift record
    await supabase
      .from("gift_subscriptions")
      .update({ moncash_order_id: orderId })
      .eq("id", gift.id);

    return new Response(
      JSON.stringify({ success: true, redirectUrl }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Error in moncash-gift-payment:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erreur lors de la création du paiement" }),
      { status: 500, headers: responseHeaders }
    );
  }
});
