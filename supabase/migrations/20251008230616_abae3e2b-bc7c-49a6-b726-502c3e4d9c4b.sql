-- Drop the old check constraint on notifications type
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new check constraint that includes 'new_post' type
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('like', 'comment', 'share', 'follow_request', 'new_post'));