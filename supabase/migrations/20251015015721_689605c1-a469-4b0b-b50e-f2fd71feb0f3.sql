-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Policy to allow users to check their own tokens
CREATE POLICY "Users can check their own reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (true);

-- Policy to allow system to insert tokens
CREATE POLICY "Service role can insert reset tokens"
  ON public.password_reset_tokens
  FOR INSERT
  WITH CHECK (true);

-- Policy to allow system to update tokens
CREATE POLICY "Service role can update reset tokens"
  ON public.password_reset_tokens
  FOR UPDATE
  USING (true);

-- Function to generate reset token
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
  
  -- Generate random token
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

-- Function to verify and consume reset token
CREATE OR REPLACE FUNCTION public.verify_reset_token(reset_token TEXT)
RETURNS TABLE(valid BOOLEAN, user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_expires_at TIMESTAMPTZ;
  v_used BOOLEAN;
BEGIN
  -- Get token details
  SELECT 
    password_reset_tokens.user_id,
    password_reset_tokens.expires_at,
    password_reset_tokens.used
  INTO v_user_id, v_expires_at, v_used
  FROM public.password_reset_tokens
  WHERE token = reset_token;
  
  -- Check if token exists
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Check if token is expired or used
  IF v_expires_at < now() OR v_used THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT;
    RETURN;
  END IF;
  
  -- Get user email
  SELECT auth.users.email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Mark token as used
  UPDATE public.password_reset_tokens
  SET used = true
  WHERE token = reset_token;
  
  RETURN QUERY SELECT true, v_user_id, v_email;
END;
$$;