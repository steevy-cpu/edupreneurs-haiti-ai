-- Standardize grade levels across the database
-- Consolidate AF7 and 7eme into 7AF

-- Update lessons table
UPDATE lessons 
SET grade_level = '7AF' 
WHERE grade_level IN ('AF7', '7eme');

-- Update subjects table
UPDATE subjects 
SET grade_level = '7AF' 
WHERE grade_level IN ('AF7', '7eme');

-- Add a comment for documentation
COMMENT ON COLUMN lessons.grade_level IS 'Standardized grade levels: 7AF, AF8';
COMMENT ON COLUMN subjects.grade_level IS 'Standardized grade levels: 7AF, AF8';