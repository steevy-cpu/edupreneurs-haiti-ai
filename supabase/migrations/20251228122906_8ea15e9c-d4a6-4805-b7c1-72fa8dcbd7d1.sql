-- Create curriculum_analysis_logs table to store PDF analysis results
CREATE TABLE public.curriculum_analysis_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  pdf_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  topics_found JSONB DEFAULT '[]'::jsonb,
  existing_lessons JSONB DEFAULT '[]'::jsonb,
  missing_topics JSONB DEFAULT '[]'::jsonb,
  partial_matches JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  analyzed_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.curriculum_analysis_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for content editors
CREATE POLICY "Content editors can view curriculum analysis logs"
ON public.curriculum_analysis_logs
FOR SELECT
USING (public.is_content_editor(auth.uid(), 'viewer'));

CREATE POLICY "Content editors can create curriculum analysis logs"
ON public.curriculum_analysis_logs
FOR INSERT
WITH CHECK (public.is_content_editor(auth.uid(), 'editor'));

CREATE POLICY "Content editors can delete curriculum analysis logs"
ON public.curriculum_analysis_logs
FOR DELETE
USING (public.is_content_editor(auth.uid(), 'editor'));

-- Create index for faster lookups by subject
CREATE INDEX idx_curriculum_analysis_subject ON public.curriculum_analysis_logs(subject_id);
CREATE INDEX idx_curriculum_analysis_grade ON public.curriculum_analysis_logs(grade_level);