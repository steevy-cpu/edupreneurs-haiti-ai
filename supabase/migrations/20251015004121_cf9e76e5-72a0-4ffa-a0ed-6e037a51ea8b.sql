-- Update the verify_email_code function to trim whitespace when comparing codes
CREATE OR REPLACE FUNCTION public.verify_email_code(
  p_user_id uuid,
  p_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Return success with user info for welcome email
  RETURN jsonb_build_object(
    'success', true,
    'full_name', v_profile.full_name,
    'nickname', v_profile.nickname
  );
END;
$$;