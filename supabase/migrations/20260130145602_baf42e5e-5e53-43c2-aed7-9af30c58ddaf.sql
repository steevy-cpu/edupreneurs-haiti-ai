-- Create device verification challenges table
CREATE TABLE public.device_verification_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  hardware_fingerprint TEXT,
  verification_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 minutes'),
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  device_name TEXT,
  browser TEXT,
  os TEXT
);

-- Enable RLS
ALTER TABLE public.device_verification_challenges ENABLE ROW LEVEL SECURITY;

-- Users can only read their own challenges (for checking status)
CREATE POLICY "Users can read own challenges"
  ON public.device_verification_challenges FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_device_challenges_user_device 
  ON public.device_verification_challenges(user_id, device_fingerprint);
CREATE INDEX idx_device_challenges_expires 
  ON public.device_verification_challenges(expires_at);

-- RPC: Create Device Challenge
CREATE OR REPLACE FUNCTION public.create_device_challenge(
  p_user_id UUID,
  p_device_fingerprint TEXT,
  p_hardware_fingerprint TEXT,
  p_device_name TEXT,
  p_browser TEXT,
  p_os TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_code TEXT;
  v_challenge_id UUID;
BEGIN
  -- Delete expired challenges for this user
  DELETE FROM device_verification_challenges 
  WHERE user_id = p_user_id AND expires_at < now();
  
  -- Check if there's a recent unexpired challenge for same device
  SELECT id INTO v_challenge_id
  FROM device_verification_challenges
  WHERE user_id = p_user_id 
    AND device_fingerprint = p_device_fingerprint
    AND expires_at > now()
    AND verified_at IS NULL
  LIMIT 1;
  
  -- If exists, regenerate code
  IF v_challenge_id IS NOT NULL THEN
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    UPDATE device_verification_challenges
    SET verification_code = v_code,
        created_at = now(),
        expires_at = now() + INTERVAL '15 minutes',
        attempts = 0
    WHERE id = v_challenge_id;
    
    RETURN jsonb_build_object('challenge_id', v_challenge_id, 'code', v_code);
  END IF;
  
  -- Create new challenge
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  INSERT INTO device_verification_challenges (
    user_id, device_fingerprint, hardware_fingerprint,
    verification_code, device_name, browser, os
  ) VALUES (
    p_user_id, p_device_fingerprint, p_hardware_fingerprint,
    v_code, p_device_name, p_browser, p_os
  ) RETURNING id INTO v_challenge_id;
  
  RETURN jsonb_build_object('challenge_id', v_challenge_id, 'code', v_code);
END;
$$;

-- RPC: Verify Device Challenge
CREATE OR REPLACE FUNCTION public.verify_device_challenge(
  p_challenge_id UUID,
  p_code TEXT,
  p_trust_device BOOLEAN DEFAULT false
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_challenge RECORD;
BEGIN
  -- Get challenge with lock
  SELECT * INTO v_challenge
  FROM device_verification_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'challenge_not_found');
  END IF;
  
  -- Check expiration
  IF v_challenge.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'challenge_expired');
  END IF;
  
  -- Check if already verified
  IF v_challenge.verified_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_verified');
  END IF;
  
  -- Check max attempts
  IF v_challenge.attempts >= v_challenge.max_attempts THEN
    RETURN jsonb_build_object('success', false, 'error', 'max_attempts_exceeded');
  END IF;
  
  -- Increment attempts
  UPDATE device_verification_challenges
  SET attempts = attempts + 1
  WHERE id = p_challenge_id;
  
  -- Verify code
  IF TRIM(v_challenge.verification_code) != TRIM(p_code) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'invalid_code',
      'attempts_remaining', v_challenge.max_attempts - v_challenge.attempts - 1
    );
  END IF;
  
  -- Mark as verified
  UPDATE device_verification_challenges
  SET verified_at = now()
  WHERE id = p_challenge_id;
  
  -- Register/update trusted device
  INSERT INTO user_trusted_devices (
    user_id, device_fingerprint, hardware_fingerprint,
    device_name, browser, os, is_trusted, last_login_at
  ) VALUES (
    v_challenge.user_id, v_challenge.device_fingerprint,
    v_challenge.hardware_fingerprint, v_challenge.device_name,
    v_challenge.browser, v_challenge.os, p_trust_device, now()
  )
  ON CONFLICT (user_id, device_fingerprint) 
  DO UPDATE SET 
    is_trusted = p_trust_device,
    last_login_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_challenge.user_id
  );
END;
$$;

-- RPC: Resend Device Challenge Code
CREATE OR REPLACE FUNCTION public.resend_device_challenge(
  p_challenge_id UUID
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_challenge RECORD;
  v_new_code TEXT;
BEGIN
  -- Get challenge
  SELECT * INTO v_challenge
  FROM device_verification_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'challenge_not_found');
  END IF;
  
  -- Check if already verified
  IF v_challenge.verified_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_verified');
  END IF;
  
  -- Generate new code and reset
  v_new_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  UPDATE device_verification_challenges
  SET verification_code = v_new_code,
      created_at = now(),
      expires_at = now() + INTERVAL '15 minutes',
      attempts = 0
  WHERE id = p_challenge_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'code', v_new_code,
    'user_id', v_challenge.user_id,
    'device_name', v_challenge.device_name,
    'browser', v_challenge.browser
  );
END;
$$;