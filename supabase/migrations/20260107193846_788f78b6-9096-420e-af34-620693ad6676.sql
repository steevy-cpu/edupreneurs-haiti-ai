-- Allow anonymous users to view subjects (matières)
CREATE POLICY "Allow anon to view subjects"
ON public.subjects
FOR SELECT
TO anon
USING (true);