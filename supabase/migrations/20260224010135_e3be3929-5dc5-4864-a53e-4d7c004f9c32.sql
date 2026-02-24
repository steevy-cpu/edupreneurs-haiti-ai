ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sent_onboarding_emails jsonb DEFAULT '[]'::jsonb;