-- Drop and recreate the group_chats INSERT policy with simpler logic
DROP POLICY IF EXISTS "Users can create groups" ON public.group_chats;

-- Create a simpler, more permissive INSERT policy
CREATE POLICY "Users can create groups"
ON public.group_chats
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());