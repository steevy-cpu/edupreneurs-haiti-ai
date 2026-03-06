/**
 * Check Subscription Expiry — Scheduled Reminder Emails
 *
 * Runs daily via pg_cron (9AM Haiti time / 14:00 UTC).
 * Sends renewal reminder emails at 7 days, 3 days, and day-of expiry
 * for both paid subscribers and free trial users.
 *
 * Auth: INTERNAL_CALL_SECRET header (not JWT). The service-role Supabase
 * client is created internally — the secret never leaves edge function scope.
 *
 * Dedup: Uses profiles.sent_expiry_reminders JSONB array to prevent
 * duplicate sends. Resets to [] on subscription renewal.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getTimeAwareGreeting } from "../_shared/emailGreeting.ts";
import { sendEmail } from "../_shared/emails.ts";

// ─── Internal auth guard ───────────────────────────────────────────────────────
function validateInternalSecret(req: Request): boolean {
  const secret = req.headers.get("x-internal-secret");
  const expected = Deno.env.get("INTERNAL_CALL_SECRET");
  return !!secret && !!expected && secret === expected;
}

// ─── Email templates ───────────────────────────────────────────────────────────

const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";
const RENEWAL_URL = `${SITE_URL}/settings?tab=account#subscription`;
const AMBER_GRADIENT = "linear-gradient(135deg, #d97706, #b45309)";

/** Shared email layout with amber/warning header */
function reminderWrapper(headerIcon: string, headerTitle: string, headerSubtitle: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:${AMBER_GRADIENT};padding:40px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:8px;">${headerIcon}</div>
  <h1 style="color:#ffffff;font-size:24px;margin:0 0 4px;">${headerTitle}</h1>
  <p style="color:#fef3c7;font-size:14px;margin:0;">${headerSubtitle}</p>
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

/** CTA button shared across all templates */
function ctaButton(label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:24px;">
  <a href="${RENEWAL_URL}" style="display:inline-block;background:#d97706;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;">
    ${label}
  </a>
</td></tr></table>`;
}

/** Feature list shown in the 7-day reminder */
function featureList(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
<tr>
  <td width="33%" style="padding:4px;">
    <table width="100%" style="background:#fef3c7;border-radius:10px;"><tr><td style="padding:12px;text-align:center;">
      <div style="font-size:22px;margin-bottom:2px;">📚</div>
      <p style="color:#92400e;font-size:11px;font-weight:600;margin:0;">Matières</p>
    </td></tr></table>
  </td>
  <td width="33%" style="padding:4px;">
    <table width="100%" style="background:#fef3c7;border-radius:10px;"><tr><td style="padding:12px;text-align:center;">
      <div style="font-size:22px;margin-bottom:2px;">🎮</div>
      <p style="color:#92400e;font-size:11px;font-weight:600;margin:0;">Jeux</p>
    </td></tr></table>
  </td>
  <td width="34%" style="padding:4px;">
    <table width="100%" style="background:#fef3c7;border-radius:10px;"><tr><td style="padding:12px;text-align:center;">
      <div style="font-size:22px;margin-bottom:2px;">📖</div>
      <p style="color:#92400e;font-size:11px;font-weight:600;margin:0;">Ressources</p>
    </td></tr></table>
  </td>
</tr>
<tr>
  <td width="33%" style="padding:4px;">
    <table width="100%" style="background:#fef3c7;border-radius:10px;"><tr><td style="padding:12px;text-align:center;">
      <div style="font-size:22px;margin-bottom:2px;">🎵</div>
      <p style="color:#92400e;font-size:11px;font-weight:600;margin:0;">Musique</p>
    </td></tr></table>
  </td>
  <td width="33%" style="padding:4px;">
    <table width="100%" style="background:#fef3c7;border-radius:10px;"><tr><td style="padding:12px;text-align:center;">
      <div style="font-size:22px;margin-bottom:2px;">💡</div>
      <p style="color:#92400e;font-size:11px;font-weight:600;margin:0;">Mes Passions</p>
    </td></tr></table>
  </td>
  <td width="34%"></td>
</tr>
</table>`;
}

// ─── Email template builders (paid subscribers) ────────────────────────────────

function build7DayReminder(greeting: string, name: string, expiryDate: string): string {
  return reminderWrapper("📅", "Rappel d'abonnement", "Expire dans 7 jours",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Votre abonnement Edupreneurs expire le <strong>${expiryDate}</strong>, soit dans 7 jours.
</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px;">
  Pour continuer à profiter de toutes les fonctionnalités, pensez à renouveler votre abonnement avant l'expiration:
</p>
${featureList()}
<p style="color:#6b7280;font-size:13px;line-height:1.5;margin:0;">
  Renouvelez dès maintenant pour éviter toute interruption de votre apprentissage.
</p>
${ctaButton("Renouveler maintenant")}`
  );
}

function build3DayReminder(greeting: string, name: string, expiryDate: string): string {
  return reminderWrapper("⏰", "Plus que 3 jours!", "Renouvelez votre abonnement",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Votre abonnement expire le <strong>${expiryDate}</strong> — il ne vous reste que <strong>3 jours</strong>.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:16px;text-align:center;">
  <p style="color:#92400e;font-size:14px;font-weight:600;margin:0;">
    ⚡ Ne perdez pas votre progression d'apprentissage!
  </p>
  <p style="color:#78350f;font-size:13px;margin:8px 0 0;">
    Vos quiz, leçons et activités vous attendent.
  </p>
</td></tr>
</table>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">
  Renouvelez maintenant pour continuer sans interruption. Votre compte et vos données restent intacts.
</p>
${ctaButton("Renouveler mon abonnement")}`
  );
}

function build0DayReminder(greeting: string, name: string): string {
  return reminderWrapper("🔔", "Expiration aujourd'hui", "Votre abonnement se termine",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Votre abonnement Edupreneurs <strong>expire aujourd'hui</strong>.
</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Après expiration, l'accès aux Matières, Jeux, Ressources, Musique et Passions sera verrouillé. 
  <strong>Votre compte reste actif</strong> et toutes vos données sont conservées — vous pouvez renouveler à tout moment pour retrouver l'accès.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:16px;text-align:center;">
  <p style="color:#991b1b;font-size:14px;font-weight:600;margin:0;">
    🔒 L'accès aux fonctionnalités premium se termine aujourd'hui
  </p>
</td></tr>
</table>
${ctaButton("Renouveler maintenant")}`
  );
}

// ─── Trial-specific email template builders ────────────────────────────────────

function buildTrial2DayReminder(greeting: string, name: string, expiryDate: string): string {
  return reminderWrapper("⏳", "Plus que 2 jours d'essai", "Votre essai gratuit se termine bientôt",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Votre essai gratuit de 7 jours se termine le <strong>${expiryDate}</strong> — il ne vous reste que <strong>2 jours</strong>.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:16px;text-align:center;">
  <p style="color:#92400e;font-size:14px;font-weight:600;margin:0;">
    ✨ Vous avez apprécié Edupreneurs? Continuez l'aventure!
  </p>
  <p style="color:#78350f;font-size:13px;margin:8px 0 0;">
    Abonnez-vous pour garder l'accès à tous vos cours et activités.
  </p>
</td></tr>
</table>
${featureList()}
${ctaButton("S'abonner maintenant — 200 HTG/mois")}`
  );
}

function buildTrial0DayReminder(greeting: string, name: string): string {
  return reminderWrapper("🔔", "Essai gratuit terminé", "Votre essai expire aujourd'hui",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Votre essai gratuit de 7 jours sur Edupreneurs <strong>expire aujourd'hui</strong>.
</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Nous espérons que vous avez apprécié la plateforme ! Pour continuer à apprendre, abonnez-vous dès maintenant.
  <strong>Votre compte et vos données sont conservés</strong> — vous pouvez vous abonner à tout moment.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:16px;text-align:center;">
  <p style="color:#991b1b;font-size:14px;font-weight:600;margin:0;">
    🔒 L'accès gratuit se termine aujourd'hui
  </p>
</td></tr>
</table>
${ctaButton("S'abonner — 200 HTG/mois")}`
  );
}

// ─── Main handler ──────────────────────────────────────────────────────────────

serve(async (req) => {
  // CORS preflight — shouldn't be needed for cron but included for safety
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // Auth: validate internal secret (not JWT)
  if (!validateInternalSecret(req)) {
    console.error("[check-subscription-expiry] Unauthorized — invalid or missing X-Internal-Secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Service-role client created internally — key never leaves this function
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Query 1: Active paid subscribers approaching expiry ──────────────────
    const { data: paidProfiles, error: paidError } = await supabase
      .from("profiles")
      .select("user_id, full_name, nickname, subscription_end_date, sent_expiry_reminders")
      .eq("subscription_status", "active")
      .eq("has_free_access", false)
      .not("subscription_end_date", "is", null)
      .limit(100);

    // ── Query 2: Trial users approaching expiry ─────────────────────────────
    const { data: trialProfiles, error: trialError } = await supabase
      .from("profiles")
      .select("user_id, full_name, nickname, subscription_end_date, sent_expiry_reminders")
      .eq("subscription_status", "timed_free")
      .eq("has_free_access", true)
      .not("subscription_end_date", "is", null)
      .limit(100);

    if (paidError || trialError) {
      console.error("[check-subscription-expiry] Query error:", paidError || trialError);
      return new Response(JSON.stringify({ error: "Database query failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Merge both lists with a type tag for email template selection
    const allProfiles = [
      ...(paidProfiles || []).map((p: any) => ({ ...p, _type: "paid" as const })),
      ...(trialProfiles || []).map((p: any) => ({ ...p, _type: "trial" as const })),
    ];

    if (allProfiles.length === 0) {
      console.log("[check-subscription-expiry] No subscribers or trial users to check");
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    // Normalize to start of day in Haiti timezone for consistent day calculation
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: "America/Port-au-Prince" });
    const todayDate = new Date(todayStr + "T00:00:00Z");

    let sent7 = 0, sent3 = 0, sent0 = 0, sentTrial2 = 0, sentTrial0 = 0, skipped = 0, errors = 0;

    for (const profile of allProfiles) {
      try {
        const endDate = new Date(profile.subscription_end_date);
        // Normalize expiry to start of day for accurate day diff
        const endStr = endDate.toLocaleDateString("en-CA", { timeZone: "America/Port-au-Prince" });
        const endDateNorm = new Date(endStr + "T00:00:00Z");

        const diffMs = endDateNorm.getTime() - todayDate.getTime();
        const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Determine which reminder to send based on user type and days remaining
        let reminderKey: string | null = null;

        if (profile._type === "trial") {
          // Trial reminders: day 5 (2 days left) and day 7 (0 days left)
          if (daysRemaining <= 0) {
            reminderKey = "trial_0days";
          } else if (daysRemaining <= 2) {
            reminderKey = "trial_2days";
          }
        } else {
          // Paid subscriber reminders: 7, 3, and 0 days
          if (daysRemaining <= 0) {
            reminderKey = "0days";
          } else if (daysRemaining <= 3) {
            reminderKey = "3days";
          } else if (daysRemaining <= 7) {
            reminderKey = "7days";
          }
        }

        if (!reminderKey) continue; // Not within reminder window

        // Dedup guard: check if this reminder was already sent
        const sentReminders: string[] = Array.isArray(profile.sent_expiry_reminders)
          ? profile.sent_expiry_reminders
          : [];

        if (sentReminders.includes(reminderKey)) {
          skipped++;
          continue;
        }

        // Fetch user email from auth (service role access)
        const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);
        const userEmail = authData?.user?.email;

        if (!userEmail) {
          console.warn(`[check-subscription-expiry] No email for user ${profile.user_id}, skipping`);
          skipped++;
          continue;
        }

        // Build the appropriate email
        const displayName = profile.nickname || profile.full_name || "Étudiant";
        const greeting = getTimeAwareGreeting(displayName);
        const expiryDateStr = endDate.toLocaleDateString("fr-FR", {
          day: "numeric", month: "long", year: "numeric",
        });

        let subject: string;
        let html: string;

        switch (reminderKey) {
          case "7days":
            subject = "Votre abonnement expire dans 7 jours 📅";
            html = build7DayReminder(greeting, displayName, expiryDateStr);
            break;
          case "3days":
            subject = "Plus que 3 jours — renouvelez votre abonnement ⏰";
            html = build3DayReminder(greeting, displayName, expiryDateStr);
            break;
          case "0days":
            subject = "Votre abonnement expire aujourd'hui 🔔";
            html = build0DayReminder(greeting, displayName);
            break;
          case "trial_2days":
            subject = "Plus que 2 jours d'essai gratuit ⏳";
            html = buildTrial2DayReminder(greeting, displayName, expiryDateStr);
            break;
          case "trial_0days":
            subject = "Votre essai gratuit expire aujourd'hui 🔔";
            html = buildTrial0DayReminder(greeting, displayName);
            break;
          default:
            continue;
        }

        // Send the email (non-blocking per user — individual failure doesn't abort)
        await sendEmail(userEmail, subject, html);

        // Append reminder key to sent_expiry_reminders to prevent re-send
        const updatedReminders = [...sentReminders, reminderKey];
        await supabase
          .from("profiles")
          .update({ sent_expiry_reminders: updatedReminders })
          .eq("user_id", profile.user_id);

        // Track counts
        if (reminderKey === "7days") sent7++;
        else if (reminderKey === "3days") sent3++;
        else if (reminderKey === "0days") sent0++;
        else if (reminderKey === "trial_2days") sentTrial2++;
        else if (reminderKey === "trial_0days") sentTrial0++;

        console.log(`[check-subscription-expiry] Sent ${reminderKey} to ${userEmail}`);
      } catch (userErr) {
        // Individual user failure — log and continue to next user
        console.error(`[check-subscription-expiry] Error for user ${profile.user_id}:`, userErr);
        errors++;
      }
    }

    const totalSent = sent7 + sent3 + sent0 + sentTrial2 + sentTrial0;
    console.log(`[check-subscription-expiry] Done: ${totalSent} sent (7d:${sent7}, 3d:${sent3}, 0d:${sent0}, trial2d:${sentTrial2}, trial0d:${sentTrial0}), ${skipped} skipped, ${errors} errors`);

    return new Response(
      JSON.stringify({ sent: totalSent, sent7, sent3, sent0, sentTrial2, sentTrial0, skipped, errors }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[check-subscription-expiry] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
