-- Temporarily disable the push notification trigger to unblock messaging
DROP TRIGGER IF EXISTS on_message_created ON public.messages;

-- Drop the notification function
DROP FUNCTION IF EXISTS public.notify_new_message();