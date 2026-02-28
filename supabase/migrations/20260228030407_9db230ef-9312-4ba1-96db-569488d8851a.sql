-- Index for expire_subscriptions() cron which scans all profiles by subscription_status
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
  ON public.profiles(subscription_status);

-- Index for paginated notification history queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON public.notifications(user_id, created_at DESC);

-- Index for profile page post listings
CREATE INDEX IF NOT EXISTS idx_posts_user_created 
  ON public.posts(user_id, created_at DESC);