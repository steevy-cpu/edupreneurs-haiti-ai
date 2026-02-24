/**
 * Stripe Donation Webhook — reliable server-side donation completion.
 *
 * Listens for `checkout.session.completed` events from Stripe.
 * Matches the session's `order_id` metadata to the donations table,
 * updates status from 'pending' → 'completed', and triggers
 * the thank-you email via the send-donation-thank-you edge function.
 *
 * PUBLIC endpoint — Stripe sends webhooks without auth.
 * Requires STRIPE_WEBHOOK_SECRET_GIFT for signature verification (shared with gift webhook).
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

serve(async (req) => {
  // Only accept POST — Stripe always sends webhooks via POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    // Reuse the gift webhook secret — same Stripe endpoint handles both
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_GIFT");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET_GIFT is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
    }

    // Verify webhook signature to prevent spoofed events
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("[DONATION-WEBHOOK] Signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    console.log(`[DONATION-WEBHOOK] Received event: ${event.type}, id: ${event.id}`);

    // Only process completed checkout sessions — ignore all other event types
    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      console.log("[DONATION-WEBHOOK] No order_id in session metadata, skipping");
      return new Response(JSON.stringify({ received: true, skipped: "no_order_id" }), { status: 200 });
    }

    // Admin client — bypasses RLS to update donations table
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Idempotent update: only transitions 'pending' → 'completed'.
    // If the callback page already completed this donation, 0 rows are affected.
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("donations")
      .update({ status: "completed" })
      .eq("order_id", orderId)
      .eq("status", "pending")
      .select("id, donor_name, donor_email, amount, currency, order_id")
      .maybeSingle();

    if (updateError) {
      console.error("[DONATION-WEBHOOK] Update error:", updateError);
      return new Response(JSON.stringify({ error: "DB update failed" }), { status: 500 });
    }

    if (!updated) {
      // Already completed by callback page or duplicate event — safe to ignore
      console.log(`[DONATION-WEBHOOK] Donation ${orderId} already completed or not found`);
      return new Response(JSON.stringify({ received: true, skipped: "already_completed" }), { status: 200 });
    }

    console.log(`[DONATION-WEBHOOK] Donation ${orderId} marked completed`);

    // Send thank-you email if donor provided an email address
    if (updated.donor_email) {
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-donation-thank-you`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            donorName: updated.donor_name || "",
            donorEmail: updated.donor_email,
            amount: updated.amount,
            currency: updated.currency,
            orderId: updated.order_id,
          }),
        });
      } catch (emailErr) {
        // Non-fatal — donation is already completed, email failure is logged but not retried
        console.error("[DONATION-WEBHOOK] Thank-you email error:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ received: true, completed: orderId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[DONATION-WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
