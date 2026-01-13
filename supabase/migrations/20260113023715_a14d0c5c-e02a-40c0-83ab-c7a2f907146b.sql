-- Add last_feed_visit column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_feed_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to count new feed posts for a user
CREATE OR REPLACE FUNCTION get_new_feed_posts_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.posts p
  WHERE 
    -- Only posts newer than last feed visit (default to 7 days ago if null)
    p.created_at > (
      SELECT COALESCE(last_feed_visit, NOW() - INTERVAL '7 days')
      FROM public.profiles 
      WHERE user_id = p_user_id
    )
    -- User can see: public posts OR posts from followed users
    AND (
      p.is_public = true
      OR EXISTS (
        SELECT 1 FROM public.follows f
        WHERE f.follower_id = p_user_id 
        AND f.following_id = p.user_id 
        AND f.status = 'accepted'
      )
    )
    -- Exclude user's own posts
    AND p.user_id != p_user_id;
$$;