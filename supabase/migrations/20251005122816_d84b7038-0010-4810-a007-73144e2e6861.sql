-- Create function to send push notifications when a new message is created
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recipient_id uuid;
  sender_name text;
BEGIN
  -- Get the recipient user ID (the other person in the conversation)
  SELECT user_id INTO recipient_id
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id != NEW.sender_id
  LIMIT 1;

  -- Get sender's name
  SELECT full_name INTO sender_name
  FROM public.profiles
  WHERE user_id = NEW.sender_id;

  -- Call the edge function to send push notification
  -- Note: This uses pg_net extension if available, otherwise notifications
  -- will be handled client-side
  IF recipient_id IS NOT NULL THEN
    PERFORM
      net.http_post(
        url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := jsonb_build_object(
          'recipientUserId', recipient_id,
          'title', sender_name || ' vous a envoyé un message',
          'body', SUBSTRING(NEW.content, 1, 100),
          'conversationId', NEW.conversation_id
        )
      );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on messages table
DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();