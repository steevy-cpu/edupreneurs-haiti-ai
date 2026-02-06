-- Fix the cleanup function with correct syntax
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete attempts older than 24 hours that are not locked
  DELETE FROM login_attempts 
  WHERE locked_at IS NULL 
    AND updated_at < now() - interval '24 hours';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- Delete locked attempts older than 7 days
  DELETE FROM login_attempts 
  WHERE locked_at IS NOT NULL 
    AND locked_at < now() - interval '7 days';
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  RETURN deleted_count;
END;
$$;