
-- Create gift_subscriptions table
CREATE TABLE public.gift_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE,
  student_user_id uuid NOT NULL,
  student_name text NOT NULL,
  student_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  amount_usd integer NOT NULL DEFAULT 200,
  stripe_session_id text,
  payer_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE public.gift_subscriptions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can INSERT their own gift requests
CREATE POLICY "Users can create their own gift links"
ON public.gift_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = student_user_id);

-- Authenticated users can SELECT their own records
CREATE POLICY "Users can view their own gift links"
ON public.gift_subscriptions
FOR SELECT
USING (auth.uid() = student_user_id);

-- Anonymous users can SELECT by token (for the public payment page)
CREATE POLICY "Anyone can view gift by token"
ON public.gift_subscriptions
FOR SELECT
USING (true);

-- Index for fast token lookups
CREATE INDEX idx_gift_subscriptions_token ON public.gift_subscriptions (token);
CREATE INDEX idx_gift_subscriptions_student ON public.gift_subscriptions (student_user_id);
