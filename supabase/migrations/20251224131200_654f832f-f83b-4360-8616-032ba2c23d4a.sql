-- Add columns to official_exams for Baccalauréat NS4 support
ALTER TABLE official_exams 
ADD COLUMN IF NOT EXISTS series TEXT,
ADD COLUMN IF NOT EXISTS session TEXT DEFAULT 'principale',
ADD COLUMN IF NOT EXISTS is_model_exam BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Add comment to explain the columns
COMMENT ON COLUMN official_exams.series IS 'Série du baccalauréat: SMP, SES, SVT, LLA (NULL pour 9AF)';
COMMENT ON COLUMN official_exams.session IS 'Session de l''examen: principale ou rattrapage';
COMMENT ON COLUMN official_exams.is_model_exam IS 'True si c''est un modèle d''examen, false pour les examens officiels';
COMMENT ON COLUMN official_exams.version_number IS 'Numéro de version pour permettre plusieurs uploads même année/matière';