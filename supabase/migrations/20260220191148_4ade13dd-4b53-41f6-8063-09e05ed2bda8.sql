CREATE OR REPLACE FUNCTION public.get_next_display_order()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(MAX(display_order), 0) + 1 FROM daily_words;
$$;