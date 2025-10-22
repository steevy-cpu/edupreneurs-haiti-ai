-- Use existing Anglais subject and add lessons
DO $$
DECLARE
  v_subject_id uuid := '11991d6d-8c73-4df1-92ab-2a3ad38f10ea';
  v_creator_id uuid;
BEGIN
  -- Get creator ID
  SELECT user_id INTO v_creator_id FROM public.profiles WHERE nickname = 'DI' LIMIT 1;
  
  -- Update subject info
  UPDATE public.subjects
  SET grade_level = 'AF7',
      description = 'Vocabulaire, grammaire et conversation en anglais',
      icon_name = '🇬🇧'
  WHERE id = v_subject_id;
  
  -- Delete any existing lessons
  DELETE FROM public.lessons WHERE subject_id = v_subject_id;
  
  -- Insert all 23 lessons
  INSERT INTO public.lessons (subject_id, title, slug, objectif, introduction, contenu, exemples_exercices, grade_level, order_index, is_published, created_by)
  VALUES 
    -- December (3 lessons)
    (v_subject_id, 'Salutations et Présentations', 'salutations-presentations', 
     'L''élève sera capable d''exprimer correctement ses salutations et de réagir à une présentation',
     'Apprendre les formules de base pour saluer et se présenter en anglais',
     'Formules: Hi!, Good morning, Good afternoon. Se présenter: What''s your name? Who is this?',
     'Exercices: Questionnement oral ou écrit, simuler des situations de salutation',
     'AF7', 1, true, v_creator_id),
     
    (v_subject_id, 'Remerciements et Excuses', 'remerciements-excuses',
     'Réagir aux différentes formules de remerciement, dire au revoir et choisir la formule d''excuse',
     'Maîtriser les formules de politesse essentielles en anglais',
     'Remerciements: Thank you, Thanks a lot, You are welcome. Au revoir: Good bye. Excuses: Sorry, Pardon, I beg your pardon',
     'Exercices: Créer des dialogues, jeux de rôle en groupes',
     'AF7', 2, true, v_creator_id),
     
    (v_subject_id, 'Demande et Obtention d''Informations', 'demande-informations',
     'Formuler des demandes oralement pour se renseigner sur une personne, un animal, une chose ou un lieu',
     'Apprendre à poser des questions pour obtenir des informations',
     'Questions: What does he do for living? Where do you live? What is your name? How old are you?',
     'Exercices: Se poser des questions mutuellement, compléter des dialogues',
     'AF7', 3, true, v_creator_id),
     
    -- January (4 lessons)
    (v_subject_id, 'How Much / How Many - There is / There are', 'how-much-many',
     'Employer les noms comptables et non-comptables',
     'Comprendre la différence entre les noms comptables et non-comptables',
     'There is one book, There are two pens, There is much water, There are many cars. Nombres 0-100',
     'Exercices: Compléter avec les notions du contenu, identifier des objets',
     'AF7', 4, true, v_creator_id),
     
    (v_subject_id, 'Les Professions', 'professions',
     'Parler des métiers et des activités professionnelles',
     'Découvrir les différentes professions en anglais',
     'Professions: Lawyer, Engineer, Teacher, Electrician, Carpenter, Doctor, Nurse',
     'Exercices: Présenter des professions, quelle est ta profession de rêve?',
     'AF7', 5, true, v_creator_id),
     
    (v_subject_id, 'Les Voyages', 'voyages',
     'Lire, parler et discuter sur les modes de transport',
     'Explorer les différents types de voyages et moyens de transport',
     'Types: Voyage aérien, maritime, terrestre. Transport: Airplane, boat, car, bus, train, bicycle',
     'Exercices: Conversation en groupe sur les voyages, décrire son transport préféré',
     'AF7', 6, true, v_creator_id),
     
    (v_subject_id, 'Le Corps Humain et les Maladies', 'corps-maladies',
     'Identifier les parties du corps humain et dire comment on se sent',
     'Apprendre le vocabulaire du corps et exprimer les maux',
     'Corps: Body, head, stomach, neck, shoulder, foot, leg. Maladies: Fever, stomach ache, backache, flu',
     'Exercices: Compléter des phrases, dialogues "How do you feel?"',
     'AF7', 7, true, v_creator_id),
     
    -- February (2 lessons)
    (v_subject_id, 'Les Périodes de l''Année', 'periodes-annee',
     'Employer les périodes de l''année dans des situations déterminées',
     'Maîtriser le calendrier en anglais',
     'Jours: Monday-Sunday. Mois: January-December. Saisons: Spring, Summer, Fall/Autumn, Winter',
     'Exercices: Questionnement oral, créer un calendrier personnel',
     'AF7', 8, true, v_creator_id),
     
    (v_subject_id, 'Vêtements et Couleurs', 'vetements-couleurs',
     'Parler et identifier les types de vêtements et couleurs',
     'Enrichir son vocabulaire vestimentaire',
     'Vêtements: Dress, sweater, blouse, coat, pants. Couleurs: White, black, red, blue, pink, green',
     'Exercices: Décrire ce que portent tes parents',
     'AF7', 9, true, v_creator_id),
     
    -- March (4 lessons)
    (v_subject_id, 'Description Physique et Personnalité', 'description',
     'Décrire une personne, un animal, une chose',
     'Apprendre à décrire les personnes et les objets',
     'Questions: What does he like? (personnalité), What does he look like? (physique). Vocabulaire: Tall, short, nice, kind',
     'Exercices: Questionnement oral et écrit, prononcer correctement',
     'AF7', 10, true, v_creator_id),
     
    (v_subject_id, 'Le Logement', 'logement',
     'Identifier les parties de la maison et les objets',
     'Découvrir le vocabulaire de la maison',
     'Pièces: Dining room, bathroom, bedroom, kitchen. Meubles: Closet, armchair, bed, table, chair, sofa',
     'Exercices: Parler de sa maison de rêve, décrire sa chambre',
     'AF7', 11, true, v_creator_id),
     
    (v_subject_id, 'Les Articles et le Pluriel', 'articles-pluriel',
     'Employer les articles et former le pluriel des noms',
     'Maîtriser les règles grammaticales de base',
     'Articles: The, A, an. Pluriel: book→books, boy→boys, lady→ladies, mouse→mice, box→boxes',
     'Exercices: Transformer au pluriel, compléter avec articles',
     'AF7', 12, true, v_creator_id),
     
    (v_subject_id, 'Les Adjectifs et Synonymes', 'adjectifs-synonymes',
     'Utiliser les adjectifs et enrichir son vocabulaire',
     'Explorer les adjectifs et leurs synonymes',
     'Adjectifs: Long↔short, Big↔small. Synonymes: Fat=fleshy, Big=huge, Easy=manageable, Calm=quiet',
     'Exercices: Compléter avec adjectifs, trouver synonymes et antonymes',
     'AF7', 13, true, v_creator_id),
     
    -- April (3 lessons)
    (v_subject_id, 'Les Verbes TO BE et TO HAVE', 'be-have',
     'Utiliser les formes verbales de to be et to have au présent',
     'Maîtriser les verbes les plus importants en anglais',
     'TO BE: I am, you are, he/she/it is. Négatif: I am not, you are not. TO HAVE: I have, he/she has',
     'Exercices: Phrases affirmatives, négatives, interrogatives. Dialogues en paires',
     'AF7', 14, true, v_creator_id),
     
    (v_subject_id, 'Désirs et Préférences', 'desirs-preferences',
     'Exprimer ses intentions, préférences, goûts et désirs',
     'Apprendre à exprimer ce qu''on veut et aime',
     'Désirs: I would like to, I want to. Préférences: He prefers. Comparaisons: taller than, as old as',
     'Exercices: Exprimer ses désirs, faire des comparaisons',
     'AF7', 15, true, v_creator_id),
     
    (v_subject_id, 'Prépositions et Directions', 'prepositions-directions',
     'Utiliser les prépositions et donner des directions',
     'Savoir se repérer et donner des indications',
     'Prépositions: On, in, at, across, under, below, between. Directions: How can I get to...? Go straight, turn left/right',
     'Exercices: Inviter des camarades, donner des directions',
     'AF7', 16, true, v_creator_id),
     
    -- May (4 lessons)
    (v_subject_id, 'Aide et Clarification', 'aide-clarification',
     'Solliciter/offrir de l''aide et demander une clarification',
     'Apprendre à demander et offrir de l''aide',
     'Aide: Can you help me? Can I help you? Clarification: What do you mean? Garde: Look out! Watch out!',
     'Exercices: Jeux de rôle, simulations de situations',
     'AF7', 17, true, v_creator_id),
     
    (v_subject_id, 'Nourriture et Boissons', 'nourriture-boissons',
     'Identifier les types de nourriture et les utiliser',
     'Explorer le vocabulaire de l''alimentation',
     'Nourriture: Rice, corn, bread, cabbage, onions, eggplants, meat, fish. Boissons: Milk, juice, water, coffee, tea',
     'Exercices: Lire et répondre sur vidéo, décrire son repas préféré',
     'AF7', 18, true, v_creator_id),
     
    (v_subject_id, 'La Famille', 'famille',
     'Parler de sa famille et celle des autres',
     'Découvrir le vocabulaire de la famille',
     'Famille: Mother, father, brother, sister, grandmother, grandfather, aunt, uncle, cousin, son, daughter',
     'Exercices: Présenter l''arbre généalogique, répondre aux questions',
     'AF7', 19, true, v_creator_id),
     
    (v_subject_id, 'Adjectifs Possessifs', 'adjectifs-possessifs',
     'Utiliser les adjectifs possessifs relatifs aux pronoms sujets',
     'Maîtriser la possession en anglais',
     'Adjectifs: My, your, his, her, its, our, your, their. Exemples: My book, her pen, their house',
     'Exercices: Questionnement oral, identifier objets de la classe',
     'AF7', 20, true, v_creator_id),
     
    -- June (3 lessons)
    (v_subject_id, 'Pronoms Possessifs', 'pronoms-possessifs',
     'Utiliser les pronoms possessifs',
     'Distinguer adjectifs et pronoms possessifs',
     'Pronoms: Mine, yours, his, hers, its, ours, yours, theirs. Différence: This is my book = This book is mine',
     'Exercices: Questionnement oral, transformer des phrases',
     'AF7', 21, true, v_creator_id),
     
    (v_subject_id, 'L''Heure et Démonstratifs', 'heure-demonstratifs',
     'Dire l''heure et utiliser les adjectifs démonstratifs',
     'Maîtriser l''expression du temps et la désignation',
     'Heure: It''s seven o''clock, five past seven, quarter past, half past. Démonstratifs: This, these, that, those',
     'Exercices: Écrire les heures et prononcer, utiliser démonstratifs',
     'AF7', 22, true, v_creator_id),
     
    (v_subject_id, 'Forme Impérative et Intonation', 'forme-imperative',
     'Passer et exécuter des ordres, utiliser les accents toniques',
     'Maîtriser la forme impérative',
     'Impératif: Go to the board, Open your book, Close the door. Polies: Help me please, Give me something',
     'Exercices: Répondre aux questions, pratiquer prononciation et intonation',
     'AF7', 23, true, v_creator_id);
     
  -- Update lesson count
  UPDATE public.subjects
  SET lesson_count = 23
  WHERE id = v_subject_id;
  
END $$;