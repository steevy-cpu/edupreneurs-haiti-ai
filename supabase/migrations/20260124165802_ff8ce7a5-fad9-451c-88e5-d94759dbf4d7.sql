-- Update submit_chess_move to accept and persist remaining time
CREATE OR REPLACE FUNCTION public.submit_chess_move(
  p_match_id UUID, 
  p_user_id UUID, 
  p_from_square TEXT, 
  p_to_square TEXT, 
  p_new_fen TEXT,
  p_promotion TEXT DEFAULT NULL,
  p_time_remaining INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
  v_is_white_turn BOOLEAN;
  v_is_player_white BOOLEAN;
  v_new_move JSONB;
  v_new_history JSONB;
  v_new_turn TEXT;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO v_match 
  FROM chess_matches 
  WHERE id = p_match_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not found');
  END IF;
  
  IF v_match.status != 'playing' THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match is not active');
  END IF;
  
  -- Verify it's the player's turn
  v_is_white_turn := v_match.current_turn = 'w';
  v_is_player_white := v_match.white_player_id = p_user_id;
  
  IF v_is_white_turn != v_is_player_white THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not your turn');
  END IF;
  
  -- Determine next turn
  v_new_turn := CASE WHEN v_match.current_turn = 'w' THEN 'b' ELSE 'w' END;
  
  -- Build the move record
  v_new_move := jsonb_build_object(
    'from', p_from_square,
    'to', p_to_square,
    'promotion', p_promotion,
    'fen', p_new_fen,
    'player_id', p_user_id::text,
    'timestamp', now()::text
  );
  
  -- Append to history
  v_new_history := v_match.move_history || v_new_move;
  
  -- Update match with move and time if provided
  UPDATE chess_matches SET
    move_history = v_new_history,
    current_fen = p_new_fen,
    current_turn = v_new_turn,
    last_move_at = now(),
    white_time_remaining = CASE 
      WHEN v_is_player_white AND p_time_remaining IS NOT NULL 
      THEN p_time_remaining 
      ELSE white_time_remaining 
    END,
    black_time_remaining = CASE 
      WHEN NOT v_is_player_white AND p_time_remaining IS NOT NULL 
      THEN p_time_remaining 
      ELSE black_time_remaining 
    END,
    updated_at = now()
  WHERE id = p_match_id;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'move', v_new_move,
    'next_turn', v_new_turn,
    'new_fen', p_new_fen
  );
END;
$$;