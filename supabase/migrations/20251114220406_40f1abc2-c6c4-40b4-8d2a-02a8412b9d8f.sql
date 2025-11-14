-- Add unique constraint on subjects table for slug and grade_level combination
ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_slug_grade_level_unique UNIQUE (slug, grade_level);