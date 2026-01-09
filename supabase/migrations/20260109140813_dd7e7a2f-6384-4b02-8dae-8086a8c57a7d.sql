-- CRITICAL FIX: Fix password_reset_tokens RLS policy
-- Current policy uses USING (true) which allows ANY authenticated user to read ALL tokens
-- This enables account takeover attacks

-- Drop the insecure policy
DROP POLICY IF EXISTS "Users can check their own reset tokens" ON public.password_reset_tokens;

-- Create secure policy that only allows users to check their OWN tokens
CREATE POLICY "Users can check their own reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (auth.uid() = user_id);