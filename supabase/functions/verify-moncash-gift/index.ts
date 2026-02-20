/**
 * Verify MonCash Gift Payment - Verifies Bazik payment and activates student subscription
 * 
 * PUBLIC endpoint (called from callback page).
 * Accepts: { token: string, orderId: string }
 * Returns: { success: boolean, studentName?: string, status?: string }
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { BAZIK_API_BASE, getBazikToken, getMonCashCredentials } from "../_shared/bazik.ts";
import {
  sendEmail,
  buildGiftStudentEmail,
  buildSubscriptionInvoiceEmail,
} from "../_shared/emails.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  const responseHeaders = {
    ...corsHeaders, ...securityHeaders, ...noCacheHeaders,
    "Content-Type": "application/json",
  };

  try {
    const { mode, userID, secretKey } = getMonCashCredentials();
    if (!userID || !secretKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Service de paiement non configuré" }),
        { status: 503, headers: responseHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit by IP
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.PAYMENT, `verify-gift-mc-${clientIp}`, clientIp);
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    const { token, orderId } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Token requis" }),
        { status: 400, headers: responseHeaders }
      );
    }
    if (!orderId || typeof orderId !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "orderId requis" }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Look up gift subscription
    const { data: gift, error: giftError } = await supabase
      .from("gift_subscriptions")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (giftError || !gift) {
      return new Response(
        JSON.stringify({ success: false, error: "Lien introuvable" }),
        { status: 404, headers: responseHeaders }
      );
    }

    // Already completed
    if (gift.status === "completed") {
      return new Response(
        JSON.stringify({ success: true, studentName: gift.student_name, alreadyCompleted: true }),
        { status: 200, headers: responseHeaders }
      );
    }

    if (gift.payment_gateway !== "moncash") {
      return new Response(
        JSON.stringify({ success: false, error: "Type de paiement invalide" }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Verify payment via Bazik
    const bazikToken = await getBazikToken(userID, secretKey);
    const lookupId = orderId;

    const verifyResponse = await fetch(`${BAZIK_API_BASE}/moncash/verify/${lookupId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${bazikToken}`,
        "Accept": "application/json",
      },
    });

    if (!verifyResponse.ok) {
      console.error("Bazik verify error:", verifyResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: "Impossible de vérifier le paiement", status: "unknown" }),
        { status: 200, headers: responseHeaders }
      );
    }

    const verifyData = await verifyResponse.json();
    const paymentData = verifyData.data || verifyData;
    const paymentStatus = paymentData.status || paymentData.message;

    const isCompleted = paymentStatus === "successful" || paymentStatus === "completed";
    const isPending = paymentStatus === "pending";

    if (isPending) {
      return new Response(
        JSON.stringify({ success: false, studentName: gift.student_name, status: "pending" }),
        { status: 200, headers: responseHeaders }
      );
    }

    if (!isCompleted) {
      return new Response(
        JSON.stringify({ success: false, error: "Paiement non confirmé", status: paymentStatus }),
        { status: 200, headers: responseHeaders }
      );
    }

    // === Payment completed: activate subscription ===

    // Update gift status
    await supabase
      .from("gift_subscriptions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", gift.id);

    // Resolve student_user_id
    let studentUserId = gift.student_user_id;
    if (!studentUserId && gift.student_email) {
      const { data: userList } = await supabase.auth.admin.listUsers({
        filter: gift.student_email,
        page: 1,
        perPage: 1,
      });
      const matchedUser = userList?.users?.[0];
      if (matchedUser?.email?.toLowerCase() === gift.student_email.toLowerCase()) {
        studentUserId = matchedUser.id;
        await supabase
          .from("gift_subscriptions")
          .update({ student_user_id: studentUserId })
          .eq("id", gift.id);
      }
    }

    if (!studentUserId) {
      console.log(`MonCash gift ${gift.id} completed but student not yet registered (${gift.student_email})`);
      return new Response(
        JSON.stringify({ success: true, studentName: gift.student_name, pendingActivation: true }),
        { status: 200, headers: responseHeaders }
      );
    }

    // Activate/extend subscription (stacking logic)
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("subscription_end_date, full_name")
      .eq("user_id", studentUserId)
      .maybeSingle();

    const now = new Date();
    const currentEnd = currentProfile?.subscription_end_date
      ? new Date(currentProfile.subscription_end_date)
      : null;
    const baseDate = (currentEnd && currentEnd > now) ? currentEnd : now;
    const newEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error: subError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_end_date: newEnd.toISOString(),
      })
      .eq("user_id", studentUserId);

    if (subError) {
      console.error("Error extending subscription:", subError);
    } else {
      console.log(`MonCash gift subscription activated for ${studentUserId} until ${newEnd.toISOString()}`);
    }

    // Create notification
    try {
      await supabase.from("notifications").insert({
        user_id: studentUserId,
        actor_id: studentUserId,
        type: "gift_payment",
        content: `Un proche a payé votre abonnement via MonCash ! Accès actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
        read: false,
      });
    } catch (notifErr) {
      console.error("Failed to send notification:", notifErr);
    }

    // Send push notification for MonCash gift payment
    try {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          recipientUserId: studentUserId,
          title: 'Abonnement offert!',
          body: `Un proche a payé votre abonnement via MonCash ! Accès actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
          type: 'gift_payment',
          url: '/settings?tab=compte',
        }),
      });
    } catch (pushErr) {
      console.error("Failed to send push notification:", pushErr);
    }

    // Send emails
    const endDateStr = newEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const dateNow = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    // Email 1: Student activation
    try {
      await sendEmail(
        gift.student_email,
        "🎉 Votre abonnement est activé! — Edupreneurs",
        buildGiftStudentEmail(gift.student_name, "un proche (via MonCash)", endDateStr)
      );
      console.log("Student activation email sent to", gift.student_email);
    } catch (e) {
      console.error("Student email failed:", e);
    }

    // Email 2: Receipt to student (MonCash has no payer email)
    try {
      await sendEmail(
        gift.student_email,
        "🧾 Reçu de paiement — Edupreneurs",
        buildSubscriptionInvoiceEmail(
          gift.student_name,
          "200 HTG",
          orderId,
          dateNow,
          "MonCash",
          `Abonnement 30 jours pour ${gift.student_name}`
        )
      );
      console.log("Invoice email sent to", gift.student_email);
    } catch (e) {
      console.error("Invoice email failed:", e);
    }

    return new Response(
      JSON.stringify({ success: true, studentName: gift.student_name }),
      { status: 200, headers: responseHeaders }
    );
  } catch (error) {
    console.error("Error in verify-moncash-gift:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: responseHeaders }
    );
  }
});
