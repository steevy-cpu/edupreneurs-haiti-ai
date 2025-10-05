-- Add bio and school fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN bio text,
ADD COLUMN school text;

-- Create follow status enum
CREATE TYPE public.follow_status AS ENUM ('pending', 'accepted', 'rejected');

-- Add status column to follows table
ALTER TABLE public.follows 
ADD COLUMN status follow_status NOT NULL DEFAULT 'pending';

-- Drop existing policies on follows
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;

-- Create new policies for follows with status
CREATE POLICY "Users can send follow requests" 
ON public.follows 
FOR INSERT 
WITH CHECK (auth.uid() = follower_id AND follower_id <> following_id);

CREATE POLICY "Users can view their own follows" 
ON public.follows 
FOR SELECT 
USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can accept/reject follow requests" 
ON public.follows 
FOR UPDATE 
USING (auth.uid() = following_id);

CREATE POLICY "Users can cancel their follow requests" 
ON public.follows 
FOR DELETE 
USING (auth.uid() = follower_id);

-- Drop existing policy on posts
DROP POLICY IF EXISTS "Users can view posts from people they follow or their own" ON public.posts;

-- Create new policy for posts with accepted follows only
CREATE POLICY "Users can view their own posts and posts from accepted follows" 
ON public.posts 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.follows 
    WHERE follower_id = auth.uid() 
    AND following_id = posts.user_id 
    AND status = 'accepted'
  )
);