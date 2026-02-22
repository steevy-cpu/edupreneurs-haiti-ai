CREATE TABLE exam_exercise_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL,
  exercise_number integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exam_id, exercise_number)
);

ALTER TABLE exam_exercise_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
  ON exam_exercise_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON exam_exercise_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);