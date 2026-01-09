-- Security: Rate limiting table for tracking request counts per user/IP
-- Optimized for 200+ concurrent users with proper indexes

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,  -- Format: "user:{user_id}:{endpoint}" or "ip:{ip}:{endpoint}"
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Performance indexes for high-volume lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON public.rate_limits(expires_at);

-- Enable RLS (no policies needed - only edge functions with service role access this)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Cleanup function for expired rate limit records (called via cron or manually)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.rate_limits WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Security: Promo codes table to replace hardcoded values
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  gold_reward INTEGER NOT NULL DEFAULT 100,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS for promo codes (only service role can modify)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read active promo codes (for validation)
CREATE POLICY "Anyone can read active promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Insert existing promo codes from hardcoded values
INSERT INTO public.promo_codes (code, gold_reward) VALUES 
  ('EDUPRENEURS2025', 50),
  ('HAITI2025', 50),
  ('BIENVENUE', 25),
  ('BETA2025', 100)
ON CONFLICT (code) DO NOTHING;

-- Security: Fix award_referral_points to prevent unauthorized calls
CREATE OR REPLACE FUNCTION public.award_referral_points(
  p_referrer_id uuid, 
  p_referred_id uuid, 
  p_points integer DEFAULT 10
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Security: Only allow calls from the referred user themselves
  -- This prevents users from awarding points to arbitrary referrers
  IF auth.uid() IS NOT NULL AND auth.uid() != p_referred_id THEN
    RAISE EXCEPTION 'Unauthorized: Only the referred user can trigger referral points';
  END IF;
  
  -- Security: Prevent self-referral attacks
  IF p_referrer_id = p_referred_id THEN
    RAISE EXCEPTION 'Invalid: Cannot refer yourself';
  END IF;

  -- Update referral status (if referrals table exists)
  UPDATE public.referrals
  SET status = 'rewarded',
      points_awarded = p_points,
      rewarded_at = now()
  WHERE referrer_id = p_referrer_id 
    AND referred_id = p_referred_id
    AND status != 'rewarded';
  
  -- Award points to referrer
  UPDATE public.profiles
  SET affiliation_points = COALESCE(affiliation_points, 0) + p_points
  WHERE id = p_referrer_id;
END;
$$;