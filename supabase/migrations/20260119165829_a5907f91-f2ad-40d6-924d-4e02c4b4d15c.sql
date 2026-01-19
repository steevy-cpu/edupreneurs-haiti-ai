-- Update user_has_active_battle to ignore stale in_progress battles
CREATE OR REPLACE FUNCTION public.user_has_active_battle(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM quiz_battle_players qbp
    JOIN quiz_battles qb ON qb.id = qbp.battle_id
    WHERE qbp.user_id = p_user_id
    AND (
      -- In progress battles: must be recent OR have recent activity
      (
        qb.status = 'in_progress'::quiz_battle_status 
        AND (
          qb.created_at > NOW() - INTERVAL '10 minutes'
          OR qb.round_started_at > NOW() - INTERVAL '5 minutes'
        )
      )
      -- OR waiting battles less than 5 minutes old
      OR (
        qb.status = 'waiting'::quiz_battle_status 
        AND qb.created_at > NOW() - INTERVAL '5 minutes'
      )
    )
  )
$function$;