-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Function to send push notification via edge function
CREATE OR REPLACE FUNCTION public.send_notification_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_profile RECORD;
  v_notification_title TEXT;
  v_notification_body TEXT;
  v_deeplink TEXT;
  v_supabase_url TEXT;
  v_supabase_anon_key TEXT;
BEGIN
  -- Get environment variables
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);
  
  -- If env vars are not set, try to get them from secrets
  IF v_supabase_url IS NULL THEN
    SELECT decrypted_secret INTO v_supabase_url 
    FROM vault.decrypted_secrets 
    WHERE name = 'SUPABASE_URL' LIMIT 1;
  END IF;
  
  IF v_supabase_anon_key IS NULL THEN
    SELECT decrypted_secret INTO v_supabase_anon_key 
    FROM vault.decrypted_secrets 
    WHERE name = 'SUPABASE_ANON_KEY' LIMIT 1;
  END IF;
  
  -- Get actor profile
  SELECT nickname, full_name INTO v_actor_profile
  FROM public.profiles
  WHERE user_id = NEW.actor_id;
  
  -- Set title and body based on notification type
  v_notification_title := 'EDUPRENEURS';
  
  CASE NEW.type
    WHEN 'follow_request' THEN
      v_notification_body := (v_actor_profile.nickname || ' vous a envoyé une demande d''abonnement');
      v_deeplink := '/notifications';
    WHEN 'new_post' THEN
      v_notification_body := (v_actor_profile.nickname || ' a publié un nouveau post');
      v_deeplink := '/feed';
    WHEN 'like' THEN
      v_notification_body := (v_actor_profile.nickname || ' a aimé votre publication');
      v_deeplink := CASE WHEN NEW.post_id IS NOT NULL THEN '/feed' ELSE '/notifications' END;
    WHEN 'comment' THEN
      v_notification_body := (v_actor_profile.nickname || ' a commenté votre publication');
      v_deeplink := CASE WHEN NEW.post_id IS NOT NULL THEN '/feed' ELSE '/notifications' END;
    WHEN 'share' THEN
      v_notification_body := (v_actor_profile.nickname || ' a partagé votre publication');
      v_deeplink := CASE WHEN NEW.post_id IS NOT NULL THEN '/feed' ELSE '/notifications' END;
    WHEN 'group_invitation' THEN
      v_notification_body := COALESCE(NEW.content, v_actor_profile.nickname || ' vous a ajouté à un groupe');
      v_deeplink := '/community';
    WHEN 'group_deleted' THEN
      v_notification_body := COALESCE(NEW.content, 'Un groupe a été supprimé');
      v_deeplink := '/notifications';
    ELSE
      v_notification_body := COALESCE(NEW.content, 'Nouvelle notification');
      v_deeplink := '/notifications';
  END CASE;
  
  -- Call the edge function asynchronously using pg_net
  PERFORM extensions.http_post(
    url := v_supabase_url || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_supabase_anon_key
    ),
    body := jsonb_build_object(
      'recipientUserId', NEW.user_id::text,
      'title', v_notification_title,
      'body', v_notification_body,
      'url', v_deeplink,
      'notificationId', NEW.id::text
    )
  );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;

-- Create trigger to send push notifications
CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_notification_push();