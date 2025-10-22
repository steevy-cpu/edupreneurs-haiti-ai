-- Add missing columns to lessons table
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS mois text,
ADD COLUMN IF NOT EXISTS "references" text[];