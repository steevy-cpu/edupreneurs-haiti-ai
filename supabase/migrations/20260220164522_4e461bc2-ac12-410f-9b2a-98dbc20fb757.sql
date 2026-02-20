
-- Fix cleanup_stale_games to handle NULL last_move_at (matches that started but never had a move)
CREATE OR REPLACE FUNCTION public.cleanup_stale_games()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE quiz_battles
  SET status = 'cancelled'
  WHERE status = 'in_progress'
    AND updated_at < NOW() - INTERVAL '2 hours';

  UPDATE quiz_battles
  SET status = 'cancelled'
  WHERE status = 'waiting'
    AND updated_at < NOW() - INTERVAL '30 minutes';

  -- Handle both NULL last_move_at (never moved) and stale last_move_at
  UPDATE chess_matches
  SET status = 'abandoned'
  WHERE status = 'playing'
    AND (last_move_at < NOW() - INTERVAL '4 hours'
         OR (last_move_at IS NULL AND created_at < NOW() - INTERVAL '4 hours'));

  UPDATE chess_matches
  SET status = 'cancelled'
  WHERE status = 'waiting'
    AND updated_at < NOW() - INTERVAL '1 hour';

  DELETE FROM quiz_battle_matchmaking
  WHERE expires_at < NOW();
END;
$$;
