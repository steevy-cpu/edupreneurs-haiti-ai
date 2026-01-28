-- Job status enum
CREATE TYPE ai_job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Main jobs table for async AI generation
CREATE TABLE ai_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  
  -- Job configuration
  job_type TEXT NOT NULL, -- 'single_lesson', 'quiz_only', 'activities_only', 'batch'
  config JSONB NOT NULL DEFAULT '{}', -- selectedSections, wordCounts, options
  
  -- Progress tracking
  status ai_job_status DEFAULT 'pending',
  progress JSONB DEFAULT '{"current": 0, "total": 0, "sections": []}',
  current_section TEXT,
  
  -- Results
  result_content JSONB, -- Generated content ready for preview
  error_message TEXT,
  
  -- Metadata
  created_by UUID REFERENCES profiles(user_id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own jobs
CREATE POLICY "Users can manage own jobs"
  ON ai_generation_jobs FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Policy: Content editors can view all jobs for monitoring
CREATE POLICY "Editors can view all jobs"
  ON ai_generation_jobs FOR SELECT
  TO authenticated
  USING (public.is_content_editor(auth.uid(), 'viewer'));

-- Enable realtime for job status updates
ALTER PUBLICATION supabase_realtime ADD TABLE ai_generation_jobs;

-- Trigger for updated_at
CREATE TRIGGER update_ai_generation_jobs_timestamp
  BEFORE UPDATE ON ai_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index for querying pending/running jobs
CREATE INDEX idx_ai_jobs_status ON ai_generation_jobs(status) WHERE status IN ('pending', 'running');
CREATE INDEX idx_ai_jobs_lesson ON ai_generation_jobs(lesson_id, status);
CREATE INDEX idx_ai_jobs_created_by ON ai_generation_jobs(created_by, created_at DESC);