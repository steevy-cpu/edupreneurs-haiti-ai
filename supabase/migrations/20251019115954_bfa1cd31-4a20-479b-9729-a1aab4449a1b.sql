-- Create table for user passion preferences
CREATE TABLE IF NOT EXISTS public.user_passion_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  music_score INTEGER DEFAULT 0,
  arts_score INTEGER DEFAULT 0,
  chess_score INTEGER DEFAULT 0,
  literature_score INTEGER DEFAULT 0,
  quiz_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_passion_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_passion_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON public.user_passion_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON public.user_passion_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_passion_preferences_user_id 
  ON public.user_passion_preferences(user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_passion_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_passion_preferences_updated_at
  BEFORE UPDATE ON public.user_passion_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_passion_preferences_updated_at();