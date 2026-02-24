/**
 * Check Onboarding Emails — Automated Drip Sequence
 *
 * Runs daily via pg_cron (10:15 AM Haiti time / 14:15 UTC).
 * Sends 3 onboarding emails based on days since onboarding completion:
 *   Day 1: Welcome nudge → start first lesson
 *   Day 3: Re-engagement (only if NO lessons completed)
 *   Day 7: Progression (only if ≥1 lesson completed) → try Quiz Battle
 *
 * Auth: INTERNAL_CALL_SECRET header (not JWT).
 * Dedup: profiles.sent_onboarding_emails JSONB array prevents duplicate sends.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getTimeAwareGreeting } from "../_shared/emailGreeting.ts";
import { sendEmail } from "../_shared/emails.ts";

// ─── Internal auth guard (mirrors check-subscription-expiry) ───────────────────
function validateInternalSecret(req: Request): boolean {
  const secret = req.headers.get("x-internal-secret");
  const expected = Deno.env.get("INTERNAL_CALL_SECRET");
  return !!secret && !!expected && secret === expected;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";
const MATIERES_URL = `${SITE_URL}/matieres`;
const BATTLE_URL = `${SITE_URL}/quiz-battle`;
// Brand gradient used across onboarding emails (purple → amber)
const ONBOARDING_GRADIENT = "linear-gradient(135deg, #7c3aed, #d97706)";

// ─── Shared email layout with onboarding header ───────────────────────────────
function onboardingWrapper(
  headerIcon: string,
  headerTitle: string,
  headerSubtitle: string,
  bodyContent: string,
): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
<tr><td style="background:${ONBOARDING_GRADIENT};padding:40px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:8px;">${headerIcon}</div>
  <h1 style="color:#ffffff;font-size:24px;margin:0 0 4px;">${headerTitle}</h1>
  <p style="color:#fef3c7;font-size:14px;margin:0;">${headerSubtitle}</p>
</td></tr>
<tr><td style="padding:32px;">
  ${bodyContent}
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="color:#9ca3af;font-size:12px;margin:0 0 4px;">© ${new Date().getFullYear()} Edupreneurs Haiti · Transfòme edikasyon an nan Ayiti</p>
  <p style="color:#d1d5db;font-size:11px;margin:0;">Tu reçois cet email car tu es inscrit sur Mon Edupreneurs</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** CTA button reused across all onboarding templates */
function ctaButton(label: string, url: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding-top:24px;">
  <a href="${url}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;">
    ${label}
  </a>
</td></tr></table>`;
}

// ─── Day 1: Welcome nudge ─────────────────────────────────────────────────────
function buildDay1Email(greeting: string, name: string): string {
  return onboardingWrapper("📚", "Ta première leçon t'attend!", "Ton compte est prêt",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Ton compte Edupreneurs est maintenant configuré et <strong>Jude</strong>, ton assistant IA, est prêt à t'accompagner! 🤖
</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Ta première leçon ne prend que <strong>15 minutes</strong> et tu peux choisir parmi toutes les matières disponibles pour ton niveau.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:16px;text-align:center;">
  <p style="color:#5b21b6;font-size:14px;font-weight:600;margin:0;">
    🎯 Objectif: Complète ta première leçon aujourd'hui!
  </p>
</td></tr>
</table>
${ctaButton("Commencer ma première leçon 🚀", MATIERES_URL)}`
  );
}

// ─── Day 3: Re-engagement (no lessons completed yet) ──────────────────────────
function buildDay3Email(greeting: string, name: string): string {
  return onboardingWrapper("👋", "Jude t'attend!", "Tu n'as pas encore commencé",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  C'est Jude, ton assistant IA éducatif! 🤖 J'ai remarqué que tu n'as pas encore commencé ta première leçon — et je voulais te dire que c'est <strong>très simple</strong>.
</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 8px;">
  Voici comment faire en 3 étapes:
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
<tr><td style="padding:8px 0;">
  <p style="color:#374151;font-size:14px;margin:0;">
    <strong style="color:#7c3aed;">1.</strong> Clique sur "Voir mes matières" ci-dessous
  </p>
</td></tr>
<tr><td style="padding:8px 0;">
  <p style="color:#374151;font-size:14px;margin:0;">
    <strong style="color:#7c3aed;">2.</strong> Choisis une matière qui t'intéresse
  </p>
</td></tr>
<tr><td style="padding:8px 0;">
  <p style="color:#374151;font-size:14px;margin:0;">
    <strong style="color:#7c3aed;">3.</strong> Lis la leçon et essaie le quiz — je suis là pour t'aider! 💡
  </p>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:16px;text-align:center;">
  <p style="color:#92400e;font-size:14px;font-weight:600;margin:0;">
    ⏱️ Une leçon = 15 minutes. Tu peux commencer maintenant!
  </p>
</td></tr>
</table>
${ctaButton("Voir mes matières 📖", MATIERES_URL)}`
  );
}

// ─── Day 7: Progression (at least 1 lesson completed) ─────────────────────────
function buildDay7Email(greeting: string, name: string): string {
  return onboardingWrapper("🏆", "Bravo — essaie le Quiz Battle!", "Tu as complété une leçon",
    `<p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 16px;">${greeting}</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Félicitations <strong>${name}</strong>! 🎉 Tu as déjà complété ta première leçon — c'est un excellent début!
</p>
<p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
  Maintenant, passe au niveau suivant avec le <strong>Quiz Battle</strong>: défie tes camarades dans un quiz en temps réel et gagne des points XP! ⚡
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:16px;">
  <p style="color:#5b21b6;font-size:14px;font-weight:600;margin:0 0 8px;">🎮 Comment ça marche:</p>
  <p style="color:#374151;font-size:13px;margin:0 0 4px;">• Choisis une matière et un niveau</p>
  <p style="color:#374151;font-size:13px;margin:0 0 4px;">• Réponds aux questions plus vite que ton adversaire</p>
  <p style="color:#374151;font-size:13px;margin:0;">• Gagne des XP et monte dans le classement!</p>
</td></tr>
</table>
${ctaButton("Défier un camarade 🏆", BATTLE_URL)}`
  );
}

// ─── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  // CORS preflight — included for safety even though cron doesn't need it
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // Auth: validate internal secret (not JWT)
  if (!validateInternalSecret(req)) {
    console.error("[check-onboarding-emails] Unauthorized — invalid or missing X-Internal-Secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Service-role client — key never leaves this function
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Query users who completed onboarding but haven't received all 3 emails yet (max 100/run)
    const { data: profiles, error: queryError } = await supabase
      .from("profiles")
      .select("user_id, full_name, nickname, onboarding_tour_completed_at, sent_onboarding_emails")
      .eq("onboarding_tour_completed", true)
      .not("onboarding_tour_completed_at", "is", null)
      .limit(100);

    if (queryError) {
      console.error("[check-onboarding-emails] Query error:", queryError);
      return new Response(JSON.stringify({ error: "Database query failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!profiles || profiles.length === 0) {
      console.log("[check-onboarding-emails] No eligible users found");
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Normalize current date to Haiti timezone for consistent day calculation
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA", { timeZone: "America/Port-au-Prince" });
    const todayDate = new Date(todayStr + "T00:00:00Z");

    let sentDay1 = 0, sentDay3 = 0, sentDay7 = 0, skipped = 0, errors = 0;

    for (const profile of profiles) {
      try {
        // Parse sent emails array (dedup guard)
        const sentEmails: string[] = Array.isArray(profile.sent_onboarding_emails)
          ? profile.sent_onboarding_emails
          : [];

        // Skip if all 3 emails already sent
        if (sentEmails.includes("day1") && sentEmails.includes("day3") && sentEmails.includes("day7")) {
          skipped++;
          continue;
        }

        // Calculate days since onboarding completion (Haiti timezone)
        const completedAt = new Date(profile.onboarding_tour_completed_at);
        const completedStr = completedAt.toLocaleDateString("en-CA", { timeZone: "America/Port-au-Prince" });
        const completedDate = new Date(completedStr + "T00:00:00Z");
        const diffMs = todayDate.getTime() - completedDate.getTime();
        const daysAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // Determine which email to send (priority: day1 first, then day3, then day7)
        let emailKey: string | null = null;

        if (daysAgo >= 1 && !sentEmails.includes("day1")) {
          emailKey = "day1";
        } else if (daysAgo >= 3 && !sentEmails.includes("day3")) {
          // Day 3: only send if user has NOT completed any lesson (nudge)
          const { count } = await supabase
            .from("lesson_completions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profile.user_id);
          if (count === 0) {
            emailKey = "day3";
          }
        } else if (daysAgo >= 7 && !sentEmails.includes("day7")) {
          // Day 7: only send if user HAS completed at least 1 lesson (progression)
          const { count } = await supabase
            .from("lesson_completions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", profile.user_id);
          if (count && count > 0) {
            emailKey = "day7";
          }
        }

        if (!emailKey) {
          skipped++;
          continue;
        }

        // Fetch user email from auth (service role)
        const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);
        const userEmail = authData?.user?.email;

        if (!userEmail) {
          console.warn(`[check-onboarding-emails] No email for user ${profile.user_id}, skipping`);
          skipped++;
          continue;
        }

        // Build email content
        const displayName = profile.nickname || profile.full_name || "Étudiant";
        const greeting = getTimeAwareGreeting(displayName);

        let subject: string;
        let html: string;

        switch (emailKey) {
          case "day1":
            subject = "Ta première leçon t'attend! 📚";
            html = buildDay1Email(greeting, displayName);
            break;
          case "day3":
            subject = "Tu n'as pas encore commencé — Jude t'attend 👋";
            html = buildDay3Email(greeting, displayName);
            break;
          case "day7":
            subject = "Tu as complété une leçon — essaie le Quiz Battle! 🏆";
            html = buildDay7Email(greeting, displayName);
            break;
          default:
            continue;
        }

        // Send and record (non-blocking per user)
        await sendEmail(userEmail, subject, html);

        // Append email key to dedup array
        const updatedEmails = [...sentEmails, emailKey];
        await supabase
          .from("profiles")
          .update({ sent_onboarding_emails: updatedEmails })
          .eq("user_id", profile.user_id);

        // Track counts
        if (emailKey === "day1") sentDay1++;
        else if (emailKey === "day3") sentDay3++;
        else sentDay7++;

        console.log(`[check-onboarding-emails] Sent ${emailKey} to ${userEmail}`);
      } catch (userErr) {
        // Individual user failure — log and continue
        console.error(`[check-onboarding-emails] Error for user ${profile.user_id}:`, userErr);
        errors++;
      }
    }

    const totalSent = sentDay1 + sentDay3 + sentDay7;
    console.log(
      `[check-onboarding-emails] Done: ${totalSent} sent (d1:${sentDay1}, d3:${sentDay3}, d7:${sentDay7}), ${skipped} skipped, ${errors} errors`,
    );

    return new Response(
      JSON.stringify({ sent: totalSent, sentDay1, sentDay3, sentDay7, skipped, errors }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[check-onboarding-emails] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
