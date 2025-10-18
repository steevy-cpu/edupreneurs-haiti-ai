-- Add policy to allow users to update their own conversation visibility settings
CREATE POLICY "Users can update their conversation visibility"
ON conversation_participants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);