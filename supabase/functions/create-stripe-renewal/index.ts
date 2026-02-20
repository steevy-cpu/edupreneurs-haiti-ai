/**
 * Create Stripe Renewal - Authenticated self-pay for subscription renewal
 * 
 * Requires JWT auth. Creates a Stripe Checkout session for $2 USD one-time payment.
 * On success, redirects to /payment/stripe-renewal-callback.
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

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        { status: 401, headers }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Non authentifié" }),
        { status: 401, headers }
      );
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;

    if (!userEmail) {
      return new Response(
        JSON.stringify({ error: "Email non disponible" }),
        { status: 400, headers }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "https://edupreneurs-haiti-ai.lovable.app";

    // Create one-time payment Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Renouvellement Edupreneurs — 30 jours",
              description: "Accès complet à la plateforme éducative pendant 30 jours",
            },
            unit_amount: 200, // $2.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment/stripe-renewal-callback?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/settings?tab=account#subscription`,
      metadata: {
        user_id: userId,
        type: "renewal",
      },
    });

    console.log(`[Stripe Renewal] Session created for user ${userId}: ${session.id}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Stripe renewal error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers }
    );
  }
});
