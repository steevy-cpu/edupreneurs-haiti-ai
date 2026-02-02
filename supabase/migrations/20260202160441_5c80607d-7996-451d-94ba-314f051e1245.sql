-- Phase 1: ExamHub Canonical Data Model Upgrade
-- Goal: Support all exam types (9AF, NS4) with structured content

-- 1.1 Add missing fields to official_exams
ALTER TABLE official_exams ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'official';
-- Values: 'official', 'model', 'practice', 'rattrapage'

ALTER TABLE official_exams ADD COLUMN IF NOT EXISTS track TEXT;
-- Values: '9AF', 'NS4' (derived from grade_level)

ALTER TABLE official_exams ADD COLUMN IF NOT EXISTS subject_slug TEXT;
-- Normalized slug for consistent querying

ALTER TABLE official_exams ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
-- Support multiple versions per year

-- 1.2 Upgrade exam_exercises for structured content (KaTeX support)
ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS prompt_blocks JSONB;
-- Format: [{ type: "text", content: "..." }, { type: "math-inline", latex: "x^2" }]

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS options_json JSONB;
-- Format: { "A": { blocks: [...], value: "..." }, "B": {...} }

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS answer_json JSONB;
-- Format: { index: 0, value: "A", blocks: [...] }

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS explanation_blocks JSONB;
-- Structured explanation with math support

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
-- Values: 'easy', 'medium', 'hard'

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS concept_tags TEXT[];
-- Array of concept tags for filtering

-- 1.3 Enhance exam_practice_sessions
ALTER TABLE exam_practice_sessions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'practice';
-- Values: 'practice', 'timed', 'review'

ALTER TABLE exam_practice_sessions ADD COLUMN IF NOT EXISTS time_remaining INTEGER;
-- For timed mode (seconds)

-- 1.4 Create index for fast filtering
CREATE INDEX IF NOT EXISTS idx_exams_track_series_subject 
ON official_exams(track, series, subject_slug, year DESC);

-- 1.5 Backfill existing data
-- Backfill track from grade_level
UPDATE official_exams SET track = grade_level WHERE track IS NULL;

-- Backfill subject_slug from subject (normalize to lowercase with hyphens)
UPDATE official_exams 
SET subject_slug = lower(regexp_replace(
  regexp_replace(subject, '[^a-zA-Z0-9àâäéèêëïîôùûüçÀÂÄÉÈÊËÏÎÔÙÛÜÇ]+', '-', 'g'),
  '-+', '-', 'g'
))
WHERE subject_slug IS NULL;