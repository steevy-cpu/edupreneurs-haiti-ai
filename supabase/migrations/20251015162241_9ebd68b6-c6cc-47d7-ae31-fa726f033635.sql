-- Update create_group_chat function to automatically add Eric as a member
CREATE OR REPLACE FUNCTION public.create_group_chat(p_name text, p_description text DEFAULT NULL::text, p_avatar_url text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_group_id uuid;
  v_user_id uuid;
  eric_user_id uuid := '68f2f959-e14a-47f9-8277-07df3a6fcd79';
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Insert the group
  INSERT INTO public.group_chats (name, description, avatar_url, created_by)
  VALUES (p_name, p_description, p_avatar_url, v_user_id)
  RETURNING id INTO v_group_id;
  
  -- Add the creator as an admin member
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'admin');
  
  -- Add Eric as a member automatically
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, eric_user_id, 'member')
  ON CONFLICT DO NOTHING;
  
  RETURN v_group_id;
END;
$function$;