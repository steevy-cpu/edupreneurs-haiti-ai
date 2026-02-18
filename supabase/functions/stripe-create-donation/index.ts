import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Validate donation inputs before any DB insert or Stripe call.
// amount is in cents (e.g. 500 = $5.00). Email/name/message are optional
// to support anonymous donations, but validated when present.
const donationSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Montant invalide" })
    .positive("Montant doit être positif")
    .max(100000, "Montant trop élevé (max $1000)"),
  donorEmail: z
    .string()
    .email("Adresse email invalide")
    .max(255, "Email trop long")
    .optional()
    .nullable(),
  donorName: z
    .string()
    .max(100, "Nom trop long (max 100 caractères)")
    .optional()
    .nullable(),
  donorMessage: z
    .string()
    .max(500, "Message trop long (max 500 caractères)")
    .optional()
    .nullable(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const responseHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Create admin client early — reused for both rate limiting and DB insert
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Rate limit: 5 req/min per IP for anonymous endpoints (PAYMENT config).
    // Prevents endpoint hammering to create junk donation records or spam Stripe.
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabaseAdmin, RATE_LIMITS.PAYMENT, null, clientIp);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, corsHeaders);
    }

    // Parse and validate all inputs before touching DB or Stripe
    const rawBody = await req.json();
    const validation = donationSchema.safeParse(rawBody);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { amount, donorName, donorEmail, donorMessage } = validation.data;

    // Secondary range check in cents (100 = $1.00 minimum, 100000 = $1000 max).
    // Zod validates the raw number; this validates the rounded cent value.
    const amountCents = Math.round(Number(amount));
    if (!amountCents || amountCents < 100 || amountCents > 100000) {
      return new Response(
        JSON.stringify({ error: "Montant invalide (min $1, max $1000)" }),
        { status: 400, headers: responseHeaders }
      );
    }

    const orderId = `DON-STRIPE-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();

    await supabaseAdmin.from("donations").insert({
      order_id: orderId,
      amount: amountCents / 100,
      currency: "USD",
      provider: "stripe",
      donor_name: donorName?.trim() || null,
      donor_email: donorEmail?.trim() || null,
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
        donor_email: donorEmail?.trim() || "",
        donor_message: donorMessage?.trim() || "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: responseHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("Stripe donation error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      headers: responseHeaders,
      status: 500,
    });
  }
});
