-- Create ai_generation_logs table for tracking AI content generation
CREATE TABLE IF NOT EXISTS public.ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Prompt details
  prompt_used TEXT,
  target_words INTEGER,
  additional_context TEXT,
  
  -- Response details
  response_content TEXT,
  word_count INTEGER,
  generation_time_ms INTEGER,
  
  -- Quality metrics
  quality_score INTEGER,
  has_html_tags BOOLEAN,
  has_tailwind_classes BOOLEAN,
  has_emojis BOOLEAN,
  mentions_haiti BOOLEAN,
  
  -- Model & status
  model_used TEXT DEFAULT 'google/gemini-2.5-flash',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_logs_lesson ON public.ai_generation_logs(lesson_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON public.ai_generation_logs(generated_by);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created ON public.ai_generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_success ON public.ai_generation_logs(success);
CREATE INDEX IF NOT EXISTS idx_ai_logs_section ON public.ai_generation_logs(section_name);

-- Enable RLS
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- Content editors can view all logs
CREATE POLICY "Content editors can view all logs"
  ON public.ai_generation_logs
  FOR SELECT
  USING (is_content_editor(auth.uid(), 'viewer'::content_editor_role));

-- System can insert logs
CREATE POLICY "System can insert logs"
  ON public.ai_generation_logs
  FOR INSERT
  WITH CHECK (auth.uid() = generated_by);