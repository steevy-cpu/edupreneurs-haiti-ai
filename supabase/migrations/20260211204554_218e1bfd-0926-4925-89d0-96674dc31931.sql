
-- New table for outgoing NatCash transfers (payouts)
CREATE TABLE public.natcash_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  initiated_by UUID NOT NULL,
  amount NUMERIC NOT NULL,
  fees NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'HTG',
  wallet TEXT NOT NULL,
  recipient_first_name TEXT NOT NULL,
  recipient_last_name TEXT NOT NULL,
  recipient_email TEXT,
  description TEXT,
  reference_id TEXT NOT NULL UNIQUE,
  bazik_transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  transfer_type TEXT DEFAULT 'payout',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.natcash_transfers ENABLE ROW LEVEL SECURITY;

-- Admins can manage all transfers
CREATE POLICY "Admins can manage transfers"
  ON public.natcash_transfers FOR ALL TO authenticated
  USING (public.is_content_editor(auth.uid(), 'admin'));

-- Users can view their own received transfers
CREATE POLICY "Users can view own transfers"
  ON public.natcash_transfers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Auto-update updated_at
CREATE TRIGGER update_natcash_transfers_updated_at
  BEFORE UPDATE ON public.natcash_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add natcash_phone column to payment_transactions for auto-matching
ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS natcash_phone TEXT;

-- Index for webhook auto-matching by phone + amount + status
CREATE INDEX IF NOT EXISTS idx_payment_transactions_natcash_match
  ON public.payment_transactions (natcash_phone, amount, status)
  WHERE provider = 'natcash' AND status = 'pending';

-- Index for transfer lookups
CREATE INDEX IF NOT EXISTS idx_natcash_transfers_status ON public.natcash_transfers (status);
CREATE INDEX IF NOT EXISTS idx_natcash_transfers_user ON public.natcash_transfers (user_id);
CREATE INDEX IF NOT EXISTS idx_natcash_transfers_reference ON public.natcash_transfers (reference_id);
