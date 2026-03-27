/**
 * Test All Emails — sends every email template to a single test address.
 * 
 * NOT for production. Protected by INTERNAL_CALL_SECRET.
 * Sends all 20+ Edupreneurs email templates sequentially with a 1s delay
 * between each to avoid Resend rate limits.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import {
  buildEmailTemplate,
  BRAND_COLORS,
  sendEmail,
  buildSubscriptionConfirmationEmail,
  buildSubscriptionInvoiceEmail,
  buildGiftStudentEmail,
  buildGiftPayerInvoiceEmail,
  buildGiftPayerThankYouEmail,
  buildRenewalStudentEmail,
  buildRenewalPayerEmail,
} from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: 1s delay between sends to respect Resend rate limits
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth guard — internal secret OR service role key
  const internalSecret = req.headers.get("x-internal-secret");
  const expectedSecret = Deno.env.get("INTERNAL_CALL_SECRET");
  const authHeader = req.headers.get("authorization") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  const isInternalAuth = !!internalSecret && !!expectedSecret && internalSecret === expectedSecret;
  const isServiceRole = authHeader === `Bearer ${serviceRoleKey}`;
  
  if (!isInternalAuth && !isServiceRole) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const TEST_EMAIL = "celestinsteeve738@gmail.com";
  const TEST_NAME = "Steevy Test";
  const results: { name: string; status: string }[] = [];

  try {
    // ─── 1. Welcome Email ───────────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🎉 [TEST] Bienvenue sur Edupreneurs !", buildEmailTemplate({
      accentColor: BRAND_COLORS.primary,
      icon: '🎉',
      title: 'Bienvenue parmi nous !',
      subtitle: 'Ton aventure éducative commence maintenant',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Salut <strong style="color:${BRAND_COLORS.primary};">${TEST_NAME}</strong> ! 👋
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Ton compte Edupreneurs est maintenant actif. Tu as accès à plus de
          <strong>2 800 leçons</strong> alignées sur le programme du MENFP,
          des examens officiels du BAC avec corrections IA, et ton assistant
          personnel <strong>Jude</strong> disponible 24h/24.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:20px;">
        <tr><td style="padding:16px;text-align:center;">
          <p style="color:${BRAND_COLORS.primaryDark};font-size:15px;font-weight:700;margin:0 0 4px;">🎁 Accès gratuit jusqu'au 8 mai 2026</p>
          <p style="color:#374151;font-size:13px;margin:0;">Profite de toutes les fonctionnalités sans limitation.</p>
        </td></tr>
        </table>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">Commence ta première leçon dès aujourd'hui ! 🚀</p>
      `,
      ctaText: 'Commencer à apprendre →',
      ctaUrl: SITE_URL + '/dashboard',
      showJudeSignature: true,
    }), results, "Welcome");
    await delay(1000);

    // ─── 2. Confirmation Email (OTP) ────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "✉️ [TEST] Confirmez votre inscription", buildEmailTemplate({
      accentColor: BRAND_COLORS.secondary,
      icon: '✉️',
      title: 'Vérifiez votre email',
      subtitle: "Plus qu'une étape pour rejoindre l'aventure !",
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Salut <strong style="color:${BRAND_COLORS.secondary};">${TEST_NAME}</strong> ! 👋
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Voici ton code de confirmation pour finaliser la création de ton compte :
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border:2px dashed #cbd5e1;border-radius:16px;padding:32px;text-align:center;">
          <p style="margin:0 0 12px;font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Ton code de confirmation</p>
          <div style="font-size:42px;font-weight:800;color:${BRAND_COLORS.secondary};letter-spacing:8px;font-family:'SF Mono',SFMono-Regular,Consolas,monospace;">847291</div>
        </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin-bottom:24px;">
        <tr><td style="padding:20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Nom</td><td style="padding:8px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">${TEST_NAME}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Pseudo</td><td style="padding:8px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">@steevy</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Niveau</td><td style="padding:8px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">NS4</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">${TEST_EMAIL}</td></tr>
          </table>
        </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#fef3c7;border-left:4px solid ${BRAND_COLORS.accent};border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">⏱️ Ce code expire dans <strong>15 minutes</strong>. Ne le partage avec personne.</p>
        </td></tr>
        </table>
      `,
    }), results, "Confirmation OTP");
    await delay(1000);

    // ─── 3. Password Reset ──────────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🔐 [TEST] Réinitialisation de votre mot de passe", buildEmailTemplate({
      accentColor: BRAND_COLORS.red,
      icon: '🔐',
      title: 'Réinitialisation',
      subtitle: 'de votre mot de passe',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Salut <strong style="color:${BRAND_COLORS.red};">${TEST_NAME}</strong> ! 👋
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Tu as demandé la réinitialisation de ton mot de passe Edupreneurs.
          Clique sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="background:#fef2f2;border-left:4px solid ${BRAND_COLORS.red};border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">
            ⚠️ Si tu n'as pas demandé cette réinitialisation, ignore cet email. Ton compte reste sécurisé.
          </p>
        </td></tr>
        </table>
        <p style="color:#9ca3af;font-size:13px;margin:0;">Ce lien expire dans 1 heure.</p>
      `,
      ctaText: 'Réinitialiser mon mot de passe →',
      ctaUrl: SITE_URL + '/reset-password?token=test-token-123',
    }), results, "Password Reset");
    await delay(1000);

    // ─── 4. Device Verification ─────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🛡️ [TEST] Vérification de nouvel appareil", buildEmailTemplate({
      accentColor: BRAND_COLORS.accent,
      icon: '🛡️',
      title: 'Nouvel appareil détecté',
      subtitle: 'Une vérification supplémentaire est requise',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Salut <strong style="color:${BRAND_COLORS.accent};">${TEST_NAME}</strong> ! 👋
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
          Une connexion depuis un nouvel appareil a été détectée. Entre ce code pour confirmer :
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-radius:12px;margin-bottom:20px;">
        <tr><td style="padding:16px;">
          <p style="margin:0 0 8px;font-size:14px;color:#92400e;font-weight:600;">📱 Appareil détecté :</p>
          <p style="margin:0 0 4px;font-size:14px;color:#78350f;">iPhone 15 Pro</p>
          <p style="margin:0 0 4px;font-size:14px;color:#78350f;">Navigateur : Safari 17</p>
          <p style="margin:0;font-size:14px;color:#78350f;">Date : jeudi 27 mars 2026 à 14:30</p>
        </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr><td style="background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border:2px dashed #cbd5e1;border-radius:16px;padding:32px;text-align:center;">
          <p style="margin:0 0 12px;font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Ton code de vérification</p>
          <div style="font-size:42px;font-weight:800;color:${BRAND_COLORS.accent};letter-spacing:8px;font-family:'SF Mono',SFMono-Regular,Consolas,monospace;">593017</div>
          <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;">Ce code expire dans 15 minutes</p>
        </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#fef2f2;border-left:4px solid ${BRAND_COLORS.red};border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">
            ⚠️ Si tu ne reconnais pas cette connexion, <strong>change ton mot de passe immédiatement.</strong>
          </p>
        </td></tr>
        </table>
      `,
    }), results, "Device Verification");
    await delay(1000);

    // ─── 5. Login Notification ──────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🔔 [TEST] Nouvelle connexion à votre compte", buildEmailTemplate({
      accentColor: BRAND_COLORS.blue,
      icon: '🔔',
      title: 'Connexion détectée',
      subtitle: 'Nouvelle activité sur votre compte',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Salut <strong style="color:${BRAND_COLORS.blue};">${TEST_NAME}</strong> ! 👋
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Une connexion à ton compte vient d'être détectée :
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-left:4px solid ${BRAND_COLORS.blue};border-radius:0 12px 12px 0;margin-bottom:20px;">
        <tr><td style="padding:20px;">
          <p style="margin:0 0 8px;font-size:14px;color:#1e40af;">📅 <strong>Date :</strong> jeudi 27 mars 2026 à 14:30</p>
          <p style="margin:0 0 8px;font-size:14px;color:#1e40af;">🌐 <strong>Appareil :</strong> Chrome 120 / macOS</p>
          <p style="margin:0 0 8px;font-size:14px;color:#1e40af;">📍 <strong>Localisation :</strong> Port-au-Prince, Haïti</p>
          <p style="margin:0;font-size:14px;color:#1e40af;">📧 <strong>Email :</strong> ${TEST_EMAIL}</p>
        </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        <tr><td style="background:#f0fdf4;border-left:4px solid ${BRAND_COLORS.green};border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;">✅ Si c'est toi, aucune action n'est nécessaire.</p>
        </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#fef2f2;border-left:4px solid ${BRAND_COLORS.red};border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">⚠️ Sinon, sécurise ton compte immédiatement.</p>
        </td></tr>
        </table>
      `,
      ctaText: 'Sécuriser mon compte →',
      ctaUrl: SITE_URL + '/settings',
    }), results, "Login Notification");
    await delay(1000);

    // ─── 6. Farewell Email ──────────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "👋 [TEST] Au revoir - Votre compte a été supprimé", buildEmailTemplate({
      accentColor: '#475569',
      icon: '👋',
      title: 'Au revoir...',
      subtitle: 'Nous sommes tristes de te voir partir',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Salut <strong>${TEST_NAME}</strong>,</p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
          Ton compte Edupreneurs a été supprimé conformément à ta demande.
          Toutes tes données personnelles ont été effacées de nos systèmes.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">
          Si tu changes d'avis un jour, tu seras toujours le bienvenu. La porte reste ouverte. 🇭🇹
        </p>
      `,
      ctaText: 'Revenir sur Edupreneurs →',
      ctaUrl: SITE_URL,
    }), results, "Farewell");
    await delay(1000);

    // ─── 7. Admin Delete Post ───────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "📢 [TEST] Votre publication a été supprimée", buildEmailTemplate({
      accentColor: BRAND_COLORS.red,
      icon: '📢',
      title: 'Publication supprimée',
      subtitle: 'Action de modération',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Salut <strong style="color:${BRAND_COLORS.red};">${TEST_NAME}</strong>,
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
          Une de tes publications a été retirée par notre équipe de modération
          car elle ne respectait pas les conditions d'utilisation d'Edupreneurs.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="background:#f1f5f9;border-radius:8px;padding:12px 16px;">
          <p style="margin:0;font-size:14px;color:#64748b;"><strong>Motif :</strong> Contenu inapproprié</p>
        </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="background:#fef2f2;border-left:4px solid ${BRAND_COLORS.red};border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">
            ⚠️ En cas de violations répétées, ton compte pourra être suspendu.
          </p>
        </td></tr>
        </table>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;">
          Si tu penses que c'est une erreur, contacte-nous à
          <a href="mailto:contact@edupreneurs.com" style="color:${BRAND_COLORS.primary};text-decoration:none;">contact@edupreneurs.com</a>
        </p>
      `,
    }), results, "Admin Delete Post");
    await delay(1000);

    // ─── 8. Report Confirmation ─────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "📬 [TEST] Signalement reçu", buildEmailTemplate({
      accentColor: BRAND_COLORS.secondary,
      icon: '📬',
      title: 'Signalement reçu',
      subtitle: 'Merci de ta vigilance',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Salut <strong style="color:${BRAND_COLORS.secondary};">${TEST_NAME}</strong> ! 🙏
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
          Notre équipe a bien reçu ton rapport et va l'examiner dans les plus
          brefs délais. Grâce à des membres vigilants comme toi, Edupreneurs
          reste un espace sûr et bienveillant.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#f0fdfd;border-left:4px solid ${BRAND_COLORS.primary};border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:${BRAND_COLORS.primaryDark};line-height:1.6;">
            🔒 Ton signalement est traité de façon confidentielle.
          </p>
        </td></tr>
        </table>
      `,
    }), results, "Report Confirmation");
    await delay(1000);

    // ─── 9. Onboarding Day 1 ────────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "📚 [TEST] Ta première leçon t'attend!", buildEmailTemplate({
      accentColor: BRAND_COLORS.primary,
      icon: '📚',
      title: "Ta première leçon t'attend!",
      subtitle: 'Ton compte est prêt',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">
          Salut <strong style="color:${BRAND_COLORS.primary};">${TEST_NAME}</strong> ! 👋
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Tu t'es inscrit sur Edupreneurs — c'est un grand pas !
          Il est temps de commencer ta première leçon. Ça ne prend que <strong>15 minutes</strong>.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:20px;">
        <tr><td style="padding:16px;text-align:center;">
          <p style="color:${BRAND_COLORS.primaryDark};font-size:14px;font-weight:600;margin:0 0 4px;">🎯 Ton objectif du jour</p>
          <p style="color:#374151;font-size:13px;margin:0;">Complète ta première leçon et gagne tes premiers Gold ! 🥇</p>
        </td></tr>
        </table>
      `,
      ctaText: 'Commencer ma première leçon 🚀',
      ctaUrl: SITE_URL + '/matieres',
      showJudeSignature: true,
    }), results, "Onboarding Day 1");
    await delay(1000);

    // ─── 10. Onboarding Day 3 ───────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "👋 [TEST] Tu n'as pas encore commencé — Jude t'attend", buildEmailTemplate({
      accentColor: BRAND_COLORS.accent,
      icon: '👋',
      title: "Jude t'attend!",
      subtitle: "Tu n'as pas encore commencé",
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">
          Salut <strong style="color:${BRAND_COLORS.accent};">${TEST_NAME}</strong> ! 👋
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Ça fait 3 jours — et Jude t'attend toujours.
          Pas de pression, mais sache que c'est maintenant le meilleur moment pour commencer !
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="padding:8px 0;"><p style="color:#374151;font-size:14px;margin:0;"><strong style="color:${BRAND_COLORS.accent};">1️⃣</strong> Va sur mon-edupreneur.com</p></td></tr>
        <tr><td style="padding:8px 0;"><p style="color:#374151;font-size:14px;margin:0;"><strong style="color:${BRAND_COLORS.accent};">2️⃣</strong> Choisis une matière que tu aimes</p></td></tr>
        <tr><td style="padding:8px 0;"><p style="color:#374151;font-size:14px;margin:0;"><strong style="color:${BRAND_COLORS.accent};">3️⃣</strong> Complète ta première leçon en 15 min</p></td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;margin-bottom:20px;">
        <tr><td style="padding:16px;text-align:center;">
          <p style="color:#92400e;font-size:14px;font-weight:600;margin:0;">🎁 Rappel : ton accès est gratuit jusqu'au 8 mai 2026 !</p>
        </td></tr>
        </table>
      `,
      ctaText: 'Voir mes matières 📖',
      ctaUrl: SITE_URL + '/matieres',
      showJudeSignature: true,
    }), results, "Onboarding Day 3");
    await delay(1000);

    // ─── 11. Onboarding Day 7 ───────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🏆 [TEST] Tu as complété une leçon — essaie le Quiz Battle!", buildEmailTemplate({
      accentColor: BRAND_COLORS.primary,
      icon: '🏆',
      title: 'Bravo — essaie le Quiz Battle!',
      subtitle: 'Tu as complété une leçon',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">
          Félicitations <strong style="color:${BRAND_COLORS.primary};">${TEST_NAME}</strong> ! 🎉
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Tu as déjà complété une leçon — c'est le plus difficile !
          Maintenant, essaie le <strong>Quiz Battle</strong> pour défier tes camarades en temps réel.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:20px;">
        <tr><td style="padding:16px;">
          <p style="color:${BRAND_COLORS.primaryDark};font-size:14px;font-weight:600;margin:0 0 8px;">⚔️ Quiz Battle</p>
          <p style="color:#374151;font-size:13px;margin:0 0 4px;">• Défie tes amis en temps réel</p>
          <p style="color:#374151;font-size:13px;margin:0 0 4px;">• Gagne des badges et de l'XP</p>
          <p style="color:#374151;font-size:13px;margin:0;">• Monte dans le classement national</p>
        </td></tr>
        </table>
      `,
      ctaText: 'Défier un camarade 🏆',
      ctaUrl: SITE_URL + '/quiz-battle',
      showJudeSignature: true,
    }), results, "Onboarding Day 7");
    await delay(1000);

    // ─── 12. Birthday ───────────────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🎂 [TEST] Joyeux Anniversaire Steevy! 🎉", buildEmailTemplate({
      accentColor: BRAND_COLORS.accent,
      icon: '🎂',
      title: 'Joyeux Anniversaire !',
      subtitle: `${TEST_NAME}, c'est ton jour ! 🎉`,
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Salut <strong style="color:${BRAND_COLORS.accent};">${TEST_NAME}</strong> ! 🌟
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
          En ce jour spécial, Jude et toute l'équipe Edupreneurs te souhaitent
          un joyeux anniversaire plein de succès ! 🇭🇹
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;margin-bottom:24px;">
        <tr><td style="padding:24px;text-align:center;">
          <div style="font-size:48px;margin-bottom:8px;">🎁</div>
          <p style="color:#92400e;font-size:16px;font-weight:700;margin:0 0 4px;">Cadeau d'anniversaire</p>
          <p style="color:#78350f;font-size:14px;margin:0;">Connecte-toi aujourd'hui pour une surprise spéciale de Jude !</p>
        </td></tr>
        </table>
      `,
      ctaText: 'Récupérer mon cadeau 🎁',
      ctaUrl: SITE_URL + '/dashboard',
      showJudeSignature: true,
    }), results, "Birthday");
    await delay(1000);

    // ─── 13. Donation Thank You ─────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "💙 [TEST] Mèsi anpil pou don ou!", buildEmailTemplate({
      accentColor: BRAND_COLORS.cyan,
      icon: '💙',
      title: 'Mèsi anpil!',
      subtitle: 'Votre générosité change des vies 🇭🇹',
      body: `
        <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
          Mèsi anpil <strong style="color:${BRAND_COLORS.cyan};">${TEST_NAME}</strong> ! 🙏
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
          Ton don de <strong>$25.00 USD</strong> va directement aider les élèves
          haïtiens à accéder à une éducation de qualité. Tu fais partie du changement. 🇭🇹
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;margin-bottom:24px;">
        <tr><td style="padding:20px;text-align:center;">
          <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Montant du don</p>
          <p style="color:${BRAND_COLORS.cyan};font-size:32px;font-weight:700;margin:0;">$25.00 USD</p>
          <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Réf: DON-TEST-123</p>
        </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="background:#f0fdfd;border-left:4px solid ${BRAND_COLORS.primary};border-radius:0 12px 12px 0;padding:16px 20px;">
          <p style="margin:0;font-size:14px;color:${BRAND_COLORS.primaryDark};line-height:1.6;">
            💡 Avec ton soutien, Edupreneurs peut continuer à offrir un accès gratuit aux élèves qui en ont le plus besoin.
          </p>
        </td></tr>
        </table>
      `,
      ctaText: 'Visiter Edupreneurs →',
      ctaUrl: SITE_URL,
    }), results, "Donation Thank You");
    await delay(1000);

    // ─── 14. Subscription Confirmation ──────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🎉 [TEST] Abonnement activé!", 
      buildSubscriptionConfirmationEmail(TEST_NAME, "27 avril 2026", "MonCash"),
      results, "Subscription Confirmation");
    await delay(1000);

    // ─── 15. Subscription Invoice ───────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🧾 [TEST] Reçu de paiement", 
      buildSubscriptionInvoiceEmail(TEST_NAME, "200 HTG", "ORD-TEST-456", "27 mars 2026", "MonCash"),
      results, "Subscription Invoice");
    await delay(1000);

    // ─── 16. Gift Student Email ─────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🎉 [TEST] Votre abonnement est activé!", 
      buildGiftStudentEmail(TEST_NAME, "Maman Test", "27 avril 2026"),
      results, "Gift Student");
    await delay(1000);

    // ─── 17. Gift Payer Invoice ─────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🧾 [TEST] Reçu de paiement cadeau", 
      buildGiftPayerInvoiceEmail("Parent Test", TEST_NAME, 999, "sess_test_123", "27 mars 2026"),
      results, "Gift Payer Invoice");
    await delay(1000);

    // ─── 18. Gift Payer Thank You ───────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "💚 [TEST] Mèsi anpil!", 
      buildGiftPayerThankYouEmail("Parent Test", TEST_NAME),
      results, "Gift Payer Thank You");
    await delay(1000);

    // ─── 19. Renewal Student ────────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🔄 [TEST] Abonnement renouvelé!", 
      buildRenewalStudentEmail(TEST_NAME, "27 mai 2026"),
      results, "Renewal Student");
    await delay(1000);

    // ─── 20. Renewal Payer ──────────────────────────────────────────────
    await sendTestEmail(resend, TEST_EMAIL, "🧾 [TEST] Renouvellement mensuel", 
      buildRenewalPayerEmail(TEST_NAME, "200 HTG", "27 mars 2026"),
      results, "Renewal Payer");

    // ─── Summary ────────────────────────────────────────────────────────
    const passed = results.filter(r => r.status === "sent").length;
    const failed = results.filter(r => r.status !== "sent").length;

    console.log(`[test-all-emails] Done: ${passed} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({
        totalEmails: results.length,
        sent: passed,
        failed,
        recipient: TEST_EMAIL,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[test-all-emails] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message, resultsSoFar: results }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper: send a single test email and record result
async function sendTestEmail(
  resendClient: any,
  to: string,
  subject: string,
  html: string,
  results: { name: string; status: string }[],
  name: string,
) {
  try {
    const response = await resendClient.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [to],
      subject,
      html,
    });
    if (response.error) {
      console.error(`[test-all-emails] ${name} failed:`, response.error);
      results.push({ name, status: `error: ${response.error.message}` });
    } else {
      console.log(`[test-all-emails] ${name} sent: ${response.data?.id}`);
      results.push({ name, status: "sent" });
    }
  } catch (err: any) {
    console.error(`[test-all-emails] ${name} exception:`, err.message);
    results.push({ name, status: `exception: ${err.message}` });
  }
}
