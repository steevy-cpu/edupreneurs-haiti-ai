-- Create function to notify followers when a new post is created
CREATE OR REPLACE FUNCTION public.notify_followers_on_new_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create notifications for all followers who have accepted follow status
  INSERT INTO public.notifications (user_id, actor_id, type, post_id, content, read)
  SELECT 
    follows.follower_id,
    NEW.user_id,
    'new_post',
    NEW.id,
    NULL,
    false
  FROM public.follows
  WHERE follows.following_id = NEW.user_id
    AND follows.status = 'accepted';
  
  RETURN NEW;
END;
$function$;

-- Create trigger to notify followers when a post is created
CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_followers_on_new_post();