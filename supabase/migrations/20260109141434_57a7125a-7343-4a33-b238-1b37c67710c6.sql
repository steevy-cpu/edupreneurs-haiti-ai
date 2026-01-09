-- Drop the broken policy that causes infinite recursion
DROP POLICY IF EXISTS "Authenticated users can view profiles for social features" ON profiles;

-- Create a fixed policy without self-reference
CREATE POLICY "Authenticated users can view profiles for social features"
ON profiles FOR SELECT TO authenticated
USING (
  -- Own profile
  auth.uid() = user_id
  OR
  -- Profiles of followers/following (with accepted status)
  EXISTS (
    SELECT 1 FROM follows
    WHERE (follows.follower_id = auth.uid() AND follows.following_id = profiles.user_id AND follows.status = 'accepted')
       OR (follows.following_id = auth.uid() AND follows.follower_id = profiles.user_id)
  )
  OR
  -- Profiles of conversation participants
  EXISTS (
    SELECT 1 FROM conversation_participants cp1
    JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = auth.uid() AND cp2.user_id = profiles.user_id
  )
  OR
  -- Profiles of public post authors
  EXISTS (
    SELECT 1 FROM posts
    WHERE posts.user_id = profiles.user_id AND posts.is_public = true
  )
  OR
  -- Non-system accounts (for leaderboard visibility)
  (is_system_account = false OR is_system_account IS NULL)
);