-- Allow unauthenticated users to insert gift subscriptions (for signup flow)
CREATE POLICY "Allow anon insert gift subscriptions"
ON public.gift_subscriptions
FOR INSERT
WITH CHECK (student_user_id IS NULL);