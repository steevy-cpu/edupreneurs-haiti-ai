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

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { token } = await req.json();

    if (!token || typeof token !== "string" || token.length < 16) {
      return new Response(
        JSON.stringify({ error: "Token invalide" }),
        { status: 400, headers }
      );
    }

    // Look up the gift subscription
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

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

    // Create Stripe Checkout session - fixed $2 USD
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://edupreneurs-haiti-ai.lovable.app";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Abonnement Edupreneurs pour ${gift.student_name}`,
              description: "30 jours d'accès complet à la plateforme éducative",
            },
            unit_amount: gift.amount_usd, // 200 cents = $2.00
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
    });

    // Save the Stripe session ID
    await supabaseAdmin
      .from("gift_subscriptions")
      .update({ stripe_session_id: session.id })
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
