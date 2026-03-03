
-- Add exam stats columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS exams_completed integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS best_exam_score_percent integer DEFAULT 0;

-- Atomic function to complete an exam session: marks completed, updates stats, awards bonus gold
CREATE OR REPLACE FUNCTION public.complete_exam_session(
  p_session_id uuid,
  p_final_score integer,
  p_total_points integer,
  p_bonus_gold integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_score_percent integer;
  v_safe_gold integer;
BEGIN
  -- Verify caller owns the session
  SELECT user_id INTO v_user_id 
  FROM exam_practice_sessions 
  WHERE id = p_session_id AND user_id = auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Session not found or unauthorized';
  END IF;

  -- Cap bonus gold server-side to prevent client abuse
  v_safe_gold := LEAST(GREATEST(p_bonus_gold, 0), 150);

  -- Calculate score percent safely
  v_score_percent := CASE 
    WHEN p_total_points > 0 THEN ROUND((p_final_score::float / p_total_points) * 100)
    ELSE 0 
  END;

  -- Mark session as completed
  UPDATE exam_practice_sessions 
  SET completed_at = now(), updated_at = now()
  WHERE id = p_session_id AND completed_at IS NULL;

  -- Update profile stats atomically
  UPDATE profiles SET
    exams_completed = COALESCE(exams_completed, 0) + 1,
    best_exam_score_percent = GREATEST(COALESCE(best_exam_score_percent, 0), v_score_percent),
    gold_earned = COALESCE(gold_earned, 0) + v_safe_gold
  WHERE user_id = v_user_id;
END;
$$;
