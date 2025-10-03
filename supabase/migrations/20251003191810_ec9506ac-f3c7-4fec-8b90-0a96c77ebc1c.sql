-- Drop and recreate the policy explicitly as PERMISSIVE
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "Users can create conversations"
ON public.conversations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);