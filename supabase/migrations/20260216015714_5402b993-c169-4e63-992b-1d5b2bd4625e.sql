CREATE POLICY "Authenticated users can create own gift links"
  ON gift_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_user_id = auth.uid()
    AND student_email IS NOT NULL
  );