-- Allow anonymous users to view public leaderboard data
CREATE POLICY "Allow anon to view leaderboard profiles"
ON public.profiles
FOR SELECT
TO anon
USING (
  is_system_account = false OR is_system_account IS NULL
);