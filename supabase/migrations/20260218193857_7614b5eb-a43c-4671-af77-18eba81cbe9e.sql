
-- Harden end_chess_match: require authentication and validate the caller
-- is one of the two players before accepting any winner_id.
CREATE OR REPLACE FUNCTION public.end_chess_match(
  p_match_id uuid,
  p_winner_id uuid,
  p_result text,
  p_result_reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match RECORD;
  v_white_stats RECORD;
  v_black_stats RECORD;
  v_white_elo_change INTEGER := 0;
  v_black_elo_change INTEGER := 0;
  v_k_factor INTEGER := 32;
  v_expected_white NUMERIC;
  v_expected_black NUMERIC;
  v_white_result NUMERIC;
  v_black_result NUMERIC;
  v_moves_count INTEGER;
BEGIN
  -- ── AUTH CHECK ──────────────────────────────────────────────────────────────
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not authenticated');
  END IF;

  -- Lock and fetch match
  SELECT * INTO v_match
  FROM chess_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match not found');
  END IF;

  -- ── PARTICIPANT CHECK ───────────────────────────────────────────────────────
  -- The caller must be white or black player; prevents any third party from
  -- ending a match or manipulating winner_id.
  IF auth.uid() NOT IN (v_match.white_player_id, v_match.black_player_id) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not a participant');
  END IF;

  -- ── WINNER SANITY CHECK ─────────────────────────────────────────────────────
  -- p_winner_id must be NULL (draw) or one of the two players.
  IF p_winner_id IS NOT NULL AND p_winner_id NOT IN (v_match.white_player_id, v_match.black_player_id) THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Invalid winner_id');
  END IF;

  IF v_match.status = 'completed' THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Match already completed');
  END IF;

  -- Ensure black player exists (match was started)
  IF v_match.black_player_id IS NULL THEN
    UPDATE chess_matches SET
      status = 'cancelled',
      ended_at = now(),
      updated_at = now()
    WHERE id = p_match_id;

    RETURN jsonb_build_object('status', 'cancelled', 'message', 'Match cancelled - no opponent');
  END IF;

  -- Get moves count
  v_moves_count := jsonb_array_length(COALESCE(v_match.move_history, '[]'::jsonb));

  -- Get or create stats for both players
  SELECT * INTO v_white_stats FROM chess_player_stats WHERE user_id = v_match.white_player_id;
  SELECT * INTO v_black_stats FROM chess_player_stats WHERE user_id = v_match.black_player_id;

  IF v_white_stats IS NULL THEN
    INSERT INTO chess_player_stats (user_id, elo_rating, games_played, games_won, games_lost, games_drawn, total_moves, current_winning_streak, longest_winning_streak)
    VALUES (v_match.white_player_id, 1000, 0, 0, 0, 0, 0, 0, 0)
    RETURNING * INTO v_white_stats;
  END IF;

  IF v_black_stats IS NULL THEN
    INSERT INTO chess_player_stats (user_id, elo_rating, games_played, games_won, games_lost, games_drawn, total_moves, current_winning_streak, longest_winning_streak)
    VALUES (v_match.black_player_id, 1000, 0, 0, 0, 0, 0, 0, 0)
    RETURNING * INTO v_black_stats;
  END IF;

  -- Calculate ELO changes
  v_expected_white := 1.0 / (1.0 + power(10, (v_black_stats.elo_rating - v_white_stats.elo_rating)::numeric / 400));
  v_expected_black := 1.0 - v_expected_white;

  IF p_winner_id = v_match.white_player_id THEN
    v_white_result := 1; v_black_result := 0;
  ELSIF p_winner_id = v_match.black_player_id THEN
    v_white_result := 0; v_black_result := 1;
  ELSE
    v_white_result := 0.5; v_black_result := 0.5;
  END IF;

  v_white_elo_change := ROUND(v_k_factor * (v_white_result - v_expected_white));
  v_black_elo_change := ROUND(v_k_factor * (v_black_result - v_expected_black));

  -- Update match status
  UPDATE chess_matches SET
    status = 'completed',
    winner_id = p_winner_id,
    result = p_result,
    result_reason = p_result_reason,
    ended_at = now(),
    updated_at = now()
  WHERE id = p_match_id;

  -- Save game history for WHITE player
  INSERT INTO chess_games (
    user_id, opponent_type, opponent_id, match_id, is_multiplayer,
    difficulty, time_control, result, elo_change, moves_count,
    final_fen, move_history, started_at, ended_at
  ) VALUES (
    v_match.white_player_id, 'human', v_match.black_player_id, p_match_id, true,
    v_match.difficulty, v_match.time_control,
    CASE WHEN p_winner_id = v_match.white_player_id THEN 'win'
         WHEN p_winner_id IS NULL THEN 'draw' ELSE 'loss' END,
    v_white_elo_change, v_moves_count,
    v_match.current_fen, v_match.move_history, v_match.started_at, now()
  );

  -- Save game history for BLACK player
  INSERT INTO chess_games (
    user_id, opponent_type, opponent_id, match_id, is_multiplayer,
    difficulty, time_control, result, elo_change, moves_count,
    final_fen, move_history, started_at, ended_at
  ) VALUES (
    v_match.black_player_id, 'human', v_match.white_player_id, p_match_id, true,
    v_match.difficulty, v_match.time_control,
    CASE WHEN p_winner_id = v_match.black_player_id THEN 'win'
         WHEN p_winner_id IS NULL THEN 'draw' ELSE 'loss' END,
    v_black_elo_change, v_moves_count,
    v_match.current_fen, v_match.move_history, v_match.started_at, now()
  );

  -- Update WHITE player stats
  UPDATE chess_player_stats SET
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN p_winner_id = v_match.white_player_id THEN 1 ELSE 0 END,
    games_lost = games_lost + CASE WHEN p_winner_id = v_match.black_player_id THEN 1 ELSE 0 END,
    games_drawn = games_drawn + CASE WHEN p_winner_id IS NULL THEN 1 ELSE 0 END,
    elo_rating = GREATEST(100, elo_rating + v_white_elo_change),
    current_winning_streak = CASE
      WHEN p_winner_id = v_match.white_player_id THEN current_winning_streak + 1
      ELSE 0 END,
    longest_winning_streak = GREATEST(longest_winning_streak,
      CASE WHEN p_winner_id = v_match.white_player_id THEN current_winning_streak + 1 ELSE longest_winning_streak END),
    total_moves = total_moves + CEIL(v_moves_count::numeric / 2),
    updated_at = now()
  WHERE user_id = v_match.white_player_id;

  -- Update BLACK player stats
  UPDATE chess_player_stats SET
    games_played = games_played + 1,
    games_won = games_won + CASE WHEN p_winner_id = v_match.black_player_id THEN 1 ELSE 0 END,
    games_lost = games_lost + CASE WHEN p_winner_id = v_match.white_player_id THEN 1 ELSE 0 END,
    games_drawn = games_drawn + CASE WHEN p_winner_id IS NULL THEN 1 ELSE 0 END,
    elo_rating = GREATEST(100, elo_rating + v_black_elo_change),
    current_winning_streak = CASE
      WHEN p_winner_id = v_match.black_player_id THEN current_winning_streak + 1
      ELSE 0 END,
    longest_winning_streak = GREATEST(longest_winning_streak,
      CASE WHEN p_winner_id = v_match.black_player_id THEN current_winning_streak + 1 ELSE longest_winning_streak END),
    total_moves = total_moves + CEIL(v_moves_count::numeric / 2),
    updated_at = now()
  WHERE user_id = v_match.black_player_id;

  RETURN jsonb_build_object(
    'status', 'success',
    'white_elo_change', v_white_elo_change,
    'black_elo_change', v_black_elo_change
  );
END;
$$;
