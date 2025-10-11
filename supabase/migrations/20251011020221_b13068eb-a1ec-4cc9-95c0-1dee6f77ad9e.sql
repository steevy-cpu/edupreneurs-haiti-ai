-- Add DELETE policy for conversations so users can delete conversations they're part of
CREATE POLICY "Users can delete conversations they're part of"
ON public.conversations
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = auth.uid()
  )
);

-- Add DELETE policy for notifications so users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Add CASCADE DELETE to ensure related data is cleaned up when a conversation is deleted
-- First drop existing foreign keys if they exist
ALTER TABLE public.conversation_participants
DROP CONSTRAINT IF EXISTS conversation_participants_conversation_id_fkey;

ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- Recreate foreign keys with CASCADE DELETE
ALTER TABLE public.conversation_participants
ADD CONSTRAINT conversation_participants_conversation_id_fkey
FOREIGN KEY (conversation_id)
REFERENCES public.conversations(id)
ON DELETE CASCADE;

ALTER TABLE public.messages
ADD CONSTRAINT messages_conversation_id_fkey
FOREIGN KEY (conversation_id)
REFERENCES public.conversations(id)
ON DELETE CASCADE;

-- Add CASCADE DELETE for message reactions when messages are deleted
ALTER TABLE public.message_reactions
DROP CONSTRAINT IF EXISTS message_reactions_message_id_fkey;

ALTER TABLE public.message_reactions
ADD CONSTRAINT message_reactions_message_id_fkey
FOREIGN KEY (message_id)
REFERENCES public.messages(id)
ON DELETE CASCADE;