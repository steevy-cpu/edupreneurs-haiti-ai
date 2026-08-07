-- Widen notifications.type to include every type the app actually inserts.
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type = ANY (ARRAY[
  'like','comment','share','follow','follow_request','follow_accepted','mention','new_post',
  'group_deleted','lesson_comment','group_invitation','announcement','quiz_invite',
  -- newly allowed: previously rejected at insert time
  'word_of_day','system','subscription_renewed','gift_payment'
]::text[]));

-- Widen notification_preferences.category to match NOTIFICATION_GROUPS in the Settings UI
-- and getCategoryFromType() in send-push-notification.
ALTER TABLE public.notification_preferences DROP CONSTRAINT IF EXISTS notification_preferences_category_check;
ALTER TABLE public.notification_preferences ADD CONSTRAINT notification_preferences_category_check CHECK (category = ANY (ARRAY[
  'message','comment','like','post','mention','follow','group',
  -- newly allowed: these four Settings toggles previously failed at the DB
  'share','lesson','word_of_day','system'
]::text[]));