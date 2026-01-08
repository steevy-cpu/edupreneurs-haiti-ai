-- Add onboarding tour tracking columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_tour_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_tour_completed_at TIMESTAMP WITH TIME ZONE;