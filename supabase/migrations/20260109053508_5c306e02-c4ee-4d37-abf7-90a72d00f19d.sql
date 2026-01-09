-- Add indexes for better query performance at scale (200+ users)

-- Optimize message queries (conversation lookups, sender filtering)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender 
ON public.messages(conversation_id, sender_id, created_at DESC);

-- Optimize notification queries (user notification inbox)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON public.notifications(user_id, read, created_at DESC);

-- Optimize follows queries (status filtering)
CREATE INDEX IF NOT EXISTS idx_follows_status 
ON public.follows(following_id, status);

-- Optimize conversation participants lookups
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user 
ON public.conversation_participants(user_id, conversation_id);

-- Optimize lesson completions for dashboard
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_subject 
ON public.lesson_completions(user_id, subject, completed_at DESC);