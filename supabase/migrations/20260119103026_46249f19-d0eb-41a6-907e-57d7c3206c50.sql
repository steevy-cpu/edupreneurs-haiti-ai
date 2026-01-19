-- Add winner_id column to quiz_battles table
ALTER TABLE public.quiz_battles 
ADD COLUMN winner_id UUID;

-- Add comment for documentation
COMMENT ON COLUMN public.quiz_battles.winner_id IS 'UUID of the winning player. NULL if the game is a draw or not yet completed.';

-- Create index for efficient winner lookups (useful for leaderboard queries)
CREATE INDEX idx_quiz_battles_winner ON public.quiz_battles(winner_id) WHERE winner_id IS NOT NULL;