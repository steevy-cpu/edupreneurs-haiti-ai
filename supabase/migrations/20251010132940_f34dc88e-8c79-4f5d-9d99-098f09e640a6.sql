-- Fix security definer view issue
-- Recreate the view without security definer and with proper RLS
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
FROM public.profiles;