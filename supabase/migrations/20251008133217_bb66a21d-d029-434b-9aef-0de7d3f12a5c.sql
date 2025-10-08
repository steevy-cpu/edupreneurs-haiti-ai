-- CRITICAL SECURITY FIX: Remove policy that exposes sensitive user data
DROP POLICY IF EXISTS "Authenticated users can view other profiles" ON public.profiles;

-- Create a safe public view without sensitive fields
DROP VIEW IF EXISTS public.public_profiles CASCADE;

CREATE VIEW public.public_profiles AS
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

-- Fix post_shares - users should only see relevant shares
DROP POLICY IF EXISTS "Users can view all shares" ON public.post_shares;

CREATE POLICY "Users can view relevant shares"
ON public.post_shares
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_shares.post_id
    AND (posts.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM follows
      WHERE follows.follower_id = auth.uid()
      AND follows.following_id = posts.user_id
      AND follows.status = 'accepted'
    ))
  )
);

-- Fix post_likes - users should only see relevant likes  
DROP POLICY IF EXISTS "Users can view all likes" ON public.post_likes;

CREATE POLICY "Users can view relevant likes"
ON public.post_likes
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_likes.post_id
    AND (posts.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM follows
      WHERE follows.follower_id = auth.uid()
      AND follows.following_id = posts.user_id
      AND follows.status = 'accepted'
    ))
  )
);