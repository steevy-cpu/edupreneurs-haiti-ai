-- Fix quiz_battle_players SELECT policy (infinite recursion)
DROP POLICY IF EXISTS "Users can view players in their battles" ON public.quiz_battle_players;

CREATE POLICY "Users can view players in their battles" 
ON public.quiz_battle_players
FOR SELECT
USING (
  user_id = auth.uid()
  OR 
  battle_id IN (
    SELECT battle_id FROM quiz_battle_players WHERE user_id = auth.uid()
  )
);

-- Fix quiz_battles UPDATE policy (potential recursion)
DROP POLICY IF EXISTS "Battle creators can update their battles" ON public.quiz_battles;

CREATE POLICY "Battle creators can update their battles" 
ON public.quiz_battles
FOR UPDATE
USING (
  created_by = auth.uid()
  OR 
  id IN (SELECT battle_id FROM quiz_battle_players WHERE user_id = auth.uid())
);