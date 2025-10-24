-- Create function to notify content editors when a lesson is commented
CREATE OR REPLACE FUNCTION public.notify_lesson_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_lesson_title TEXT;
  v_editor_user_id UUID;
BEGIN
  -- Get the lesson title
  SELECT title INTO v_lesson_title
  FROM public.lessons
  WHERE id = NEW.lesson_id;

  -- Notify all content editors except the commenter
  FOR v_editor_user_id IN 
    SELECT user_id 
    FROM public.content_editor_roles
    WHERE user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, actor_id, type, content, read)
    VALUES (
      v_editor_user_id,
      NEW.user_id,
      'lesson_comment',
      v_lesson_title,
      false
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

-- Create trigger for lesson comments
DROP TRIGGER IF EXISTS on_lesson_comment_created ON public.lesson_comments;
CREATE TRIGGER on_lesson_comment_created
  AFTER INSERT ON public.lesson_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_lesson_comment();