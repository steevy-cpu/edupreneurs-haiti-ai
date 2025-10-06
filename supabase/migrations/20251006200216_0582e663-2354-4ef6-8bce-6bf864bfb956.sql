-- Add school and gender fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school text,
ADD COLUMN IF NOT EXISTS gender text;