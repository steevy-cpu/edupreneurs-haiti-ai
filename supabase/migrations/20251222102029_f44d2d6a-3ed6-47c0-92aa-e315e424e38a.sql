-- Create payment_transactions table for tracking all payment activities
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'HTG',
  provider TEXT NOT NULL CHECK (provider IN ('moncash', 'natcash')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  payer_phone TEXT,
  payment_token TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for fast lookups
CREATE INDEX idx_payment_transactions_user_id ON public.payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_provider ON public.payment_transactions(provider);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.payment_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create their own transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- System can update transactions (for webhook/verification)
CREATE POLICY "Service role can update transactions"
ON public.payment_transactions
FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON public.payment_transactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();