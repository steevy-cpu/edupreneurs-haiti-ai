-- Add recurring payment support to gift_subscriptions
ALTER TABLE public.gift_subscriptions
ADD COLUMN IF NOT EXISTS payment_mode text NOT NULL DEFAULT 'one_time',
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

-- Add index for webhook lookups by subscription ID
CREATE INDEX IF NOT EXISTS idx_gift_subscriptions_stripe_sub_id 
ON public.gift_subscriptions (stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;