-- Fix 1: Clean up duplicate conversation_participants
-- Keep only the most recent entry for each user-conversation pair
WITH ranked_participants AS (
  SELECT 
    id,
    conversation_id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY conversation_id, user_id 
      ORDER BY joined_at DESC
    ) as rn
  FROM conversation_participants
)
DELETE FROM conversation_participants
WHERE id IN (
  SELECT id FROM ranked_participants WHERE rn > 1
);

-- Fix 2: Add unique constraint to prevent future duplicates in conversation_participants
ALTER TABLE conversation_participants
ADD CONSTRAINT conversation_participants_conversation_user_unique 
UNIQUE (conversation_id, user_id);

-- Fix 3: Add unique constraint to prevent duplicates in group_members
ALTER TABLE group_members
ADD CONSTRAINT group_members_group_user_unique 
UNIQUE (group_id, user_id);

-- Fix 4: Create a helper function to safely add a user to a group
-- This handles both group_members and conversation_participants in one transaction
CREATE OR REPLACE FUNCTION add_user_to_group(
  p_group_id uuid,
  p_user_id uuid,
  p_conversation_id uuid,
  p_role text DEFAULT 'member',
  p_visible_from_message_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into group_members if not exists
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (p_group_id, p_user_id, p_role)
  ON CONFLICT (group_id, user_id) DO NOTHING;
  
  -- Insert into conversation_participants if not exists
  INSERT INTO conversation_participants (
    conversation_id, 
    user_id, 
    visible_from_message_id
  )
  VALUES (p_conversation_id, p_user_id, p_visible_from_message_id)
  ON CONFLICT (conversation_id, user_id) 
  DO UPDATE SET visible_from_message_id = EXCLUDED.visible_from_message_id;
END;
$$;

-- Fix 5: Create a helper function to safely remove a user from a group
-- This handles both group_members and conversation_participants
CREATE OR REPLACE FUNCTION remove_user_from_group(
  p_group_id uuid,
  p_user_id uuid,
  p_conversation_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove from group_members
  DELETE FROM group_members
  WHERE group_id = p_group_id AND user_id = p_user_id;
  
  -- Remove from conversation_participants
  DELETE FROM conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
END;
$$;