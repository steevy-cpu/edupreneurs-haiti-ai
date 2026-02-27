-- Add streak columns to profiles (additive, safe for existing data)
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_date date,
  ADD COLUMN IF NOT EXISTS streak_freeze_count integer NOT NULL DEFAULT 0;

-- Create streak_milestones table to track earned badges
CREATE TABLE IF NOT EXISTS public.streak_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_days integer NOT NULL,
  badge_title text NOT NULL,
  badge_icon_url text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone_days)
);

-- Enable RLS — users can only read/write their own milestones
ALTER TABLE public.streak_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON public.streak_milestones FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = streak_milestones.user_id
  ));

CREATE POLICY "Users can insert own milestones"
  ON public.streak_milestones FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = streak_milestones.user_id
  ));

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS streak_milestones_user_id_idx 
  ON public.streak_milestones(user_id);