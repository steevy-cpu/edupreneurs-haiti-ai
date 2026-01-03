-- Phase 1: Add precomputed count columns to lessons table for performance optimization
-- This eliminates the need to fetch and parse large HTML content just to count activities

-- Add the new columns
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS activities_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quiz_count INTEGER DEFAULT 0;

-- Create function to count activities from HTML content
CREATE OR REPLACE FUNCTION public.count_activities_in_html(html_content TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  count_result INTEGER := 0;
BEGIN
  IF html_content IS NULL OR html_content = '' THEN
    RETURN 0;
  END IF;
  
  -- Count different activity patterns in the HTML
  -- Pattern 1: data-game-type attributes (interactive games)
  SELECT COUNT(*) INTO count_result
  FROM regexp_matches(html_content, 'data-game-type', 'gi');
  
  -- Pattern 2: activity-card classes
  count_result := count_result + (
    SELECT COUNT(*) FROM regexp_matches(html_content, 'activity-card', 'gi')
  );
  
  -- Pattern 3: interactive-activity classes
  count_result := count_result + (
    SELECT COUNT(*) FROM regexp_matches(html_content, 'interactive-activity', 'gi')
  );
  
  RETURN count_result;
END;
$$;

-- Create function to count quiz questions from HTML content
CREATE OR REPLACE FUNCTION public.count_quiz_in_html(html_content TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  count_result INTEGER := 0;
BEGIN
  IF html_content IS NULL OR html_content = '' THEN
    RETURN 0;
  END IF;
  
  -- Count quiz question patterns
  -- Pattern 1: quiz-question classes
  SELECT COUNT(*) INTO count_result
  FROM regexp_matches(html_content, 'quiz-question', 'gi');
  
  -- Pattern 2: data-question attributes
  count_result := count_result + (
    SELECT COUNT(*) FROM regexp_matches(html_content, 'data-question', 'gi')
  );
  
  -- Pattern 3: question-card classes
  count_result := count_result + (
    SELECT COUNT(*) FROM regexp_matches(html_content, 'question-card', 'gi')
  );
  
  RETURN count_result;
END;
$$;

-- Create function to update counts when lesson content changes
CREATE OR REPLACE FUNCTION public.update_lesson_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update activities count from activites_interactives field
  NEW.activities_count := public.count_activities_in_html(NEW.activites_interactives);
  
  -- Update quiz count from quiz_final field
  NEW.quiz_count := public.count_quiz_in_html(NEW.quiz_final);
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-update counts on insert/update
DROP TRIGGER IF EXISTS update_lesson_counts_trigger ON public.lessons;
CREATE TRIGGER update_lesson_counts_trigger
BEFORE INSERT OR UPDATE OF activites_interactives, quiz_final ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_lesson_counts();

-- Populate counts for existing lessons (one-time migration)
UPDATE public.lessons
SET 
  activities_count = public.count_activities_in_html(activites_interactives),
  quiz_count = public.count_quiz_in_html(quiz_final)
WHERE activities_count = 0 OR quiz_count = 0 OR activities_count IS NULL OR quiz_count IS NULL;