-- Add columns for content alignment tracking on lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS needs_quiz_regeneration boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS content_alignment_score numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_content_validated_at timestamp with time zone DEFAULT NULL;

-- Create partial index for efficient filtering of lessons needing regeneration
CREATE INDEX IF NOT EXISTS idx_lessons_needs_regeneration 
ON public.lessons (needs_quiz_regeneration) 
WHERE needs_quiz_regeneration = true;