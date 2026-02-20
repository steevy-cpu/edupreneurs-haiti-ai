ALTER TABLE public.daily_words
ADD COLUMN IF NOT EXISTS audio_source text;

COMMENT ON COLUMN public.daily_words.audio_source
IS 'Tracks which method generated the audio: elevenlabs, openai, or recording';