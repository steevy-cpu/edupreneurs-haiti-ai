-- Add DELETE policy for conversation_participants
-- Allow users to remove themselves from conversations
CREATE POLICY "Users can remove themselves from conversations"
ON conversation_participants
FOR DELETE
USING (auth.uid() = user_id);
