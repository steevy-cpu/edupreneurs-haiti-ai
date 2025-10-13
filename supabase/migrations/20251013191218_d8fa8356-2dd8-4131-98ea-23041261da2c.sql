-- Add 'group_invitation' to the notifications type check constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('like', 'comment', 'share', 'follow_request', 'new_post', 'group_invitation'));