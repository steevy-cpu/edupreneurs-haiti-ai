-- Fix the group_chats INSERT policy
DROP POLICY IF EXISTS "Users can create groups" ON public.group_chats;

CREATE POLICY "Users can create groups"
ON public.group_chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);