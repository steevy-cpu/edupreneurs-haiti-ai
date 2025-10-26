
-- Ajouter 'lesson_comment' aux types de notifications autorisés
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type = ANY (ARRAY[
  'like'::text, 
  'comment'::text, 
  'share'::text, 
  'follow_request'::text, 
  'new_post'::text, 
  'group_invitation'::text, 
  'group_deleted'::text,
  'lesson_comment'::text
]));
