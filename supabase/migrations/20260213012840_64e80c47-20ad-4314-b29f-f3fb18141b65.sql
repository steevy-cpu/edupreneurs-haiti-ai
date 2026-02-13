
-- Create donations table for tracking donation payments
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'HTG',
  provider TEXT NOT NULL DEFAULT 'moncash',
  donor_name TEXT,
  donor_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Anon users can insert donations (public donation page)
CREATE POLICY "Anyone can create donations"
  ON public.donations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only founders can view donations
CREATE POLICY "Founders can view all donations"
  ON public.donations
  FOR SELECT
  TO authenticated
  USING (public.is_founder());

-- Only founders can update donations
CREATE POLICY "Founders can update donations"
  ON public.donations
  FOR UPDATE
  TO authenticated
  USING (public.is_founder());
