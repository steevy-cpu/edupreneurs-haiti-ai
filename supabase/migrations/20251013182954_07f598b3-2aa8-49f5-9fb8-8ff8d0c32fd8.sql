-- Add INSERT policy for conversations table to allow creating group conversations
CREATE POLICY "Users can create group conversations if they're group admins"
ON public.conversations
FOR INSERT
WITH CHECK (
  is_group AND 
  EXISTS (
    SELECT 1 
    FROM public.group_members 
    WHERE group_members.group_id = conversations.group_id 
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'admin'
  )
);

-- Also allow creating direct conversations
CREATE POLICY "Users can create direct conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  NOT is_group AND 
  auth.uid() IS NOT NULL
);