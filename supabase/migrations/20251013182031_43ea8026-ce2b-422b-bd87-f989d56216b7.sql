-- Drop the current INSERT policy
DROP POLICY IF EXISTS "allow_authenticated_users_to_create_groups" ON public.group_chats;

-- Create a new INSERT policy that explicitly checks for valid user authentication
CREATE POLICY "authenticated_users_can_create_groups"
ON public.group_chats
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Verify RLS is enabled
ALTER TABLE public.group_chats ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT INSERT ON public.group_chats TO authenticated;