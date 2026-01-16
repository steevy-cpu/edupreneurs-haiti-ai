-- Table for assigning one word per day per user
CREATE TABLE public.user_daily_word (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id uuid NOT NULL REFERENCES daily_words(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Index for fast lookup
CREATE INDEX idx_user_daily_word_lookup ON user_daily_word(user_id, date);

-- RLS Policies
ALTER TABLE user_daily_word ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily word" 
  ON user_daily_word FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily word" 
  ON user_daily_word FOR INSERT 
  WITH CHECK (auth.uid() = user_id);