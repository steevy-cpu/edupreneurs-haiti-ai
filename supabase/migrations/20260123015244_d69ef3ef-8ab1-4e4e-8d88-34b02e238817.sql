-- Allow users to see players in battles they can join (battles with invite code in waiting status)
CREATE POLICY "Users can view players in joinable battles"
ON public.quiz_battle_players
FOR SELECT
USING (
  battle_id IN (
    SELECT id FROM public.quiz_battles 
    WHERE invite_code IS NOT NULL 
    AND status = 'waiting'
  )
);