
-- ============================================================
-- Games Plan A: Fix 2 (cleanup_stale_games) + Fix 3 (tighter RLS)
-- ============================================================

-- FIX 2: Server-side cleanup function for stale/orphaned games
CREATE OR REPLACE FUNCTION public.cleanup_stale_games()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Cancel quiz battles stuck in_progress for > 2 hours
  UPDATE quiz_battles
  SET status = 'cancelled'
  WHERE status = 'in_progress'
    AND updated_at < NOW() - INTERVAL '2 hours';

  -- Cancel quiz battles stuck waiting for > 30 minutes
  UPDATE quiz_battles
  SET status = 'cancelled'
  WHERE status = 'waiting'
    AND updated_at < NOW() - INTERVAL '30 minutes';

  -- Abandon chess matches stuck playing for > 4 hours (no moves)
  UPDATE chess_matches
  SET status = 'abandoned'
  WHERE status = 'playing'
    AND last_move_at < NOW() - INTERVAL '4 hours';

  -- Cancel chess matches stuck waiting for > 1 hour
  UPDATE chess_matches
  SET status = 'cancelled'
  WHERE status = 'waiting'
    AND updated_at < NOW() - INTERVAL '1 hour';

  -- Purge expired matchmaking queue entries
  DELETE FROM quiz_battle_matchmaking
  WHERE expires_at < NOW();
END;
$$;

-- FIX 3: Tighter UPDATE RLS on chess_matches
-- Drop overly-permissive existing policies (try both known names)
DROP POLICY IF EXISTS "Players can update chess matches" ON chess_matches;
DROP POLICY IF EXISTS "Participants can update matches" ON chess_matches;
DROP POLICY IF EXISTS "Participants can update chess matches" ON chess_matches;

-- Host can cancel their own match while it's still waiting
CREATE POLICY "Host can cancel waiting match"
ON chess_matches FOR UPDATE
USING (
  auth.uid() = white_player_id
  AND status = 'waiting'
)
WITH CHECK (
  status = 'cancelled'
);

-- Players can request a rematch on completed matches (belt-and-suspenders for RPCs)
CREATE POLICY "Players can request rematch"
ON chess_matches FOR UPDATE
USING (
  (auth.uid() = white_player_id OR auth.uid() = black_player_id)
  AND status = 'completed'
)
WITH CHECK (
  rematch_requested_by = auth.uid()
  AND status = 'completed'
);
