/**
 * Shared Email Module
 * 
 * Centralized email sending, universal template builder, and payment email
 * templates for all Edupreneurs edge functions.
 * Brand colors: teal #087E7E + amber #FF9F00
 */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Fallback to production domain if SITE_URL secret is missing
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";

// ─── Brand colors — single source of truth for all emails ───

export const BRAND_COLORS = {
  primary: '#087E7E',      // teal — main site color
  primaryDark: '#075E5E',  // teal dark
  accent: '#FF9F00',       // amber — accent color
  secondary: '#7C3AED',    // violet
  blue: '#2563EB',         // security blue
  red: '#EF4444',          // danger/destructive
  cyan: '#0EA5E9',         // donation cyan
  green: '#10B77F',        // success green
  dark: '#232D3F',         // foreground text
  mid: '#6B7280',          // muted text
  light: '#9CA3AF',        // light text
  bg: '#F4F7F6',           // email background
  white: '#FFFFFF',
};

// ─── Template constants ───

const LOGO_URL = 'https://mon-edupreneur.com/logo.png';
// Jude AI avatar for signature block
const JUDE_AVATAR_URL = 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/blog-images/content/1769227733253-download.png';
const CURRENT_YEAR = new Date().getFullYear();

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

// ─── Universal email template builder ───
// Every Edupreneurs email uses this layout:
// Logo → teal-amber stripe → colored header → body → optional CTA → optional Jude signature → footer

export function buildEmailTemplate({
  accentColor,
  icon,
  title,
  subtitle,
  body,
  ctaText,
  ctaUrl,
  showJudeSignature = false,
}: {
  accentColor: string;
  icon: string;
  title: string;
  subtitle?: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  showJudeSignature?: boolean;
}): string {

  // Optional CTA button using the accent color
  const ctaButton = ctaText && ctaUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:24px;">
    <tr><td align="center">
      <a href="${ctaUrl}" style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;">
        ${ctaText}
      </a>
    </td></tr>
    </table>` : '';

  // Optional Jude AI signature with avatar
  const judeSignature = showJudeSignature ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="padding-top:24px;border-top:1px solid #e5e7eb;margin-top:24px;">
    <tr><td>
      <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:12px;vertical-align:middle;">
          <img src="${JUDE_AVATAR_URL}" alt="Jude" width="40" height="40" style="border-radius:50%;display:block;" />
        </td>
        <td style="vertical-align:middle;">
          <p style="margin:0;font-size:14px;font-weight:600;color:${BRAND_COLORS.dark};">Jude</p>
          <p style="margin:0;font-size:12px;color:${BRAND_COLORS.mid};">Ton assistant IA — Edupreneurs 🇭🇹</p>
        </td>
      </tr>
      </table>
    </td></tr>
    </table>` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${BRAND_COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_COLORS.bg};padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;">

  <!-- Logo -->
  <tr><td style="text-align:center;padding-bottom:24px;">
    <img src="${LOGO_URL}" alt="Edupreneurs" width="160" height="auto" style="display:block;margin:0 auto;" />
  </td></tr>

  <!-- Card -->
  <tr><td>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND_COLORS.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Brand stripe: teal → amber (visual signature) -->
      <tr><td style="height:4px;background:linear-gradient(90deg,${BRAND_COLORS.primary},${BRAND_COLORS.accent});font-size:0;line-height:0;">&nbsp;</td></tr>

      <!-- Header with accent color -->
      <tr><td style="background:${accentColor};padding:40px 32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">${icon}</div>
        <h1 style="color:#ffffff;font-size:24px;font-weight:800;margin:0 0 4px;">${title}</h1>
        ${subtitle ? `<p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0;">${subtitle}</p>` : ''}
      </td></tr>

      <!-- Body content -->
      <tr><td style="padding:32px;">
        ${body}
        ${ctaButton}
        ${judeSignature}
      </td></tr>

      <!-- Footer with links -->
      <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:12px;">
          <a href="${SITE_URL}" style="color:${BRAND_COLORS.primary};text-decoration:none;">Site web</a>
          &nbsp;·&nbsp;
          <a href="${SITE_URL}/blog" style="color:${BRAND_COLORS.primary};text-decoration:none;">Blog</a>
          &nbsp;·&nbsp;
          <a href="${SITE_URL}/confidentialite" style="color:${BRAND_COLORS.primary};text-decoration:none;">Confidentialité</a>
        </p>
        <p style="color:#9ca3af;font-size:11px;margin:0;">
          © ${CURRENT_YEAR} Edupreneurs Haiti · 🇭🇹 Fait pour les élèves haïtiens<br>
          Tu reçois cet email car tu as un compte Edupreneurs.
        </p>
      </td></tr>

    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

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

  return buildEmailTemplate({
    accentColor: BRAND_COLORS.primary,
    icon: '🎉',
    title: 'Abonnement activé!',
    subtitle: 'Votre accès de 30 jours est actif',
    body: `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${studentName}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
  Votre abonnement Edupreneurs de 30 jours est maintenant actif. Vous avez accès à toutes les leçons, quiz, tuteurs IA et bien plus!
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;text-align:center;">
  <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Accès actif jusqu'au</p>
  <p style="color:${BRAND_COLORS.primary};font-size:28px;font-weight:700;margin:0 0 12px;">${endDate}</p>
  ${methodBadge}
</td></tr>
</table>`,
    ctaText: 'Continuer à apprendre 🚀',
    ctaUrl: SITE_URL,
  });
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
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.primary,
    icon: '🧾',
    title: 'Reçu de paiement',
    subtitle: 'Abonnement Edupreneurs',
    body: `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${name}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
  Voici le reçu de votre paiement pour votre abonnement Edupreneurs.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Description</td><td style="color:#1f2937;font-size:13px;font-weight:600;text-align:right;padding:6px 0;">${desc}</td></tr>
  <tr><td colspan="2" style="border-bottom:1px solid #e5e7eb;"></td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Montant</td><td style="color:${BRAND_COLORS.primary};font-size:20px;font-weight:700;text-align:right;padding:6px 0;">${amount}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Date</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${date}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Méthode</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${paymentMethod}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Référence</td><td style="color:#9ca3af;font-size:11px;text-align:right;padding:6px 0;">${orderId}</td></tr>
  </table>
</td></tr>
</table>
<p style="color:#9ca3af;font-size:12px;margin:0;">Ce reçu sert de confirmation de paiement. Conservez-le pour vos archives.</p>`,
  });
}

// ─── Template: Gift Student Activation (first-time gift) ───

export function buildGiftStudentEmail(studentName: string, payerName: string, endDate: string): string {
  const displayPayer = payerName || "un proche";
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.primary,
    icon: '🎉',
    title: 'Votre abonnement est activé!',
    subtitle: `Grâce à ${displayPayer}`,
    body: `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${studentName}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
  Bonne nouvelle! <strong>${displayPayer}</strong> a payé votre abonnement Edupreneurs. Vous avez maintenant accès à toutes les leçons, quiz, tuteurs IA et bien plus encore!
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;text-align:center;">
  <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Accès actif jusqu'au</p>
  <p style="color:${BRAND_COLORS.primary};font-size:28px;font-weight:700;margin:0;">${endDate}</p>
</td></tr>
</table>`,
    ctaText: 'Commencer à apprendre 🚀',
    ctaUrl: SITE_URL,
  });
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
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.primary,
    icon: '🧾',
    title: 'Reçu de paiement',
    subtitle: 'Abonnement Edupreneurs',
    body: `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${displayPayer}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
  Voici le reçu de votre paiement pour l'abonnement de <strong>${studentName}</strong> sur Edupreneurs.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Description</td><td style="color:#1f2937;font-size:13px;font-weight:600;text-align:right;padding:6px 0;">Abonnement 30 jours pour ${studentName}</td></tr>
  <tr><td colspan="2" style="border-bottom:1px solid #e5e7eb;"></td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Montant</td><td style="color:${BRAND_COLORS.primary};font-size:20px;font-weight:700;text-align:right;padding:6px 0;">${formattedAmount}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Date</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${date}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Référence</td><td style="color:#9ca3af;font-size:11px;text-align:right;padding:6px 0;">${sessionId}</td></tr>
  </table>
</td></tr>
</table>
<p style="color:#9ca3af;font-size:12px;margin:0;">Ce reçu sert de confirmation de paiement. Conservez-le pour vos archives.</p>`,
  });
}

// ─── Template: Gift Payer Thank You ───

export function buildGiftPayerThankYouEmail(payerName: string, studentName: string): string {
  const displayPayer = payerName || "Ami(e) d'Edupreneurs";
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.primary,
    icon: '💚',
    title: 'Mèsi anpil!',
    subtitle: 'Vous changez des vies 🇭🇹',
    body: `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${displayPayer}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
  Grâce à vous, <strong>${studentName}</strong> a maintenant accès à une éducation de qualité sur Edupreneurs. Votre geste fait une vraie différence!
</p>
<p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 12px;">📚 Ce que ${studentName} peut maintenant faire:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr>
  <td width="33%" style="padding:4px;">
    <table width="100%" style="background:#f0fdfd;border-radius:10px;"><tr><td style="padding:14px;text-align:center;">
      <div style="font-size:24px;margin-bottom:4px;">🤖</div>
      <p style="color:${BRAND_COLORS.primaryDark};font-size:12px;font-weight:600;margin:0;">Tuteurs IA</p>
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
</p>`,
    ctaText: 'Découvrir Edupreneurs',
    ctaUrl: SITE_URL,
  });
}

// ─── Template: Renewal Student (recurring gift) ───

export function buildRenewalStudentEmail(studentName: string, endDate: string): string {
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.primary,
    icon: '🔄',
    title: 'Abonnement renouvelé!',
    subtitle: 'Votre accès continue',
    body: `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Bonjour <strong>${studentName}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
  Votre abonnement Edupreneurs a été renouvelé automatiquement grâce au soutien de votre proche. Continuez à apprendre!
</p>
<table width="100%" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;text-align:center;">
  <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Accès actif jusqu'au</p>
  <p style="color:${BRAND_COLORS.primary};font-size:28px;font-weight:700;margin:0;">${endDate}</p>
</td></tr>
</table>`,
    ctaText: 'Continuer à apprendre 🚀',
    ctaUrl: SITE_URL,
  });
}

// ─── Template: Renewal Payer Receipt (recurring gift) ───

export function buildRenewalPayerEmail(studentName: string, amount: string, date: string): string {
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.primary,
    icon: '🧾',
    title: 'Renouvellement mensuel',
    subtitle: 'Abonnement Edupreneurs',
    body: `<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
  Votre abonnement mensuel pour <strong>${studentName}</strong> a été renouvelé avec succès.
</p>
<table width="100%" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:24px;">
<tr><td style="padding:20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Montant</td><td style="color:${BRAND_COLORS.primary};font-size:18px;font-weight:700;text-align:right;padding:6px 0;">${amount}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Date</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${date}</td></tr>
  <tr><td style="color:#6b7280;font-size:13px;padding:6px 0;">Étudiant</td><td style="color:#1f2937;font-size:13px;text-align:right;padding:6px 0;">${studentName}</td></tr>
  </table>
</td></tr>
</table>
<p style="color:#9ca3af;font-size:12px;margin:0;">Merci pour votre soutien continu! 💚</p>`,
  });
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

    const metadataEmail = txn?.metadata?.email || txn?.metadata?.userEmail;
    const userName = userAuth?.full_name || "Étudiant";

    // Fallback: if metadata has no email, try auth.admin if the client supports it
    let userEmail = metadataEmail;
    if (!userEmail) {
      console.warn(`[Email] WARNING: No email in transaction metadata for order ${orderId}, user ${userId}. Attempting auth fallback.`);
      try {
        const adminClient = supabase as any;
        if (adminClient?.auth?.admin?.getUserById) {
          const { data: authData } = await adminClient.auth.admin.getUserById(userId);
          userEmail = authData?.user?.email;
          if (userEmail) {
            console.warn(`[Email] Fallback succeeded: found email from auth for user ${userId}`);
          }
        }
      } catch (fallbackErr) {
        console.warn(`[Email] Auth fallback failed:`, fallbackErr);
      }
    }

    if (!userEmail) {
      console.error(`[Email] CRITICAL: No email found for user ${userId}, order ${orderId}. Subscription emails NOT sent.`);
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
