-- Fix the public_profiles view to use SECURITY INVOKER instead of SECURITY DEFINER

-- Drop and recreate with security_invoker
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
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
FROM profiles;

-- Grant access 
GRANT SELECT ON public.public_profiles TO authenticated;