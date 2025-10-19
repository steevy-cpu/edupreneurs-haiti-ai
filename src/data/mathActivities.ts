// Quiz questions for different math topics

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
