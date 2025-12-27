-- Add domain field to push_subscriptions for tracking subscription origin
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT NULL;

-- Add created_at index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_used 
ON public.push_subscriptions (last_used_at);

-- Add index on domain for filtering
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_domain 
ON public.push_subscriptions (domain);

-- Update existing subscriptions with a placeholder domain (will be updated on re-subscribe)
UPDATE public.push_subscriptions 
SET domain = 'legacy' 
WHERE domain IS NULL;