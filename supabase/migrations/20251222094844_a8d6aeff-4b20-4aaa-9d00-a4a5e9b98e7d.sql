-- Add policy to allow authenticated users to read anyone's lesson completions
-- This enables badges/achievements to be visible on other users' profiles
-- The streak section remains private through UI-level control

CREATE POLICY "Authenticated users can view all lesson completions for badges"
ON public.lesson_completions
FOR SELECT
USING (auth.uid() IS NOT NULL);