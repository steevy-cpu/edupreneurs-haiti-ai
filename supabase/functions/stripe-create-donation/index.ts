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

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { amount, donorName, donorMessage } = await req.json();

    // Validate amount (minimum $1 USD = 100 cents)
    const amountCents = Math.round(Number(amount));
    if (!amountCents || amountCents < 100 || amountCents > 100000) {
      return new Response(
        JSON.stringify({ error: "Montant invalide (min $1, max $1000)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create donation record
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const orderId = `DON-STRIPE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

    await supabaseAdmin.from("donations").insert({
      order_id: orderId,
      amount: amountCents,
      currency: "USD",
      provider: "stripe",
      donor_name: donorName?.trim() || null,
      donor_message: donorMessage?.trim() || null,
      status: "pending",
    });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const origin = req.headers.get("origin") || "https://edupreneurs-haiti-ai.lovable.app";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product: "prod_Ty7qewpprROFnd",
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/donate/callback?stripe=success&order=${orderId}`,
      cancel_url: `${origin}/donate?cancelled=true`,
      metadata: {
        order_id: orderId,
        donor_name: donorName?.trim() || "",
        donor_message: donorMessage?.trim() || "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Stripe donation error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
