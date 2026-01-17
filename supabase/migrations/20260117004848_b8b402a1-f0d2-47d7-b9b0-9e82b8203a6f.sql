-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read ebook comments" ON ebook_comments;

-- Create new policy allowing anyone (including anonymous/visitors) to read comments
CREATE POLICY "Anyone can read ebook comments" 
  ON ebook_comments
  FOR SELECT
  TO public
  USING (true);