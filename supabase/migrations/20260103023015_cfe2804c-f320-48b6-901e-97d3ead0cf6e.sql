-- Optimize the create_lesson_version function to only update the one current version
CREATE OR REPLACE FUNCTION public.create_lesson_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM lesson_versions
  WHERE lesson_id = NEW.id;
  
  -- Mark only the current version as not current (much faster than updating all)
  UPDATE lesson_versions
  SET is_current = false
  WHERE lesson_id = NEW.id AND is_current = true;
  
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
$function$;

-- Add index to speed up the version lookups
CREATE INDEX IF NOT EXISTS idx_lesson_versions_lesson_current 
ON public.lesson_versions (lesson_id, is_current) 
WHERE is_current = true;