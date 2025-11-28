-- Create official_exams table
CREATE TABLE public.official_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  year INTEGER NOT NULL,
  grade_level TEXT NOT NULL,
  pdf_url TEXT,
  total_exercises INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create exam_exercises table
CREATE TABLE public.exam_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.official_exams(id) ON DELETE CASCADE,
  exercise_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  exercise_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  concept TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(exam_id, exercise_number)
);

-- Create exam_practice_sessions table
CREATE TABLE public.exam_practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.official_exams(id) ON DELETE CASCADE,
  current_exercise INTEGER NOT NULL DEFAULT 1,
  score INTEGER NOT NULL DEFAULT 0,
  completed_exercises JSONB NOT NULL DEFAULT '[]',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create exam_practice_conversations table for persistent chat
CREATE TABLE public.exam_practice_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES public.exam_practice_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exam_exercises(id) ON DELETE CASCADE,
  message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant')),
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.official_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_practice_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for official_exams
CREATE POLICY "Everyone can view published exams"
  ON public.official_exams FOR SELECT
  USING (true);

CREATE POLICY "Editors can create exams"
  ON public.official_exams FOR INSERT
  WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

CREATE POLICY "Editors can update exams"
  ON public.official_exams FOR UPDATE
  USING (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- RLS Policies for exam_exercises
CREATE POLICY "Everyone can view exercises"
  ON public.exam_exercises FOR SELECT
  USING (true);

CREATE POLICY "Editors can create exercises"
  ON public.exam_exercises FOR INSERT
  WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

CREATE POLICY "Editors can update exercises"
  ON public.exam_exercises FOR UPDATE
  USING (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- RLS Policies for exam_practice_sessions
CREATE POLICY "Users can view own sessions"
  ON public.exam_practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON public.exam_practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.exam_practice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for exam_practice_conversations
CREATE POLICY "Users can view own conversations"
  ON public.exam_practice_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.exam_practice_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.exam_practice_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_exam_exercises_exam_id ON public.exam_exercises(exam_id);
CREATE INDEX idx_exam_practice_sessions_user_id ON public.exam_practice_sessions(user_id);
CREATE INDEX idx_exam_practice_sessions_exam_id ON public.exam_practice_sessions(exam_id);
CREATE INDEX idx_exam_practice_conversations_session_id ON public.exam_practice_conversations(session_id);
CREATE INDEX idx_exam_practice_conversations_exercise_id ON public.exam_practice_conversations(exercise_id);

-- Insert Math 9AF 2025 exam
INSERT INTO public.official_exams (title, subject, year, grade_level, total_exercises, total_points)
VALUES ('Examen Officiel Mathématiques', 'Mathématiques', 2025, '9AF', 18, 50);

-- Get the exam_id for inserting exercises
DO $$
DECLARE
  v_exam_id UUID;
BEGIN
  SELECT id INTO v_exam_id FROM public.official_exams WHERE title = 'Examen Officiel Mathématiques' AND year = 2025 AND grade_level = '9AF' LIMIT 1;
  
  -- Insert exercises from Math 9AF 2025
  INSERT INTO public.exam_exercises (exam_id, exercise_number, question_text, options, correct_answer, explanation, concept, points) VALUES
  (v_exam_id, 1, 'Lequel des nombres suivants n''est pas un diviseur de 14?', '["2", "3", "7", "14"]', 'B', 'Pour qu''un nombre soit diviseur de 14, 14 doit être divisible par ce nombre. 14 ÷ 2 = 7 ✓, 14 ÷ 3 = 4.67 ✗, 14 ÷ 7 = 2 ✓, 14 ÷ 14 = 1 ✓', 'divisibilité', 2),
  (v_exam_id, 2, 'Quel est le résultat de (-2)²?', '["8", "4", "1", "-8"]', 'B', '(-2)² = (-2) × (-2) = 4. Quand on élève un nombre négatif au carré, le résultat est toujours positif.', 'puissances', 2),
  (v_exam_id, 3, 'Quelle est la valeur de x dans l''équation: 3x - 5 = 10?', '["x = 3", "x = 5", "x = 15", "x = 2"]', 'B', 'Pour résoudre: 3x - 5 = 10 → 3x = 15 → x = 5', 'équations', 3),
  (v_exam_id, 4, 'Quel est le périmètre d''un rectangle de longueur 8 cm et de largeur 5 cm?', '["13 cm", "26 cm", "40 cm", "18 cm"]', 'B', 'Périmètre = 2(L + l) = 2(8 + 5) = 2(13) = 26 cm', 'géométrie', 3),
  (v_exam_id, 5, 'Quelle fraction est équivalente à 0,75?', '["1/4", "3/4", "2/3", "1/2"]', 'B', '0,75 = 75/100 = 3/4 (en simplifiant par 25)', 'fractions', 2),
  (v_exam_id, 6, 'Quel est le résultat de 2³ + 3²?', '["17", "13", "11", "14"]', 'A', '2³ = 8, 3² = 9, donc 8 + 9 = 17', 'puissances', 2),
  (v_exam_id, 7, 'Dans un triangle rectangle, si un angle mesure 35°, combien mesure l''autre angle aigu?', '["55°", "65°", "45°", "75°"]', 'A', 'Dans un triangle rectangle: 90° + 35° + x = 180° → x = 55°', 'géométrie', 3),
  (v_exam_id, 8, 'Quel est le PGCD de 24 et 36?', '["6", "12", "8", "4"]', 'B', 'Les diviseurs de 24: 1,2,3,4,6,8,12,24. Les diviseurs de 36: 1,2,3,4,6,9,12,18,36. Le plus grand diviseur commun est 12.', 'divisibilité', 3),
  (v_exam_id, 9, 'Quelle est l''aire d''un cercle de rayon 5 cm? (π ≈ 3,14)', '["78,5 cm²", "31,4 cm²", "15,7 cm²", "62,8 cm²"]', 'A', 'Aire = πr² = 3,14 × 5² = 3,14 × 25 = 78,5 cm²', 'géométrie', 3),
  (v_exam_id, 10, 'Combien vaut 15% de 200?', '["30", "25", "35", "20"]', 'A', '15% de 200 = (15/100) × 200 = 30', 'pourcentages', 2),
  (v_exam_id, 11, 'Quelle est la valeur de x dans: 2x/3 = 8?', '["x = 12", "x = 6", "x = 16", "x = 10"]', 'A', '2x/3 = 8 → 2x = 24 → x = 12', 'équations', 3),
  (v_exam_id, 12, 'Le volume d''un cube d''arête 4 cm est:', '["64 cm³", "16 cm³", "48 cm³", "32 cm³"]', 'A', 'Volume = arête³ = 4³ = 64 cm³', 'géométrie', 3),
  (v_exam_id, 13, 'Quel nombre est un nombre premier?', '["21", "17", "15", "9"]', 'B', 'Un nombre premier n''a que deux diviseurs: 1 et lui-même. 17 est divisible uniquement par 1 et 17.', 'nombres premiers', 2),
  (v_exam_id, 14, 'Quelle est la médiane de la série: 3, 7, 5, 9, 11?', '["7", "5", "8", "9"]', 'A', 'Ordre croissant: 3, 5, 7, 9, 11. La médiane est la valeur du milieu: 7', 'statistiques', 3),
  (v_exam_id, 15, 'Si un article coûte 80 gourdes avec une réduction de 20%, quel est le nouveau prix?', '["64 gourdes", "60 gourdes", "70 gourdes", "75 gourdes"]', 'A', 'Réduction = 20% de 80 = 16 gourdes. Nouveau prix = 80 - 16 = 64 gourdes', 'pourcentages', 3),
  (v_exam_id, 16, 'Quel est le résultat de: (-3) × (-5)?', '["15", "-15", "8", "-8"]', 'A', 'Le produit de deux nombres négatifs est positif: (-3) × (-5) = 15', 'opérations', 2),
  (v_exam_id, 17, 'Quelle est la somme des angles intérieurs d''un triangle?', '["180°", "360°", "90°", "270°"]', 'A', 'La somme des angles intérieurs d''un triangle est toujours 180°', 'géométrie', 2),
  (v_exam_id, 18, 'Quel est le résultat simplifié de: 3/4 + 1/2?', '["5/4", "4/6", "1", "5/6"]', 'A', '3/4 + 1/2 = 3/4 + 2/4 = 5/4', 'fractions', 3);
END $$;