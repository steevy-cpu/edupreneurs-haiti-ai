CREATE OR REPLACE FUNCTION public.create_lesson_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Serialize concurrent triggers for the same lesson using a transaction-scoped advisory lock.
  -- Two simultaneous AI generation saves to the same lesson would otherwise both read
  -- is_current = true, both set it to false, and both insert is_current = true —
  -- producing duplicate current-version rows. The lock queues them instead.
  -- hashtext() converts the UUID text to an integer lock key; xact_lock auto-releases at commit.
  PERFORM pg_advisory_xact_lock(hashtext(NEW.id::text));

  -- Get next version number after acquiring the lock (safe read)
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM lesson_versions
  WHERE lesson_id = NEW.id;

  -- Mark only the current version as not current (targeted update, faster than full scan)
  UPDATE lesson_versions
  SET is_current = false
  WHERE lesson_id = NEW.id AND is_current = true;

  -- Create new version snapshot
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