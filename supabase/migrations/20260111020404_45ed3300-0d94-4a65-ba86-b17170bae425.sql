-- Create RPC function to start direct conversations safely
-- This bypasses RLS issues by using SECURITY DEFINER

CREATE OR REPLACE FUNCTION public.start_direct_conversation(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  existing_conversation_id uuid;
  new_conversation_id uuid;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  IF current_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot start conversation with yourself';
  END IF;

  -- Check for existing direct conversation between these users
  SELECT cp1.conversation_id INTO existing_conversation_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  JOIN conversations c ON c.id = cp1.conversation_id
  WHERE cp1.user_id = current_user_id
    AND cp2.user_id = other_user_id
    AND c.is_group = false
  LIMIT 1;

  -- If conversation exists, ensure current user is a participant (may have left)
  IF existing_conversation_id IS NOT NULL THEN
    -- Check if current user is still a participant
    IF NOT EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_id = existing_conversation_id 
      AND user_id = current_user_id
    ) THEN
      -- Re-add the user
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES (existing_conversation_id, current_user_id);
    ELSE
      -- Reset visibility if user deleted the conversation
      UPDATE conversation_participants 
      SET visible_from_message_id = NULL
      WHERE conversation_id = existing_conversation_id 
      AND user_id = current_user_id;
    END IF;
    
    RETURN existing_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (id, created_at, updated_at, is_group)
  VALUES (gen_random_uuid(), now(), now(), false)
  RETURNING id INTO new_conversation_id;

  -- Add both participants atomically
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES 
    (new_conversation_id, current_user_id),
    (new_conversation_id, other_user_id);

  RETURN new_conversation_id;
END;
$$;