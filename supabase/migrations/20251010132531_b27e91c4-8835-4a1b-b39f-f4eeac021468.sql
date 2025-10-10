-- Update public_profiles view to include verified field
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  nickname,
  bio,
  academic_grade,
  avatar_url,
  gold_earned,
  affiliation_points,
  created_at,
  verified
FROM public.profiles;