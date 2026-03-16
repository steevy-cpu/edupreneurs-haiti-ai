-- Update is_founder() (no-arg version) to include Rose
CREATE OR REPLACE FUNCTION public.is_founder()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT auth.uid() IN (
    '0de08330-4183-48f9-b169-19b92f4d114f'::uuid,
    '7580cd10-e18c-4b2f-ac50-def28d046c9d'::uuid,
    'a72154dd-97ae-4dfe-a939-b48ecc7764fb'::uuid
  )
$function$;

-- Update is_founder(uuid) to include Rose
CREATE OR REPLACE FUNCTION public.is_founder(check_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT check_user_id IN (
    '0de08330-4183-48f9-b169-19b92f4d114f',
    '7580cd10-e18c-4b2f-ac50-def28d046c9d',
    'a72154dd-97ae-4dfe-a939-b48ecc7764fb'
  )
$function$;

-- Also update expire_subscriptions to exclude Rose from free-access expiry
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
  UPDATE profiles
  SET subscription_status = 'expired'
  WHERE subscription_status = 'active'
    AND subscription_end_date < now()
    AND has_free_access = false;
  GET DIAGNOSTICS expired_count = ROW_COUNT;

  UPDATE profiles
  SET has_free_access = false,
      subscription_status = 'expired'
  WHERE has_free_access = true
    AND subscription_end_date IS NOT NULL
    AND subscription_end_date < now()
    AND user_id NOT IN (
      '0de08330-4183-48f9-b169-19b92f4d114f',
      '7580cd10-e18c-4b2f-ac50-def28d046c9d',
      'a72154dd-97ae-4dfe-a939-b48ecc7764fb'
    );
  GET DIAGNOSTICS free_expired = ROW_COUNT;

  RETURN expired_count + free_expired;
END;
$function$;