-- Drop the existing check constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated check constraint with 'mention' included
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('like', 'comment', 'share', 'follow_request', 'follow_accepted', 'new_post', 'group_invitation', 'group_deleted', 'lesson_comment', 'mention', 'post'));