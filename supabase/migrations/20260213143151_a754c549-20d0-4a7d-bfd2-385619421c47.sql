
-- A. Rename amount_usd to amount_cents
ALTER TABLE public.gift_subscriptions RENAME COLUMN amount_usd TO amount_cents;

-- B. Drop overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view gift by token" ON public.gift_subscriptions;

-- C. Drop dead INSERT policy
DROP POLICY IF EXISTS "Users can create their own gift links" ON public.gift_subscriptions;

-- D. Create security definer function for safe token lookup
CREATE OR REPLACE FUNCTION public.get_gift_info_by_token(p_token text)
RETURNS TABLE(student_name text, status text, expires_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT student_name, status, expires_at
  FROM public.gift_subscriptions
  WHERE token = p_token
  LIMIT 1;
$$;
