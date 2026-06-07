
-- 1. achievements: drop permissive INSERT; service_role bypasses RLS so no replacement needed
DROP POLICY IF EXISTS "System can insert achievements" ON public.achievements;

-- 2. donations: drop broad anon SELECT and anon UPDATE (webhook handles completion)
DROP POLICY IF EXISTS "Anon can read donation by order_id" ON public.donations;
DROP POLICY IF EXISTS "Anon can update pending donation status" ON public.donations;

-- 3. gift_subscriptions: replace open UPDATE with email-scoped claim policy
DROP POLICY IF EXISTS "Allow update gift subscriptions by email match" ON public.gift_subscriptions;
CREATE POLICY "Students can claim their gift"
ON public.gift_subscriptions FOR UPDATE
TO authenticated
USING (
  student_user_id IS NULL
  AND student_email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (student_user_id = auth.uid());

-- 4. password_reset_tokens: drop public INSERT/UPDATE (SECURITY DEFINER funcs handle lifecycle)
DROP POLICY IF EXISTS "Service role can insert reset tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Service role can update reset tokens" ON public.password_reset_tokens;

-- 5. payment_transactions: drop redundant + dangerous open UPDATE
DROP POLICY IF EXISTS "Service role can update transactions" ON public.payment_transactions;

-- 6. referrals: drop open INSERT/UPDATE; award_referral_points() RPC handles writes
DROP POLICY IF EXISTS "System can insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "System can update referrals" ON public.referrals;
