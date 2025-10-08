-- Add full_name to public_profiles view (it's needed for display but keep sensitive data hidden)
DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  full_name,
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