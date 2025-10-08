-- Drop the old policy that only allows senders to update
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Create a new policy that allows:
-- 1. Senders to update their own messages (any field)
-- 2. Recipients to update the read status
CREATE POLICY "Users can update messages"
ON messages
FOR UPDATE
USING (
  -- User is the sender (can update any field)
  auth.uid() = sender_id
  OR
  -- User is a participant in the conversation (can update read field only)
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
)
WITH CHECK (
  -- User is the sender (can update any field)
  auth.uid() = sender_id
  OR
  -- User is a participant in the conversation (can update read field only)
  EXISTS (
    SELECT 1
    FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);