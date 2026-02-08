-- Drop the existing function first (required when changing parameter defaults)
DROP FUNCTION IF EXISTS public.verify_device_challenge(uuid, text, boolean);

-- Recreate verify_device_challenge with "only upgrade" trust logic
CREATE OR REPLACE FUNCTION public.verify_device_challenge(
  p_challenge_id uuid,
  p_code text,
  p_trust_device boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_challenge RECORD;
BEGIN
  -- Get the challenge
  SELECT 
    id, user_id, device_fingerprint, hardware_fingerprint, 
    device_name, browser, os, verification_code, 
    expires_at, verified_at, attempts, max_attempts
  INTO v_challenge
  FROM public.device_verification_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;
  
  -- Check if challenge exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'challenge_not_found'
    );
  END IF;
  
  -- Check if already verified
  IF v_challenge.verified_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_verified'
    );
  END IF;
  
  -- Check if expired
  IF v_challenge.expires_at < now() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'challenge_expired'
    );
  END IF;
  
  -- Check attempts
  IF v_challenge.attempts >= v_challenge.max_attempts THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'max_attempts_exceeded'
    );
  END IF;
  
  -- Increment attempts
  UPDATE public.device_verification_challenges
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
  UPDATE public.device_verification_challenges
  SET verified_at = now()
  WHERE id = p_challenge_id;
  
  -- Upsert trusted device with "only upgrade" logic for is_trusted
  -- CRITICAL: Use OR to prevent downgrading an already trusted device
  INSERT INTO public.user_trusted_devices (
    user_id, device_fingerprint, hardware_fingerprint,
    device_name, browser, os, is_trusted, last_login_at
  ) VALUES (
    v_challenge.user_id, v_challenge.device_fingerprint, v_challenge.hardware_fingerprint,
    v_challenge.device_name, v_challenge.browser, v_challenge.os, 
    p_trust_device, now()
  )
  ON CONFLICT (user_id, device_fingerprint) 
  DO UPDATE SET
    hardware_fingerprint = EXCLUDED.hardware_fingerprint,
    device_name = EXCLUDED.device_name,
    browser = EXCLUDED.browser,
    os = EXCLUDED.os,
    -- Only upgrade trust, never downgrade: keep existing TRUE or apply new TRUE
    is_trusted = user_trusted_devices.is_trusted OR EXCLUDED.is_trusted,
    last_login_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_challenge.user_id
  );
END;
$function$;