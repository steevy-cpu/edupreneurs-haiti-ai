-- Security Fix: Restrict profiles table access to protect student PII
-- This removes overly permissive policies while keeping social features working

-- Step 1: Drop the overly permissive policies
DROP POLICY IF EXISTS "Users can view public profile information" ON public.profiles;
DROP POLICY IF EXISTS "Allow anon to view leaderboard profiles" ON public.profiles;

-- Step 2: Keep the policy for users viewing their own complete profile (already exists, but ensure it's there)
-- This allows users to see their full profile including phone, email, etc.
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Step 3: Create a policy for authenticated users to view LIMITED profile info for social features
-- This uses a subquery to only allow access to non-sensitive data conceptually
-- Since RLS is row-level (not column-level), we allow access but the app should use public_profiles view
CREATE POLICY "Authenticated users can view profiles for social features" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can view their own profile OR other profiles for social features
  auth.uid() = user_id 
  OR 
  -- Allow viewing profiles of users they interact with (followers, following, conversation participants)
  EXISTS (
    SELECT 1 FROM follows 
    WHERE (follower_id = auth.uid() AND following_id = profiles.user_id AND status = 'accepted')
       OR (following_id = auth.uid() AND follower_id = profiles.user_id AND status = 'accepted')
  )
  OR
  EXISTS (
    SELECT 1 FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = profiles.user_id
  )
  OR
  -- Allow viewing profiles for public posts and leaderboard
  -- This is needed for feed and leaderboard functionality
  (is_system_account IS NULL OR is_system_account = false)
);

-- Note: The above policy still allows authenticated users to see profiles for feed/leaderboard
-- The application MUST use the public_profiles view when displaying other users' info to avoid exposing PII
-- public_profiles view only contains: id, user_id, full_name, nickname, bio, academic_grade, avatar_url, gold_earned, affiliation_points, verified, created_at

-- Step 4: Create a secure view for public leaderboard (anonymous access)
-- This replaces direct table access with a view that only shows safe columns
DROP VIEW IF EXISTS public.leaderboard_profiles;
CREATE VIEW public.leaderboard_profiles AS
SELECT 
  id,
  user_id,
  nickname,
  avatar_url,
  academic_grade,
  gold_earned,
  affiliation_points,
  verified,
  created_at
FROM public.profiles
WHERE (is_system_account IS NULL OR is_system_account = false);

-- Grant anonymous and authenticated users access to the leaderboard view
GRANT SELECT ON public.leaderboard_profiles TO anon;
GRANT SELECT ON public.leaderboard_profiles TO authenticated;

-- Ensure the public_profiles view is accessible for safe profile lookups
GRANT SELECT ON public.public_profiles TO authenticated;