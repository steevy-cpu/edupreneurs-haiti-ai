-- Create a function to check nickname availability (case-insensitive)
CREATE OR REPLACE FUNCTION public.check_nickname_available(nickname_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE LOWER(nickname) = LOWER(nickname_input)
  );
END;
$$;