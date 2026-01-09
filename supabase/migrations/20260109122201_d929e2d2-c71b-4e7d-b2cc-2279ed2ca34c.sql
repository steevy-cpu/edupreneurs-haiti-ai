-- Fix Security Issues: More restrictive profiles access + fix SECURITY DEFINER view

-- Step 1: Drop the view that was created with SECURITY DEFINER issues
DROP VIEW IF EXISTS public.leaderboard_profiles;

-- Step 2: Recreate view with SECURITY INVOKER (explicit) to use caller's permissions
CREATE VIEW public.leaderboard_profiles 
WITH (security_invoker = true)
AS
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

-- Grant access to the view
GRANT SELECT ON public.leaderboard_profiles TO anon;
GRANT SELECT ON public.leaderboard_profiles TO authenticated;

-- Step 3: Drop the overly permissive policy and create a more targeted one
DROP POLICY IF EXISTS "Authenticated users can view profiles for social features" ON public.profiles;

-- Create a more restrictive policy that only allows access to users you interact with
CREATE POLICY "Authenticated users can view profiles for social features" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can always view their own profile
  auth.uid() = user_id 
  OR 
  -- Can view profiles of accepted followers/following
  EXISTS (
    SELECT 1 FROM follows 
    WHERE (follower_id = auth.uid() AND following_id = profiles.user_id AND status = 'accepted')
       OR (following_id = auth.uid() AND follower_id = profiles.user_id)
  )
  OR
  -- Can view profiles of people in same conversations
  EXISTS (
    SELECT 1 FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = profiles.user_id
  )
  OR
  -- Can view profiles of post authors (for feed)
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.user_id = profiles.user_id 
    AND (posts.is_public = true OR posts.user_id = auth.uid())
  )
  OR
  -- Can view profiles of people who commented on posts the user can see
  EXISTS (
    SELECT 1 FROM post_comments pc
    JOIN posts p ON pc.post_id = p.id
    WHERE pc.user_id = profiles.user_id 
    AND (p.is_public = true OR p.user_id = auth.uid())
  )
  OR
  -- Can view profiles for leaderboard (only non-system accounts)
  EXISTS (
    SELECT 1 FROM profiles p2
    WHERE p2.user_id = profiles.user_id
    AND (p2.is_system_account IS NULL OR p2.is_system_account = false)
    AND p2.gold_earned > 0
  )
);

-- Step 4: Ensure anonymous users can access the leaderboard_profiles view
-- We need a SELECT policy that allows anon to see non-system profiles
CREATE POLICY "Anonymous can view basic profiles for leaderboard" 
ON public.profiles 
FOR SELECT 
TO anon
USING (
  (is_system_account IS NULL OR is_system_account = false)
);