-- Add synchronization columns for real-time competitive quiz battles
ALTER TABLE quiz_battles 
  ADD COLUMN IF NOT EXISTS current_question_index INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS round_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS round_answers JSONB DEFAULT '[]'::jsonb;

-- Create atomic answer submission function for multiplayer battles
-- This handles race conditions when both players answer simultaneously
CREATE OR REPLACE FUNCTION public.submit_multiplayer_answer(
  p_battle_id UUID,
  p_user_id UUID,
  p_question_index INTEGER,
  p_answer INTEGER,
  p_is_correct BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle RECORD;
  v_round_data JSONB;
  v_existing_answers JSONB;
  v_opponent_answer JSONB;
  v_my_answer JSONB;
  v_should_advance BOOLEAN := FALSE;
  v_round_winner UUID := NULL;
  v_updated_round_answers JSONB;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO v_battle 
  FROM quiz_battles 
  WHERE id = p_battle_id 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Battle not found');
  END IF;
  
  -- Check if this is still the current question
  IF v_battle.current_question_index != p_question_index THEN
    RETURN jsonb_build_object(
      'status', 'already_advanced', 
      'current_index', v_battle.current_question_index
    );
  END IF;
  
  -- Get existing round answers array
  v_updated_round_answers := COALESCE(v_battle.round_answers, '[]'::jsonb);
  
  -- Get or create round data for this question
  v_round_data := v_updated_round_answers->p_question_index;
  
  IF v_round_data IS NULL THEN
    v_round_data := jsonb_build_object(
      'question_index', p_question_index, 
      'answers', '[]'::jsonb, 
      'winner_id', NULL
    );
  END IF;
  
  v_existing_answers := COALESCE(v_round_data->'answers', '[]'::jsonb);
  
  -- Check if user already answered this round
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_existing_answers) a 
    WHERE (a->>'user_id')::uuid = p_user_id
  ) THEN
    RETURN jsonb_build_object('status', 'already_answered');
  END IF;
  
  -- Create my answer object
  v_my_answer := jsonb_build_object(
    'user_id', p_user_id::text,
    'answer', p_answer,
    'correct', p_is_correct,
    'answered_at', now()::text
  );
  
  -- Add this answer to existing answers
  v_existing_answers := v_existing_answers || v_my_answer;
  
  -- Find opponent's answer (if exists)
  SELECT a INTO v_opponent_answer 
  FROM jsonb_array_elements(v_existing_answers) a 
  WHERE (a->>'user_id')::uuid != p_user_id
  LIMIT 1;
  
  -- Determine round outcome based on correctness and timing
  IF p_is_correct THEN
    -- I answered correctly
    IF v_opponent_answer IS NULL THEN
      -- I'm first to answer correctly - I WIN, advance immediately
      v_round_winner := p_user_id;
      v_should_advance := TRUE;
    ELSE
      -- Opponent already answered
      IF (v_opponent_answer->>'correct')::boolean THEN
        -- Opponent was also correct - first by timestamp wins
        IF (v_opponent_answer->>'answered_at')::timestamptz < now() THEN
          v_round_winner := (v_opponent_answer->>'user_id')::uuid;
        ELSE
          v_round_winner := p_user_id;
        END IF;
      ELSE
        -- Opponent was wrong, I'm correct - I WIN
        v_round_winner := p_user_id;
      END IF;
      v_should_advance := TRUE;
    END IF;
  ELSE
    -- I answered incorrectly
    IF v_opponent_answer IS NOT NULL THEN
      -- Opponent already answered
      IF (v_opponent_answer->>'correct')::boolean THEN
        -- Opponent was correct - they win
        v_round_winner := (v_opponent_answer->>'user_id')::uuid;
      END IF;
      -- Both answered (one or both wrong), advance
      v_should_advance := TRUE;
    END IF;
    -- If opponent hasn't answered yet, we wait for them
  END IF;
  
  -- Update round data
  v_round_data := jsonb_set(v_round_data, '{answers}', v_existing_answers);
  IF v_should_advance THEN
    v_round_data := jsonb_set(v_round_data, '{winner_id}', 
      CASE WHEN v_round_winner IS NOT NULL 
        THEN to_jsonb(v_round_winner::text) 
        ELSE 'null'::jsonb 
      END
    );
  END IF;
  
  -- Ensure round_answers array is big enough
  WHILE jsonb_array_length(v_updated_round_answers) <= p_question_index LOOP
    v_updated_round_answers := v_updated_round_answers || 'null'::jsonb;
  END LOOP;
  
  -- Set this round's data
  v_updated_round_answers := jsonb_set(
    v_updated_round_answers,
    ARRAY[p_question_index::text],
    v_round_data
  );
  
  -- Update battle record
  UPDATE quiz_battles SET
    round_answers = v_updated_round_answers,
    current_question_index = CASE 
      WHEN v_should_advance THEN current_question_index + 1 
      ELSE current_question_index 
    END,
    round_started_at = CASE 
      WHEN v_should_advance THEN now() 
      ELSE round_started_at 
    END
  WHERE id = p_battle_id;
  
  RETURN jsonb_build_object(
    'status', CASE WHEN v_should_advance THEN 'round_complete' ELSE 'waiting_opponent' END,
    'round_winner', v_round_winner,
    'should_advance', v_should_advance,
    'new_question_index', CASE WHEN v_should_advance THEN p_question_index + 1 ELSE p_question_index END,
    'my_answer_correct', p_is_correct
  );
END;
$$;

COMMENT ON FUNCTION public.submit_multiplayer_answer IS 'Atomic answer submission for real-time multiplayer quiz battles. Handles race conditions with row locking.';