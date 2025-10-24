-- Create lesson comments table
CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Only content editors can view comments
CREATE POLICY "Content editors can view comments"
  ON public.lesson_comments
  FOR SELECT
  USING (is_content_editor(auth.uid(), 'viewer'::content_editor_role));

-- Policy: Only content editors can create comments
CREATE POLICY "Content editors can create comments"
  ON public.lesson_comments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND is_content_editor(auth.uid(), 'viewer'::content_editor_role)
  );

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.lesson_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.lesson_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_lesson_comments_lesson_id ON public.lesson_comments(lesson_id);
CREATE INDEX idx_lesson_comments_user_id ON public.lesson_comments(user_id);