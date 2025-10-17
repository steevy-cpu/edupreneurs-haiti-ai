-- Drop the existing trigger that uses http_post
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;

-- Recreate the function to simply log instead of calling http_post
CREATE OR REPLACE FUNCTION public.send_notification_push()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Just log that a notification was created
  -- The actual push notification will be sent from the application code
  RAISE LOG 'Notification created: % for user: %', NEW.type, NEW.user_id;
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_notification_push();