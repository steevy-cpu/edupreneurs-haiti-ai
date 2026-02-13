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

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://edupreneurs-haiti-ai.lovable.app";

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY || !to) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: "Edupreneurs Haiti <noreply@mon-edupreneur.com>", to: [to], subject, html }),
  });
  if (!res.ok) console.error("Email send failed:", await res.text());
}

function buildStudentEmail(studentName: string, payerName: string, endDate: string): string {
  const displayPayer = payerName || "un proche";
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#16a34a,#059669);padding:40px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:8px;">🎉</div>
  <h1 style="color:#ffffff;font-size:26px;margin:0 0 4px;">Votre abonnement est activé!</h1>
  <p style="color:#d1fae5;font-size:14px;margin:0;">Grâce à ${displayPayer}</p>
</td></tr>
<tr><td style="padding:32px;">
  <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${studentName}</strong>,</p>
  <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
    Bonne nouvelle! <strong>${displayPayer}</strong> a payé votre abonnement Edupreneurs. Vous avez maintenant accès à toutes les leçons, quiz, tuteurs IA et bien plus encore!
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
  <tr><td style="padding:20px;text-align:center;">
    <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Accès actif jusqu'au</p>
    <p style="color:#16a34a;font-size:28px;font-weight:700;margin:0;">${endDate}</p>
  </td></tr>
  </table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <a href="${SITE_URL}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;">
      Commencer à apprendre 🚀
    </a>
  </td></tr></table>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Edupreneurs Haiti · Transfòme edikasyon an nan Ayiti</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildPayerInvoiceEmail(payerName: string, studentName: string, amount: number, sessionId: string, date: string): string {
  const displayPayer = payerName || "Ami(e) d'Edupreneurs";
  const formattedAmount = `$${(amount / 100).toFixed(2)} USD`;
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#16a34a,#059669);padding:40px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:8px;">🧾</div>
  <h1 style="color:#ffffff;font-size:26px;margin:0 0 4px;">Reçu de paiement</h1>
  <p style="color:#d1fae5;font-size:14px;margin:0;">Abonnement Edupreneurs</p>
</td></tr>
<tr><td style="padding:32px;">
  <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${displayPayer}</strong>,</p>
  <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
    Voici le reçu de votre paiement pour l'abonnement de <strong>${studentName}</strong> sur Edupreneurs.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
  <tr><td style="padding:20px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Description</td><td style="color:#1f2937;font-size:13px;font-weight:600;text-align:right;padding:6px 0;">Abonnement 30 jours pour ${studentName}</td></tr>
    <tr><td colspan="2" style="border-bottom:1px solid #e5e7eb;"></td></tr>
    <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Montant</td><td style="color:#16a34a;font-size:20px;font-weight:700;text-align:right;padding:6px 0;">${formattedAmount}</td></tr>
    <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Date</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${date}</td></tr>
    <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Référence</td><td style="color:#9ca3af;font-size:11px;text-align:right;padding:6px 0;">${sessionId}</td></tr>
    </table>
  </td></tr>
  </table>
  <p style="color:#9ca3af;font-size:12px;margin:0;">Ce reçu sert de confirmation de paiement. Conservez-le pour vos archives.</p>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Edupreneurs Haiti · Transfòme edikasyon an nan Ayiti</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildPayerThankYouEmail(payerName: string, studentName: string): string {
  const displayPayer = payerName || "Ami(e) d'Edupreneurs";
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#16a34a,#059669);padding:40px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:8px;">💚</div>
  <h1 style="color:#ffffff;font-size:26px;margin:0 0 4px;">Mèsi anpil!</h1>
  <p style="color:#d1fae5;font-size:14px;margin:0;">Vous changez des vies 🇭🇹</p>
</td></tr>
<tr><td style="padding:32px;">
  <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${displayPayer}</strong>,</p>
  <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
    Grâce à vous, <strong>${studentName}</strong> a maintenant accès à une éducation de qualité sur Edupreneurs. Votre geste fait une vraie différence!
  </p>
  <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 12px;">📚 Ce que ${studentName} peut maintenant faire:</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr>
    <td width="33%" style="padding:4px;">
      <table width="100%" style="background:#eff6ff;border-radius:10px;"><tr><td style="padding:14px;text-align:center;">
        <div style="font-size:24px;margin-bottom:4px;">🤖</div>
        <p style="color:#1e40af;font-size:12px;font-weight:600;margin:0;">Tuteurs IA</p>
      </td></tr></table>
    </td>
    <td width="33%" style="padding:4px;">
      <table width="100%" style="background:#fef3c7;border-radius:10px;"><tr><td style="padding:14px;text-align:center;">
        <div style="font-size:24px;margin-bottom:4px;">📖</div>
        <p style="color:#92400e;font-size:12px;font-weight:600;margin:0;">Leçons</p>
      </td></tr></table>
    </td>
    <td width="33%" style="padding:4px;">
      <table width="100%" style="background:#fce7f3;border-radius:10px;"><tr><td style="padding:14px;text-align:center;">
        <div style="font-size:24px;margin-bottom:4px;">🧠</div>
        <p style="color:#9d174d;font-size:12px;font-weight:600;margin:0;">Quiz</p>
      </td></tr></table>
    </td>
  </tr>
  </table>
  <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
    Edupreneurs aide les élèves haïtiens à accéder à une éducation moderne avec l'intelligence artificielle. Chaque abonnement compte!
  </p>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <a href="${SITE_URL}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">
      Découvrir Edupreneurs
    </a>
  </td></tr></table>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Edupreneurs Haiti · Transfòme edikasyon an nan Ayiti</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

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

    // For recurring payments, store the Stripe subscription ID
    if (gift.payment_mode === "recurring" && session.subscription) {
      updateData.stripe_subscription_id = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
    }

    await supabaseAdmin
      .from("gift_subscriptions")
      .update(updateData)
      .eq("id", gift.id);

    // Resolve student_user_id: if null, look up by email (targeted, not full scan)
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
        // Link the gift record to the student
        await supabaseAdmin
          .from("gift_subscriptions")
          .update({ student_user_id: studentUserId })
          .eq("id", gift.id);
      }
    }

    // If student hasn't created account yet, mark as completed but skip activation
    if (!studentUserId) {
      console.log(`Gift ${gift.id} completed but student not yet registered (${gift.student_email})`);
      return new Response(
        JSON.stringify({ success: true, studentName: gift.student_name, pendingActivation: true }),
        { status: 200, headers }
      );
    }

    // Activate/extend student subscription (same stacking logic as moncash-verify-payment)
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

    // Send notification to student
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

    // --- Send emails ---
    const payerEmail = session.customer_details?.email || null;
    const payerName = session.customer_details?.name || "";
    const endDateStr = newEnd.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const dateNow = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    // Email 1: Student activation
    try {
      await sendEmail(
        gift.student_email,
        "🎉 Votre abonnement est activé! — Edupreneurs",
        buildStudentEmail(gift.student_name, payerName, endDateStr)
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
          buildPayerInvoiceEmail(payerName, gift.student_name, gift.amount_usd, gift.stripe_session_id || "", dateNow)
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
          buildPayerThankYouEmail(payerName, gift.student_name)
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
