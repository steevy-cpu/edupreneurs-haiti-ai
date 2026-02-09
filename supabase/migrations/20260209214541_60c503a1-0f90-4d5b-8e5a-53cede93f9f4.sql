
-- Create study_music_tracks table
CREATE TABLE public.study_music_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(user_id)
);

-- Enable RLS
ALTER TABLE public.study_music_tracks ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated users
CREATE POLICY "Authenticated users can read tracks"
ON public.study_music_tracks FOR SELECT
TO authenticated
USING (true);

-- INSERT/UPDATE/DELETE: founders only
CREATE POLICY "Founders can insert tracks"
ON public.study_music_tracks FOR INSERT
TO authenticated
WITH CHECK (is_founder());

CREATE POLICY "Founders can update tracks"
ON public.study_music_tracks FOR UPDATE
TO authenticated
USING (is_founder());

CREATE POLICY "Founders can delete tracks"
ON public.study_music_tracks FOR DELETE
TO authenticated
USING (is_founder());

-- Seed the 23 existing hardcoded tracks
INSERT INTO public.study_music_tracks (youtube_id, title, thumbnail_url, sort_order) VALUES
('ViKbB7vbK7Q', 'Lofi Hip Hop Radio', 'https://i.ytimg.com/vi/ViKbB7vbK7Q/hqdefault.jpg', 1),
('45Siu4EtXzE', 'Musique Relaxante pour Étudier - Concentration', 'https://i.ytimg.com/vi/45Siu4EtXzE/hqdefault.jpg', 2),
('Rb0UmrCXxVA', 'Mozart - Musique Classique pour Étudier', 'https://i.ytimg.com/vi/Rb0UmrCXxVA/hqdefault.jpg', 3),
('jgpJVI3tDbY', 'Mozart - Concertos pour Piano Complets', 'https://i.ytimg.com/vi/jgpJVI3tDbY/hqdefault.jpg', 4),
('hOA-2hl1Vbc', 'Mozart - Eine Kleine Nachtmusik', 'https://i.ytimg.com/vi/hOA-2hl1Vbc/hqdefault.jpg', 5),
('9E6b3swbnWg', 'Chopin - Nocturne Op. 9 No. 2', 'https://i.ytimg.com/vi/9E6b3swbnWg/hqdefault.jpg', 6),
('wygy721nzRc', 'Chopin - Nocturnes Complets', 'https://i.ytimg.com/vi/wygy721nzRc/hqdefault.jpg', 7),
('EhO_MrRfftU', 'Chopin - Valses Célèbres', 'https://i.ytimg.com/vi/EhO_MrRfftU/hqdefault.jpg', 8),
('t3217H8JppI', 'Beethoven - Symphonies pour Étudier', 'https://i.ytimg.com/vi/t3217H8JppI/hqdefault.jpg', 9),
('4Tr0otuiQuU', 'Beethoven - Sonate au Clair de Lune', 'https://i.ytimg.com/vi/4Tr0otuiQuU/hqdefault.jpg', 10),
('rOjHhS5MtvA', 'Beethoven - Symphonie No. 9', 'https://i.ytimg.com/vi/rOjHhS5MtvA/hqdefault.jpg', 11),
('6JQm5aSjX6g', 'Bach - Le Clavier Bien Tempéré', 'https://i.ytimg.com/vi/6JQm5aSjX6g/hqdefault.jpg', 12),
('Nnuq9PXbywA', 'Bach - Toccata et Fugue en Ré Mineur', 'https://i.ytimg.com/vi/Nnuq9PXbywA/hqdefault.jpg', 13),
('ho9rZjlsyYY', 'Bach - Prélude en Do Majeur', 'https://i.ytimg.com/vi/ho9rZjlsyYY/hqdefault.jpg', 14),
('GRxofEmo3HA', 'Vivaldi - Les Quatre Saisons Complet', 'https://i.ytimg.com/vi/GRxofEmo3HA/hqdefault.jpg', 15),
('l-dYNttdgl0', 'Vivaldi - Meilleurs Concertos Baroque', 'https://i.ytimg.com/vi/l-dYNttdgl0/hqdefault.jpg', 16),
('CvFH_6DNRCY', 'Debussy - Clair de Lune et Œuvres', 'https://i.ytimg.com/vi/CvFH_6DNRCY/hqdefault.jpg', 17),
('WNcsUNKlAKw', 'Debussy - La Mer', 'https://i.ytimg.com/vi/WNcsUNKlAKw/hqdefault.jpg', 18),
('KpOtuoHL45Y', 'Liszt - Rêve d''Amour', 'https://i.ytimg.com/vi/KpOtuoHL45Y/hqdefault.jpg', 19),
('H1Dvg2MxQn8', 'Liszt - Rhapsodies Hongroises', 'https://i.ytimg.com/vi/H1Dvg2MxQn8/hqdefault.jpg', 20),
('2bosouX_d8Y', 'Schubert - Ave Maria (Version Orchestrale)', 'https://i.ytimg.com/vi/2bosouX_d8Y/hqdefault.jpg', 21),
('4PUHBL1vMNY', 'Meilleure Musique Classique Étude', 'https://i.ytimg.com/vi/4PUHBL1vMNY/hqdefault.jpg', 22);
