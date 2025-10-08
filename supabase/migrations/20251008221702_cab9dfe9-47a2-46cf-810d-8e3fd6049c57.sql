-- Add replied_to_id column to messages table
ALTER TABLE public.messages
ADD COLUMN replied_to_id uuid REFERENCES public.messages(id) ON DELETE SET NULL;

-- Create index for better performance when fetching replies
CREATE INDEX idx_messages_replied_to ON public.messages(replied_to_id);