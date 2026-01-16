-- Create daily_words table
CREATE TABLE IF NOT EXISTS public.daily_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  phonetic TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  definition TEXT NOT NULL,
  example TEXT NOT NULL,
  audio_url TEXT,
  difficulty_level TEXT DEFAULT 'advanced',
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on daily_words
ALTER TABLE public.daily_words ENABLE ROW LEVEL SECURITY;

-- Anyone can view active daily words
CREATE POLICY "Anyone can view daily words" 
  ON public.daily_words FOR SELECT 
  USING (is_active = true);

-- Editors can manage all daily words
CREATE POLICY "Editors can insert daily words" 
  ON public.daily_words FOR INSERT 
  WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

CREATE POLICY "Editors can update daily words" 
  ON public.daily_words FOR UPDATE 
  USING (is_content_editor(auth.uid(), 'editor'::content_editor_role))
  WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

CREATE POLICY "Editors can delete daily words" 
  ON public.daily_words FOR DELETE 
  USING (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- Create user_seen_words table
CREATE TABLE IF NOT EXISTS public.user_seen_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES public.daily_words(id) ON DELETE CASCADE,
  seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, word_id)
);

-- Enable RLS on user_seen_words
ALTER TABLE public.user_seen_words ENABLE ROW LEVEL SECURITY;

-- Users can view their own seen words
CREATE POLICY "Users can view their own seen words"
  ON public.user_seen_words FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own seen words
CREATE POLICY "Users can mark words as seen"
  ON public.user_seen_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Performance index
CREATE INDEX idx_user_seen_words_lookup ON public.user_seen_words(user_id, word_id);

-- Seed initial words
INSERT INTO public.daily_words (word, phonetic, part_of_speech, definition, example, category) VALUES
  ('Éphémère', 'e.fe.mɛʁ', 'adj.', 'Qui ne dure qu''un temps très court', 'La beauté des fleurs est éphémère.', 'Littérature'),
  ('Conifère', 'kɔ.ni.fɛʁ', 'n.m.', 'Arbre qui produit des cônes', 'Les sapins sont des conifères communs.', 'Sciences'),
  ('Ubiquité', 'y.bi.ki.te', 'n.f.', 'Fait d''être présent partout à la fois', 'L''ubiquité des smartphones a changé nos vies.', 'Philosophie'),
  ('Parcimonie', 'paʁ.si.mɔ.ni', 'n.f.', 'Économie excessive dans l''usage de quelque chose', 'Il utilise ses ressources avec parcimonie.', 'Littérature'),
  ('Ineffable', 'i.ne.fabl', 'adj.', 'Qui ne peut être exprimé par des mots', 'Une joie ineffable l''envahit à cet instant.', 'Littérature'),
  ('Quintessence', 'kɛ̃.te.sɑ̃s', 'n.f.', 'Ce qu''il y a de plus pur, de plus raffiné', 'Ce parfum est la quintessence de l''élégance.', 'Philosophie'),
  ('Anachronique', 'a.na.kʁɔ.nik', 'adj.', 'Qui n''est pas de son époque', 'Cette pratique semble anachronique aujourd''hui.', 'Histoire'),
  ('Dilettante', 'di.le.tɑ̃t', 'n.', 'Amateur qui s''occupe de quelque chose sans approfondir', 'Il reste un dilettante dans ce domaine.', 'Arts'),
  ('Apothéose', 'a.pɔ.te.oz', 'n.f.', 'Point culminant, moment de gloire suprême', 'Ce concert fut l''apothéose de sa carrière.', 'Arts'),
  ('Sérendipité', 'se.ʁɑ̃.di.pi.te', 'n.f.', 'Découverte heureuse faite par hasard', 'Cette rencontre fut une belle sérendipité.', 'Sciences'),
  ('Acrimonie', 'a.kʁi.mɔ.ni', 'n.f.', 'Aigreur, amertume dans le caractère ou les propos', 'Il répondit avec acrimonie à la critique.', 'Littérature'),
  ('Perspicace', 'pɛʁ.spi.kas', 'adj.', 'Qui a une intelligence pénétrante et clairvoyante', 'Son analyse perspicace impressionna tous.', 'Philosophie'),
  ('Idiosyncrasie', 'i.djo.sɛ̃.kʁa.zi', 'n.f.', 'Manière d''être propre à chaque individu', 'Chacun a ses propres idiosyncrasies.', 'Psychologie'),
  ('Procrastiner', 'pʁɔ.kʁas.ti.ne', 'v.', 'Remettre au lendemain ce qu''on devrait faire', 'Il a tendance à procrastiner ses devoirs.', 'Psychologie'),
  ('Syncrétisme', 'sɛ̃.kʁe.tism', 'n.m.', 'Fusion de doctrines ou de systèmes différents', 'Cette religion est un syncrétisme de plusieurs traditions.', 'Philosophie')
ON CONFLICT (word) DO NOTHING;