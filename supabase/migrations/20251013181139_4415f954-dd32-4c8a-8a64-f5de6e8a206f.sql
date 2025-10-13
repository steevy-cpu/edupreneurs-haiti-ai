-- Drop ALL existing policies on group_chats to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'group_chats' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_chats', pol.policyname);
    END LOOP;
END $$;

-- Create a simple, permissive INSERT policy that explicitly checks authentication
CREATE POLICY "allow_authenticated_users_to_create_groups"
ON public.group_chats
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Keep the existing SELECT policy
CREATE POLICY "Users can view groups they're members of" 
ON public.group_chats
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM group_members
  WHERE group_members.group_id = group_chats.id 
    AND group_members.user_id = auth.uid()
));

-- Keep the existing UPDATE policy
CREATE POLICY "Group admins can update groups" 
ON public.group_chats
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1
  FROM group_members
  WHERE group_members.group_id = group_chats.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role = 'admin'
));

-- Keep the existing DELETE policy
CREATE POLICY "Group admins can delete groups" 
ON public.group_chats
FOR DELETE
TO authenticated
USING (created_by = auth.uid());