-- Add activites_interactives column to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS activites_interactives TEXT;

COMMENT ON COLUMN public.lessons.activites_interactives IS 'AI-generated interactive activities in structured format for InteractiveActivitiesEnhanced component';