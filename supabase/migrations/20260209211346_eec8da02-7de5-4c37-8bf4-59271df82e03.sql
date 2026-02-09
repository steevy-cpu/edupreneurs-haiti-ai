
CREATE TABLE public.lesson_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('up', 'down')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.lesson_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.lesson_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON public.lesson_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Founders can view all feedback"
  ON public.lesson_feedback FOR SELECT
  USING (public.is_founder());

CREATE TRIGGER update_lesson_feedback_updated_at
  BEFORE UPDATE ON public.lesson_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
