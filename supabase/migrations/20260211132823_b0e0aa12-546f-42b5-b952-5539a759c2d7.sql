CREATE OR REPLACE VIEW public.lesson_content_flags AS
SELECT 
  id,
  (objectif IS NOT NULL AND length(trim(objectif)) > 10 
    AND lower(trim(objectif)) NOT IN ('contenu à venir...', 'contenu a venir...')) AS has_objectif,
  (introduction IS NOT NULL AND length(trim(introduction)) > 10 
    AND lower(trim(introduction)) NOT IN ('contenu à venir...', 'contenu a venir...')) AS has_introduction,
  (contenu IS NOT NULL AND length(trim(contenu)) > 10 
    AND lower(trim(contenu)) NOT IN ('contenu à venir...', 'contenu a venir...')) AS has_contenu,
  (exemples_exercices IS NOT NULL AND length(trim(exemples_exercices)) > 10 
    AND lower(trim(exemples_exercices)) NOT IN ('exercices à venir...', 'exercices a venir...', 'contenu à venir...', 'contenu a venir...')) AS has_exemples,
  (quiz_final IS NOT NULL AND length(trim(quiz_final)) > 10) AS has_quiz,
  (activites_interactives IS NOT NULL AND length(trim(activites_interactives)) > 10) AS has_activities
FROM lessons;