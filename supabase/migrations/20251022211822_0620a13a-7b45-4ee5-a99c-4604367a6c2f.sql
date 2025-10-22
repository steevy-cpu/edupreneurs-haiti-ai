-- Create lesson versions table for version control
CREATE TABLE IF NOT EXISTS public.lesson_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  objectif TEXT,
  introduction TEXT,
  contenu TEXT,
  exemples_exercices TEXT,
  grade_level TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_current BOOLEAN DEFAULT false,
  UNIQUE(lesson_id, version_number)
);

-- Enable RLS
ALTER TABLE public.lesson_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Editors can view all versions"
ON public.lesson_versions FOR SELECT
USING (is_content_editor(auth.uid(), 'viewer'::content_editor_role));

CREATE POLICY "Editors can create versions"
ON public.lesson_versions FOR INSERT
WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- Create workflow status enum
CREATE TYPE public.workflow_status AS ENUM ('draft', 'in_review', 'approved', 'published', 'rejected');

-- Add workflow fields to lessons
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS workflow_status workflow_status DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS reviewed_by UUID,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ;

-- Function to create version snapshot
CREATE OR REPLACE FUNCTION public.create_lesson_version()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM lesson_versions
  WHERE lesson_id = NEW.id;
  
  -- Mark all previous versions as not current
  UPDATE lesson_versions
  SET is_current = false
  WHERE lesson_id = NEW.id;
  
  -- Create new version
  INSERT INTO lesson_versions (
    lesson_id, version_number, title, slug, objectif, 
    introduction, contenu, exemples_exercices, grade_level,
    created_by, is_current
  ) VALUES (
    NEW.id, next_version, NEW.title, NEW.slug, NEW.objectif,
    NEW.introduction, NEW.contenu, NEW.exemples_exercices, NEW.grade_level,
    NEW.created_by, true
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic versioning
DROP TRIGGER IF EXISTS lesson_version_trigger ON public.lessons;
CREATE TRIGGER lesson_version_trigger
AFTER UPDATE ON public.lessons
FOR EACH ROW
WHEN (
  OLD.title IS DISTINCT FROM NEW.title OR
  OLD.contenu IS DISTINCT FROM NEW.contenu OR
  OLD.objectif IS DISTINCT FROM NEW.objectif OR
  OLD.introduction IS DISTINCT FROM NEW.introduction OR
  OLD.exemples_exercices IS DISTINCT FROM NEW.exemples_exercices
)
EXECUTE FUNCTION public.create_lesson_version();

-- Enable realtime for workflow
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_versions;