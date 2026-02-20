-- Fix 1: Add composite index for leaderboard queries on quiz_battle_weekly_xp
CREATE INDEX IF NOT EXISTS idx_quiz_battle_weekly_xp_week_start
ON quiz_battle_weekly_xp(week_start, xp_earned DESC);