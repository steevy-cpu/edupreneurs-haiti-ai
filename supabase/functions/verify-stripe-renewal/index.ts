/**
 * Verify Stripe Renewal - Verifies Stripe payment and extends subscription
 * 
 * Called from the callback page after Stripe redirect.
 * Accepts: { sessionId: string }
 * Returns: { success: boolean, subscriptionEnd?: string }
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import {
  sendEmail,
  buildSubscriptionConfirmationEmail,
  buildSubscriptionInvoiceEmail,
} from "../_shared/emails.ts";

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

    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "sessionId requis" }),
        { status: 400, headers }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Retrieve Checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, error: "Paiement non confirmé", status: session.payment_status }),
        { status: 200, headers }
      );
    }

    const userId = session.metadata?.user_id;
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: "Utilisateur non identifié" }),
        { status: 400, headers }
      );
    }

    // Initialize admin Supabase
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Idempotency: check if this session was already processed
    const { data: existingTxn } = await supabaseAdmin
      .from("payment_transactions")
      .select("id")
      .eq("order_id", sessionId)
      .maybeSingle();

    if (existingTxn) {
      // Already processed, fetch current end date
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("subscription_end_date")
        .eq("user_id", userId)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          success: true,
          subscriptionEnd: profile?.subscription_end_date,
          alreadyProcessed: true,
        }),
        { status: 200, headers }
      );
    }

    // Fetch current profile for stacking logic
    const { data: currentProfile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_end_date, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    const now = new Date();
    const currentEnd = currentProfile?.subscription_end_date
      ? new Date(currentProfile.subscription_end_date)
      : null;
    const baseDate = currentEnd && currentEnd > now ? currentEnd : now;
    const newEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Update subscription
    const { error: subError } = await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_end_date: newEnd.toISOString(),
      })
      .eq("user_id", userId);

    if (subError) {
      console.error("Error extending subscription:", subError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors de l'activation" }),
        { status: 500, headers }
      );
    }

    console.log(`[Stripe Renewal] Subscription extended for ${userId} until ${newEnd.toISOString()}`);

    // Record payment transaction
    try {
      await supabaseAdmin.from("payment_transactions").insert({
        user_id: userId,
        order_id: sessionId,
        amount: 200,
        status: "completed",
        payment_method: "stripe",
        metadata: {
          type: "renewal",
          stripe_session_id: sessionId,
          userEmail: session.customer_email || session.customer_details?.email,
        },
      });
    } catch (txnErr) {
      console.error("Failed to record transaction:", txnErr);
    }

    // Create notification
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        actor_id: userId,
        type: "subscription_renewed",
        content: `Abonnement renouvelé via Stripe ! Accès actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
        read: false,
      });
    } catch (notifErr) {
      console.error("Failed to send notification:", notifErr);
    }

    // Send push notification for subscription renewal
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          recipientUserId: userId,
          title: 'Abonnement renouvelé!',
          body: `Votre abonnement est actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
          type: 'subscription_renewed',
          url: '/settings?tab=compte',
        }),
      });
    } catch (pushErr) {
      console.error("Failed to send push notification:", pushErr);
    }

    // Send emails
    const userName = currentProfile?.full_name || "Étudiant";
    const userEmail = session.customer_email || session.customer_details?.email;
    const endDateStr = newEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const dateNow = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    if (userEmail) {
      try {
        await sendEmail(
          userEmail,
          "🎉 Abonnement renouvelé! — Edupreneurs",
          buildSubscriptionConfirmationEmail(userName, endDateStr, "Stripe")
        );
        await sendEmail(
          userEmail,
          "🧾 Reçu de paiement — Edupreneurs",
          buildSubscriptionInvoiceEmail(userName, "$2.00 USD", sessionId, dateNow, "Stripe", "Renouvellement 30 jours")
        );
        console.log(`[Email] Renewal emails sent to ${userEmail}`);
      } catch (emailErr) {
        console.error("Failed to send emails:", emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, subscriptionEnd: newEnd.toISOString() }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Verify stripe renewal error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers }
    );
  }
});
