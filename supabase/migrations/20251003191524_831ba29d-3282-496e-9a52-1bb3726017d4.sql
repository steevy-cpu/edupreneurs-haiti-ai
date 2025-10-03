-- Fix the conversations INSERT policy to be PERMISSIVE instead of RESTRICTIVE
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (true);