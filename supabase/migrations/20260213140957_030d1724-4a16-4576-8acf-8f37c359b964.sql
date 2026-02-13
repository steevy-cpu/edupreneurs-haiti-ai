
-- A. Add RLS UPDATE policy for gift_subscriptions
CREATE POLICY "Allow update gift subscriptions by email match"
ON public.gift_subscriptions
FOR UPDATE
USING (student_user_id IS NULL)
WITH CHECK (true);

-- D. Rate limit function
CREATE OR REPLACE FUNCTION public.check_gift_rate_limit(p_email text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*) < 3
  FROM public.gift_subscriptions
  WHERE student_email = p_email
    AND created_at > NOW() - INTERVAL '1 hour';
$$;

-- D. Update anon insert policy with rate limiting
DROP POLICY IF EXISTS "Allow anon insert gift subscriptions" ON public.gift_subscriptions;
CREATE POLICY "Allow anon insert gift subscriptions"
ON public.gift_subscriptions
FOR INSERT
WITH CHECK (
  student_user_id IS NULL
  AND student_email IS NOT NULL
  AND public.check_gift_rate_limit(student_email)
);
