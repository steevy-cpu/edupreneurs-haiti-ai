-- Add unique constraint to prevent duplicate achievements
ALTER TABLE public.chess_achievements 
ADD CONSTRAINT chess_achievements_user_achievement_unique 
UNIQUE (user_id, achievement_key);