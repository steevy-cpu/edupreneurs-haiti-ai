-- Fix 7AF science subjects structure
-- For 7AF, there should only be:
-- 1. Sciences Sociales
-- 2. Sciences Expérimentales

-- First, create Sciences Expérimentales for 7AF
INSERT INTO subjects (id, name, slug, grade_level, description, icon_name, color, created_by)
VALUES (
  gen_random_uuid(),
  'Sciences Expérimentales',
  'sciences-experimentales-7af',
  '7AF',
  'Sciences expérimentales pour le niveau 7AF',
  'Flask',
  'blue',
  NULL
)
ON CONFLICT DO NOTHING;

-- Migrate lessons from old "Sciences" subject to new "Sciences Expérimentales" for 7AF
UPDATE lessons
SET subject_id = (
  SELECT id FROM subjects 
  WHERE name = 'Sciences Expérimentales' 
  AND grade_level = '7AF' 
  LIMIT 1
)
WHERE grade_level = '7AF' 
AND subject_id IN (
  SELECT id FROM subjects 
  WHERE grade_level = '7AF' 
  AND name IN ('Sciences', 'Sciences de la Vie et de la Terre', 'Sciences Physiques')
);

-- Delete incorrect science subjects for 7AF (keeping only Sciences Sociales and Sciences Expérimentales)
DELETE FROM subjects 
WHERE grade_level = '7AF' 
AND name IN ('Sciences', 'Sciences de la Vie et de la Terre', 'Sciences Physiques');