-- Drop the existing view and recreate it as SECURITY INVOKER
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the view with SECURITY INVOKER (uses permissions of the querying user)
CREATE OR REPLACE VIEW public.public_profiles 
WITH (security_invoker=true)
AS
SELECT 
  id,
  user_id,
  full_name,
  nickname,
  academic_grade,
  created_at,
  affiliation_points
FROM public.profiles;

-- Grant access to the public profiles view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Fix the second policy to be more secure
DROP POLICY IF EXISTS "Users can view basic info of other profiles" ON public.profiles;

-- Create a better policy that allows authenticated users to see other profiles
-- The RLS will allow row access, but the view should be used for querying to limit columns
CREATE POLICY "Authenticated users can view other profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() != user_id AND auth.uid() IS NOT NULL);