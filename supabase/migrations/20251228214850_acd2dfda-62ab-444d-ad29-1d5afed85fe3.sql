-- Create chess_player_stats table for tracking player progression
CREATE TABLE public.chess_player_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  elo_rating INTEGER NOT NULL DEFAULT 800,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_won INTEGER NOT NULL DEFAULT 0,
  games_lost INTEGER NOT NULL DEFAULT 0,
  games_drawn INTEGER NOT NULL DEFAULT 0,
  total_moves INTEGER NOT NULL DEFAULT 0,
  avg_time_per_move NUMERIC,
  longest_winning_streak INTEGER NOT NULL DEFAULT 0,
  current_winning_streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_chess_stats UNIQUE (user_id)
);

-- Create chess_games table for game history
CREATE TABLE public.chess_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  opponent_type TEXT NOT NULL DEFAULT 'ai', -- 'ai', 'friend'
  difficulty TEXT, -- 'beginner', 'intermediate', 'advanced', 'expert'
  time_control TEXT, -- 'bullet', 'blitz', 'rapid', 'classic', 'untimed'
  result TEXT NOT NULL, -- 'win', 'loss', 'draw'
  elo_change INTEGER DEFAULT 0,
  opening_name TEXT,
  moves_count INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER,
  final_fen TEXT,
  move_history JSONB,
  analysis JSONB, -- Store post-game analysis from ERIC
  brilliant_moves INTEGER DEFAULT 0,
  good_moves INTEGER DEFAULT 0,
  inaccuracies INTEGER DEFAULT 0,
  mistakes INTEGER DEFAULT 0,
  blunders INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chess_achievements table for badges
CREATE TABLE public.chess_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_key TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  icon TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_key)
);

-- Create chess_puzzles table for training puzzles
CREATE TABLE public.chess_puzzles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  difficulty TEXT NOT NULL, -- 'easy', 'medium', 'hard'
  theme TEXT, -- 'fork', 'pin', 'mate_in_1', 'mate_in_2', etc.
  fen TEXT NOT NULL,
  solution TEXT[] NOT NULL,
  hint TEXT,
  explanation TEXT,
  is_daily BOOLEAN DEFAULT false,
  daily_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chess_puzzle_attempts for tracking puzzle progress
CREATE TABLE public.chess_puzzle_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  puzzle_id UUID NOT NULL REFERENCES public.chess_puzzles(id) ON DELETE CASCADE,
  solved BOOLEAN NOT NULL DEFAULT false,
  attempts INTEGER NOT NULL DEFAULT 1,
  time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.chess_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chess_puzzle_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for chess_player_stats
CREATE POLICY "Users can view their own stats"
ON public.chess_player_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
ON public.chess_player_stats FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.chess_player_stats FOR UPDATE
USING (auth.uid() = user_id);

-- Public leaderboard view
CREATE POLICY "Public can view all stats for leaderboard"
ON public.chess_player_stats FOR SELECT
USING (true);

-- RLS policies for chess_games
CREATE POLICY "Users can view their own games"
ON public.chess_games FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
ON public.chess_games FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
ON public.chess_games FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for chess_achievements
CREATE POLICY "Users can view their own achievements"
ON public.chess_achievements FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.chess_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Public view for showing achievements on profiles
CREATE POLICY "Public can view all achievements"
ON public.chess_achievements FOR SELECT
USING (true);

-- RLS policies for chess_puzzles (everyone can view)
CREATE POLICY "Everyone can view puzzles"
ON public.chess_puzzles FOR SELECT
USING (true);

-- RLS policies for chess_puzzle_attempts
CREATE POLICY "Users can view their own puzzle attempts"
ON public.chess_puzzle_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own puzzle attempts"
ON public.chess_puzzle_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own puzzle attempts"
ON public.chess_puzzle_attempts FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_chess_games_user_id ON public.chess_games(user_id);
CREATE INDEX idx_chess_games_started_at ON public.chess_games(started_at DESC);
CREATE INDEX idx_chess_achievements_user_id ON public.chess_achievements(user_id);
CREATE INDEX idx_chess_puzzles_difficulty ON public.chess_puzzles(difficulty);
CREATE INDEX idx_chess_puzzles_daily ON public.chess_puzzles(is_daily, daily_date);
CREATE INDEX idx_chess_puzzle_attempts_user ON public.chess_puzzle_attempts(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_chess_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for chess_player_stats
CREATE TRIGGER update_chess_player_stats_updated_at
BEFORE UPDATE ON public.chess_player_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_chess_stats_updated_at();

-- Insert some default puzzles for training
INSERT INTO public.chess_puzzles (difficulty, theme, fen, solution, hint, explanation) VALUES
('easy', 'mate_in_1', 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4', ARRAY['h5f7'], 'La dame peut capturer sur f7', 'Le mat du berger! La dame capture le pion f7 avec échec et mat car le roi ne peut pas échapper.'),
('easy', 'fork', '8/8/8/3k4/8/4N3/8/4K3 w - - 0 1', ARRAY['e3c4', 'e3f5'], 'Le cavalier peut attaquer deux pièces à la fois', 'Le cavalier en e3 peut faire une fourchette royale!'),
('medium', 'pin', 'r1bqkb1r/ppp2ppp/2np1n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 5', ARRAY['c4f7'], 'Le fou vise une case vulnérable', 'Le sacrifice de fou sur f7 expose le roi noir.'),
('medium', 'mate_in_2', 'r1b1kb1r/pppp1ppp/5q2/4n3/3KP3/2N5/PPP2PPP/R1BQ1BNR b kq - 0 6', ARRAY['e5c4', 'c4a3'], 'Le cavalier peut donner échec', 'Le cavalier donne échec découvert en c4, puis mat en a3!'),
('hard', 'sacrifice', 'r2qkb1r/pp2pppp/2p2n2/3p1b2/3P1B2/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 0 6', ARRAY['f3e5'], 'Un sacrifice tactique ouvre des lignes', 'Le cavalier capture en e5, sacrifiant la pièce pour une attaque sur le roi.');