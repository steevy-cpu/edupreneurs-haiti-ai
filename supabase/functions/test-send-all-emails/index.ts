/**
 * TEST ONLY: Send all email templates to a single address for visual review.
 * Protected by X-Internal-Secret. Delete this function after testing.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  sendEmail,
  buildSubscriptionConfirmationEmail,
  buildSubscriptionInvoiceEmail,
  buildGiftStudentEmail,
  buildGiftPayerInvoiceEmail,
  buildGiftPayerThankYouEmail,
  buildRenewalStudentEmail,
  buildRenewalPayerEmail,
} from "../_shared/emails.ts";
import { getTimeAwareGreeting } from "../_shared/emailGreeting.ts";

const TEST_EMAIL = "celestinsteeve738@gmail.com";
const TEST_NAME = "Steeve Celestin";
const SITE_URL = "https://mon-edupreneur.com";

// Auth guard — same pattern as other internal functions
function validateSecret(req: Request): boolean {
  const secret = req.headers.get("x-internal-secret");
  const expected = Deno.env.get("INTERNAL_CALL_SECRET");
  return !!secret && !!expected && secret === expected;
}

// ─── Delay helper to avoid Resend rate limits ───
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Inline templates from existing edge functions (read-only copies) ───

function welcomeEmailHtml(): string {
  const greeting = getTimeAwareGreeting(TEST_NAME);
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" style="background:#f8fafc;"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;max-width:600px;">
<tr><td style="text-align:center;padding-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180"/></td></tr>
<tr><td><table width="100%" style="background:#fff;border-radius:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#10b981,#059669,#047857);padding:50px 40px;text-align:center;">
<div style="font-size:64px;margin-bottom:16px;">🎉</div>
<h1 style="margin:0 0 12px;font-size:32px;font-weight:800;color:#fff;">Bienvenue parmi nous !</h1>
<p style="margin:0;font-size:18px;color:rgba(255,255,255,0.9);">Votre aventure éducative commence maintenant</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:18px;color:#1e293b;margin:0 0 24px;">${greeting}</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 32px;">Félicitations ! Vous faites maintenant partie de la communauté Edupreneurs.</p>
<table width="100%" style="margin-bottom:32px;"><tr><td style="text-align:center;">
<a href="${SITE_URL}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:700;">🚀 Accéder à la plateforme</a>
</td></tr></table>
</td></tr></table></td></tr>
<tr><td style="padding:40px 20px;text-align:center;"><p style="font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} Edupreneurs. Tous droits réservés.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function confirmationEmailHtml(): string {
  const greeting = getTimeAwareGreeting(TEST_NAME);
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" style="background:#f8fafc;"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;max-width:600px;">
<tr><td style="text-align:center;padding-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180"/></td></tr>
<tr><td><table width="100%" style="background:#fff;border-radius:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6);padding:50px 40px;text-align:center;">
<div style="font-size:64px;margin-bottom:16px;">✉️</div>
<h1 style="margin:0 0 12px;font-size:32px;font-weight:800;color:#fff;">Vérifiez votre email</h1>
<p style="margin:0;font-size:18px;color:rgba(255,255,255,0.9);">Plus qu'une étape pour rejoindre l'aventure !</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:18px;color:#1e293b;margin:0 0 24px;">${greeting}</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 32px;">Bienvenue sur Edupreneurs ! Pour activer votre compte, utilisez le code ci-dessous. <strong style="color:#ef4444;">Ce code expire dans 1 heure.</strong></p>
<table width="100%" style="margin-bottom:32px;"><tr><td style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:2px dashed #cbd5e1;border-radius:16px;padding:32px;text-align:center;">
<p style="font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Votre code de confirmation</p>
<div style="font-size:42px;font-weight:800;color:#6366f1;letter-spacing:8px;font-family:monospace;">123456</div>
</td></tr></table>
<table width="100%" style="background:#f8fafc;border-radius:16px;margin-bottom:32px;"><tr><td style="padding:24px;">
<h3 style="font-size:16px;color:#1e293b;margin:0 0 20px;">📋 Informations de votre compte</h3>
<table width="100%">
<tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Nom complet</td><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;color:#1e293b;font-weight:600;">${TEST_NAME}</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Pseudo</td><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;color:#1e293b;font-weight:600;">@steeve</td></tr>
<tr><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#64748b;">Niveau</td><td style="padding:12px 0;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;color:#1e293b;font-weight:600;">NS4</td></tr>
<tr><td style="padding:12px 0;font-size:14px;color:#64748b;">Email</td><td style="padding:12px 0;text-align:right;font-size:14px;color:#1e293b;font-weight:600;">${TEST_EMAIL}</td></tr>
</table>
</td></tr></table>
</td></tr></table></td></tr>
<tr><td style="padding:40px 20px;text-align:center;"><p style="font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} Edupreneurs.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function passwordResetEmailHtml(): string {
  const greeting = getTimeAwareGreeting(TEST_NAME);
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" style="background:#f8fafc;"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;max-width:600px;">
<tr><td style="text-align:center;padding-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180"/></td></tr>
<tr><td><table width="100%" style="background:#fff;border-radius:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#f97316,#ea580c,#dc2626);padding:50px 40px;text-align:center;">
<div style="font-size:64px;margin-bottom:16px;">🔐</div>
<h1 style="margin:0 0 12px;font-size:32px;font-weight:800;color:#fff;">Réinitialisation</h1>
<p style="margin:0;font-size:18px;color:rgba(255,255,255,0.9);">de votre mot de passe</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:18px;color:#1e293b;margin:0 0 24px;">${greeting}</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 32px;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Edupreneurs.</p>
<table width="100%" style="margin-bottom:24px;"><tr><td style="text-align:center;">
<a href="${SITE_URL}/reset-password?token=test123" style="display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;text-decoration:none;padding:16px 48px;border-radius:12px;font-weight:700;">🔑 Réinitialiser mon mot de passe</a>
</td></tr><tr><td style="text-align:center;padding-top:12px;"><p style="font-size:13px;color:#94a3b8;margin:0;">Ce lien est valide pendant 1 heure</p></td></tr></table>
<table width="100%" style="margin-bottom:32px;"><tr><td style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 12px 12px 0;padding:20px;">
<p style="font-size:15px;font-weight:700;color:#991b1b;margin:0 0 8px;">⚠️ Important !</p>
<p style="font-size:14px;color:#b91c1c;line-height:1.6;margin:0;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
</td></tr></table>
</td></tr></table></td></tr>
<tr><td style="padding:40px 20px;text-align:center;"><p style="font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} Edupreneurs.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function deviceVerificationEmailHtml(): string {
  const greeting = getTimeAwareGreeting(TEST_NAME);
  const timestamp = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" style="background:#f8fafc;"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;max-width:600px;">
<tr><td style="text-align:center;padding-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180"/></td></tr>
<tr><td><table width="100%" style="background:#fff;border-radius:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:50px 40px;text-align:center;">
<div style="font-size:64px;margin-bottom:16px;">🔐</div>
<h1 style="margin:0 0 12px;font-size:28px;font-weight:800;color:#fff;">Nouvel appareil détecté</h1>
<p style="margin:0;font-size:16px;color:rgba(255,255,255,0.9);">Une vérification supplémentaire est requise</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:18px;color:#1e293b;margin:0 0 24px;">${greeting}</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 24px;">Nous avons détecté une tentative de connexion depuis un nouvel appareil.</p>
<table width="100%" style="background:#fef3c7;border-radius:12px;margin-bottom:24px;"><tr><td style="padding:16px;">
<p style="font-size:14px;color:#92400e;font-weight:600;margin:0 0 8px;">📱 Appareil détecté :</p>
<p style="font-size:14px;color:#78350f;margin:0 0 4px;">iPhone 15 Pro</p>
<p style="font-size:14px;color:#78350f;margin:0 0 4px;">Navigateur : Safari</p>
<p style="font-size:14px;color:#78350f;margin:0;">Date : ${timestamp}</p>
</td></tr></table>
<table width="100%" style="margin-bottom:32px;"><tr><td style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:2px dashed #cbd5e1;border-radius:16px;padding:32px;text-align:center;">
<p style="font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Votre code de vérification</p>
<div style="font-size:42px;font-weight:800;color:#d97706;letter-spacing:8px;font-family:monospace;">789012</div>
<p style="font-size:13px;color:#94a3b8;margin:12px 0 0;">Ce code expire dans 15 minutes</p>
</td></tr></table>
</td></tr></table></td></tr>
<tr><td style="padding:40px 20px;text-align:center;"><p style="font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} Edupreneurs.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function loginNotificationEmailHtml(): string {
  const greeting = getTimeAwareGreeting(TEST_NAME);
  const timestamp = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' });
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" style="background:#f8fafc;"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;max-width:600px;">
<tr><td style="text-align:center;padding-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180"/></td></tr>
<tr><td><table width="100%" style="background:#fff;border-radius:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#3b82f6,#2563eb,#1d4ed8);padding:50px 40px;text-align:center;">
<div style="font-size:64px;margin-bottom:16px;">🔔</div>
<h1 style="margin:0 0 12px;font-size:32px;font-weight:800;color:#fff;">Connexion détectée</h1>
<p style="margin:0;font-size:18px;color:rgba(255,255,255,0.9);">Nouvelle activité sur votre compte</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:18px;color:#1e293b;margin:0 0 24px;">${greeting}</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 32px;">Nous vous informons qu'une connexion a été effectuée sur votre compte Edupreneurs.</p>
<table width="100%" style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 16px 16px 0;margin-bottom:24px;"><tr><td style="padding:24px;">
<h3 style="font-size:16px;font-weight:700;color:#1e40af;margin:0 0 20px;">📊 Détails de la connexion</h3>
<table width="100%">
<tr><td style="padding:10px 0;border-bottom:1px solid #bfdbfe;font-size:14px;color:#1d4ed8;font-weight:600;">📧 Email</td><td style="padding:10px 0;border-bottom:1px solid #bfdbfe;font-size:14px;color:#1e40af;text-align:right;">${TEST_EMAIL}</td></tr>
<tr><td style="padding:10px 0;border-bottom:1px solid #bfdbfe;font-size:14px;color:#1d4ed8;font-weight:600;">🕐 Date et heure</td><td style="padding:10px 0;border-bottom:1px solid #bfdbfe;font-size:14px;color:#1e40af;text-align:right;">${timestamp}</td></tr>
<tr><td style="padding:10px 0;border-bottom:1px solid #bfdbfe;font-size:14px;color:#1d4ed8;font-weight:600;">💻 Appareil</td><td style="padding:10px 0;border-bottom:1px solid #bfdbfe;font-size:14px;color:#1e40af;text-align:right;">MacBook Pro</td></tr>
<tr><td style="padding:10px 0;font-size:14px;color:#1d4ed8;font-weight:600;">📍 Localisation</td><td style="padding:10px 0;font-size:14px;color:#1e40af;text-align:right;">Port-au-Prince, Haiti</td></tr>
</table></td></tr></table>
<table width="100%" style="margin-bottom:24px;"><tr><td style="background:#f0fdf4;border-left:4px solid #22c55e;border-radius:0 12px 12px 0;padding:20px;">
<p style="font-size:15px;color:#166534;margin:0;"><strong>✓ C'était vous ?</strong> Parfait ! Vous n'avez rien à faire.</p>
</td></tr></table>
</td></tr></table></td></tr>
<tr><td style="padding:40px 20px;text-align:center;"><p style="font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} Edupreneurs.</p></td></tr>
</table></td></tr></table></body></html>`;
}

// Onboarding day 1/3/7 — reuse the shared wrapper from check-onboarding-emails
const ONBOARDING_GRADIENT = "linear-gradient(135deg, #7c3aed, #d97706)";

function onboardingWrapper(icon: string, title: string, subtitle: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:${ONBOARDING_GRADIENT};padding:40px 32px;text-align:center;">
<div style="font-size:48px;margin-bottom:8px;">${icon}</div>
<h1 style="color:#fff;font-size:24px;margin:0 0 4px;">${title}</h1>
<p style="color:#fef3c7;font-size:14px;margin:0;">${subtitle}</p>
</td></tr>
<tr><td style="padding:32px;">${body}</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Edupreneurs Haiti</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function onboardingDay1Html(): string {
  const greeting = getTimeAwareGreeting(TEST_NAME);
  return onboardingWrapper("📚", "Ta première leçon t'attend!", "Ton compte est prêt",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">Ton compte Edupreneurs est configuré et <strong>Jude</strong>, ton assistant IA, est prêt! 🤖</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">Ta première leçon ne prend que <strong>15 minutes</strong>.</p>
<table width="100%" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin-bottom:20px;"><tr><td style="padding:16px;text-align:center;">
<p style="color:#5b21b6;font-size:14px;font-weight:600;margin:0;">🎯 Objectif: Complète ta première leçon aujourd'hui!</p>
</td></tr></table>
<table width="100%"><tr><td align="center" style="padding-top:24px;">
<a href="${SITE_URL}/matieres" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;">Commencer ma première leçon 🚀</a>
</td></tr></table>`);
}

function onboardingDay3Html(): string {
  const greeting = getTimeAwareGreeting(TEST_NAME);
  return onboardingWrapper("👋", "Jude t'attend!", "Tu n'as pas encore commencé",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">C'est Jude, ton assistant IA! 🤖 J'ai remarqué que tu n'as pas encore commencé ta première leçon.</p>
<table width="100%" style="margin-bottom:20px;">
<tr><td style="padding:8px 0;"><p style="color:#374151;font-size:14px;margin:0;"><strong style="color:#7c3aed;">1.</strong> Clique sur "Voir mes matières"</p></td></tr>
<tr><td style="padding:8px 0;"><p style="color:#374151;font-size:14px;margin:0;"><strong style="color:#7c3aed;">2.</strong> Choisis une matière</p></td></tr>
<tr><td style="padding:8px 0;"><p style="color:#374151;font-size:14px;margin:0;"><strong style="color:#7c3aed;">3.</strong> Lis la leçon et essaie le quiz! 💡</p></td></tr>
</table>
<table width="100%" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin-bottom:20px;"><tr><td style="padding:16px;text-align:center;">
<p style="color:#92400e;font-size:14px;font-weight:600;margin:0;">⏱️ Une leçon = 15 minutes. Tu peux commencer maintenant!</p>
</td></tr></table>
<table width="100%"><tr><td align="center" style="padding-top:24px;">
<a href="${SITE_URL}/matieres" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;">Voir mes matières 📖</a>
</td></tr></table>`);
}

function onboardingDay7Html(): string {
  const greeting = getTimeAwareGreeting(TEST_NAME);
  return onboardingWrapper("🏆", "Bravo — essaie le Quiz Battle!", "Tu as complété une leçon",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">Félicitations <strong>${TEST_NAME}</strong>! 🎉 Tu as déjà complété ta première leçon!</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">Passe au niveau suivant avec le <strong>Quiz Battle</strong>: défie tes camarades en temps réel! ⚡</p>
<table width="100%" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin-bottom:20px;"><tr><td style="padding:16px;">
<p style="color:#5b21b6;font-size:14px;font-weight:600;margin:0 0 8px;">🎮 Comment ça marche:</p>
<p style="color:#374151;font-size:13px;margin:0 0 4px;">• Choisis une matière et un niveau</p>
<p style="color:#374151;font-size:13px;margin:0 0 4px;">• Réponds plus vite que ton adversaire</p>
<p style="color:#374151;font-size:13px;margin:0;">• Gagne des XP!</p>
</td></tr></table>
<table width="100%"><tr><td align="center" style="padding-top:24px;">
<a href="${SITE_URL}/quiz-battle" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;">Défier un camarade 🏆</a>
</td></tr></table>`);
}

function donationThankYouHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:linear-gradient(135deg,#16a34a,#059669);padding:40px 32px;text-align:center;">
<div style="font-size:48px;margin-bottom:8px;">💚</div>
<h1 style="color:#fff;font-size:28px;margin:0 0 4px;">Mèsi anpil!</h1>
<p style="color:#d1fae5;font-size:14px;margin:0;">Votre générosité change des vies 🇭🇹</p>
</td></tr>
<tr><td style="padding:32px;">
<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">Salut <strong>${TEST_NAME}</strong>,</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">Nous avons bien reçu votre don et nous vous en remercions du fond du cœur.</p>
<table width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;"><tr><td style="padding:20px;text-align:center;">
<p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Montant du don</p>
<p style="color:#16a34a;font-size:32px;font-weight:700;margin:0;">500 HTG</p>
<p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Réf: TEST-DON-001</p>
</td></tr></table>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="color:#9ca3af;font-size:12px;margin:0;">© ${new Date().getFullYear()} Edupreneurs Haiti</p>
</td></tr>
</table></td></tr></table></body></html>`;
}

function reportConfirmationHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" style="background:#f8fafc;"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;max-width:600px;">
<tr><td style="text-align:center;padding-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180"/></td></tr>
<tr><td><table width="100%" style="background:#fff;border-radius:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:50px 40px;text-align:center;border-radius:24px 24px 0 0;">
<div style="font-size:64px;margin-bottom:16px;">📬</div>
<h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;">Signalement reçu</h1>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:18px;color:#1e293b;margin:0 0 24px;">Bonjour <strong style="color:#8b5cf6;">${TEST_NAME}</strong>,</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 24px;">Nous avons bien reçu votre signalement et nous vous remercions de nous aider à maintenir une communauté saine.</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 24px;">Notre équipe de modération examinera ce signalement dans les plus brefs délais.</p>
<p style="font-size:16px;color:#475569;margin:0;">L'équipe Edupreneurs</p>
</td></tr></table></td></tr>
<tr><td style="padding:40px 20px;text-align:center;"><p style="font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} Edupreneurs.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function farewellEmailHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" style="background:#f8fafc;"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;max-width:600px;">
<tr><td style="text-align:center;padding-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180"/></td></tr>
<tr><td><table width="100%" style="background:#fff;border-radius:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7);padding:50px 40px;text-align:center;">
<div style="font-size:64px;margin-bottom:16px;">😢</div>
<h1 style="margin:0 0 12px;font-size:32px;font-weight:800;color:#fff;">Au revoir...</h1>
<p style="margin:0;font-size:18px;color:rgba(255,255,255,0.9);">Nous sommes tristes de vous voir partir</p>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:18px;color:#1e293b;margin:0 0 24px;">Salut <strong style="color:#8b5cf6;">${TEST_NAME}</strong> 👋</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 24px;">Votre compte a été supprimé avec succès. Nous espérons que vous avez passé un bon moment avec nous.</p>
<table width="100%" style="margin-bottom:32px;"><tr><td style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border-radius:16px;padding:24px;border-left:4px solid #0ea5e9;">
<div style="font-size:28px;margin-bottom:12px;">💜</div>
<p style="font-size:15px;color:#0c4a6e;line-height:1.7;margin:0;"><strong>Vous nous manquerez !</strong><br><br>Les portes d'Edupreneurs seront toujours ouvertes pour vous.</p>
</td></tr></table>
</td></tr></table></td></tr>
<tr><td style="padding:40px 20px;text-align:center;"><p style="font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} Edupreneurs.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function adminPostDeletedHtml(): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
<table width="100%" style="background:#f8fafc;"><tr><td style="padding:40px 20px;">
<table width="600" style="margin:0 auto;max-width:600px;">
<tr><td style="text-align:center;padding-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180"/></td></tr>
<tr><td><table width="100%" style="background:#fff;border-radius:24px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
<tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:50px 40px;text-align:center;border-radius:24px 24px 0 0;">
<div style="font-size:64px;margin-bottom:16px;">📢</div>
<h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;">Publication supprimée</h1>
</td></tr>
<tr><td style="padding:40px;">
<p style="font-size:18px;color:#1e293b;margin:0 0 24px;">Bonjour <strong style="color:#f97316;">${TEST_NAME}</strong>,</p>
<p style="font-size:16px;color:#475569;line-height:1.8;margin:0 0 24px;">Nous vous informons que l'une de vos publications a été supprimée par notre équipe de modération.</p>
<p style="font-size:14px;color:#64748b;padding:12px;background:#f1f5f9;border-radius:8px;margin:0 0 24px;"><strong>Motif :</strong> Contenu inapproprié (test)</p>
<p style="font-size:16px;color:#475569;margin:0;">L'équipe Edupreneurs</p>
</td></tr></table></td></tr>
<tr><td style="padding:40px 20px;text-align:center;"><p style="font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} Edupreneurs.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function birthdayEmailHtml(): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
<div style="text-align:center;margin-bottom:30px;"><img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" style="height:60px;"/></div>
<div style="background:linear-gradient(180deg,#fff,#f8f9ff);border-radius:24px;padding:50px 40px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
<div style="text-align:center;margin-bottom:30px;"><div style="font-size:80px;line-height:1;">🎂</div></div>
<h1 style="text-align:center;font-size:32px;font-weight:700;color:#1a1a2e;margin:0 0 10px;">🎉 Joyeux Anniversaire! 🎉</h1>
<p style="text-align:center;font-size:18px;color:#4a5568;margin:0 0 30px;">Salut ${TEST_NAME}! 🌟</p>
<div style="background:linear-gradient(135deg,#ffecd2,#fcb69f);border-radius:16px;padding:30px;margin-bottom:30px;text-align:center;">
<p style="font-size:18px;color:#5c3d2e;margin:0 0 15px;font-weight:600;">Toute l'équipe d'Edupreneurs te souhaite une merveilleuse journée! 🎈</p>
<p style="font-size:16px;color:#7c5c4e;margin:0;">Que cette nouvelle année soit riche en apprentissages! 🌈✨</p>
</div>
<div style="text-align:center;margin-bottom:30px;">
<a href="${SITE_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:16px 40px;border-radius:30px;text-decoration:none;font-weight:600;font-size:16px;">🎓 Célébrer en apprenant</a>
</div>
<div style="text-align:center;margin-bottom:20px;"><span style="font-size:30px;">🎈🎊🎁🎀🎈</span></div>
<p style="text-align:center;color:#718096;font-size:14px;margin:0;">Avec toute notre affection,<br><strong style="color:#667eea;">L'équipe Edupreneurs</strong> 💜</p>
</div>
<div style="text-align:center;margin-top:30px;"><p style="color:rgba(255,255,255,0.8);font-size:12px;margin:0;">© ${new Date().getFullYear()} Edupreneurs.</p></div>
</div></body></html>`;
}

// ─── Main handler ───
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // Protect with internal secret
  if (!validateSecret(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: { index: number; name: string; success: boolean; error?: string }[] = [];
  const endDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
  const dateNow = new Date().toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Define all 20 emails
  const emails: { name: string; subject: string; html: string }[] = [
    { name: "Welcome", subject: "[1/20] 🎉 Bienvenue sur Edupreneurs", html: welcomeEmailHtml() },
    { name: "Email Confirmation", subject: "[2/20] ✉️ Confirmez votre inscription", html: confirmationEmailHtml() },
    { name: "Password Reset", subject: "[3/20] 🔐 Réinitialisation mot de passe", html: passwordResetEmailHtml() },
    { name: "Device Verification", subject: "[4/20] 🔐 Nouvel appareil détecté", html: deviceVerificationEmailHtml() },
    { name: "Login Notification", subject: "[5/20] 🔔 Connexion détectée", html: loginNotificationEmailHtml() },
    { name: "Onboarding Day 1", subject: "[6/20] 📚 Ta première leçon t'attend", html: onboardingDay1Html() },
    { name: "Onboarding Day 3", subject: "[7/20] 👋 Jude t'attend", html: onboardingDay3Html() },
    { name: "Onboarding Day 7", subject: "[8/20] 🏆 Essaie le Quiz Battle", html: onboardingDay7Html() },
    { name: "Subscription Confirmation", subject: "[9/20] 🎉 Abonnement activé", html: buildSubscriptionConfirmationEmail(TEST_NAME, endDate, "MonCash") },
    { name: "Subscription Invoice", subject: "[10/20] 🧾 Reçu de paiement", html: buildSubscriptionInvoiceEmail(TEST_NAME, "200 HTG", "ORD-TEST-001", dateNow, "MonCash") },
    { name: "Gift Student Activation", subject: "[11/20] 🎉 Abonnement offert activé", html: buildGiftStudentEmail(TEST_NAME, "Marie Celestin", endDate) },
    { name: "Gift Payer Invoice", subject: "[12/20] 🧾 Reçu cadeau", html: buildGiftPayerInvoiceEmail("Marie Celestin", TEST_NAME, 500, "sess_test_123", dateNow) },
    { name: "Gift Payer Thank You", subject: "[13/20] 💚 Mèsi anpil", html: buildGiftPayerThankYouEmail("Marie Celestin", TEST_NAME) },
    { name: "Renewal Student", subject: "[14/20] 🔄 Abonnement renouvelé", html: buildRenewalStudentEmail(TEST_NAME, endDate) },
    { name: "Renewal Payer Receipt", subject: "[15/20] 🧾 Renouvellement mensuel", html: buildRenewalPayerEmail(TEST_NAME, "$5.00 USD", dateNow) },
    { name: "Donation Thank You", subject: "[16/20] 💚 Mèsi anpil pou don ou", html: donationThankYouHtml() },
    { name: "Report Confirmation", subject: "[17/20] 📬 Signalement reçu", html: reportConfirmationHtml() },
    { name: "Farewell", subject: "[18/20] 😢 Au revoir", html: farewellEmailHtml() },
    { name: "Admin Post Deleted", subject: "[19/20] 📢 Publication supprimée", html: adminPostDeletedHtml() },
    { name: "Birthday", subject: "[20/20] 🎂 Joyeux Anniversaire", html: birthdayEmailHtml() },
  ];

  console.log(`[test-send-all-emails] Sending ${emails.length} test emails to ${TEST_EMAIL}`);

  for (let i = 0; i < emails.length; i++) {
    const { name, subject, html } = emails[i];
    try {
      await sendEmail(TEST_EMAIL, subject, html);
      results.push({ index: i + 1, name, success: true });
      console.log(`[${i + 1}/${emails.length}] ✅ ${name}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({ index: i + 1, name, success: false, error: errMsg });
      console.error(`[${i + 1}/${emails.length}] ❌ ${name}: ${errMsg}`);
    }
    // Throttle to avoid Resend rate limits (2 req/sec is safe)
    if (i < emails.length - 1) await delay(600);
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`[test-send-all-emails] Done: ${succeeded} sent, ${failed} failed`);

  return new Response(
    JSON.stringify({ total: emails.length, succeeded, failed, results }),
    { headers: { "Content-Type": "application/json" } },
  );
});
