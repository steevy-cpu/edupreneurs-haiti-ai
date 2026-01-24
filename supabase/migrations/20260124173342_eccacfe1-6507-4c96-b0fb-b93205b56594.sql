-- Fix RLS recursion on chess_matches by removing self-referential policy helper

-- SELECT: participants can view their matches (no recursive function call)
DROP POLICY IF EXISTS "Participants can view their matches" ON public.chess_matches;
CREATE POLICY "Participants can view their matches"
ON public.chess_matches
FOR SELECT
TO authenticated
USING (
  white_player_id = auth.uid() OR black_player_id = auth.uid()
);

-- UPDATE: participants can update their matches (no recursive function call)
DROP POLICY IF EXISTS "Participants can update matches" ON public.chess_matches;
CREATE POLICY "Participants can update matches"
ON public.chess_matches
FOR UPDATE
TO authenticated
USING (
  white_player_id = auth.uid() OR black_player_id = auth.uid()
);
