-- Founders can view ALL payment transactions (fixes empty Paiements tab)
CREATE POLICY "Founders can view all payment transactions"
  ON payment_transactions FOR SELECT
  USING (public.is_founder());

-- Founders can update ALL payment transactions (verify/approve/reject)
CREATE POLICY "Founders can update all payment transactions"
  ON payment_transactions FOR UPDATE
  USING (public.is_founder())
  WITH CHECK (public.is_founder());