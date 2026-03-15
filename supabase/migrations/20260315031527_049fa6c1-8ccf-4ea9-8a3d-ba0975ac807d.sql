
CREATE OR REPLACE FUNCTION public.add_group_conversation_participants(
  p_conversation_id UUID,
  p_participant_ids UUID[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify that the calling user is a member of the group linked to this conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.group_members gm ON gm.group_id = c.group_id
    WHERE c.id = p_conversation_id
    AND gm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized to add participants to this conversation';
  END IF;

  -- Insert all participants, ignore duplicates
  INSERT INTO public.conversation_participants (conversation_id, user_id, visible_from_message_id)
  SELECT p_conversation_id, unnest(p_participant_ids), NULL
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
END;
$$;
