-- Create a secure function to resend verification code
CREATE OR REPLACE FUNCTION public.resend_verification_code(
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile record;
  v_new_code text;
BEGIN
  -- Generate new 6-digit code
  v_new_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  -- Get the profile and update code
  UPDATE public.profiles
  SET confirmation_code = v_new_code
  WHERE user_id = p_user_id AND email_confirmed = false
  RETURNING full_name, nickname, academic_grade, confirmation_code INTO v_profile;
  
  -- Check if profile exists and was updated
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Profile not found or already verified'
    );
  END IF;
  
  -- Return success with profile info and new code
  RETURN jsonb_build_object(
    'success', true,
    'full_name', v_profile.full_name,
    'nickname', v_profile.nickname,
    'academic_grade', v_profile.academic_grade,
    'confirmation_code', v_profile.confirmation_code
  );
END;
$$;