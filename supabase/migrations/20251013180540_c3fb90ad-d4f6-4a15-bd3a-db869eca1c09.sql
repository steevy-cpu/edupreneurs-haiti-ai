-- First, let's check and fix the group_chats policies completely
DROP POLICY IF EXISTS "Users can create groups" ON public.group_chats;

-- Recreate the insert policy with proper authentication check
CREATE POLICY "Users can create groups"
ON public.group_chats
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  auth.uid() = created_by
);