-- Function to find a match by invite code (bypasses RLS for private matches)
CREATE OR REPLACE FUNCTION public.find_match_by_invite_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_match RECORD;
BEGIN
  -- Find the match by code
  SELECT id, status, white_player_id, black_player_id, time_control, is_public
  INTO v_match
  FROM chess_matches
  WHERE invite_code = UPPER(p_code)
  AND status = 'waiting';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Code invalide ou partie non disponible'
    );
  END IF;
  
  IF v_match.black_player_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Cette partie est déjà complète'
    );
  END IF;
  
  -- Return match info (limited fields for security)
  RETURN jsonb_build_object(
    'status', 'success',
    'match_id', v_match.id,
    'white_player_id', v_match.white_player_id,
    'time_control', v_match.time_control,
    'is_public', v_match.is_public
  );
END;
$$;