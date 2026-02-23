
-- 1. Create expire_subscriptions() function — runs hourly via pg_cron
-- Marks active subscriptions as expired when end_date has passed
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE profiles
  SET subscription_status = 'expired'
  WHERE subscription_status = 'active'
    AND subscription_end_date < now()
    AND has_free_access = false;
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;

-- 2. Set has_free_access for both founders (idempotent)
-- Belt-and-suspenders: founders also get client-side bypass via isFounder()
UPDATE profiles SET has_free_access = true
WHERE user_id IN (
  '0de08330-4183-48f9-b169-19b92f4d114f',
  '7580cd10-e18c-4b2f-ac50-def28d046c9d'
);
