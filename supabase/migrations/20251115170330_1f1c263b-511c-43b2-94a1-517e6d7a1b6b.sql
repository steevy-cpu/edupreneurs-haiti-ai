-- Drop the old unique constraint on slug alone
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_slug_key;

-- Add a proper unique constraint on (slug, grade_level) combination
ALTER TABLE subjects ADD CONSTRAINT subjects_slug_grade_level_key UNIQUE (slug, grade_level);

-- Now insert Espagnol AF9
INSERT INTO subjects (slug, name, grade_level, description, icon_name, color, lesson_count, exercise_count)
VALUES (
  'espagnol',
  'Espagnol',
  'AF9',
  'Cours d''espagnol pour la 9ème année fondamentale',
  'Languages',
  'gradient-orange',
  19,
  0
)
ON CONFLICT (slug, grade_level) DO UPDATE SET
  description = EXCLUDED.description,
  lesson_count = EXCLUDED.lesson_count;

-- Insert all lessons for Espagnol AF9
DO $$
DECLARE
  v_subject_id uuid;
BEGIN
  SELECT id INTO v_subject_id FROM subjects WHERE slug = 'espagnol' AND grade_level = 'AF9';

  -- Décembre
  INSERT INTO lessons (subject_id, title, slug, objectif, grade_level, mois, order_index, is_published) VALUES
  (v_subject_id, 'El transporte', 'el-transporte', 
   '🎯 Objectifs : Comunicar por teléfono, Indicar los medios de transporte, Explicar las ventajas de los transportes',
   'AF9', 'Décembre', 1, true),
  
  (v_subject_id, 'El tiempo', 'el-tiempo',
   '🎯 Objectifs : Expresarse sobre el tiempo, Dar informaciones sobre el tiempo que hace, Expresar diferencia',
   'AF9', 'Décembre', 2, true);

  -- Janvier
  INSERT INTO lessons (subject_id, title, slug, objectif, grade_level, mois, order_index, is_published) VALUES
  (v_subject_id, 'La familia', 'la-familia',
   '🎯 Objectifs : Hablar de la familia, Expresar sus sentimientos sobre un miembro de la familia, Describir a un miembro de su familia',
   'AF9', 'Janvier', 3, true),
  
  (v_subject_id, 'El deporte', 'el-deporte',
   '🎯 Objectifs : Expresarse sobre el deporte, Hablar de su deporte favorito, Expresarse sobre sus jugadores preferidos',
   'AF9', 'Janvier', 4, true),
  
  (v_subject_id, 'El medio ambiente', 'el-medio-ambiente',
   '🎯 Objectifs : Hablar del medio ambiente, Expresarse sobre su medio ambiente, Dar consejos',
   'AF9', 'Janvier', 5, true);

  -- Février
  INSERT INTO lessons (subject_id, title, slug, objectif, grade_level, mois, order_index, is_published) VALUES
  (v_subject_id, 'El acento de intensidad', 'el-acento-de-intensidad',
   '🎯 Objectifs : Pronunciar correctamente las palabras castellanas, Acentuar en la sílaba tónica, Poner el acento ortográfico',
   'AF9', 'Février', 6, true),
  
  (v_subject_id, 'Los sonidos', 'los-sonidos',
   '🎯 Objectifs : Pronunciar correctamente las palabras castellanas, Saber pronunciar c, qu, g, gu, j delante de las vocales',
   'AF9', 'Février', 7, true);

  -- Mars
  INSERT INTO lessons (subject_id, title, slug, objectif, grade_level, mois, order_index, is_published) VALUES
  (v_subject_id, 'El medio ambiente - Comprensión oral', 'medio-ambiente-comprension',
   '🎯 Objectifs : Comprender un texto registrado, Escuchar la grabación, Escoger las respuestas correctas',
   'AF9', 'Mars', 8, true),
  
  (v_subject_id, 'Las vacaciones', 'las-vacaciones',
   '🎯 Objectifs : Saber resumir un texto leído, Construir un resumen coherente, Restablecer la verdad',
   'AF9', 'Mars', 9, true),
  
  (v_subject_id, 'Actividades diarias', 'actividades-diarias',
   '🎯 Objectifs : Expresarse sobre unas actividades, Hacer preguntas acerca de actividades, Contestar sobre actividades cotidianas',
   'AF9', 'Mars', 10, true);

  -- Avril
  INSERT INTO lessons (subject_id, title, slug, objectif, grade_level, mois, order_index, is_published) VALUES
  (v_subject_id, 'Actividades de vacaciones', 'actividades-de-vacaciones',
   '🎯 Objectifs : Hablar de unas actividades, Contestar preguntas, Redactar sobre las vacaciones',
   'AF9', 'Avril', 11, true),
  
  (v_subject_id, 'La personalidad', 'la-personalidad',
   '🎯 Objectifs : Hablar de su personalidad, Decir cómo es, Decir cómo era, Hablar de sus sentimientos actuales',
   'AF9', 'Avril', 12, true),
  
  (v_subject_id, 'La gente', 'la-gente',
   '🎯 Objectifs : Expresar sus opiniones, Dar su opinión acerca de alguien, Responder a preguntas',
   'AF9', 'Avril', 13, true);

  -- Mai
  INSERT INTO lessons (subject_id, title, slug, objectif, grade_level, mois, order_index, is_published) VALUES
  (v_subject_id, 'Fiesta de cumpleaños', 'fiesta-de-cumpleanos',
   '🎯 Objectifs : Saber resumir un texto, Seleccionar lo esencial de una información, Contestar preguntas sobre el cumpleaños',
   'AF9', 'Mai', 14, true),
  
  (v_subject_id, 'La rutina diaria', 'la-rutina-diaria',
   '🎯 Objectifs : Hablar de la rutina diaria, Expresarse sobre lo que se hace regularmente, Saber decir la hora',
   'AF9', 'Mai', 15, true),
  
  (v_subject_id, 'La carta', 'la-carta',
   '🎯 Objectifs : Saber redactar una carta, Pedir una información, Fijar una cita',
   'AF9', 'Mai', 16, true);

  -- Juin
  INSERT INTO lessons (subject_id, title, slug, objectif, grade_level, mois, order_index, is_published) VALUES
  (v_subject_id, 'Retrato', 'retrato',
   '🎯 Objectifs : Hacer el retrato, Describir a una persona conocida',
   'AF9', 'Juin', 17, true),
  
  (v_subject_id, 'La probabilidad', 'la-probabilidad',
   '🎯 Objectifs : Expresar la probabilidad, Indicar la probabilidad en el presente, Indicar la probabilidad en el pasado',
   'AF9', 'Juin', 18, true),
  
  (v_subject_id, 'El fallecimiento', 'el-fallecimiento',
   '🎯 Objectifs : Producir en situación, Redactar cortos textos de pésame',
   'AF9', 'Juin', 19, true);

END $$;