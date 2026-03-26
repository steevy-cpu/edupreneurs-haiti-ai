CREATE TABLE IF NOT EXISTS public.app_internal_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_internal_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_internal_config (key, value)
VALUES ('internal_call_secret', 'REDACTED_SECRET')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

CREATE OR REPLACE FUNCTION public.get_internal_secret()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT value FROM public.app_internal_config WHERE key = 'internal_call_secret'
$$;

DROP FUNCTION IF EXISTS public.set_internal_call_secret(text);