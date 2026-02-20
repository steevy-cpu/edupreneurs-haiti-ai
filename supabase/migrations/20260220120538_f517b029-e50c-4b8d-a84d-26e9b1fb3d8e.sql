
-- Fix 2a: Drop overly-permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update messages in their conversations" ON messages;

-- Create sender-only edit policy
CREATE POLICY "Users can edit their own messages"
ON messages FOR UPDATE
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Create participant read-status policy
CREATE POLICY "Participants can mark messages as read"
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Add edited_at column for audit trail
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;
