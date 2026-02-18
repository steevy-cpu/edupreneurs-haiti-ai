/**
 * Stripe Gift Payment - Creates a Stripe Checkout session for gift subscriptions
 * 
 * PUBLIC endpoint (no auth required - the family member is not a user).
 * Accepts: { token: string }
 * Returns: { url: string } - Stripe Checkout URL
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  // Create the admin client once — reused for rate limiting and gift lookup.
  // Service role is required to write to the rate_limits table.
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Rate limit: 5 req/min per IP (PAYMENT anonymous config).
  // Prevents automated spamming of Stripe session creation per token.
  const clientIp = getClientIp(req);
  const rateCheck = await checkRateLimit(supabaseAdmin, RATE_LIMITS.PAYMENT, null, clientIp);
  if (!rateCheck.allowed) {
    return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, corsHeaders);
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const body = await req.json();
    const { token, mode: paymentMode } = body;

    if (!token || typeof token !== "string" || token.length < 16) {
      return new Response(
        JSON.stringify({ error: "Token invalide" }),
        { status: 400, headers }
      );
    }

    // Look up the gift subscription using the admin client (already created above)
    const { data: gift, error: giftError } = await supabaseAdmin
      .from("gift_subscriptions")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (giftError || !gift) {
      return new Response(
        JSON.stringify({ error: "Lien de paiement introuvable" }),
        { status: 404, headers }
      );
    }

    if (gift.status === "completed") {
      return new Response(
        JSON.stringify({ error: "Ce paiement a déjà été effectué" }),
        { status: 400, headers }
      );
    }

    if (new Date(gift.expires_at) < new Date()) {
      // Mark as expired
      await supabaseAdmin
        .from("gift_subscriptions")
        .update({ status: "expired" })
        .eq("id", gift.id);

      return new Response(
        JSON.stringify({ error: "Ce lien a expiré. Demandez à l'étudiant d'en générer un nouveau." }),
        { status: 400, headers }
      );
    }

    // Use payment mode from the parsed body (default to one_time)
    const mode = paymentMode === "recurring" ? "recurring" : "one_time";

    // Create Stripe Checkout session
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://edupreneurs-haiti-ai.lovable.app";

    // Recurring monthly price ID from Stripe
    const RECURRING_PRICE_ID = "price_1T0M1kCkC1XzoKhlwDHEUSDz";

    let sessionConfig: Record<string, unknown>;

    if (mode === "recurring") {
      // Subscription mode: use pre-created recurring price
      sessionConfig = {
        line_items: [{ price: RECURRING_PRICE_ID, quantity: 1 }],
        mode: "subscription",
        success_url: `${origin}/gift/success?token=${token}`,
        cancel_url: `${origin}/gift/pay/${token}`,
        metadata: {
          gift_token: token,
          student_name: gift.student_name,
          student_user_id: gift.student_user_id,
        },
        subscription_data: {
          metadata: {
            gift_token: token,
            student_name: gift.student_name,
            student_user_id: gift.student_user_id,
          },
        },
      };
    } else {
      // One-time payment mode (existing flow)
      sessionConfig = {
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Abonnement Edupreneurs pour ${gift.student_name}`,
                description: "30 jours d'accès complet à la plateforme éducative",
              },
              unit_amount: gift.amount_cents, // 200 cents = $2.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/gift/success?token=${token}`,
        cancel_url: `${origin}/gift/pay/${token}`,
        metadata: {
          gift_token: token,
          student_name: gift.student_name,
          student_user_id: gift.student_user_id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig as Stripe.Checkout.SessionCreateParams);

    // Save the Stripe session ID and payment mode
    await supabaseAdmin
      .from("gift_subscriptions")
      .update({ stripe_session_id: session.id, payment_mode: mode })
      .eq("id", gift.id);

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Stripe gift payment error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers }
    );
  }
});
