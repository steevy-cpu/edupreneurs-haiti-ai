-- Create a function to notify group members when group is deleted
CREATE OR REPLACE FUNCTION public.notify_group_deletion(
  p_group_id uuid,
  p_group_name text,
  p_admin_id uuid,
  p_admin_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notifications for all group members except the admin
  INSERT INTO public.notifications (user_id, actor_id, type, content, read)
  SELECT 
    gm.user_id,
    p_admin_id,
    'group_deleted',
    'Le groupe "' || p_group_name || '" a été supprimé par ' || p_admin_name,
    false
  FROM public.group_members gm
  WHERE gm.group_id = p_group_id
    AND gm.user_id != p_admin_id;
END;
$$;