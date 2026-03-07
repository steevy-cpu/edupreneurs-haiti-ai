/**
 * Check Jude Motivations — Daily Motivational Notifications
 *
 * Runs daily via pg_cron (15:00 UTC = 11:00 AM Haiti).
 * Checks each active user's activity data and sends ONE motivational
 * push + in-app notification in Jude's persona based on 6 prioritized triggers.
 *
 * Auth: X-Internal-Secret header (same pattern as check-onboarding-emails).
 * Dedup: profiles.sent_jude_motivations JSONB prevents duplicate sends.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Internal auth guard (mirrors check-onboarding-emails) ───────────────────
function validateInternalSecret(req: Request): boolean {
  const secret = req.headers.get("x-internal-secret");
  const expected = Deno.env.get("INTERNAL_CALL_SECRET");
  return !!secret && !!expected && secret === expected;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const JUDE_USER_ID = "68f2f959-e14a-47f9-8277-07df3a6fcd79";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ─── Date helpers ────────────────────────────────────────────────────────────

/** Returns the number of full days between two dates */
function daysBetween(earlier: Date, later: Date): number {
  const msPerDay = 86_400_000;
  return Math.floor((later.getTime() - earlier.getTime()) / msPerDay);
}

/** Check if two dates fall on the same calendar day (UTC) */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/** ISO week number — used as dedup suffix so weekly triggers can repeat */
function getWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const daysSinceStart = daysBetween(startOfYear, now);
  return Math.ceil((daysSinceStart + startOfYear.getUTCDay() + 1) / 7);
}

// ─── Trigger evaluation ──────────────────────────────────────────────────────

interface UserRow {
  user_id: string;
  nickname: string | null;
  last_seen: string | null;
  current_streak: number | null;
  last_activity_date: string | null;
  gold_earned: number | null;
  subscription_status: string | null;
  has_free_access: boolean;
  subscription_end_date: string | null;
  sent_jude_motivations: Record<string, string> | null;
}

interface TriggerResult {
  message: string;
  key: string;
  url: string;
}

/**
 * Evaluate the 6 prioritized triggers for a single user.
 * Returns the first matching trigger or null.
 * Priority: streak_warning > first_gold > streak_milestone > inactivity_3d > inactivity_7d > trial_expiry
 */
async function evaluateTriggers(
  user: UserRow,
  supabase: any,
): Promise<TriggerResult | null> {
  const now = new Date();
  const name = user.nickname || "ami(e)";
  const dedup = user.sent_jude_motivations || {};
  const weekKey = getWeekNumber();

  // ── Trigger 1: Streak at risk ──────────────────────────────────────────────
  // last_activity_date was yesterday AND current_streak > 0
  if (user.current_streak && user.current_streak > 0 && user.last_activity_date) {
    const lastActivity = new Date(user.last_activity_date);
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const key = `streak_warning_W${weekKey}`;
    if (isSameDay(lastActivity, yesterday) && !dedup[key]) {
      const s = user.current_streak > 1 ? "s" : "";
      return {
        message: `🔥 Ta série de ${user.current_streak} jour${s} est en danger! Fais une activité aujourd'hui pour la garder.`,
        key,
        url: "/matieres",
      };
    }
  }

  // ── Trigger 2: First gold earned ───────────────────────────────────────────
  // gold_earned > 0, exactly 1 lesson completion, never sent before
  if (
    user.gold_earned &&
    user.gold_earned > 0 &&
    !dedup["first_gold"]
  ) {
    const { count } = await supabase
      .from("lesson_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.user_id);

    if (count === 1) {
      return {
        message: `🥇 Félicitations ${name}! Tu viens de gagner ton premier or! C'est le début d'une grande aventure — continue à apprendre pour en gagner plus! 💰`,
        key: "first_gold",
        url: "/matieres",
      };
    }
  }

  // ── Trigger 3: Streak milestone (7, 14, 30, 60, 100) ──────────────────────
  const milestones = [7, 14, 30, 60, 100];
  if (user.current_streak && milestones.includes(user.current_streak)) {
    const key = `streak_milestone_${user.current_streak}`;
    if (!dedup[key]) {
      return {
        message: `🏆 INCROYABLE ${name}! Tu as maintenu une série de ${user.current_streak} jours consécutifs! Continue comme ça!`,
        key,
        url: "/matieres",
      };
    }
  }

  // ── Trigger 4: Inactivity 3-6 days ────────────────────────────────────────
  if (user.last_seen) {
    const daysSinceLastSeen = daysBetween(new Date(user.last_seen), now);

    if (daysSinceLastSeen >= 3 && daysSinceLastSeen < 7) {
      const key = `inactivity_3d_W${weekKey}`;
      if (!dedup[key]) {
        return {
          message: `👋 ${name}, ça fait ${daysSinceLastSeen} jours! Reviens continuer tes leçons — tes examens approchent 📚`,
          key,
          url: "/matieres",
        };
      }
    }

    // ── Trigger 5: Inactivity 7-13 days ───────────────────────────────────────
    if (daysSinceLastSeen >= 7 && daysSinceLastSeen < 14) {
      const key = `inactivity_7d_W${weekKey}`;
      if (!dedup[key]) {
        return {
          message: `😢 ${name}, ça fait une semaine que tu n'as pas étudié. Ton avenir mérite mieux — juste 15 minutes aujourd'hui? 🎯`,
          key,
          url: "/matieres",
        };
      }
    }
  }

  // ── Trigger 6: Trial expiring in 2 days ───────────────────────────────────
  if (
    user.subscription_status === "timed_free" &&
    user.subscription_end_date
  ) {
    const daysLeft = daysBetween(now, new Date(user.subscription_end_date));
    if (daysLeft === 2 && !dedup["trial_expiry_2d"]) {
      return {
        message: `⏰ Plus que 2 jours d'essai gratuit! Ne perds pas ta progression — abonne-toi pour continuer à apprendre.`,
        key: "trial_expiry_2d",
        url: "/subscribe",
      };
    }
  }

  return null;
}

// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  // CORS preflight — unlikely for cron but included for safety
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  // Auth: internal secret only — not exposed to clients
  if (!validateInternalSecret(req)) {
    console.error("❌ Unauthorized: invalid internal secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // Fetch up to 200 active/trial users with a non-null last_seen
    const { data: users, error: fetchError } = await supabase
      .from("profiles")
      .select(
        "user_id, nickname, last_seen, current_streak, last_activity_date, gold_earned, subscription_status, has_free_access, subscription_end_date, sent_jude_motivations",
      )
      .or("subscription_status.eq.active,subscription_status.eq.timed_free")
      .eq("has_free_access", true)
      .not("last_seen", "is", null)
      .limit(200);

    if (fetchError) {
      console.error("❌ Error fetching users:", fetchError.message);
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
    }

    if (!users || users.length === 0) {
      console.log("ℹ️ No eligible users found");
      return new Response(JSON.stringify({ processed: 0, sent: 0 }), { status: 200 });
    }

    console.log(`📋 Processing ${users.length} users for Jude motivations`);

    let sentCount = 0;
    let skippedPref = 0;
    let noTrigger = 0;

    for (const user of users as UserRow[]) {
      try {
        // Check notification preference for 'system' category before evaluating triggers
        const { data: prefData } = await supabase
          .from("notification_preferences")
          .select("enabled")
          .eq("user_id", user.user_id)
          .eq("category", "system")
          .maybeSingle();

        // Opt-out model: null means enabled (default)
        if (prefData && !prefData.enabled) {
          skippedPref++;
          continue;
        }

        // Evaluate triggers — returns first match or null
        const trigger = await evaluateTriggers(user, supabase);
        if (!trigger) {
          noTrigger++;
          continue;
        }

        // ── Action 1: Send push notification via edge function ────────────
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              recipientUserId: user.user_id,
              title: "Jude 🤖",
              body: trigger.message,
              url: trigger.url,
              type: "system",
            }),
          });
        } catch (pushErr: any) {
          // Push failure should not block in-app notification
          console.warn(`⚠️ Push failed for ${user.user_id.substring(0, 8)}:`, pushErr.message);
        }

        // ── Action 2: Insert in-app notification (notification bell) ──────
        const { error: notifError } = await supabase
          .from("notifications")
          .insert({
            user_id: user.user_id,
            actor_id: JUDE_USER_ID,
            type: "system",
            content: trigger.message,
            read: false,
          });

        if (notifError) {
          console.warn(`⚠️ In-app notif failed for ${user.user_id.substring(0, 8)}:`, notifError.message);
        }

        // ── Action 3: Update dedup log ────────────────────────────────────
        const updatedMotivations = {
          ...(user.sent_jude_motivations || {}),
          [trigger.key]: new Date().toISOString(),
        };

        await supabase
          .from("profiles")
          .update({ sent_jude_motivations: updatedMotivations })
          .eq("user_id", user.user_id);

        sentCount++;
        console.log(`✅ Sent [${trigger.key}] to ${user.nickname || user.user_id.substring(0, 8)}`);
      } catch (userErr: any) {
        // Per-user error should not abort the entire batch
        console.error(`❌ Error processing ${user.user_id.substring(0, 8)}:`, userErr.message);
      }
    }

    const summary = {
      processed: users.length,
      sent: sentCount,
      skippedPreference: skippedPref,
      noTrigger,
    };

    console.log("📊 Jude motivations summary:", JSON.stringify(summary));
    return new Response(JSON.stringify(summary), { status: 200 });
  } catch (err: any) {
    console.error("❌ Fatal error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
