-- 1. Create login_attempts table
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  failed_count integer NOT NULL DEFAULT 0,
  last_failed_at timestamptz,
  locked_at timestamptz,
  reset_requested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT login_attempts_email_key UNIQUE (email)
);

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_login_attempts_email 
  ON public.login_attempts(email);

-- 3. Enable RLS (no public access = security by design)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- 4. check_login_attempt RPC - Returns current attempt status
CREATE OR REPLACE FUNCTION public.check_login_attempt(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_record RECORD;
BEGIN
  SELECT failed_count, locked_at
  INTO v_record
  FROM login_attempts
  WHERE email = LOWER(TRIM(p_email));
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('failed_count', 0, 'locked_at', NULL);
  END IF;
  
  RETURN jsonb_build_object(
    'failed_count', v_record.failed_count,
    'locked_at', v_record.locked_at
  );
END;
$$;

-- 5. record_failed_login RPC - Increments counter, locks after 5 attempts
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email TEXT := LOWER(TRIM(p_email));
  v_new_count INTEGER;
  v_is_locked BOOLEAN := false;
  v_user_id UUID;
  v_full_name TEXT;
  v_token TEXT;
BEGIN
  -- Upsert attempt record
  INSERT INTO login_attempts (email, failed_count, last_failed_at, updated_at)
  VALUES (v_email, 1, now(), now())
  ON CONFLICT (email) DO UPDATE
  SET 
    failed_count = login_attempts.failed_count + 1,
    last_failed_at = now(),
    updated_at = now()
  RETURNING failed_count INTO v_new_count;
  
  -- Check if now locked (5 attempts)
  IF v_new_count >= 5 THEN
    UPDATE login_attempts 
    SET locked_at = now()
    WHERE email = v_email AND locked_at IS NULL;
    
    v_is_locked := true;
    
    -- Find user and generate reset token
    SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = v_email;
    
    IF v_user_id IS NOT NULL THEN
      SELECT full_name INTO v_full_name FROM profiles WHERE user_id = v_user_id;
      
      -- Generate token
      v_token := encode(extensions.gen_random_bytes(32), 'hex');
      
      DELETE FROM password_reset_tokens WHERE user_id = v_user_id;
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (v_user_id, v_token, now() + interval '1 hour');
      
      UPDATE login_attempts SET reset_requested_at = now() WHERE email = v_email;
      
      RETURN jsonb_build_object(
        'new_count', v_new_count,
        'is_locked', v_is_locked,
        'reset_token', v_token,
        'full_name', v_full_name
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'new_count', v_new_count,
    'is_locked', v_is_locked,
    'reset_token', NULL,
    'full_name', NULL
  );
END;
$$;

-- 6. clear_login_attempts RPC - Removes tracking on successful login
CREATE OR REPLACE FUNCTION public.clear_login_attempts(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM login_attempts WHERE email = LOWER(TRIM(p_email));
END;
$$;