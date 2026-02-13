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

    // Mark gift as completed
    await supabaseAdmin
      .from("gift_subscriptions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        payer_email: session.customer_details?.email || null,
      })
      .eq("id", gift.id);

    // Activate/extend student subscription (same stacking logic as moncash-verify-payment)
    const { data: currentProfile } = await supabaseAdmin
      .from("profiles")
      .select("subscription_end_date")
      .eq("user_id", gift.student_user_id)
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
      .eq("user_id", gift.student_user_id);

    if (subError) {
      console.error("Error extending subscription:", subError);
    } else {
      console.log(`Gift subscription activated for ${gift.student_user_id} until ${newEnd.toISOString()}`);
    }

    // Send notification to student
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: gift.student_user_id,
        actor_id: gift.student_user_id,
        type: "gift_payment",
        content: `Un proche a payé votre abonnement ! Accès actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
        read: false,
      });
    } catch (notifErr) {
      console.error("Failed to send notification:", notifErr);
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
