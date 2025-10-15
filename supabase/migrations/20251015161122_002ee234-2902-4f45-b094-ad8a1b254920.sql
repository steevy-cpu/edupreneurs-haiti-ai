-- Drop the old check constraint
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the updated check constraint that includes group_deleted
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('like', 'comment', 'share', 'follow_request', 'new_post', 'group_invitation', 'group_deleted'));