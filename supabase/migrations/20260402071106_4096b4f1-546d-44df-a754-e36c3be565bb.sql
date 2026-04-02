
CREATE OR REPLACE FUNCTION public.get_public_homepage_stats()
RETURNS TABLE(lessons_count bigint, exams_count bigint, users_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT count(*) FROM public.lessons WHERE is_published = true),
    (SELECT count(*) FROM public.official_exams),
    (SELECT count(*) FROM public.profiles WHERE is_system_account IS NULL OR is_system_account = false);
END;
$$;
