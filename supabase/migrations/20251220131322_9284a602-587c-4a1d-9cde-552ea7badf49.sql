-- Add is_public column to posts table for discoverable posts
ALTER TABLE public.posts 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster public posts queries
CREATE INDEX idx_posts_is_public ON public.posts(is_public) WHERE is_public = true;

-- Create security definer function to check if user can view a post
-- This avoids RLS recursion and improves performance
CREATE OR REPLACE FUNCTION public.can_view_post(_user_id uuid, _post_user_id uuid, _is_public boolean)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    _is_public = true  -- Public posts visible to all
    OR _user_id = _post_user_id  -- User can see their own posts
    OR EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = _user_id 
      AND following_id = _post_user_id 
      AND status = 'accepted'
    )
$$;

-- Drop existing SELECT policy on posts
DROP POLICY IF EXISTS "Users can view their own posts and posts from accepted follows" ON public.posts;

-- Create new optimized SELECT policy using the function
CREATE POLICY "Users can view accessible posts"
ON public.posts
FOR SELECT
USING (
  public.can_view_post(auth.uid(), user_id, is_public)
);

-- Update post_comments RLS to use the new function
DROP POLICY IF EXISTS "Users can view comments on posts they can see" ON public.post_comments;

CREATE POLICY "Users can view comments on posts they can see"
ON public.post_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_comments.post_id
    AND public.can_view_post(auth.uid(), posts.user_id, posts.is_public)
  )
);

-- Update post_comments INSERT policy  
DROP POLICY IF EXISTS "Users can create comments on posts they can see" ON public.post_comments;

CREATE POLICY "Users can create comments on posts they can see"
ON public.post_comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_comments.post_id
    AND public.can_view_post(auth.uid(), posts.user_id, posts.is_public)
  )
);

-- Update post_likes SELECT policy
DROP POLICY IF EXISTS "Users can view relevant likes" ON public.post_likes;

CREATE POLICY "Users can view relevant likes"
ON public.post_likes
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_likes.post_id
    AND public.can_view_post(auth.uid(), posts.user_id, posts.is_public)
  )
);

-- Update post_shares SELECT policy
DROP POLICY IF EXISTS "Users can view relevant shares" ON public.post_shares;

CREATE POLICY "Users can view relevant shares"
ON public.post_shares
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_shares.post_id
    AND public.can_view_post(auth.uid(), posts.user_id, posts.is_public)
  )
);

-- Update post_shares INSERT policy
DROP POLICY IF EXISTS "Users can share posts they can see" ON public.post_shares;

CREATE POLICY "Users can share posts they can see"
ON public.post_shares
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.posts
    WHERE posts.id = post_shares.post_id
    AND public.can_view_post(auth.uid(), posts.user_id, posts.is_public)
  )
);