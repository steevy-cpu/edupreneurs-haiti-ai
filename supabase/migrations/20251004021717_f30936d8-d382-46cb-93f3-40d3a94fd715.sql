-- Add referral code to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS affiliation_points integer DEFAULT 0;

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger to auto-generate referral code for new profiles
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profile_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_referral_code();

-- Update existing profiles with referral codes
UPDATE public.profiles 
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rewarded')),
  points_awarded integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  rewarded_at timestamp with time zone,
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
TO authenticated
USING (auth.uid() IN (
  SELECT user_id FROM public.profiles WHERE id = referrer_id
));

CREATE POLICY "System can insert referrals"
ON public.referrals
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "System can update referrals"
ON public.referrals
FOR UPDATE
TO authenticated
USING (true);

-- Function to award referral points
CREATE OR REPLACE FUNCTION public.award_referral_points(
  p_referrer_id uuid,
  p_referred_id uuid,
  p_points integer DEFAULT 10
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update referral status
  UPDATE public.referrals
  SET status = 'rewarded',
      points_awarded = p_points,
      rewarded_at = now()
  WHERE referrer_id = p_referrer_id 
    AND referred_id = p_referred_id
    AND status != 'rewarded';
  
  -- Award points to referrer
  UPDATE public.profiles
  SET affiliation_points = affiliation_points + p_points
  WHERE id = p_referrer_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.award_referral_points TO authenticated;