-- Update the function to use fully qualified function name
CREATE OR REPLACE FUNCTION public.generate_password_reset_token(user_email TEXT)
RETURNS TABLE(token TEXT, user_id UUID, full_name TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID;
  v_token TEXT;
  v_full_name TEXT;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Get user's full name
  SELECT public.profiles.full_name INTO v_full_name
  FROM public.profiles
  WHERE public.profiles.user_id = v_user_id;
  
  -- Generate random token using fully qualified extension function
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  
  -- Delete any existing tokens for this user
  DELETE FROM public.password_reset_tokens
  WHERE public.password_reset_tokens.user_id = v_user_id;
  
  -- Insert new token (expires in 1 hour)
  INSERT INTO public.password_reset_tokens (user_id, token, expires_at)
  VALUES (v_user_id, v_token, now() + interval '1 hour');
  
  RETURN QUERY SELECT v_token, v_user_id, v_full_name;
END;
$$;