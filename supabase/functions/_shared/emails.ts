/**
 * Shared Email Module
 * 
 * Centralized email sending and template building for all payment flows.
 * All edge functions import from here instead of duplicating email logic.
 */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://edupreneurs-haiti-ai.lovable.app";

// ─── Core send function ───

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY || !to) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Edupreneurs Haiti <noreply@mon-edupreneur.com>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) console.error("[Email] Send failed:", await res.text());
  } catch (err) {
    console.error("[Email] Exception:", err);
  }
}

// ─── Shared layout wrapper ───

function emailWrapper(headerBg: string, headerIcon: string, headerTitle: string, headerSubtitle: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:${headerBg};padding:40px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:8px;">${headerIcon}</div>
  <h1 style="color:#ffffff;font-size:26px;margin:0 0 4px;">${headerTitle}</h1>
  <p style="color:#d1fae5;font-size:14px;margin:0;">${headerSubtitle}</p>
</td></tr>
<tr><td style="padding:32px;">
  ${bodyContent}
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

const GREEN_GRADIENT = "linear-gradient(135deg,#16a34a,#059669)";

// ─── Template: Subscription Confirmation (for the student/user) ───

export function buildSubscriptionConfirmationEmail(
  studentName: string,
  endDate: string,
  paymentMethod: "MonCash" | "NatCash" | "Stripe"
): string {
  const methodBadge = paymentMethod === "MonCash"
    ? '<span style="display:inline-block;background:#ff6600;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;">MonCash</span>'
    : paymentMethod === "NatCash"
    ? '<span style="display:inline-block;background:#0066cc;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;">NatCash</span>'
    : '<span style="display:inline-block;background:#635bff;color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:600;">Stripe</span>';

  return emailWrapper(
    GREEN_GRADIENT, "🎉", "Abonnement activé!", "Votre accès de 30 jours est actif",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${studentName}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
  Votre abonnement Edupreneurs de 30 jours est maintenant actif. Vous avez accès à toutes les leçons, quiz, tuteurs IA et bien plus!
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;text-align:center;">
  <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Accès actif jusqu'au</p>
  <p style="color:#16a34a;font-size:28px;font-weight:700;margin:0 0 12px;">${endDate}</p>
  ${methodBadge}
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <a href="${SITE_URL}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;">
    Continuer à apprendre 🚀
  </a>
</td></tr></table>`
  );
}

// ─── Template: Invoice/Receipt (for the payer) ───

export function buildSubscriptionInvoiceEmail(
  name: string,
  amount: string,
  orderId: string,
  date: string,
  paymentMethod: "MonCash" | "NatCash" | "Stripe",
  description?: string
): string {
  const desc = description || "Abonnement 30 jours";
  return emailWrapper(
    GREEN_GRADIENT, "🧾", "Reçu de paiement", "Abonnement Edupreneurs",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${name}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
  Voici le reçu de votre paiement pour votre abonnement Edupreneurs.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Description</td><td style="color:#1f2937;font-size:13px;font-weight:600;text-align:right;padding:6px 0;">${desc}</td></tr>
  <tr><td colspan="2" style="border-bottom:1px solid #e5e7eb;"></td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Montant</td><td style="color:#16a34a;font-size:20px;font-weight:700;text-align:right;padding:6px 0;">${amount}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Date</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${date}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Méthode</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${paymentMethod}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Référence</td><td style="color:#9ca3af;font-size:11px;text-align:right;padding:6px 0;">${orderId}</td></tr>
  </table>
</td></tr>
</table>
<p style="color:#9ca3af;font-size:12px;margin:0;">Ce reçu sert de confirmation de paiement. Conservez-le pour vos archives.</p>`
  );
}

// ─── Template: Gift Student Activation (first-time gift) ───

export function buildGiftStudentEmail(studentName: string, payerName: string, endDate: string): string {
  const displayPayer = payerName || "un proche";
  return emailWrapper(
    GREEN_GRADIENT, "🎉", "Votre abonnement est activé!", `Grâce à ${displayPayer}`,
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${studentName}</strong>,</p>
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
</td></tr></table>`
  );
}

// ─── Template: Gift Payer Invoice ───

export function buildGiftPayerInvoiceEmail(
  payerName: string,
  studentName: string,
  amount: number,
  sessionId: string,
  date: string
): string {
  const displayPayer = payerName || "Ami(e) d'Edupreneurs";
  const formattedAmount = `$${(amount / 100).toFixed(2)} USD`;
  return emailWrapper(
    GREEN_GRADIENT, "🧾", "Reçu de paiement", "Abonnement Edupreneurs",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${displayPayer}</strong>,</p>
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
<p style="color:#9ca3af;font-size:12px;margin:0;">Ce reçu sert de confirmation de paiement. Conservez-le pour vos archives.</p>`
  );
}

// ─── Template: Gift Payer Thank You ───

export function buildGiftPayerThankYouEmail(payerName: string, studentName: string): string {
  const displayPayer = payerName || "Ami(e) d'Edupreneurs";
  return emailWrapper(
    GREEN_GRADIENT, "💚", "Mèsi anpil!", "Vous changez des vies 🇭🇹",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${displayPayer}</strong>,</p>
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
</td></tr></table>`
  );
}

// ─── Template: Renewal Student (recurring gift) ───

export function buildRenewalStudentEmail(studentName: string, endDate: string): string {
  return emailWrapper(
    GREEN_GRADIENT, "🔄", "Abonnement renouvelé!", "Votre accès continue",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${studentName}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
  Votre abonnement Edupreneurs a été renouvelé automatiquement grâce au soutien de votre proche. Continuez à apprendre!
</p>
<table width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;text-align:center;">
  <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Accès actif jusqu'au</p>
  <p style="color:#16a34a;font-size:28px;font-weight:700;margin:0;">${endDate}</p>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <a href="${SITE_URL}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;">
    Continuer à apprendre 🚀
  </a>
</td></tr></table>`
  );
}

// ─── Template: Renewal Payer Receipt (recurring gift) ───

export function buildRenewalPayerEmail(studentName: string, amount: string, date: string): string {
  return emailWrapper(
    GREEN_GRADIENT, "🧾", "Renouvellement mensuel", "Abonnement Edupreneurs",
    `<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
  Votre abonnement mensuel pour <strong>${studentName}</strong> a été renouvelé avec succès.
</p>
<table width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Montant</td><td style="color:#16a34a;font-size:18px;font-weight:700;text-align:right;padding:6px 0;">${amount}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Date</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${date}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Étudiant</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${studentName}</td></tr>
  </table>
</td></tr>
</table>
<p style="color:#9ca3af;font-size:12px;margin:0;">Merci pour votre soutien continu! 💚</p>`
  );
}

// ─── Helper: Send subscription emails after payment ───

export async function sendSubscriptionEmails(
  supabase: { from: (table: string) => any },
  userId: string,
  orderId: string,
  newEndDate: Date,
  paymentMethod: "MonCash" | "NatCash",
  amount = "200 HTG"
): Promise<void> {
  try {
    // Fetch user email and name
    const { data: userAuth } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .maybeSingle();

    // Get email from auth.users via profiles join isn't possible, 
    // so we read it from the payment_transactions metadata or auth
    // For now, get from auth users table via service role
    // Actually, we need the Supabase admin client for auth.users
    // Let's get email from the transaction metadata instead
    const { data: txn } = await supabase
      .from('payment_transactions')
      .select('metadata')
      .eq('order_id', orderId)
      .maybeSingle();

    const userEmail = txn?.metadata?.email || txn?.metadata?.userEmail;
    const userName = userAuth?.full_name || "Étudiant";

    if (!userEmail) {
      console.log(`[Email] No email found for user ${userId}, skipping emails`);
      return;
    }

    const endDateStr = newEndDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const dateNow = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    // Email 1: Subscription confirmation
    await sendEmail(
      userEmail,
      "🎉 Abonnement activé! — Edupreneurs",
      buildSubscriptionConfirmationEmail(userName, endDateStr, paymentMethod)
    );
    console.log(`[Email] Subscription confirmation sent to ${userEmail}`);

    // Email 2: Invoice/receipt
    await sendEmail(
      userEmail,
      "🧾 Reçu de paiement — Edupreneurs",
      buildSubscriptionInvoiceEmail(userName, amount, orderId, dateNow, paymentMethod)
    );
    console.log(`[Email] Invoice sent to ${userEmail}`);
  } catch (err) {
    // Non-blocking: email failure should never break payment flow
    console.error("[Email] Failed to send subscription emails:", err);
  }
}

// ─── Helper: Send emails with admin Supabase client (for auth email lookup) ───

export async function sendSubscriptionEmailsWithAuth(
  supabaseAdmin: { from: (table: string) => any; auth: { admin: { getUserById: (id: string) => Promise<any> } } },
  userId: string,
  orderId: string,
  newEndDate: Date,
  paymentMethod: "MonCash" | "NatCash",
  amount = "200 HTG"
): Promise<void> {
  try {
    // Fetch user name from profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .maybeSingle();

    // Fetch email from auth
    const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const userEmail = authData?.user?.email;
    const userName = profile?.full_name || "Étudiant";

    if (!userEmail) {
      console.log(`[Email] No email found for user ${userId}, skipping emails`);
      return;
    }

    const endDateStr = newEndDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    const dateNow = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    // Email 1: Subscription confirmation
    await sendEmail(
      userEmail,
      "🎉 Abonnement activé! — Edupreneurs",
      buildSubscriptionConfirmationEmail(userName, endDateStr, paymentMethod)
    );
    console.log(`[Email] Subscription confirmation sent to ${userEmail}`);

    // Email 2: Invoice/receipt
    await sendEmail(
      userEmail,
      "🧾 Reçu de paiement — Edupreneurs",
      buildSubscriptionInvoiceEmail(userName, amount, orderId, dateNow, paymentMethod)
    );
    console.log(`[Email] Invoice sent to ${userEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send subscription emails:", err);
  }
}
