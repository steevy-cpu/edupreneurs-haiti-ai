
-- Fix 1a: Create get_conversation_previews function for efficient last-message + unread lookups
CREATE OR REPLACE FUNCTION public.get_conversation_previews(p_user_id uuid)
RETURNS TABLE (
  conversation_id uuid,
  last_message_content text,
  last_message_at timestamptz,
  last_message_sender_id uuid,
  last_message_id uuid,
  unread_count bigint,
  visible_from_message_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    c.id AS conversation_id,
    last_msg.content AS last_message_content,
    last_msg.created_at AS last_message_at,
    last_msg.sender_id AS last_message_sender_id,
    last_msg.id AS last_message_id,
    (
      SELECT COUNT(*)
      FROM messages m2
      WHERE m2.conversation_id = c.id
        AND m2.read = false
        AND m2.sender_id != p_user_id
        AND (cp.visible_from_message_id IS NULL
             OR m2.created_at >= (
               SELECT m3.created_at FROM messages m3
               WHERE m3.id = cp.visible_from_message_id
             ))
    ) AS unread_count,
    cp.visible_from_message_id
  FROM conversations c
  JOIN conversation_participants cp
    ON cp.conversation_id = c.id AND cp.user_id = p_user_id
  LEFT JOIN LATERAL (
    SELECT content, created_at, sender_id, id
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) last_msg ON true
  ORDER BY COALESCE(last_msg.created_at, c.created_at) DESC;
$$;

-- Fix 4: Performance indexes for messaging queries
-- Partial index on unread messages — small and fast for unread count queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_unread
ON messages(conversation_id, read) WHERE read = false;

-- Covers sender_id filters used in message queries and RLS policies
CREATE INDEX IF NOT EXISTS idx_messages_sender_id
ON messages(sender_id);

-- Covers the LATERAL join in get_conversation_previews (last message lookup)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON messages(conversation_id, created_at DESC);
