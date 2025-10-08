-- Allow authenticated users to view public profile information of other users
CREATE POLICY "Users can view public profile information"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);