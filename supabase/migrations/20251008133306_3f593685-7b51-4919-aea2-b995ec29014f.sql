-- Fix the security definer view by using security_invoker instead
DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  nickname,
  avatar_url,
  bio,
  academic_grade,
  affiliation_points,
  gold_earned,
  created_at
FROM public.profiles;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;