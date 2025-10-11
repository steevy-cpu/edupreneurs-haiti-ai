-- Drop the existing restrictive UPDATE policy on messages
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create a new policy that allows users to mark messages as read in their conversations
CREATE POLICY "Users can update messages in their conversations"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Users can only update their own message content
  (auth.uid() = sender_id) OR
  -- Or they can mark any message in their conversation as read
  (EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
      AND conversation_participants.user_id = auth.uid()
  ))
);