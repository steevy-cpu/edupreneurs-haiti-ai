-- Add quiz_final column to lessons table to store generated quiz content
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS quiz_final text;