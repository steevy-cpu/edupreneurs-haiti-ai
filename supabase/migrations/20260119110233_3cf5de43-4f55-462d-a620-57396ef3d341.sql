-- Break RLS infinite recursion between quiz_battles <-> quiz_battle_players
-- by using a SECURITY DEFINER helper (bypasses RLS during membership checks).

CREATE OR REPLACE FUNCTION public.is_battle_participant(battle_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.quiz_battle_players qbp
    WHERE qbp.battle_id = battle_uuid
      AND qbp.user_id = user_uuid
  )
$$;

-- quiz_battles: SELECT
DROP POLICY IF EXISTS "Users can view battles they're part of" ON public.quiz_battles;
CREATE POLICY "Users can view battles they're part of"
ON public.quiz_battles
FOR SELECT
USING (
  created_by = auth.uid()
  OR public.is_battle_participant(id, auth.uid())
);

-- quiz_battles: UPDATE
DROP POLICY IF EXISTS "Battle creators can update their battles" ON public.quiz_battles;
CREATE POLICY "Battle creators can update their battles"
ON public.quiz_battles
FOR UPDATE
USING (
  created_by = auth.uid()
  OR public.is_battle_participant(id, auth.uid())
);

-- quiz_battle_players: SELECT
DROP POLICY IF EXISTS "Users can view players in their battles" ON public.quiz_battle_players;
CREATE POLICY "Users can view players in their battles"
ON public.quiz_battle_players
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_battle_participant(battle_id, auth.uid())
);