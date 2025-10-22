-- Insert 8 standard subjects (matières) for the educational platform
INSERT INTO public.subjects (name, slug, description, grade_level, icon_name, color, lesson_count, exercise_count) 
SELECT * FROM (VALUES
  ('Mathématiques', 'mathematiques', 'Algèbre, géométrie, calcul et résolution de problèmes', '7eme', '🔢', '#3B82F6', 0, 0),
  ('Sciences Physiques', 'sciences-physiques', 'Physique, chimie et expériences scientifiques', '7eme', '⚗️', '#8B5CF6', 0, 0),
  ('Sciences de la Vie et de la Terre', 'svt', 'Biologie, écologie et sciences naturelles', '7eme', '🌱', '#10B981', 0, 0),
  ('Français', 'francais', 'Grammaire, littérature, expression écrite et orale', '7eme', '📚', '#EF4444', 0, 0),
  ('Histoire-Géographie', 'histoire-geographie', 'Histoire des civilisations et géographie mondiale', '7eme', '🌍', '#F59E0B', 0, 0),
  ('Anglais', 'anglais', 'Langue anglaise, vocabulaire et communication', '7eme', '🇬🇧', '#06B6D4', 0, 0),
  ('Arts', 'arts', 'Arts visuels, musique et expression créative', '7eme', '🎨', '#EC4899', 0, 0),
  ('Éducation Physique', 'education-physique', 'Sport, santé et développement physique', '7eme', '⚽', '#84CC16', 0, 0)
) AS v(name, slug, description, grade_level, icon_name, color, lesson_count, exercise_count)
WHERE NOT EXISTS (
  SELECT 1 FROM public.subjects s WHERE s.slug = v.slug
);