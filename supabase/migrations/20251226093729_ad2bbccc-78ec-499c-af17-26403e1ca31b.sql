-- Add phone verification request ID column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verification_request_id text DEFAULT NULL;

-- Add phone verification sent timestamp for rate limiting
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_verification_sent_at timestamp with time zone DEFAULT NULL;