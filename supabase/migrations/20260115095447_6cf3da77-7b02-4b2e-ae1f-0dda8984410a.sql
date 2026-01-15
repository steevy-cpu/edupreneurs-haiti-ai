-- Drop existing constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add updated constraint with 'announcement' type
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
  'like', 'comment', 'share', 'follow_request', 
  'follow_accepted', 'new_post', 'group_invitation', 
  'group_deleted', 'lesson_comment', 'mention', 
  'post', 'announcement'
));