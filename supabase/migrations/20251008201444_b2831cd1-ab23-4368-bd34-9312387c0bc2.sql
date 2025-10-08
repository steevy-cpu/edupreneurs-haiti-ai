-- Create function to handle follow request notifications
CREATE OR REPLACE FUNCTION public.handle_follow_request_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notification for new follow request
  INSERT INTO public.notifications (user_id, actor_id, type, post_id, content, read)
  VALUES (NEW.following_id, NEW.follower_id, 'follow_request', NULL, NULL, false);
  
  RETURN NEW;
END;
$$;

-- Create trigger for follow requests
DROP TRIGGER IF EXISTS on_follow_request_created ON public.follows;
CREATE TRIGGER on_follow_request_created
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_follow_request_notification();