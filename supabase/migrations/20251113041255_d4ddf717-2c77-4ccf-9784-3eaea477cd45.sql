-- Create table for Spanish practice conversations
CREATE TABLE IF NOT EXISTS spanish_practice_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  lesson_slug text NOT NULL,
  grade_level text NOT NULL,
  message_role text NOT NULL CHECK (message_role IN ('user', 'assistant')),
  message_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE spanish_practice_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own conversations"
  ON spanish_practice_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON spanish_practice_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON spanish_practice_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_spanish_conversations_user_lesson 
  ON spanish_practice_conversations(user_id, lesson_slug, grade_level, created_at DESC);