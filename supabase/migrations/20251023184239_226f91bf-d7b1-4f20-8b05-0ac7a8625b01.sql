-- Fix lesson_versions created_by constraint
-- Make created_by use auth.uid() as default when not explicitly provided

-- First, check if lesson_versions table exists and update it
DO $$ 
BEGIN
  -- Add a trigger function to auto-set created_by if null
  CREATE OR REPLACE FUNCTION set_lesson_version_created_by()
  RETURNS TRIGGER AS $func$
  BEGIN
    IF NEW.created_by IS NULL THEN
      NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Drop trigger if exists
  DROP TRIGGER IF EXISTS lesson_versions_set_created_by ON lesson_versions;
  
  -- Create trigger to auto-set created_by
  CREATE TRIGGER lesson_versions_set_created_by
    BEFORE INSERT ON lesson_versions
    FOR EACH ROW
    EXECUTE FUNCTION set_lesson_version_created_by();
    
  RAISE NOTICE 'Lesson versions created_by trigger configured successfully';
END $$;