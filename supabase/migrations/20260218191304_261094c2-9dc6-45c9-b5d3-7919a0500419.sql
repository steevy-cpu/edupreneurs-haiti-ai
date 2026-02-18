
CREATE OR REPLACE FUNCTION public.increment_gold(
  p_user_id uuid,
  amount integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- CRITICAL: Verify caller is the user themselves
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate gold amount is reasonable (1–100 per action)
  IF amount < 1 OR amount > 100 THEN
    RAISE EXCEPTION 'Invalid gold amount: %', amount;
  END IF;

  -- Atomic increment — no read-then-write race condition
  UPDATE public.profiles
  SET gold_earned = COALESCE(gold_earned, 0) + amount
  WHERE user_id = p_user_id;
END;
$$;
