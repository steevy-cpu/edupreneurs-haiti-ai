
-- Track promo code redemptions per user (prevents double-use)
CREATE TABLE public.user_promo_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  code text NOT NULL,
  gold_awarded integer NOT NULL DEFAULT 0,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, promo_code_id)
);

ALTER TABLE public.user_promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own redemptions
CREATE POLICY "Users can read own redemptions"
  ON public.user_promo_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own redemptions (edge function uses service role, but this allows client fallback)
CREATE POLICY "Users can insert own redemptions"
  ON public.user_promo_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Founders can view all redemptions (for Control Center)
CREATE POLICY "Founders can view all redemptions"
  ON public.user_promo_redemptions FOR SELECT
  USING (public.is_founder());

-- Founder-only full CRUD on promo_codes table
CREATE POLICY "Founders can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (public.is_founder())
  WITH CHECK (public.is_founder());
