-- Add a column to track from which message each user should see messages
-- This is more reliable than timestamp comparison
ALTER TABLE public.conversation_participants 
ADD COLUMN visible_from_message_id uuid;

COMMENT ON COLUMN public.conversation_participants.visible_from_message_id IS 'Messages with ID greater than this are visible to the user. NULL means all messages are visible (e.g., for original members or new group creators).';

-- Create an index for better query performance
CREATE INDEX idx_conversation_participants_visible_from 
ON public.conversation_participants(conversation_id, user_id, visible_from_message_id);