-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their own follows" ON public.follows;

-- Create a more permissive policy that allows viewing all accepted follows
-- This is needed for displaying follower/following counts on user profiles
CREATE POLICY "Users can view follows"
ON public.follows
FOR SELECT
USING (
  -- Users can view their own follow relationships
  auth.uid() = follower_id 
  OR auth.uid() = following_id
  -- OR users can view any accepted follow relationship (for public profile stats)
  OR status = 'accepted'
);