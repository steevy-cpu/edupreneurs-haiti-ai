-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Users can add participants to conversations" ON public.conversation_participants;

-- Create a more secure INSERT policy
-- Users can only add participants if they are already a participant in the conversation
CREATE POLICY "Users can add participants to conversations they belong to" 
ON public.conversation_participants 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- User must be a participant in the conversation they're adding someone to
  public.is_conversation_participant(conversation_id, auth.uid())
);