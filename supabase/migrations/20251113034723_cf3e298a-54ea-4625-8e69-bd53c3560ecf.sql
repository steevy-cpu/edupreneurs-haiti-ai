-- Create the english_practice_conversations table
CREATE TABLE IF NOT EXISTS public.english_practice_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_slug text NOT NULL,
  grade_level text NOT NULL,
  session_id uuid NOT NULL,
  message_role text NOT NULL CHECK (message_role IN ('user', 'assistant')),
  message_content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.english_practice_conversations ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_conversations_user_lesson ON public.english_practice_conversations(user_id, lesson_slug, session_id);
CREATE INDEX idx_conversations_created_at ON public.english_practice_conversations(created_at DESC);

-- RLS Policies
CREATE POLICY "Users can view own conversations"
ON public.english_practice_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
ON public.english_practice_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
ON public.english_practice_conversations FOR DELETE
USING (auth.uid() = user_id);