-- Drop and recreate the RPCs with proper SET search_path and correct logic

-- Drop existing functions
DROP FUNCTION IF EXISTS request_chess_rematch(UUID, UUID);
DROP FUNCTION IF EXISTS accept_chess_rematch(UUID, UUID);

-- RPC to request rematch
CREATE OR REPLACE FUNCTION request_chess_rematch(p_match_id UUID, p_user_id UUID)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
BEGIN
  SELECT * INTO v_match FROM chess_matches WHERE id = p_match_id;
  
  IF NOT FOUND OR v_match.status != 'completed' THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not available for rematch');
  END IF;
  
  -- Check if user is a participant
  IF v_match.white_player_id != p_user_id AND v_match.black_player_id != p_user_id THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not a participant');
  END IF;
  
  -- Check if rematch already exists
  IF v_match.rematch_match_id IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'exists', 'rematch_id', v_match.rematch_match_id);
  END IF;
  
  -- Mark rematch as requested
  UPDATE chess_matches 
  SET rematch_requested_by = p_user_id 
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object('status', 'requested', 'requested_by', p_user_id);
END;
$$;

-- RPC to accept rematch (creates new match with swapped colors)
-- The accepting user becomes WHITE (since they were BLACK in original)
CREATE OR REPLACE FUNCTION accept_chess_rematch(p_match_id UUID, p_user_id UUID)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
  v_new_match_id UUID;
  v_new_white UUID;
  v_new_black UUID;
BEGIN
  SELECT * INTO v_match FROM chess_matches WHERE id = p_match_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not found');
  END IF;
  
  -- Check if rematch already exists
  IF v_match.rematch_match_id IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'exists', 'rematch_id', v_match.rematch_match_id);
  END IF;
  
  IF v_match.rematch_requested_by IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'No rematch request pending');
  END IF;
  
  IF v_match.rematch_requested_by = p_user_id THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Cannot accept your own rematch request');
  END IF;
  
  -- Check if user is a participant
  IF v_match.white_player_id != p_user_id AND v_match.black_player_id != p_user_id THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not a participant');
  END IF;
  
  -- Swap colors: original black becomes white
  v_new_white := v_match.black_player_id;
  v_new_black := v_match.white_player_id;
  
  -- Create new match with swapped colors
  -- Use the new white player as created_by to satisfy RLS if needed
  INSERT INTO chess_matches (
    white_player_id, 
    black_player_id, 
    created_by, 
    status,
    time_control, 
    time_per_player, 
    difficulty, 
    is_public,
    rematch_from_id, 
    white_time_remaining, 
    black_time_remaining,
    started_at
  ) VALUES (
    v_new_white, 
    v_new_black, 
    v_new_white,  -- created_by = new white player
    'playing',
    v_match.time_control, 
    v_match.time_per_player, 
    v_match.difficulty, 
    false,
    p_match_id, 
    v_match.time_per_player, 
    v_match.time_per_player,
    now()
  ) RETURNING id INTO v_new_match_id;
  
  -- Link original match to rematch
  UPDATE chess_matches SET rematch_match_id = v_new_match_id WHERE id = p_match_id;
  
  RETURN jsonb_build_object('status', 'success', 'rematch_id', v_new_match_id);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION request_chess_rematch(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_chess_rematch(UUID, UUID) TO authenticated;