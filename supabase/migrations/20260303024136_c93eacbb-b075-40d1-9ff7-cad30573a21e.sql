
-- Add duration_minutes to official_exams for timed mode support
ALTER TABLE public.official_exams 
ADD COLUMN IF NOT EXISTS duration_minutes integer;

-- Populate durations based on MENFP official exam durations
UPDATE public.official_exams SET duration_minutes = CASE
  WHEN subject ILIKE '%mathématiques%' OR subject ILIKE '%maths%' THEN 180
  WHEN subject ILIKE '%physique%' OR subject ILIKE '%chimie%' THEN 180
  WHEN subject ILIKE '%français%' THEN 180
  WHEN subject ILIKE '%philosophie%' THEN 180
  WHEN subject ILIKE '%svt%' OR subject ILIKE '%sciences de la vie%' OR subject ILIKE '%biologie%' THEN 120
  WHEN subject ILIKE '%histoire%' OR subject ILIKE '%géographie%' THEN 120
  WHEN subject ILIKE '%anglais%' THEN 120
  WHEN subject ILIKE '%espagnol%' THEN 120
  WHEN subject ILIKE '%créole%' THEN 120
  WHEN subject ILIKE '%sciences expérimentales%' THEN 120
  WHEN subject ILIKE '%sciences sociales%' THEN 120
  ELSE 120
END;
