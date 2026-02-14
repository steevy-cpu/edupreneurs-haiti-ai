
-- Add payment gateway discriminator
ALTER TABLE public.gift_subscriptions
ADD COLUMN IF NOT EXISTS payment_gateway text NOT NULL DEFAULT 'stripe';

-- Add MonCash-specific fields
ALTER TABLE public.gift_subscriptions
ADD COLUMN IF NOT EXISTS moncash_order_id text,
ADD COLUMN IF NOT EXISTS amount_htg integer;

-- Index for MonCash order lookups
CREATE INDEX IF NOT EXISTS idx_gift_subs_moncash_order
ON public.gift_subscriptions (moncash_order_id)
WHERE moncash_order_id IS NOT NULL;
