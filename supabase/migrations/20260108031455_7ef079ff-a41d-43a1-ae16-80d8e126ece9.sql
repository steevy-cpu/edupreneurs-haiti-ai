-- Allow anonymous users to view published lessons (for stats and previews)
CREATE POLICY "Allow anon to view published lessons"
ON public.lessons
FOR SELECT
TO anon
USING (is_published = true);