-- Update verify_email_code to accept device info and auto-trust device after verification
CREATE OR REPLACE FUNCTION public.verify_email_code(
  p_user_id uuid,
  p_code text,
  p_device_fingerprint text DEFAULT NULL,
  p_hardware_fingerprint text DEFAULT NULL,
  p_device_name text DEFAULT NULL,
  p_browser text DEFAULT NULL,
  p_os text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_profile record;
  v_result jsonb;
BEGIN
  -- Get the profile
  SELECT confirmation_code, email_confirmed, full_name, nickname
  INTO v_profile
  FROM public.profiles
  WHERE user_id = p_user_id;
  
  -- Check if profile exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile not found'
    );
  END IF;
  
  -- Check if already confirmed
  IF v_profile.email_confirmed THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email already confirmed'
    );
  END IF;
  
  -- Check if code matches (trim whitespace and compare)
  IF TRIM(v_profile.confirmation_code) != TRIM(p_code) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid verification code'
    );
  END IF;
  
  -- Update profile to mark email as confirmed
  UPDATE public.profiles
  SET 
    email_confirmed = true,
    confirmation_code = null
  WHERE user_id = p_user_id;
  
  -- Auto-trust the device used for email verification
  -- This prevents a second OTP prompt on first login
  IF p_device_fingerprint IS NOT NULL THEN
    INSERT INTO public.user_trusted_devices (
      user_id, device_fingerprint, hardware_fingerprint,
      device_name, browser, os, is_trusted, last_login_at
    ) VALUES (
      p_user_id, p_device_fingerprint, p_hardware_fingerprint,
      p_device_name, p_browser, p_os, true, now()
    )
    ON CONFLICT (user_id, device_fingerprint) 
    DO UPDATE SET
      hardware_fingerprint = EXCLUDED.hardware_fingerprint,
      device_name = EXCLUDED.device_name,
      browser = EXCLUDED.browser,
      os = EXCLUDED.os,
      is_trusted = true,
      last_login_at = now();
  END IF;
  
  -- Return success with user info for welcome email
  RETURN jsonb_build_object(
    'success', true,
    'full_name', v_profile.full_name,
    'nickname', v_profile.nickname
  );
END;
$function$;