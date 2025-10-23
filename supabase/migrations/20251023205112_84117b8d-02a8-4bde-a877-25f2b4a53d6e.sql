-- Add youtube_url column to lessons table to allow custom YouTube videos for each lesson
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS youtube_url TEXT;