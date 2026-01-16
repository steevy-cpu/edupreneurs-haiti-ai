
-- Create enum types for quiz battles
CREATE TYPE quiz_battle_mode AS ENUM ('solo', 'friend', 'random');
CREATE TYPE quiz_battle_status AS ENUM ('waiting', 'in_progress', 'completed', 'cancelled');
CREATE TYPE quiz_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Quiz Battles table - stores game instances
CREATE TABLE public.quiz_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode quiz_battle_mode NOT NULL DEFAULT 'solo',
  status quiz_battle_status NOT NULL DEFAULT 'waiting',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  grade_level TEXT NOT NULL,
  difficulty quiz_difficulty NOT NULL DEFAULT 'medium',
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL,
  invite_code TEXT UNIQUE,
  max_players INTEGER NOT NULL DEFAULT 2,
  time_per_question INTEGER NOT NULL DEFAULT 20,
  total_questions INTEGER NOT NULL DEFAULT 10,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz Battle Players - players in a battle
CREATE TABLE public.quiz_battle_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.quiz_battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  current_question INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  time_per_question JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  is_ready BOOLEAN NOT NULL DEFAULT false,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

-- Quiz Battle Stats - player statistics
CREATE TABLE public.quiz_battle_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_battles INTEGER NOT NULL DEFAULT 0,
  solo_battles INTEGER NOT NULL DEFAULT 0,
  multi_battles INTEGER NOT NULL DEFAULT 0,
  battles_won INTEGER NOT NULL DEFAULT 0,
  battles_lost INTEGER NOT NULL DEFAULT 0,
  battles_drawn INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  rank_points INTEGER NOT NULL DEFAULT 0,
  total_correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  avg_response_time_ms INTEGER,
  perfect_games INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz Battle Badges - earned badges
CREATE TABLE public.quiz_battle_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '🏆',
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

-- Quiz Battle Matchmaking - queue for finding opponents
CREATE TABLE public.quiz_battle_matchmaking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  grade_level TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  difficulty quiz_difficulty NOT NULL DEFAULT 'medium',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  matched_with UUID,
  battle_id UUID REFERENCES public.quiz_battles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '60 seconds')
);

-- Enable RLS on all tables
ALTER TABLE public.quiz_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_battle_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_battle_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_battle_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_battle_matchmaking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_battles
CREATE POLICY "Users can view battles they're part of" ON public.quiz_battles
  FOR SELECT USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.quiz_battle_players WHERE battle_id = quiz_battles.id AND user_id = auth.uid())
  );

CREATE POLICY "Users can view battles with invite code" ON public.quiz_battles
  FOR SELECT USING (invite_code IS NOT NULL AND status = 'waiting');

CREATE POLICY "Authenticated users can create battles" ON public.quiz_battles
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Battle creators can update their battles" ON public.quiz_battles
  FOR UPDATE USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.quiz_battle_players WHERE battle_id = quiz_battles.id AND user_id = auth.uid()));

-- RLS Policies for quiz_battle_players
CREATE POLICY "Users can view players in their battles" ON public.quiz_battle_players
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.quiz_battles WHERE id = battle_id AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.quiz_battle_players p2 WHERE p2.battle_id = quiz_battle_players.battle_id AND p2.user_id = auth.uid())))
  );

CREATE POLICY "Users can join battles" ON public.quiz_battle_players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player record" ON public.quiz_battle_players
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for quiz_battle_stats
CREATE POLICY "Anyone can view battle stats" ON public.quiz_battle_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own stats" ON public.quiz_battle_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.quiz_battle_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for quiz_battle_badges
CREATE POLICY "Anyone can view badges" ON public.quiz_battle_badges
  FOR SELECT USING (true);

CREATE POLICY "Users can earn badges" ON public.quiz_battle_badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quiz_battle_matchmaking
CREATE POLICY "Users can view matchmaking queue" ON public.quiz_battle_matchmaking
  FOR SELECT USING (true);

CREATE POLICY "Users can join matchmaking" ON public.quiz_battle_matchmaking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their matchmaking record" ON public.quiz_battle_matchmaking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave matchmaking" ON public.quiz_battle_matchmaking
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for multiplayer sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_battles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_battle_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_battle_matchmaking;

-- Create indexes for performance
CREATE INDEX idx_quiz_battles_created_by ON public.quiz_battles(created_by);
CREATE INDEX idx_quiz_battles_status ON public.quiz_battles(status);
CREATE INDEX idx_quiz_battles_invite_code ON public.quiz_battles(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX idx_quiz_battle_players_battle_id ON public.quiz_battle_players(battle_id);
CREATE INDEX idx_quiz_battle_players_user_id ON public.quiz_battle_players(user_id);
CREATE INDEX idx_quiz_battle_stats_total_xp ON public.quiz_battle_stats(total_xp DESC);
CREATE INDEX idx_quiz_battle_stats_rank_points ON public.quiz_battle_stats(rank_points DESC);
CREATE INDEX idx_quiz_battle_badges_user_id ON public.quiz_battle_badges(user_id);
CREATE INDEX idx_quiz_battle_matchmaking_grade ON public.quiz_battle_matchmaking(grade_level, difficulty);

-- Function to generate invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate XP needed for next level
CREATE OR REPLACE FUNCTION xp_for_level(lvl INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN 100 * lvl * lvl;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, floor(sqrt(xp / 100.0))::integer);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update level when XP changes
CREATE OR REPLACE FUNCTION update_battle_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := level_from_xp(NEW.total_xp);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_battle_level
  BEFORE UPDATE OF total_xp ON public.quiz_battle_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_battle_level();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_quiz_battle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quiz_battles_timestamp
  BEFORE UPDATE ON public.quiz_battles
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_battle_timestamp();
