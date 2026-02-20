/**
 * Stripe Gift Webhook - Handles recurring subscription renewals
 * 
 * Listens for `invoice.paid` events from Stripe subscriptions.
 * When a recurring gift subscription renews, extends the student's subscription by 30 days.
 * 
 * PUBLIC endpoint (Stripe sends webhooks without auth).
 * Requires STRIPE_WEBHOOK_SECRET_GIFT for signature verification.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import {
  sendEmail,
  buildRenewalStudentEmail,
  buildRenewalPayerEmail,
} from "../_shared/emails.ts";

serve(async (req) => {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET_GIFT");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET_GIFT is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    console.log(`[GIFT-WEBHOOK] Received event: ${event.type}, id: ${event.id}`);

    // Only process invoice.paid for subscription renewals
    if (event.type !== "invoice.paid") {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const invoice = event.data.object as Stripe.Invoice;

    // Skip the first invoice (initial payment handled by verify-gift-payment)
    if (invoice.billing_reason === "subscription_create") {
      console.log("[GIFT-WEBHOOK] Skipping initial subscription invoice");
      return new Response(JSON.stringify({ received: true, skipped: "initial_payment" }), { status: 200 });
    }

    const subscriptionId = typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

    if (!subscriptionId) {
      console.log("[GIFT-WEBHOOK] No subscription ID in invoice, skipping");
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Idempotency check
    const invoiceId = invoice.id;
    const { data: existingGift } = await supabaseAdmin
      .from("gift_subscriptions")
      .select("id")
      .eq("stripe_session_id", invoiceId)
      .maybeSingle();

    if (existingGift) {
      console.log(`[GIFT-WEBHOOK] Invoice ${invoiceId} already processed, skipping (idempotent)`);
      return new Response(JSON.stringify({ received: true, skipped: "already_processed" }), { status: 200 });
    }

    // Look up gift subscription by Stripe subscription ID
    const { data: gift, error: giftError } = await supabaseAdmin
      .from("gift_subscriptions")
      .select("*")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (giftError || !gift) {
      console.log(`[GIFT-WEBHOOK] No gift found for subscription ${subscriptionId}`);
      return new Response(JSON.stringify({ received: true, skipped: "no_gift_found" }), { status: 200 });
    }

    // Resolve student_user_id
    let studentUserId = gift.student_user_id;
    if (!studentUserId && gift.student_email) {
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers({
        filter: gift.student_email,
        page: 1,
        perPage: 1,
      });
      const matchedUser = userList?.users?.[0];
      if (matchedUser?.email?.toLowerCase() === gift.student_email.toLowerCase()) {
        studentUserId = matchedUser.id;
        await supabaseAdmin
          .from("gift_subscriptions")
          .update({ student_user_id: studentUserId })
          .eq("id", gift.id);
      }
    }

    if (!studentUserId) {
      console.log(`[GIFT-WEBHOOK] Student not yet registered (${gift.student_email}), skipping renewal`);
      return new Response(
        JSON.stringify({ received: true, skipped: "student_not_registered" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[GIFT-WEBHOOK] Processing renewal for student ${studentUserId}`);

    // Extend student subscription by 30 days (stacking logic)
    const { data: currentProfile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_end_date")
      .eq("user_id", studentUserId)
      .maybeSingle();

    const now = new Date();
    const currentEnd = currentProfile?.subscription_end_date
      ? new Date(currentProfile.subscription_end_date)
      : null;
    const baseDate = (currentEnd && currentEnd > now) ? currentEnd : now;
    const newEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error: subError } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_end_date: newEnd.toISOString(),
      })
      .eq("user_id", studentUserId);

    if (subError) {
      console.error("[GIFT-WEBHOOK] Error extending subscription:", subError);
      return new Response(JSON.stringify({ error: "Failed to extend subscription" }), { status: 500 });
    }

    console.log(`[GIFT-WEBHOOK] Subscription extended to ${newEnd.toISOString()}`);

    // Send notification
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: studentUserId,
        actor_id: studentUserId,
        type: "gift_payment",
        content: `Votre abonnement a été renouvelé automatiquement! Accès actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
        read: false,
      });
    } catch (e) {
      console.error("[GIFT-WEBHOOK] Notification error:", e);
    }

    // Send push notification for gift webhook renewal
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          recipientUserId: studentUserId,
          title: 'Abonnement renouvelé!',
          body: `Votre abonnement a été renouvelé automatiquement! Accès actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
          type: 'gift_payment',
          url: '/settings?tab=compte',
        }),
      });
    } catch (pushErr) {
      console.error("[GIFT-WEBHOOK] Push notification error:", pushErr);
    }

    // Send emails (using shared module)
    const endDateStr = newEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const dateNow = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const amountStr = `$${((invoice.amount_paid || 200) / 100).toFixed(2)} USD`;

    // Student renewal email
    try {
      await sendEmail(
        gift.student_email,
        "🔄 Abonnement renouvelé — Edupreneurs",
        buildRenewalStudentEmail(gift.student_name, endDateStr)
      );
    } catch (e) {
      console.error("[GIFT-WEBHOOK] Student email error:", e);
    }

    // Payer renewal receipt
    const payerEmail = gift.payer_email || invoice.customer_email;
    if (payerEmail) {
      try {
        await sendEmail(
          payerEmail,
          "🧾 Renouvellement mensuel — Edupreneurs",
          buildRenewalPayerEmail(gift.student_name, amountStr, dateNow)
        );
      } catch (e) {
        console.error("[GIFT-WEBHOOK] Payer email error:", e);
      }
    }

    return new Response(
      JSON.stringify({ received: true, extended_to: newEnd.toISOString() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[GIFT-WEBHOOK] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
