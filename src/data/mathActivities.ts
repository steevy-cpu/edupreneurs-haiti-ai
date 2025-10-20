// Quiz questions for different math topics

// ===== ENSEMBLES (SETS) - New from MENFP =====
export const ensemblesQuiz = [
  {
    question: "Que signifie le symbole ∈ ?",
    options: ["Appartient à", "N'appartient pas à", "Est inclus dans", "Est égal à"],
    correctAnswer: 0,
    explanation: "Le symbole ∈ signifie 'appartient à'. Exemple : 3 ∈ {1, 2, 3} signifie '3 appartient à l'ensemble'"
  },
  {
    question: "Si A = {1, 2, 3} et B = {2, 3, 4, 5}, que vaut A ∪ B ?",
    options: ["{2, 3}", "{1, 2, 3, 4, 5}", "{1, 4, 5}", "{1, 2, 3, 2, 3, 4, 5}"],
    correctAnswer: 1,
    explanation: "A ∪ B (la réunion) est l'ensemble de tous les éléments qui sont dans A ou dans B : {1, 2, 3, 4, 5}"
  },
  {
    question: "Si A = {1, 2, 3, 4} et B = {3, 4, 5, 6}, que vaut A ∩ B ?",
    options: ["{3, 4}", "{1, 2, 5, 6}", "{1, 2, 3, 4, 5, 6}", "∅"],
    correctAnswer: 0,
    explanation: "A ∩ B (l'intersection) contient les éléments qui sont à la fois dans A et dans B : {3, 4}"
  },
  {
    question: "Si E = {1, 2, 3, 4, 5} et A = {1, 3, 5}, que vaut Ā (complément de A) ?",
    options: ["{2, 4}", "{1, 3, 5}", "{1, 2, 3, 4, 5}", "∅"],
    correctAnswer: 0,
    explanation: "Le complément Ā contient tous les éléments de E qui ne sont pas dans A : {2, 4}"
  },
  {
    question: "Que signifie A ⊂ B ?",
    options: ["A est inclus dans B", "A est égal à B", "A et B sont disjoints", "B est inclus dans A"],
    correctAnswer: 0,
    explanation: "A ⊂ B signifie que tous les éléments de A sont aussi dans B (A est un sous-ensemble de B)"
  },
  {
    question: "L'ensemble vide se note :",
    options: ["∅ ou { }", "{0}", "Ø", "{}"],
    correctAnswer: 0,
    explanation: "L'ensemble vide (sans aucun élément) se note ∅ ou { }"
  },
  {
    question: "Si A = {2, 4} et B = {1, 2, 3, 4, 5}, alors :",
    options: ["A ⊂ B", "B ⊂ A", "A = B", "A et B sont disjoints"],
    correctAnswer: 0,
    explanation: "Tous les éléments de A (2 et 4) sont dans B, donc A ⊂ B"
  },
  {
    question: "Dans une classe, 20 élèves aiment le foot et 15 aiment le basket. 8 aiment les deux. Combien aiment au moins un sport ?",
    options: ["27", "35", "28", "23"],
    correctAnswer: 0,
    explanation: "Utilise la formule : |F ∪ B| = |F| + |B| - |F ∩ B| = 20 + 15 - 8 = 27 élèves"
  },
  {
    question: "Le lien logique 'ET' correspond à quelle opération ?",
    options: ["Intersection (∩)", "Réunion (∪)", "Complément", "Inclusion"],
    correctAnswer: 0,
    explanation: "'x est dans A ET dans B' signifie x ∈ A ∩ B (intersection)"
  },
  {
    question: "Si tous les éléments de A sont aussi dans B, on écrit :",
    options: ["A ⊂ B", "A ∪ B", "A ∩ B", "Ā"],
    correctAnswer: 0,
    explanation: "Si tous les éléments de A sont dans B, alors A est inclus dans B, noté A ⊂ B"
  }
];

export const ensemblesMatching = [
  {
    id: "1",
    question: "A ∪ B",
    answer: "Réunion"
  },
  {
    id: "2",
    question: "A ∩ B",
    answer: "Intersection"
  },
  {
    id: "3",
    question: "∈",
    answer: "Appartient à"
  },
  {
    id: "4",
    question: "⊂",
    answer: "Inclus dans"
  },
  {
    id: "5",
    question: "Ā",
    answer: "Complément"
  },
  {
    id: "6",
    question: "∅",
    answer: "Ensemble vide"
  },
  {
    id: "7",
    question: "ET logique",
    answer: "Intersection"
  },
  {
    id: "8",
    question: "OU logique",
    answer: "Réunion"
  }
];

// ===== PLANS ET DROITES (PLANES AND LINES) - New from MENFP =====
export const plansDroitesQuiz = [
  {
    question: "Qu'est-ce qu'une droite ?",
    options: ["Une ligne infinie dans les deux sens", "Une ligne qui s'arrête", "Un point", "Un cercle"],
    correctAnswer: 0,
    explanation: "Une droite est une ligne droite qui s'étend à l'infini dans les deux directions"
  },
  {
    question: "Qu'est-ce qu'un segment ?",
    options: ["Une portion de droite limitée par deux points", "Une droite infinie", "Un demi-plan", "Un point"],
    correctAnswer: 0,
    explanation: "Un segment [AB] est la portion de droite entre les points A et B, incluant ces points"
  },
  {
    question: "Deux droites qui ne se coupent jamais sont :",
    options: ["Parallèles", "Perpendiculaires", "Sécantes", "Confondues"],
    correctAnswer: 0,
    explanation: "Des droites parallèles ne se rencontrent jamais, même si on les prolonge à l'infini"
  },
  {
    question: "Deux droites perpendiculaires forment un angle de :",
    options: ["90°", "180°", "45°", "60°"],
    correctAnswer: 0,
    explanation: "Des droites perpendiculaires se coupent en formant un angle droit de 90°"
  },
  {
    question: "La médiatrice d'un segment est :",
    options: ["La droite perpendiculaire au segment en son milieu", "Le milieu du segment", "Une droite parallèle", "Un point"],
    correctAnswer: 0,
    explanation: "La médiatrice d'un segment [AB] est la droite perpendiculaire à [AB] passant par son milieu"
  },
  {
    question: "Le milieu d'un segment [AB] :",
    options: ["Partage le segment en deux parties égales", "Est à l'extrémité", "Est sur la médiatrice", "Est parallèle"],
    correctAnswer: 0,
    explanation: "Le milieu M d'un segment [AB] vérifie AM = MB (deux moitiés égales)"
  },
  {
    question: "Trois points A, B, C sont alignés si :",
    options: ["Ils sont sur une même droite", "Ils forment un triangle", "Ils sont perpendiculaires", "Ils sont parallèles"],
    correctAnswer: 0,
    explanation: "Des points alignés sont tous sur la même droite"
  },
  {
    question: "Une demi-droite a :",
    options: ["Une origine et s'étend à l'infini dans un sens", "Deux extrémités", "Pas d'origine", "Une longueur finie"],
    correctAnswer: 0,
    explanation: "Une demi-droite [AB) commence en A (origine) et passe par B pour s'étendre à l'infini"
  },
  {
    question: "La distance entre deux points A et B est :",
    options: ["La longueur du segment [AB]", "La droite (AB)", "Le milieu de [AB]", "Une perpendiculaire"],
    correctAnswer: 0,
    explanation: "La distance entre A et B est la longueur du segment [AB], notée AB"
  },
  {
    question: "Deux droites sécantes :",
    options: ["Se coupent en un point", "Ne se coupent jamais", "Sont confondues", "Sont parallèles"],
    correctAnswer: 0,
    explanation: "Des droites sécantes se croisent en un seul point"
  }
];

export const plansDroitesMatching = [
  {
    id: "1",
    question: "Droite infinie",
    answer: "(AB)"
  },
  {
    id: "2",
    question: "Segment limité",
    answer: "[AB]"
  },
  {
    id: "3",
    question: "Demi-droite",
    answer: "[AB)"
  },
  {
    id: "4",
    question: "Ne se coupent jamais",
    answer: "Parallèles"
  },
  {
    id: "5",
    question: "Angle de 90°",
    answer: "Perpendiculaires"
  },
  {
    id: "6",
    question: "Milieu d'un segment",
    answer: "Partage en 2 égales"
  },
  {
    id: "7",
    question: "Points sur même droite",
    answer: "Alignés"
  },
  {
    id: "8",
    question: "Se croisent",
    answer: "Sécantes"
  }
];

// ===== NOMBRES NATURELS (NATURAL NUMBERS) - New from MENFP =====
export const nombresNaturelsQuiz = [
  {
    question: "Calcule : 15 + 27 × 3",
    options: ["96", "126", "45", "81"],
    correctAnswer: 0,
    explanation: "On fait d'abord la multiplication : 27 × 3 = 81, puis l'addition : 15 + 81 = 96"
  },
  {
    question: "Quel est le résultat de 2³ ?",
    options: ["8", "6", "9", "5"],
    correctAnswer: 0,
    explanation: "2³ = 2 × 2 × 2 = 8 (2 multiplié par lui-même 3 fois)"
  },
  {
    question: "Calcule : (8 + 2) × 5",
    options: ["50", "18", "40", "48"],
    correctAnswer: 0,
    explanation: "Les parenthèses en premier : 8 + 2 = 10, puis 10 × 5 = 50"
  },
  {
    question: "Quelle est la règle de priorité correcte ?",
    options: ["Parenthèses, Puissances, × et ÷, + et -", "+ et - d'abord", "De gauche à droite", "× et ÷ en dernier"],
    correctAnswer: 0,
    explanation: "PEMDAS : Parenthèses, Exposants (puissances), Multiplication/Division, Addition/Soustraction"
  },
  {
    question: "Calcule : 100 ÷ 4 + 6",
    options: ["31", "25", "10", "106"],
    correctAnswer: 0,
    explanation: "Division d'abord : 100 ÷ 4 = 25, puis addition : 25 + 6 = 31"
  },
  {
    question: "Que vaut 5² × 2 ?",
    options: ["50", "52", "100", "20"],
    correctAnswer: 0,
    explanation: "Puissance d'abord : 5² = 25, puis multiplication : 25 × 2 = 50"
  },
  {
    question: "Simplifie : 12 + 8 - 5 + 3",
    options: ["18", "28", "16", "15"],
    correctAnswer: 0,
    explanation: "De gauche à droite : 12 + 8 = 20, puis 20 - 5 = 15, puis 15 + 3 = 18"
  },
  {
    question: "Calcule : 3 × (4 + 2) - 6",
    options: ["12", "18", "6", "24"],
    correctAnswer: 0,
    explanation: "Parenthèses : 4 + 2 = 6, puis 3 × 6 = 18, enfin 18 - 6 = 12"
  },
  {
    question: "Que vaut 10³ ?",
    options: ["1000", "30", "100", "300"],
    correctAnswer: 0,
    explanation: "10³ = 10 × 10 × 10 = 1000"
  },
  {
    question: "Calcule : 20 - 3 × 4",
    options: ["8", "68", "80", "12"],
    correctAnswer: 0,
    explanation: "Multiplication d'abord : 3 × 4 = 12, puis soustraction : 20 - 12 = 8"
  }
];

export const nombresNaturelsMatching = [
  {
    id: "1",
    question: "2³",
    answer: "8"
  },
  {
    id: "2",
    question: "5²",
    answer: "25"
  },
  {
    id: "3",
    question: "10²",
    answer: "100"
  },
  {
    id: "4",
    question: "3⁴",
    answer: "81"
  },
  {
    id: "5",
    question: "4² + 3²",
    answer: "25"
  },
  {
    id: "6",
    question: "(2+3) × 4",
    answer: "20"
  },
  {
    id: "7",
    question: "20 ÷ 4 + 1",
    answer: "6"
  },
  {
    id: "8",
    question: "2 × 3²",
    answer: "18"
  }
];

// ===== POLYGONES =====
export const polygonesQuiz = [
  {
    question: "Qu'est-ce qu'un polygone ?",
    options: ["Une figure fermée avec des côtés droits", "Un cercle", "Une ligne courbe", "Un point"],
    correctAnswer: 0,
    explanation: "Un polygone est une figure plane fermée formée par une ligne brisée (côtés droits)"
  },
  {
    question: "Combien de côtés possède un pentagone ?",
    options: ["5", "6", "7", "4"],
    correctAnswer: 0,
    explanation: "Un pentagone a 5 côtés et 5 angles"
  },
  {
    question: "Quelle est la somme des angles d'un triangle ?",
    options: ["180°", "360°", "90°", "270°"],
    correctAnswer: 0,
    explanation: "La somme des angles intérieurs d'un triangle est toujours 180°"
  },
  {
    question: "Un hexagone régulier a combien de côtés égaux ?",
    options: ["6", "5", "7", "8"],
    correctAnswer: 0,
    explanation: "Un hexagone a 6 côtés, et s'il est régulier, tous les côtés sont égaux"
  },
  {
    question: "Quel polygone a 4 côtés ?",
    options: ["Quadrilatère", "Triangle", "Pentagone", "Hexagone"],
    correctAnswer: 0,
    explanation: "Un quadrilatère est un polygone à 4 côtés (carré, rectangle, losange, etc.)"
  },
  {
    question: "Quelle est la somme des angles d'un quadrilatère ?",
    options: ["360°", "180°", "270°", "450°"],
    correctAnswer: 0,
    explanation: "La somme des angles intérieurs de tout quadrilatère est 360°"
  },
  {
    question: "Un polygone régulier a :",
    options: ["Tous ses côtés et angles égaux", "Seulement côtés égaux", "Seulement angles égaux", "Aucune propriété particulière"],
    correctAnswer: 0,
    explanation: "Un polygone régulier a tous ses côtés de même longueur ET tous ses angles égaux"
  },
  {
    question: "Combien de diagonales peut-on tracer depuis un sommet d'un pentagone ?",
    options: ["2", "3", "4", "5"],
    correctAnswer: 0,
    explanation: "Dans un pentagone, depuis un sommet on peut tracer 2 diagonales (on ne compte pas les côtés adjacents)"
  },
  {
    question: "Un octogone a combien de côtés ?",
    options: ["8", "6", "10", "7"],
    correctAnswer: 0,
    explanation: "Un octogone est un polygone à 8 côtés"
  },
  {
    question: "Le périmètre d'un polygone est :",
    options: ["La somme de tous ses côtés", "L'aire de la surface", "Le nombre d'angles", "La longueur d'un côté"],
    correctAnswer: 0,
    explanation: "Le périmètre est la longueur totale du contour, donc la somme de tous les côtés"
  }
];

export const polygonesMatching = [
  {
    id: "1",
    question: "3 côtés",
    answer: "Triangle"
  },
  {
    id: "2",
    question: "4 côtés",
    answer: "Quadrilatère"
  },
  {
    id: "3",
    question: "5 côtés",
    answer: "Pentagone"
  },
  {
    id: "4",
    question: "6 côtés",
    answer: "Hexagone"
  },
  {
    id: "5",
    question: "8 côtés",
    answer: "Octogone"
  }
];

// ===== NUMÉRATION BINAIRE =====
export const numerationBinaireQuiz = [
  {
    question: "En binaire, combien de chiffres différents utilise-t-on ?",
    options: ["2 (0 et 1)", "10 (0 à 9)", "8 (0 à 7)", "16 (0 à F)"],
    correctAnswer: 0,
    explanation: "Le système binaire utilise seulement deux chiffres: 0 et 1"
  },
  {
    question: "Que vaut le nombre binaire 101 en décimal ?",
    options: ["5", "3", "4", "6"],
    correctAnswer: 0,
    explanation: "101 en binaire = 1×4 + 0×2 + 1×1 = 4 + 0 + 1 = 5 en décimal"
  },
  {
    question: "Comment écrit-on le nombre décimal 8 en binaire ?",
    options: ["1000", "1001", "111", "100"],
    correctAnswer: 0,
    explanation: "8 en décimal = 1000 en binaire (1×8 + 0×4 + 0×2 + 0×1)"
  },
  {
    question: "Calculer: 11 + 10 en binaire",
    options: ["101", "110", "111", "100"],
    correctAnswer: 0,
    explanation: "11 (3) + 10 (2) = 101 (5 en décimal). En binaire: 1+0=1, 1+1=10 (on retient 1)"
  },
  {
    question: "Que vaut 1111 en binaire en décimal ?",
    options: ["15", "16", "14", "7"],
    correctAnswer: 0,
    explanation: "1111 = 1×8 + 1×4 + 1×2 + 1×1 = 8 + 4 + 2 + 1 = 15"
  },
  {
    question: "Le nombre décimal 4 s'écrit en binaire :",
    options: ["100", "101", "110", "011"],
    correctAnswer: 0,
    explanation: "4 = 1×4 + 0×2 + 0×1 = 100 en binaire"
  },
  {
    question: "Calculer: 10 - 1 en binaire",
    options: ["1", "10", "11", "0"],
    correctAnswer: 0,
    explanation: "10 (2) - 1 (1) = 1 (1 en décimal)"
  },
  {
    question: "Quelle est la valeur de position du chiffre le plus à droite en binaire ?",
    options: ["1", "2", "4", "0"],
    correctAnswer: 0,
    explanation: "Le chiffre le plus à droite représente les unités (2⁰ = 1)"
  },
  {
    question: "Le nombre binaire 110 vaut en décimal :",
    options: ["6", "5", "7", "3"],
    correctAnswer: 0,
    explanation: "110 = 1×4 + 1×2 + 0×1 = 4 + 2 + 0 = 6"
  },
  {
    question: "Combien vaut 2⁴ ?",
    options: ["16", "8", "4", "32"],
    correctAnswer: 0,
    explanation: "2⁴ = 2×2×2×2 = 16"
  }
];

export const numerationBinaireMatching = [
  {
    id: "1",
    question: "1 en binaire",
    answer: "1"
  },
  {
    id: "2",
    question: "2 en binaire",
    answer: "10"
  },
  {
    id: "3",
    question: "3 en binaire",
    answer: "11"
  },
  {
    id: "4",
    question: "4 en binaire",
    answer: "100"
  },
  {
    id: "5",
    question: "101 en décimal",
    answer: "5"
  }
];

// ===== UNITÉS DE MESURES =====
export const unitesMesuresQuiz = [
  {
    question: "Combien de centimètres dans 1 mètre ?",
    options: ["100 cm", "10 cm", "1000 cm", "50 cm"],
    correctAnswer: 0,
    explanation: "1 mètre = 100 centimètres"
  },
  {
    question: "Convertir 2,5 km en mètres",
    options: ["2500 m", "250 m", "25 m", "25000 m"],
    correctAnswer: 0,
    explanation: "1 km = 1000 m, donc 2,5 km = 2,5 × 1000 = 2500 m"
  },
  {
    question: "1 litre équivaut à :",
    options: ["1000 mL", "100 mL", "10 mL", "500 mL"],
    correctAnswer: 0,
    explanation: "1 litre = 1000 millilitres"
  },
  {
    question: "Combien de grammes dans 1 kilogramme ?",
    options: ["1000 g", "100 g", "10 g", "500 g"],
    correctAnswer: 0,
    explanation: "1 kilogramme = 1000 grammes"
  },
  {
    question: "Convertir 5000 mètres en kilomètres",
    options: ["5 km", "50 km", "0,5 km", "500 km"],
    correctAnswer: 0,
    explanation: "5000 m ÷ 1000 = 5 km"
  },
  {
    question: "1 mètre carré (m²) contient combien de centimètres carrés ?",
    options: ["10000 cm²", "100 cm²", "1000 cm²", "200 cm²"],
    correctAnswer: 0,
    explanation: "1 m = 100 cm, donc 1 m² = 100 × 100 = 10000 cm²"
  },
  {
    question: "Quelle est l'unité de base pour mesurer la masse ?",
    options: ["Kilogramme (kg)", "Gramme (g)", "Tonne (t)", "Livre (lb)"],
    correctAnswer: 0,
    explanation: "Le kilogramme est l'unité de base du système international pour la masse"
  },
  {
    question: "Convertir 3,2 kg en grammes",
    options: ["3200 g", "320 g", "32 g", "32000 g"],
    correctAnswer: 0,
    explanation: "3,2 kg × 1000 = 3200 g"
  },
  {
    question: "1 décimètre équivaut à :",
    options: ["10 cm", "100 cm", "1 cm", "1000 cm"],
    correctAnswer: 0,
    explanation: "1 décimètre = 10 centimètres"
  },
  {
    question: "Combien de millimètres dans 5 centimètres ?",
    options: ["50 mm", "5 mm", "500 mm", "0,5 mm"],
    correctAnswer: 0,
    explanation: "1 cm = 10 mm, donc 5 cm = 5 × 10 = 50 mm"
  }
];

export const unitesMesuresMatching = [
  {
    id: "1",
    question: "1 km en m",
    answer: "1000 m"
  },
  {
    id: "2",
    question: "1 L en mL",
    answer: "1000 mL"
  },
  {
    id: "3",
    question: "1 kg en g",
    answer: "1000 g"
  },
  {
    id: "4",
    question: "1 m en cm",
    answer: "100 cm"
  },
  {
    id: "5",
    question: "1 cm en mm",
    answer: "10 mm"
  }
];

// ===== DIVISIBILITÉ =====
export const divisibiliteQuiz = [
  {
    question: "Un nombre est divisible par 2 s'il :",
    options: ["Se termine par 0, 2, 4, 6 ou 8", "Se termine par 5", "Est impair", "Se termine par 1"],
    correctAnswer: 0,
    explanation: "Un nombre pair (terminant par 0, 2, 4, 6 ou 8) est divisible par 2"
  },
  {
    question: "Le nombre 45 est-il divisible par 3 ?",
    options: ["Oui", "Non", "Impossible à déterminer", "Parfois"],
    correctAnswer: 0,
    explanation: "45 est divisible par 3 car 4 + 5 = 9, et 9 est divisible par 3"
  },
  {
    question: "Un nombre est divisible par 5 s'il se termine par :",
    options: ["0 ou 5", "2 ou 5", "1 ou 5", "3 ou 5"],
    correctAnswer: 0,
    explanation: "Un nombre est divisible par 5 s'il se termine par 0 ou 5"
  },
  {
    question: "Pour vérifier si un nombre est divisible par 3, on doit :",
    options: ["Additionner ses chiffres", "Le diviser par 3", "Regarder le dernier chiffre", "Le multiplier par 3"],
    correctAnswer: 0,
    explanation: "Si la somme des chiffres est divisible par 3, alors le nombre l'est aussi"
  },
  {
    question: "Le nombre 120 est divisible par :",
    options: ["2, 3, 4, 5 et 10", "Seulement 2 et 5", "Seulement 3", "Aucun de ces nombres"],
    correctAnswer: 0,
    explanation: "120 est pair (÷2), 1+2+0=3 (÷3), 20 est divisible par 4 (÷4), termine par 0 (÷5 et ÷10)"
  },
  {
    question: "Un nombre est divisible par 10 s'il :",
    options: ["Se termine par 0", "Se termine par 5", "Est pair", "Somme des chiffres = 10"],
    correctAnswer: 0,
    explanation: "Un nombre est divisible par 10 s'il se termine par 0"
  },
  {
    question: "Pour qu'un nombre soit divisible par 4, il faut que :",
    options: ["Ses deux derniers chiffres forment un nombre divisible par 4", "Il soit pair", "Il se termine par 4", "La somme de ses chiffres soit divisible par 4"],
    correctAnswer: 0,
    explanation: "On regarde les deux derniers chiffres: s'ils forment un nombre divisible par 4, le nombre entier l'est aussi"
  },
  {
    question: "Le nombre 72 est-il divisible par 9 ?",
    options: ["Oui", "Non", "Impossible", "Parfois"],
    correctAnswer: 0,
    explanation: "72 est divisible par 9 car 7 + 2 = 9, et 9 est divisible par 9"
  },
  {
    question: "Un nombre divisible par 2 ET par 3 est aussi divisible par :",
    options: ["6", "5", "7", "8"],
    correctAnswer: 0,
    explanation: "Si un nombre est divisible par 2 et par 3, il est forcément divisible par 6 (2×3)"
  },
  {
    question: "Le critère de divisibilité par 11 utilise :",
    options: ["La différence entre sommes alternées", "Le dernier chiffre", "La somme totale", "Le produit des chiffres"],
    correctAnswer: 0,
    explanation: "Pour 11: on fait la différence entre la somme des chiffres de rang impair et pair"
  }
];

export const divisibiliteMatching = [
  {
    id: "1",
    question: "Divisible par 2",
    answer: "Nombre pair"
  },
  {
    id: "2",
    question: "Divisible par 5",
    answer: "Termine par 0 ou 5"
  },
  {
    id: "3",
    question: "Divisible par 10",
    answer: "Termine par 0"
  },
  {
    id: "4",
    question: "Divisible par 3",
    answer: "Somme des chiffres ÷ 3"
  },
  {
    id: "5",
    question: "Divisible par 9",
    answer: "Somme des chiffres ÷ 9"
  }
];

// ===== FRACTIONS =====
export const fractionsQuiz = [
  {
    question: "Quelle est la forme simplifiée de 12/18 ?",
    options: ["2/3", "3/4", "6/9", "4/6"],
    correctAnswer: 0,
    explanation: "Pour simplifier 12/18, on divise le numérateur et le dénominateur par leur PGCD qui est 6: 12÷6 = 2 et 18÷6 = 3"
  },
  {
    question: "Calculer: 1/2 + 1/3",
    options: ["2/5", "5/6", "3/6", "4/6"],
    correctAnswer: 1,
    explanation: "Pour additionner, trouver un dénominateur commun: 1/2 = 3/6 et 1/3 = 2/6, donc 3/6 + 2/6 = 5/6"
  },
  {
    question: "Quelle fraction représente la moitié de 3/4 ?",
    options: ["3/8", "3/2", "1/4", "6/4"],
    correctAnswer: 0,
    explanation: "La moitié de 3/4 = (3/4) ÷ 2 = (3/4) × (1/2) = 3/8"
  },
  {
    question: "Calculer: 2/5 × 3/4",
    options: ["6/20", "5/9", "6/9", "3/10"],
    correctAnswer: 0,
    explanation: "On multiplie les numérateurs entre eux et les dénominateurs entre eux: (2×3)/(5×4) = 6/20 = 3/10 simplifié"
  },
  {
    question: "Quelle est la fraction équivalente à 2/3 ?",
    options: ["4/6", "3/4", "2/5", "1/2"],
    correctAnswer: 0,
    explanation: "2/3 = 4/6 car on multiplie numérateur et dénominateur par 2: (2×2)/(3×2) = 4/6"
  },
  {
    question: "Si tu manges 2/8 d'une pizza, quelle fraction simplifiée as-tu mangée ?",
    options: ["1/4", "1/2", "2/4", "4/8"],
    correctAnswer: 0,
    explanation: "2/8 simplifié en divisant par 2: 2÷2 = 1 et 8÷2 = 4, donc 1/4"
  },
  {
    question: "Calculer: 3/4 - 1/2",
    options: ["1/4", "2/4", "1/2", "2/2"],
    correctAnswer: 0,
    explanation: "3/4 - 1/2 = 3/4 - 2/4 = 1/4 (on met au même dénominateur d'abord)"
  },
  {
    question: "Quelle fraction est la plus grande: 2/3 ou 3/5 ?",
    options: ["2/3", "3/5", "Elles sont égales", "Impossible à comparer"],
    correctAnswer: 0,
    explanation: "En mettant au même dénominateur: 2/3 = 10/15 et 3/5 = 9/15, donc 2/3 > 3/5"
  },
  {
    question: "Calculer: 4/5 ÷ 2/3",
    options: ["6/5", "8/15", "12/10", "2/15"],
    correctAnswer: 0,
    explanation: "Diviser par une fraction = multiplier par son inverse: 4/5 × 3/2 = 12/10 = 6/5"
  },
  {
    question: "Si 1/4 d'une classe est absente et la classe compte 32 élèves, combien sont absents ?",
    options: ["8 élèves", "4 élèves", "16 élèves", "12 élèves"],
    correctAnswer: 0,
    explanation: "1/4 de 32 = 32 ÷ 4 = 8 élèves absents"
  }
];

export const fractionsMatching = [
  {
    id: "1",
    question: "1/2 + 1/4",
    answer: "3/4"
  },
  {
    id: "2",
    question: "3/4 × 2/3",
    answer: "1/2"
  },
  {
    id: "3",
    question: "Simplifier 6/8",
    answer: "3/4"
  },
  {
    id: "4",
    question: "2/3 - 1/6",
    answer: "1/2"
  },
  {
    id: "5",
    question: "1/2 ÷ 2",
    answer: "1/4"
  }
];

// ===== NOMBRES RELATIFS =====
export const nombresRelatifsQuiz = [
  {
    question: "Quel est le résultat de -5 + 8 ?",
    options: ["3", "-3", "13", "-13"],
    correctAnswer: 0,
    explanation: "Pour additionner des nombres de signes différents, on soustrait les valeurs absolues et on garde le signe du plus grand: 8 - 5 = 3"
  },
  {
    question: "Quel est le résultat de -3 × -4 ?",
    options: ["-12", "12", "-7", "7"],
    correctAnswer: 1,
    explanation: "Un nombre négatif multiplié par un nombre négatif donne un nombre positif: -3 × -4 = 12"
  },
  {
    question: "Calculer: 7 - 10",
    options: ["3", "-3", "17", "-17"],
    correctAnswer: 1,
    explanation: "Quand on soustrait un nombre plus grand, le résultat est négatif: 7 - 10 = -3"
  },
  {
    question: "Quel est le résultat de -2 × 5 ?",
    options: ["10", "-10", "7", "-7"],
    correctAnswer: 1,
    explanation: "Un nombre négatif multiplié par un nombre positif donne un nombre négatif: -2 × 5 = -10"
  },
  {
    question: "Si on range les nombres -5, 3, -2, 7, 0 du plus petit au plus grand:",
    options: ["-5, -2, 0, 3, 7", "7, 3, 0, -2, -5", "-2, -5, 0, 3, 7", "0, -2, -5, 3, 7"],
    correctAnswer: 0,
    explanation: "Les nombres négatifs sont plus petits que zéro. Plus un nombre négatif a une grande valeur absolue, plus il est petit."
  },
  {
    question: "Le résultat de (-4) + (-6) est:",
    options: ["-10", "10", "-2", "2"],
    correctAnswer: 0,
    explanation: "Quand on additionne deux nombres négatifs, on additionne leurs valeurs absolues et on garde le signe négatif: -4 + (-6) = -10"
  },
  {
    question: "Calculer: -12 ÷ -3",
    options: ["4", "-4", "9", "-9"],
    correctAnswer: 0,
    explanation: "Négatif divisé par négatif = positif: -12 ÷ -3 = 4"
  },
  {
    question: "Quel est l'opposé de -7 ?",
    options: ["7", "-7", "0", "14"],
    correctAnswer: 0,
    explanation: "L'opposé d'un nombre négatif est le nombre positif correspondant: opposé de -7 = 7"
  },
  {
    question: "La température était -3°C. Elle a augmenté de 8°C. Quelle est la nouvelle température ?",
    options: ["5°C", "-5°C", "11°C", "-11°C"],
    correctAnswer: 0,
    explanation: "-3 + 8 = 5°C"
  },
  {
    question: "Calculer: 0 × -15",
    options: ["-15", "15", "0", "Impossible"],
    correctAnswer: 2,
    explanation: "Zéro multiplié par n'importe quel nombre donne toujours zéro"
  }
];

export const nombresRelatifsMatching = [
  {
    id: "1",
    question: "5 + (-3)",
    answer: "2"
  },
  {
    id: "2",
    question: "-2 × 4",
    answer: "-8"
  },
  {
    id: "3",
    question: "10 - 15",
    answer: "-5"
  },
  {
    id: "4",
    question: "-3 × -3",
    answer: "9"
  },
  {
    id: "5",
    question: "0 × -7",
    answer: "0"
  }
];

export const nombresRelatifsDragDrop = [-8, -3, 0, 5, 12, 20];

// ===== PROPORTIONNALITÉ =====
export const proportionnaliteQuiz = [
  {
    question: "Si 3 cahiers coûtent 90 HTG, combien coûtent 5 cahiers ?",
    options: ["150 HTG", "120 HTG", "180 HTG", "135 HTG"],
    correctAnswer: 0,
    explanation: "Prix unitaire: 90÷3 = 30 HTG par cahier. Pour 5 cahiers: 30×5 = 150 HTG"
  },
  {
    question: "Un véhicule roule à 60 km/h. Quelle distance parcourt-il en 3 heures ?",
    options: ["180 km", "20 km", "63 km", "240 km"],
    correctAnswer: 0,
    explanation: "Distance = Vitesse × Temps = 60 × 3 = 180 km"
  },
  {
    question: "Calculer 25% de 200",
    options: ["50", "25", "75", "100"],
    correctAnswer: 0,
    explanation: "25% de 200 = (25/100) × 200 = 0,25 × 200 = 50"
  },
  {
    question: "Sur une carte, 2 cm représentent 10 km. Que représentent 5 cm ?",
    options: ["25 km", "20 km", "15 km", "30 km"],
    correctAnswer: 0,
    explanation: "Échelle: 1 cm = 5 km, donc 5 cm = 5 × 5 = 25 km"
  },
  {
    question: "Une recette pour 4 personnes nécessite 2 tasses de farine. Combien pour 6 personnes ?",
    options: ["3 tasses", "4 tasses", "2,5 tasses", "3,5 tasses"],
    correctAnswer: 0,
    explanation: "Par personne: 2÷4 = 0,5 tasse. Pour 6: 0,5×6 = 3 tasses"
  },
  {
    question: "Un article à 80 HTG est soldé à -20%. Quel est le nouveau prix ?",
    options: ["64 HTG", "60 HTG", "72 HTG", "68 HTG"],
    correctAnswer: 0,
    explanation: "Réduction: 20% de 80 = 16 HTG. Nouveau prix: 80 - 16 = 64 HTG (ou 80 × 0,80 = 64)"
  },
  {
    question: "Si 5 ouvriers construisent un mur en 10 jours, combien de jours pour 10 ouvriers ?",
    options: ["5 jours", "20 jours", "10 jours", "15 jours"],
    correctAnswer: 0,
    explanation: "Plus d'ouvriers = moins de temps (proportionnalité inverse): 10 ouvriers (×2) = 10÷2 = 5 jours"
  },
  {
    question: "Quelle est la valeur de x dans: 3/6 = x/10 ?",
    options: ["5", "4", "6", "3"],
    correctAnswer: 0,
    explanation: "Produit en croix: 3×10 = 6×x → 30 = 6x → x = 5"
  },
  {
    question: "Un robinet remplit un réservoir en 4 heures. Quelle fraction se remplit en 1 heure ?",
    options: ["1/4", "1/2", "1/3", "4"],
    correctAnswer: 0,
    explanation: "En 1 heure, il remplit 1/4 du réservoir (4 heures = tout le réservoir)"
  },
  {
    question: "Si 1 dollar = 140 HTG, combien vaut 3,5 dollars ?",
    options: ["490 HTG", "420 HTG", "480 HTG", "500 HTG"],
    correctAnswer: 0,
    explanation: "3,5 × 140 = 490 HTG"
  }
];

export const proportionnaliteMatching = [
  {
    id: "1",
    question: "20% de 50",
    answer: "10"
  },
  {
    id: "2",
    question: "3 stylos = 45 HTG, 1 stylo = ?",
    answer: "15 HTG"
  },
  {
    id: "3",
    question: "60 km/h × 2h",
    answer: "120 km"
  },
  {
    id: "4",
    question: "1/2 de 100",
    answer: "50"
  },
  {
    id: "5",
    question: "4/x = 2/3, x = ?",
    answer: "6"
  }
];

// ===== GÉOMÉTRIE =====
export const geometrieQuiz = [
  {
    question: "Quelle est la somme des angles dans un triangle ?",
    options: ["180°", "360°", "90°", "270°"],
    correctAnswer: 0,
    explanation: "La somme des angles d'un triangle est toujours égale à 180°"
  },
  {
    question: "Dans un triangle, un angle mesure 50° et un autre 70°. Quelle est la mesure du troisième angle ?",
    options: ["60°", "50°", "80°", "70°"],
    correctAnswer: 0,
    explanation: "180° - 50° - 70° = 60°"
  },
  {
    question: "Un rectangle a une longueur de 8 cm et une largeur de 5 cm. Quel est son périmètre ?",
    options: ["26 cm", "40 cm", "13 cm", "24 cm"],
    correctAnswer: 0,
    explanation: "Périmètre = 2 × (longueur + largeur) = 2 × (8 + 5) = 2 × 13 = 26 cm"
  },
  {
    question: "Quelle est l'aire d'un carré de côté 6 cm ?",
    options: ["36 cm²", "24 cm²", "12 cm²", "18 cm²"],
    correctAnswer: 0,
    explanation: "Aire du carré = côté × côté = 6 × 6 = 36 cm²"
  },
  {
    question: "Quel type d'angle mesure exactement 90° ?",
    options: ["Angle droit", "Angle aigu", "Angle obtus", "Angle plat"],
    correctAnswer: 0,
    explanation: "Un angle droit mesure exactement 90°"
  },
  {
    question: "Un triangle isocèle a un angle au sommet de 40°. Quelle est la mesure de chaque angle à la base ?",
    options: ["70°", "80°", "60°", "50°"],
    correctAnswer: 0,
    explanation: "Les 2 angles à la base sont égaux: (180° - 40°) ÷ 2 = 140° ÷ 2 = 70°"
  },
  {
    question: "Quelle est l'aire d'un rectangle de 10 cm par 4 cm ?",
    options: ["40 cm²", "28 cm²", "14 cm²", "50 cm²"],
    correctAnswer: 0,
    explanation: "Aire = longueur × largeur = 10 × 4 = 40 cm²"
  },
  {
    question: "Combien d'angles droits possède un carré ?",
    options: ["4", "2", "3", "0"],
    correctAnswer: 0,
    explanation: "Un carré possède 4 angles droits (90° chacun)"
  },
  {
    question: "Quelle est la somme des angles d'un quadrilatère ?",
    options: ["360°", "180°", "270°", "450°"],
    correctAnswer: 0,
    explanation: "La somme des angles d'un quadrilatère est toujours 360°"
  },
  {
    question: "Un triangle équilatéral a tous ses angles égaux. Quelle est la mesure de chaque angle ?",
    options: ["60°", "45°", "90°", "30°"],
    correctAnswer: 0,
    explanation: "Dans un triangle équilatéral: 180° ÷ 3 = 60° pour chaque angle"
  }
];

export const geometrieMatching = [
  {
    id: "1",
    question: "Carré côté 5 cm → Périmètre",
    answer: "20 cm"
  },
  {
    id: "2",
    question: "Rectangle 6×3 → Aire",
    answer: "18 cm²"
  },
  {
    id: "3",
    question: "Triangle: 60° + 80° + ?",
    answer: "40°"
  },
  {
    id: "4",
    question: "Angle droit",
    answer: "90°"
  },
  {
    id: "5",
    question: "Triangle base 6, hauteur 4 → Aire",
    answer: "12 cm²"
  }
];

// ===== STATISTIQUES =====
export const statistiquesQuiz = [
  {
    question: "Quelle est la moyenne de: 10, 15, 20, 25 ?",
    options: ["17,5", "20", "15", "18"],
    correctAnswer: 0,
    explanation: "Moyenne = (10 + 15 + 20 + 25) ÷ 4 = 70 ÷ 4 = 17,5"
  },
  {
    question: "Quelle est la médiane de: 5, 8, 12, 15, 20 ?",
    options: ["12", "10", "15", "8"],
    correctAnswer: 0,
    explanation: "La médiane est la valeur centrale quand les données sont ordonnées: 12"
  },
  {
    question: "Quel est le mode de: 3, 5, 5, 7, 5, 9, 11 ?",
    options: ["5", "7", "3", "Il n'y a pas de mode"],
    correctAnswer: 0,
    explanation: "Le mode est la valeur la plus fréquente: 5 apparaît 3 fois"
  },
  {
    question: "Dans une classe de 40 élèves, 10 ont eu A. Quelle est la fréquence de A ?",
    options: ["25%", "10%", "40%", "20%"],
    correctAnswer: 0,
    explanation: "Fréquence = (10 ÷ 40) × 100% = 0,25 × 100% = 25%"
  },
  {
    question: "Quelle est la moyenne de: 8, 12, 16 ?",
    options: ["12", "10", "14", "13"],
    correctAnswer: 0,
    explanation: "(8 + 12 + 16) ÷ 3 = 36 ÷ 3 = 12"
  },
  {
    question: "Trouver la médiane de: 2, 4, 6, 8",
    options: ["5", "4", "6", "4,5"],
    correctAnswer: 0,
    explanation: "Nombre pair de valeurs: médiane = (4 + 6) ÷ 2 = 5"
  },
  {
    question: "Si 15 élèves sur 50 sont absents, quelle est la fréquence des absents ?",
    options: ["30%", "15%", "25%", "20%"],
    correctAnswer: 0,
    explanation: "(15 ÷ 50) × 100% = 0,30 × 100% = 30%"
  },
  {
    question: "Quel est le mode de: 10, 12, 12, 15, 18, 12, 20 ?",
    options: ["12", "15", "10", "18"],
    correctAnswer: 0,
    explanation: "12 est la valeur qui apparaît le plus souvent (3 fois)"
  },
  {
    question: "Quelle est la moyenne de: 20, 20, 25, 35 ?",
    options: ["25", "20", "30", "22"],
    correctAnswer: 0,
    explanation: "(20 + 20 + 25 + 35) ÷ 4 = 100 ÷ 4 = 25"
  },
  {
    question: "Pour trouver la médiane, les données doivent être:",
    options: ["Ordonnées", "En désordre", "Multipliées", "Additionnées"],
    correctAnswer: 0,
    explanation: "On doit d'abord ordonner les données du plus petit au plus grand pour trouver la médiane"
  }
];

export const statistiquesMatching = [
  {
    id: "1",
    question: "Moyenne de 10, 20, 30",
    answer: "20"
  },
  {
    id: "2",
    question: "Médiane de 1, 3, 5, 7, 9",
    answer: "5"
  },
  {
    id: "3",
    question: "Mode de 2, 2, 3, 4, 2",
    answer: "2"
  },
  {
    id: "4",
    question: "20% de 60",
    answer: "12"
  },
  {
    id: "5",
    question: "Fréquence: 5/25",
    answer: "20%"
  }
];

// Legacy support
export const nombresEntiersQuiz = nombresRelatifsQuiz;
export const nombresEntiersMatching = nombresRelatifsMatching;
export const nombresEntiersDragDrop = nombresRelatifsDragDrop;

export const equationsQuiz = [
  {
    question: "Quelle est la solution de l'équation x + 5 = 12 ?",
    options: ["x = 7", "x = 17", "x = -7", "x = 5"],
    correctAnswer: 0,
    explanation: "Pour isoler x, on soustrait 5 des deux côtés: x = 12 - 5 = 7"
  },
  {
    question: "Résous: 2x = 10",
    options: ["x = 5", "x = 20", "x = 12", "x = 8"],
    correctAnswer: 0,
    explanation: "Pour isoler x, on divise les deux côtés par 2: x = 10 ÷ 2 = 5"
  },
  {
    question: "Quelle est la solution de 3x - 6 = 9 ?",
    options: ["x = 1", "x = 3", "x = 5", "x = 15"],
    correctAnswer: 2,
    explanation: "D'abord on additionne 6: 3x = 15. Ensuite on divise par 3: x = 5"
  }
];

export const equationsMatching = [
  {
    id: "1",
    question: "x + 3 = 7",
    answer: "x = 4"
  },
  {
    id: "2",
    question: "2x = 8",
    answer: "x = 4"
  },
  {
    id: "3",
    question: "x - 5 = 0",
    answer: "x = 5"
  },
  {
    id: "4",
    question: "3x = 12",
    answer: "x = 4"
  }
];
