-- Weekly XP tracking for champion badge
CREATE TABLE public.quiz_battle_weekly_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  battles_played INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- RLS policies
ALTER TABLE public.quiz_battle_weekly_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view weekly xp"
  ON public.quiz_battle_weekly_xp FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own weekly xp"
  ON public.quiz_battle_weekly_xp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly xp"
  ON public.quiz_battle_weekly_xp FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for efficient queries
CREATE INDEX idx_weekly_xp_week ON public.quiz_battle_weekly_xp(week_start, xp_earned DESC);

-- Enable realtime for weekly XP tracking (optional, for live leaderboards)
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_battle_weekly_xp;