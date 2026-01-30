-- Add columns for activities content alignment tracking
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS needs_activities_regeneration boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS activities_alignment_score numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_activities_validated_at timestamp with time zone DEFAULT NULL;

-- Create partial index for filtering lessons that need activities regeneration
CREATE INDEX IF NOT EXISTS idx_lessons_needs_activities_regeneration 
ON public.lessons (needs_activities_regeneration) 
WHERE needs_activities_regeneration = true;