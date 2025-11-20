-- Add series column to subjects table
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS series TEXT;

-- Add check constraint for valid series values
ALTER TABLE subjects ADD CONSTRAINT valid_series_check 
  CHECK (
    series IS NULL OR 
    series IN ('LLA', 'SES', 'SMP', 'SVT')
  );

-- Update unique constraint to include series
-- First drop the old constraint if it exists
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_slug_grade_level_key;

-- Add new unique constraint including series
ALTER TABLE subjects ADD CONSTRAINT subjects_slug_grade_level_series_key 
  UNIQUE (slug, grade_level, series);

-- Add comment for documentation
COMMENT ON COLUMN subjects.series IS 'Academic series for NS3/NS4: LLA (Lettres, Langues et Arts), SES (Sciences Économiques et Sociales), SMP (Sciences Mathématiques et Physiques), SVT (Sciences de la Vie et de la Terre)';