-- Create a secure function to create groups that bypasses RLS
CREATE OR REPLACE FUNCTION public.create_group_chat(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_user_id uuid;
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
  
  RETURN v_group_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_group_chat TO authenticated;