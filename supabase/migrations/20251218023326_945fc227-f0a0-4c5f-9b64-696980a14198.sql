-- Add reference_texts column to official_exams table
ALTER TABLE public.official_exams 
ADD COLUMN IF NOT EXISTS reference_texts JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.official_exams.reference_texts IS 'Stores reference text passages that exam questions refer to (readings, texts, etc.)';