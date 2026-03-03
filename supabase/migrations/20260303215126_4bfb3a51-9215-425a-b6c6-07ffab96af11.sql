-- Prevent duplicate NS4 exam rows at DB level
-- Partial unique indexes handle both official and model exam cases

-- NS4 official exams: unique on track + series + subject + year + session
CREATE UNIQUE INDEX IF NOT EXISTS idx_official_exams_ns4_official_unique
ON public.official_exams (track, series, subject, year, session)
WHERE track = 'NS4' AND is_model_exam = false;

-- NS4 model exams: unique on track + series + subject (no year constraint)
CREATE UNIQUE INDEX IF NOT EXISTS idx_official_exams_ns4_model_unique
ON public.official_exams (track, series, subject, is_model_exam)
WHERE track = 'NS4' AND is_model_exam = true;

-- 9AF exams: unique on track + subject + year + session
CREATE UNIQUE INDEX IF NOT EXISTS idx_official_exams_9af_unique
ON public.official_exams (track, subject, year, session)
WHERE track = '9AF';