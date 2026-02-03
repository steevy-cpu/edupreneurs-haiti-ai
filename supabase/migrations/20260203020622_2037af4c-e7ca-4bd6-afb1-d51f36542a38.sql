-- Create table for persisting Jude chat messages
CREATE TABLE public.exam_tutor_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES exam_practice_sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exam_exercises(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  blocks jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index for fast lookups by session + exercise
CREATE INDEX idx_exam_tutor_chats_session_exercise 
  ON exam_tutor_chats(session_id, exercise_id);

-- Index for user lookups
CREATE INDEX idx_exam_tutor_chats_user 
  ON exam_tutor_chats(user_id);

-- Enable Row Level Security
ALTER TABLE exam_tutor_chats ENABLE ROW LEVEL SECURITY;

-- Users can only view their own chat messages
CREATE POLICY "Users can view own chats" ON exam_tutor_chats
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own chat messages
CREATE POLICY "Users can insert own chats" ON exam_tutor_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own chat messages
CREATE POLICY "Users can delete own chats" ON exam_tutor_chats
  FOR DELETE USING (auth.uid() = user_id);