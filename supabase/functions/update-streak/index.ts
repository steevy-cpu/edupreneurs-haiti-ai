/**
 * update-streak — Idempotent daily streak updater.
 *
 * Called once per session from StreakContext. JWT required.
 * Founders are excluded (no DB writes, early return).
 * Same-day calls return cached values (idempotent).
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mirror of src/lib/streakConstants.ts — keep in sync
const STREAK_MILESTONES = [
  { days: 3,   title: "Débutant",    icon: "https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/sprout.gif",  freezeReward: 0 },
  { days: 7,   title: "Guerrier",    icon: "https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/sword.gif",   freezeReward: 1 },
  { days: 14,  title: "Persévérant", icon: "https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/shield.gif",  freezeReward: 0 },
  { days: 30,  title: "Conquérant",  icon: "https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/crown.gif",   freezeReward: 1 },
  { days: 60,  title: "Champion",    icon: "https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/trophy.gif",  freezeReward: 1 },
  { days: 100, title: "Légende",     icon: "https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/star.gif",    freezeReward: 1 },
  { days: 365, title: "Immortel",    icon: "https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/diamond.gif", freezeReward: 2 },
];

// Founder UUIDs — excluded from streak tracking entirely
const FOUNDER_IDS = [
  "0de08330-4183-48f9-b169-19b92f4d114f",
  "7580cd10-e18c-4b2f-ac50-def28d046c9d",
];

/** UTC date string (YYYY-MM-DD) */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Difference in days between two YYYY-MM-DD date strings */
function daysDiff(a: string, b: string): number {
  const msA = new Date(a + "T00:00:00Z").getTime();
  const msB = new Date(b + "T00:00:00Z").getTime();
  return Math.round((msA - msB) / (86400 * 1000));
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate JWT
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await anonClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Founders excluded — no DB interaction
    if (FOUNDER_IDS.includes(userId)) {
      return new Response(JSON.stringify({ isFounder: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Service role client for DB writes ---
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Fetch current profile streak data
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("id, current_streak, longest_streak, last_activity_date, streak_freeze_count")
      .eq("user_id", userId)
      .single();

    if (profileErr || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = todayUTC();
    const lastDate = profile.last_activity_date as string | null;

    // --- Idempotent: already updated today ---
    if (lastDate === today) {
      return new Response(
        JSON.stringify({
          currentStreak: profile.current_streak,
          longestStreak: profile.longest_streak,
          freezeCount: profile.streak_freeze_count,
          newMilestone: null,
          streakIncremented: false,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Calculate new streak ---
    let newStreak: number;
    let newFreezeCount = profile.streak_freeze_count;
    let streakIncremented = false;

    if (lastDate && daysDiff(today, lastDate) === 1) {
      // Consecutive day — increment
      newStreak = profile.current_streak + 1;
      streakIncremented = true;
    } else if (!lastDate || daysDiff(today, lastDate) > 1) {
      // Missed day(s) — try freeze or reset
      if (newFreezeCount > 0 && lastDate && daysDiff(today, lastDate) === 2) {
        // Freeze covers exactly 1 missed day
        newStreak = profile.current_streak;
        newFreezeCount -= 1;
      } else {
        // Reset to 1 (today counts as day 1)
        newStreak = 1;
        streakIncremented = true;
      }
    } else {
      newStreak = profile.current_streak;
    }

    const newLongest = Math.max(profile.longest_streak, newStreak);

    // --- Check for new milestone ---
    const milestone = STREAK_MILESTONES.find((m) => m.days === newStreak);
    let newMilestone = null;

    if (milestone) {
      // Check if already earned
      const { data: existing } = await admin
        .from("streak_milestones")
        .select("id")
        .eq("user_id", profile.id)
        .eq("milestone_days", milestone.days)
        .maybeSingle();

      if (!existing) {
        // Insert new milestone
        await admin.from("streak_milestones").insert({
          user_id: profile.id,
          milestone_days: milestone.days,
          badge_title: milestone.title,
          badge_icon_url: milestone.icon,
        });

        // Award freeze reward
        newFreezeCount += milestone.freezeReward;

        newMilestone = {
          days: milestone.days,
          title: milestone.title,
          iconUrl: milestone.icon,
          freezeReward: milestone.freezeReward,
        };
      }
    }

    // --- Atomic profile update ---
    await admin
      .from("profiles")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        streak_freeze_count: newFreezeCount,
      })
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        currentStreak: newStreak,
        longestStreak: newLongest,
        freezeCount: newFreezeCount,
        newMilestone,
        streakIncremented,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[update-streak] Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
