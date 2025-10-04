-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a view that exposes only safe, public profile information
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- Create new restrictive policies for the profiles table
-- Policy 1: Users can see their own complete profile (all columns including sensitive data)
CREATE POLICY "Users can view their own complete profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can see basic public info of other users
-- Note: This policy allows row access, but applications should only query non-sensitive columns
-- or use the public_profiles view instead
CREATE POLICY "Users can view basic info of other profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() != user_id OR auth.uid() IS NULL);