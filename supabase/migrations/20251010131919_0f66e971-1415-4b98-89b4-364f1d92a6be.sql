-- Add verified badge field to profiles
ALTER TABLE public.profiles ADD COLUMN verified boolean DEFAULT false;

-- Create a special system user for Eric (using a reserved email)
-- Note: This requires manual auth user creation first, but we'll prepare the profile structure

-- Add is_system_account flag to identify Eric and other system accounts
ALTER TABLE public.profiles ADD COLUMN is_system_account boolean DEFAULT false;

-- Add index for quick verification checks
CREATE INDEX idx_profiles_verified ON public.profiles(verified);
CREATE INDEX idx_profiles_system_account ON public.profiles(is_system_account);

COMMENT ON COLUMN public.profiles.verified IS 'Shows verification checkmark badge';
COMMENT ON COLUMN public.profiles.is_system_account IS 'Identifies system accounts like Eric';