-- One row per Stripe invoice that already extended a gift subscription, so a re-delivered
-- invoice.paid event cannot extend the student's access twice.
CREATE TABLE IF NOT EXISTS public.gift_renewal_invoices (
  invoice_id text PRIMARY KEY,
  gift_id uuid REFERENCES public.gift_subscriptions(id) ON DELETE CASCADE,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- Written by the webhook with the service role only.
ALTER TABLE public.gift_renewal_invoices ENABLE ROW LEVEL SECURITY;
