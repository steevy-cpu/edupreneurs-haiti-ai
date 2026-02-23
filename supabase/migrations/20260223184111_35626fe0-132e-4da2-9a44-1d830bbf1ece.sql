
CREATE OR REPLACE FUNCTION public.expire_subscriptions()
  RETURNS integer
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  expired_count INTEGER;
  free_expired INTEGER;
BEGIN
  -- 1. Expire normal paid subscriptions (existing logic unchanged)
  UPDATE profiles
  SET subscription_status = 'expired'
  WHERE subscription_status = 'active'
    AND subscription_end_date < now()
    AND has_free_access = false;
  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- 2. Expire timed free access (promo-granted, founders excluded)
  UPDATE profiles
  SET has_free_access = false,
      subscription_status = 'expired'
  WHERE has_free_access = true
    AND subscription_end_date IS NOT NULL
    AND subscription_end_date < now()
    AND user_id NOT IN (
      '0de08330-4183-48f9-b169-19b92f4d114f',
      '7580cd10-e18c-4b2f-ac50-def28d046c9d'
    );
  GET DIAGNOSTICS free_expired = ROW_COUNT;

  RETURN expired_count + free_expired;
END;
$function$;
