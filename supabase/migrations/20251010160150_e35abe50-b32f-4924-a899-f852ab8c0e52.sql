-- Update the messages UPDATE policy to only allow users to update their own messages
DROP POLICY IF EXISTS "Users can update messages" ON public.messages;

CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- Add DELETE policy for messages
CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid() = sender_id);