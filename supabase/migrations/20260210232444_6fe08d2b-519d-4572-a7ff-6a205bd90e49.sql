
-- Add subscription columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none',
ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz,
ADD COLUMN IF NOT EXISTS payment_order_id text;

-- Add index for subscription checks
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles (subscription_status) WHERE subscription_status != 'none';
