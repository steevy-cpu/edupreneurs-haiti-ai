
-- Function to fetch lesson feedback with user details (including email from auth.users)
-- Only callable by founders via is_founder() check
CREATE OR REPLACE FUNCTION public.get_lesson_feedback_for_admin(
  p_rating_filter TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  rating TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID,
  full_name TEXT,
  nickname TEXT,
  avatar_url TEXT,
  email TEXT,
  lesson_id UUID,
  lesson_title TEXT,
  lesson_slug TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_founder() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    lf.id, lf.rating, lf.comment, lf.created_at,
    lf.user_id, p.full_name, p.nickname, p.avatar_url,
    au.email::TEXT,
    lf.lesson_id, l.title, l.slug
  FROM lesson_feedback lf
  JOIN profiles p ON p.user_id = lf.user_id
  JOIN auth.users au ON au.id = lf.user_id
  LEFT JOIN lessons l ON l.id = lf.lesson_id
  WHERE (p_rating_filter IS NULL OR lf.rating = p_rating_filter)
  ORDER BY lf.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Function to count lesson feedback (for pagination and badge)
CREATE OR REPLACE FUNCTION public.count_lesson_feedback_for_admin(
  p_rating_filter TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result INTEGER;
BEGIN
  IF NOT is_founder() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COUNT(*)::INTEGER INTO result
  FROM lesson_feedback lf
  WHERE (p_rating_filter IS NULL OR lf.rating = p_rating_filter);

  RETURN result;
END;
$$;
