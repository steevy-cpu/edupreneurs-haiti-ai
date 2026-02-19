-- Relax NOT NULL constraints for fields moving to post-login onboarding
ALTER TABLE public.profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN nickname DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN academic_grade DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN phone_number DROP NOT NULL;

-- Add referral_source column for onboarding quiz question 7
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_source VARCHAR(50);