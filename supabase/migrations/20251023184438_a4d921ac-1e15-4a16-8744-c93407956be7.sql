-- Fix search_path for set_lesson_version_created_by function
-- Drop trigger first, then function, then recreate both with proper search_path

DROP TRIGGER IF EXISTS lesson_versions_set_created_by ON lesson_versions;
DROP FUNCTION IF EXISTS set_lesson_version_created_by();

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION set_lesson_version_created_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
CREATE TRIGGER lesson_versions_set_created_by
  BEFORE INSERT ON lesson_versions
  FOR EACH ROW
  EXECUTE FUNCTION set_lesson_version_created_by();