-- Add promo_code_used column to profiles table
ALTER TABLE profiles 
ADD COLUMN promo_code_used TEXT DEFAULT NULL;

-- Add a timestamp for when the promo code was used
ALTER TABLE profiles 
ADD COLUMN promo_code_used_at TIMESTAMPTZ DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.promo_code_used IS 'The promotional code used during signup (e.g., CSCP2026)';
COMMENT ON COLUMN profiles.promo_code_used_at IS 'Timestamp when the promo code was applied during signup';