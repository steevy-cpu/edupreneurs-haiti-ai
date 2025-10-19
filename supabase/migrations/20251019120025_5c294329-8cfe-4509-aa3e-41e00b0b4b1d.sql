-- Fix search_path for the trigger function
DROP FUNCTION IF EXISTS update_user_passion_preferences_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_user_passion_preferences_updated_at()
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

-- Recreate the trigger
CREATE TRIGGER update_user_passion_preferences_updated_at
  BEFORE UPDATE ON public.user_passion_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_passion_preferences_updated_at();