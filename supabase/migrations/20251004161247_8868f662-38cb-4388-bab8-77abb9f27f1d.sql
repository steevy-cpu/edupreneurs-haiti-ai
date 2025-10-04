-- Add gold_earned column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gold_earned integer DEFAULT 0 NOT NULL;

-- Add comment
COMMENT ON COLUMN public.profiles.gold_earned IS 'Total gold coins earned by user from correct answers';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_gold_earned ON public.profiles(gold_earned DESC);