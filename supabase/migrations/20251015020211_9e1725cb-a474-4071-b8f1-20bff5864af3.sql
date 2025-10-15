-- Enable pgcrypto extension for gen_random_bytes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the function to generate reset token
CREATE OR REPLACE FUNCTION public.generate_password_reset_token(user_email TEXT)
RETURNS TABLE(token TEXT, user_id UUID, full_name TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  SELECT profiles.full_name INTO v_full_name
  FROM public.profiles
  WHERE profiles.user_id = v_user_id;
  
  -- Generate random token using gen_random_uuid and encoding
  v_token := encode(gen_random_bytes(32), 'hex');
  
  -- Delete any existing tokens for this user
  DELETE FROM public.password_reset_tokens
  WHERE password_reset_tokens.user_id = v_user_id;
  
  -- Insert new token (expires in 1 hour)
  INSERT INTO public.password_reset_tokens (user_id, token, expires_at)
  VALUES (v_user_id, v_token, now() + interval '1 hour');
  
  RETURN QUERY SELECT v_token, v_user_id, v_full_name;
END;
$$;