-- Create recovery function for email verification
-- Allows users to resume verification if their session expired

CREATE OR REPLACE FUNCTION public.recover_verification_by_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_new_code TEXT;
BEGIN
  -- Find user by email (case-insensitive)
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE LOWER(email) = LOWER(p_email);
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'email_not_found'
    );
  END IF;
  
  -- Get profile
  SELECT user_id, email_confirmed, full_name, nickname, academic_grade
  INTO v_profile
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'profile_not_found'
    );
  END IF;
  
  -- Check if already verified
  IF v_profile.email_confirmed THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_verified'
    );
  END IF;
  
  -- Generate new 6-digit code
  v_new_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  -- Update confirmation code
  UPDATE public.profiles
  SET confirmation_code = v_new_code
  WHERE user_id = v_user_id;
  
  -- Return success with profile info
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'full_name', v_profile.full_name,
    'nickname', v_profile.nickname,
    'academic_grade', v_profile.academic_grade,
    'confirmation_code', v_new_code
  );
END;
$function$;