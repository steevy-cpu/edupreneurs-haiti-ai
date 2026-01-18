-- Table pour tracker les réponses correctes par matière
CREATE TABLE public.quiz_battle_subject_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_quiz_battle_subject_stats_user_id ON public.quiz_battle_subject_stats(user_id);

-- RLS
ALTER TABLE public.quiz_battle_subject_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subject stats"
  ON public.quiz_battle_subject_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subject stats"
  ON public.quiz_battle_subject_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subject stats"
  ON public.quiz_battle_subject_stats FOR UPDATE
  USING (auth.uid() = user_id);