-- Add grants_free_access column to promo_codes table
ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS grants_free_access BOOLEAN DEFAULT false;

-- Add has_free_access column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_free_access BOOLEAN DEFAULT false;

-- Insert CSCP2026 promo code with free access (if not exists)
INSERT INTO promo_codes (code, gold_reward, is_active, grants_free_access, max_uses, current_uses)
VALUES ('CSCP2026', 50, true, true, NULL, 0)
ON CONFLICT (code) DO UPDATE SET grants_free_access = true, is_active = true;