/**
 * Verify Gift Payment - Checks Stripe session and activates student subscription
 * 
 * PUBLIC endpoint (called from success callback page).
 * Accepts: { token: string }
 * Returns: { success: boolean, studentName: string }
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import {
  sendEmail,
  buildGiftStudentEmail,
  buildGiftPayerInvoiceEmail,
  buildGiftPayerThankYouEmail,
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

    const { token } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Token requis" }),
        { status: 400, headers }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Look up gift subscription
    const { data: gift, error: giftError } = await supabaseAdmin
      .from("gift_subscriptions")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (giftError || !gift) {
      return new Response(
        JSON.stringify({ success: false, error: "Lien introuvable" }),
        { status: 404, headers }
      );
    }

    // Already completed
    if (gift.status === "completed") {
      return new Response(
        JSON.stringify({ success: true, studentName: gift.student_name, alreadyCompleted: true }),
        { status: 200, headers }
      );
    }

    // Check Stripe session
    if (!gift.stripe_session_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Aucun paiement trouvé pour ce lien" }),
        { status: 400, headers }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(gift.stripe_session_id);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, error: "Paiement non confirmé" }),
        { status: 400, headers }
      );
    }

    // Mark gift as completed and save subscription ID if recurring
    const updateData: Record<string, unknown> = {
      status: "completed",
      completed_at: new Date().toISOString(),
      payer_email: session.customer_details?.email || null,
    };

    if (gift.payment_mode === "recurring" && session.subscription) {
      updateData.stripe_subscription_id = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    }

    await supabaseAdmin
      .from("gift_subscriptions")
      .update(updateData)
      .eq("id", gift.id);

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
      console.log(`Gift ${gift.id} completed but student not yet registered (${gift.student_email})`);
      return new Response(
        JSON.stringify({ success: true, studentName: gift.student_name, pendingActivation: true }),
        { status: 200, headers }
      );
    }

    // Activate/extend student subscription (stacking logic)
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
      console.error("Error extending subscription:", subError);
    } else {
      console.log(`Gift subscription activated for ${studentUserId} until ${newEnd.toISOString()}`);
    }

    // Send notification
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: studentUserId,
        actor_id: studentUserId,
        type: "gift_payment",
        content: `Un proche a payé votre abonnement ! Accès actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
        read: false,
      });
    } catch (notifErr) {
      console.error("Failed to send notification:", notifErr);
    }

    // --- Send emails (using shared module) ---
    const payerEmail = session.customer_details?.email || null;
    const payerName = session.customer_details?.name || "";
    const endDateStr = newEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const dateNow = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    // Email 1: Student activation
    try {
      await sendEmail(
        gift.student_email,
        "🎉 Votre abonnement est activé! — Edupreneurs",
        buildGiftStudentEmail(gift.student_name, payerName, endDateStr)
      );
      console.log("Student activation email sent to", gift.student_email);
    } catch (e) {
      console.error("Student email failed:", e);
    }

    // Email 2: Payer invoice
    if (payerEmail) {
      try {
        await sendEmail(
          payerEmail,
          "🧾 Reçu de paiement — Abonnement Edupreneurs",
          buildGiftPayerInvoiceEmail(payerName, gift.student_name, gift.amount_cents, gift.stripe_session_id || "", dateNow)
        );
        console.log("Invoice email sent to", payerEmail);
      } catch (e) {
        console.error("Invoice email failed:", e);
      }

      // Email 3: Payer thank you
      try {
        await sendEmail(
          payerEmail,
          "💚 Mèsi anpil! Vous soutenez l'éducation en Haïti — Edupreneurs",
          buildGiftPayerThankYouEmail(payerName, gift.student_name)
        );
        console.log("Thank you email sent to", payerEmail);
      } catch (e) {
        console.error("Thank you email failed:", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, studentName: gift.student_name }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Verify gift payment error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers }
    );
  }
});
