CREATE OR REPLACE FUNCTION public.set_internal_call_secret(p_secret text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  EXECUTE format('ALTER ROLE authenticator SET "app.settings.internal_call_secret" = %L', p_secret);
END;
$$;

REVOKE ALL ON FUNCTION public.set_internal_call_secret(text) FROM public;
REVOKE ALL ON FUNCTION public.set_internal_call_secret(text) FROM anon;
REVOKE ALL ON FUNCTION public.set_internal_call_secret(text) FROM authenticated;