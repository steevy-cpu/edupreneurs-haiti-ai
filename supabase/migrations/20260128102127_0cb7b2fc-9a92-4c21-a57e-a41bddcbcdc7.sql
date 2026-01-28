-- Phase 1: Create lesson_assets table for structured JSON content storage

-- Create enum types for asset kind and status
CREATE TYPE asset_kind AS ENUM ('quiz_final', 'activities', 'outline', 'keywords');
CREATE TYPE asset_status AS ENUM ('draft', 'validating', 'validated', 'rejected', 'published');

-- Create the lesson_assets table
CREATE TABLE public.lesson_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  kind asset_kind NOT NULL,
  schema_version INTEGER DEFAULT 1,
  payload_json JSONB NOT NULL,
  status asset_status DEFAULT 'draft',
  validation_report_json JSONB,
  generated_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one asset per kind per version per lesson
  UNIQUE(lesson_id, kind, schema_version)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_assets ENABLE ROW LEVEL SECURITY;

-- Create index for efficient lookups
CREATE INDEX idx_lesson_assets_lesson_id ON public.lesson_assets(lesson_id);
CREATE INDEX idx_lesson_assets_kind_status ON public.lesson_assets(kind, status);

-- RLS Policies

-- Content editors can view all assets
CREATE POLICY "Content editors can view all lesson assets"
ON public.lesson_assets
FOR SELECT
TO authenticated
USING (public.is_content_editor(auth.uid(), 'viewer'));

-- Content editors can insert assets
CREATE POLICY "Content editors can insert lesson assets"
ON public.lesson_assets
FOR INSERT
TO authenticated
WITH CHECK (public.is_content_editor(auth.uid(), 'editor'));

-- Content editors can update assets
CREATE POLICY "Content editors can update lesson assets"
ON public.lesson_assets
FOR UPDATE
TO authenticated
USING (public.is_content_editor(auth.uid(), 'editor'));

-- Content editors can delete draft assets
CREATE POLICY "Content editors can delete draft assets"
ON public.lesson_assets
FOR DELETE
TO authenticated
USING (
  public.is_content_editor(auth.uid(), 'editor') 
  AND status = 'draft'
);

-- Students can view published assets only
CREATE POLICY "Students can view published lesson assets"
ON public.lesson_assets
FOR SELECT
TO authenticated
USING (status = 'published');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_lesson_assets_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_lesson_assets_timestamp
BEFORE UPDATE ON public.lesson_assets
FOR EACH ROW
EXECUTE FUNCTION public.update_lesson_assets_updated_at();

-- Function to check if lesson is publishable (has validated quiz and activities)
CREATE OR REPLACE FUNCTION public.check_lesson_publishable(p_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quiz_validated BOOLEAN;
  activities_validated BOOLEAN;
BEGIN
  -- Check if quiz asset exists and is validated
  SELECT EXISTS (
    SELECT 1 FROM public.lesson_assets 
    WHERE lesson_id = p_lesson_id 
    AND kind = 'quiz_final' 
    AND status = 'validated'
  ) INTO quiz_validated;
  
  -- Check if activities asset exists and is validated  
  SELECT EXISTS (
    SELECT 1 FROM public.lesson_assets 
    WHERE lesson_id = p_lesson_id 
    AND kind = 'activities' 
    AND status = 'validated'
  ) INTO activities_validated;
  
  -- For backward compatibility, also check if legacy HTML content exists
  -- This allows existing lessons with HTML content to still be published
  IF NOT quiz_validated THEN
    SELECT EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE id = p_lesson_id 
      AND quiz_final IS NOT NULL 
      AND quiz_final != ''
    ) INTO quiz_validated;
  END IF;
  
  IF NOT activities_validated THEN
    SELECT EXISTS (
      SELECT 1 FROM public.lessons 
      WHERE id = p_lesson_id 
      AND activites_interactives IS NOT NULL 
      AND activites_interactives != ''
    ) INTO activities_validated;
  END IF;
  
  RETURN quiz_validated AND activities_validated;
END;
$$;