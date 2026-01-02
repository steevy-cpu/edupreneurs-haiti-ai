-- Add audio URL columns to lessons table for pre-generated TTS audio
ALTER TABLE public.lessons ADD COLUMN audio_objectif_url TEXT;
ALTER TABLE public.lessons ADD COLUMN audio_introduction_url TEXT;
ALTER TABLE public.lessons ADD COLUMN audio_contenu_url TEXT;
ALTER TABLE public.lessons ADD COLUMN audio_exemples_url TEXT;
ALTER TABLE public.lessons ADD COLUMN audio_generated_at TIMESTAMPTZ;