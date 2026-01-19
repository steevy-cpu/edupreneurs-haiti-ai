-- Cancel specific stuck battle
UPDATE quiz_battles 
SET status = 'cancelled', ended_at = NOW() 
WHERE id = '3fbd62de-8d44-41e1-975b-8277c0fb64b7' 
  AND status = 'waiting';

-- Cancel ALL old stuck battles (waiting for more than 10 minutes)
UPDATE quiz_battles 
SET status = 'cancelled', ended_at = NOW() 
WHERE status = 'waiting' 
  AND created_at < NOW() - INTERVAL '10 minutes';

-- Update user_has_active_battle to ignore stale waiting battles (older than 5 minutes)
CREATE OR REPLACE FUNCTION public.user_has_active_battle(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM quiz_battle_players qbp
    JOIN quiz_battles qb ON qb.id = qbp.battle_id
    WHERE qbp.user_id = p_user_id
    AND (
      qb.status = 'in_progress'::quiz_battle_status
      OR (
        qb.status = 'waiting'::quiz_battle_status 
        AND qb.created_at > NOW() - INTERVAL '5 minutes'
      )
    )
  )
$$;