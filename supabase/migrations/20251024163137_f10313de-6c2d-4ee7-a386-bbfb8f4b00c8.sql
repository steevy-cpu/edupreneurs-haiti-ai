-- Create lesson_completions table to track user progress
CREATE TABLE IF NOT EXISTS public.lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_slug TEXT NOT NULL,
  subject TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score INTEGER,
  UNIQUE(user_id, lesson_slug)
);

-- Enable RLS
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- Users can view their own completions
CREATE POLICY "Users can view their own completions"
ON public.lesson_completions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own completions
CREATE POLICY "Users can insert their own completions"
ON public.lesson_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own completions
CREATE POLICY "Users can update their own completions"
ON public.lesson_completions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id ON public.lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_slug ON public.lesson_completions(lesson_slug);