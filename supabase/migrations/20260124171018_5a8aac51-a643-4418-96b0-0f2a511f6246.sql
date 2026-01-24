-- Add rematch columns to chess_matches
ALTER TABLE chess_matches ADD COLUMN IF NOT EXISTS rematch_from_id UUID REFERENCES chess_matches(id);
ALTER TABLE chess_matches ADD COLUMN IF NOT EXISTS rematch_requested_by UUID;
ALTER TABLE chess_matches ADD COLUMN IF NOT EXISTS rematch_match_id UUID REFERENCES chess_matches(id);

-- RPC to request rematch
CREATE OR REPLACE FUNCTION request_chess_rematch(p_match_id UUID, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_match RECORD;
BEGIN
  SELECT * INTO v_match FROM chess_matches WHERE id = p_match_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not found');
  END IF;
  
  IF v_match.status != 'completed' THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not completed');
  END IF;
  
  -- Check if user was in this match
  IF v_match.white_player_id != p_user_id AND v_match.black_player_id != p_user_id THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'User not in match');
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
CREATE OR REPLACE FUNCTION accept_chess_rematch(p_match_id UUID, p_user_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_match RECORD;
  v_new_match_id UUID;
BEGIN
  SELECT * INTO v_match FROM chess_matches WHERE id = p_match_id FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not found');
  END IF;
  
  -- Check if user was in this match
  IF v_match.white_player_id != p_user_id AND v_match.black_player_id != p_user_id THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'User not in match');
  END IF;
  
  -- Check if rematch already exists
  IF v_match.rematch_match_id IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'exists', 'rematch_id', v_match.rematch_match_id);
  END IF;
  
  -- Must have a pending request from the OTHER player
  IF v_match.rematch_requested_by IS NULL OR v_match.rematch_requested_by = p_user_id THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'No rematch request to accept');
  END IF;
  
  -- Create new match with swapped colors (previous white becomes black, and vice versa)
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
    v_match.black_player_id,  -- Swap: previous black is now white
    v_match.white_player_id,  -- Swap: previous white is now black
    p_user_id, 
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