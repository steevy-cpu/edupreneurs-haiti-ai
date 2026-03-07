
-- Promo partners table: links organizations to promo codes
CREATE TABLE public.promo_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  organization_type TEXT NOT NULL DEFAULT 'school',
  promo_code_id UUID REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Founder-only RLS (reuses existing is_founder() DB function)
ALTER TABLE public.promo_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders full access" ON public.promo_partners
  FOR ALL USING (public.is_founder()) WITH CHECK (public.is_founder());

-- Index for FK joins
CREATE INDEX idx_promo_partners_promo_code_id ON public.promo_partners(promo_code_id);

-- Auto-update updated_at via existing trigger function
CREATE TRIGGER update_promo_partners_updated_at
  BEFORE UPDATE ON public.promo_partners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
