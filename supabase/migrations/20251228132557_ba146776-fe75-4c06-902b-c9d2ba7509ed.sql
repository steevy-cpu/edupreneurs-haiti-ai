-- Create table for storing quiz/activity validation status
CREATE TABLE public.quiz_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('quiz', 'activity')),
  validation_status TEXT NOT NULL DEFAULT 'pending' CHECK (validation_status IN ('pending', 'verified', 'error', 'corrected')),
  error_description TEXT,
  original_answer TEXT,
  corrected_answer TEXT,
  validated_by UUID,
  validated_at TIMESTAMP WITH TIME ZONE,
  ai_confidence_score NUMERIC(3,2),
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, question_index, content_type)
);

-- Enable RLS
ALTER TABLE public.quiz_validations ENABLE ROW LEVEL SECURITY;

-- Content editors can view all validations
CREATE POLICY "Content editors can view validations"
ON public.quiz_validations
FOR SELECT
USING (is_content_editor(auth.uid(), 'viewer'::content_editor_role));

-- Content editors can create validations
CREATE POLICY "Content editors can create validations"
ON public.quiz_validations
FOR INSERT
WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- Content editors can update validations
CREATE POLICY "Content editors can update validations"
ON public.quiz_validations
FOR UPDATE
USING (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- Content editors can delete validations
CREATE POLICY "Content editors can delete validations"
ON public.quiz_validations
FOR DELETE
USING (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- Create trigger for updated_at
CREATE TRIGGER update_quiz_validations_updated_at
BEFORE UPDATE ON public.quiz_validations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_quiz_validations_lesson_id ON public.quiz_validations(lesson_id);
CREATE INDEX idx_quiz_validations_status ON public.quiz_validations(validation_status);