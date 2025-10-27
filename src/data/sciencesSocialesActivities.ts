// Quiz et activités interactives pour Sciences Sociales - Niveau AF7

// ===== LEÇON 1: L'ÉVOLUTION DES SOCIÉTÉS HUMAINES =====
export const evolutionSocietesQuiz = [
  {
    question: "Quelle est la première forme d'organisation sociale dans l'histoire de l'humanité ?",
    options: [
      "La société agricole",
      "La société de chasseurs-cueilleurs",
      "La société industrielle",
      "La société féodale"
    ],
    correctAnswer: 1,
    explanation: "Les chasseurs-cueilleurs représentent la première forme d'organisation sociale, où les humains vivaient en petits groupes nomades et se nourrissaient de chasse et de cueillette."
  },
  {
    question: "Qu'est-ce que le nomadisme ?",
    options: [
      "Vivre dans des villes",
      "Se déplacer constamment sans habitat fixe",
      "Cultiver la terre",
      "Élever des animaux"
    ],
    correctAnswer: 1,
    explanation: "Le nomadisme est un mode de vie où les groupes humains se déplacent régulièrement sans établir d'habitat permanent."
  },
  {
    question: "Quelle révolution a marqué le passage à la sédentarisation ?",
    options: [
      "La révolution industrielle",
      "La révolution numérique",
      "La révolution néolithique",
      "La révolution française"
    ],
    correctAnswer: 2,
    explanation: "La révolution néolithique (environ 10 000 ans avant J.-C.) a marqué le début de l'agriculture et de la sédentarisation des populations."
  },
  {
    question: "Qu'est-ce que la division du travail ?",
    options: [
      "Le partage des terres",
      "La spécialisation des tâches entre différents membres de la société",
      "La séparation des villages",
      "Le partage de l'eau"
    ],
    correctAnswer: 1,
    explanation: "La division du travail est la spécialisation des individus dans différentes activités (agriculture, artisanat, commerce, etc.)."
  },
  {
    question: "Dans les sociétés anciennes, quel rôle jouait le troc ?",
    options: [
      "Un système de gouvernement",
      "Un système d'échange de biens sans monnaie",
      "Une forme d'agriculture",
      "Un type de construction"
    ],
    correctAnswer: 1,
    explanation: "Le troc est un système d'échange direct de biens et services sans utiliser de monnaie."
  },
  {
    question: "Qu'est-ce qui caractérise une société hiérarchisée ?",
    options: [
      "Tous les membres sont égaux",
      "Il existe des classes sociales avec différents niveaux de pouvoir",
      "Il n'y a pas de chef",
      "Tout le monde fait le même travail"
    ],
    correctAnswer: 1,
    explanation: "Une société hiérarchisée est organisée en classes ou groupes sociaux avec des niveaux différents de pouvoir et de richesse."
  },
  {
    question: "Quel événement majeur a transformé les sociétés au XVIIIe siècle ?",
    options: [
      "La découverte de l'Amérique",
      "La révolution industrielle",
      "La chute de Rome",
      "L'invention de l'écriture"
    ],
    correctAnswer: 1,
    explanation: "La révolution industrielle (XVIIIe-XIXe siècles) a transformé les sociétés avec l'apparition des machines et des usines."
  }
];

export const evolutionSocietesMatching = [
  { id: "1", question: "Nomadisme", answer: "Mode de vie sans habitat fixe" },
  { id: "2", question: "Sédentarisation", answer: "Installation permanente dans un lieu" },
  { id: "3", question: "Néolithique", answer: "Période de début de l'agriculture" },
  { id: "4", question: "Division du travail", answer: "Spécialisation des tâches" },
  { id: "5", question: "Troc", answer: "Échange de biens sans monnaie" },
  { id: "6", question: "Hiérarchie sociale", answer: "Organisation en classes sociales" }
];

// ===== LEÇON 2: L'ESPACE GÉOGRAPHIQUE =====
export const espaceGeographiqueQuiz = [
  {
    question: "Qu'est-ce que l'espace géographique ?",
    options: [
      "Seulement l'espace naturel",
      "L'espace transformé et organisé par les humains",
      "L'espace vide",
      "Seulement les villes"
    ],
    correctAnswer: 1,
    explanation: "L'espace géographique est l'espace naturel transformé et organisé par les activités humaines."
  },
  {
    question: "Quelle est la différence entre milieu rural et milieu urbain ?",
    options: [
      "Le rural est plus peuplé",
      "L'urbain a une forte densité de population et d'activités",
      "Il n'y a pas de différence",
      "Le rural n'a pas d'agriculture"
    ],
    correctAnswer: 1,
    explanation: "Le milieu urbain se caractérise par une forte concentration de population et d'activités, contrairement au milieu rural plus dispersé."
  },
  {
    question: "Qu'est-ce qu'un paysage naturel ?",
    options: [
      "Un paysage créé par l'homme",
      "Un paysage peu ou pas modifié par l'homme",
      "Un parc de ville",
      "Un champ cultivé"
    ],
    correctAnswer: 1,
    explanation: "Un paysage naturel est un environnement qui n'a pas été significativement modifié par les activités humaines."
  },
  {
    question: "Que signifie 'aménager un territoire' ?",
    options: [
      "Le laisser intact",
      "L'organiser pour répondre aux besoins humains",
      "Le détruire",
      "Y construire seulement des routes"
    ],
    correctAnswer: 1,
    explanation: "Aménager un territoire signifie l'organiser et le transformer pour répondre aux besoins économiques, sociaux et environnementaux."
  },
  {
    question: "Qu'est-ce qu'un habitat dispersé ?",
    options: [
      "Des maisons regroupées en ville",
      "Des habitations éloignées les unes des autres",
      "Des immeubles",
      "Des bidonvilles"
    ],
    correctAnswer: 1,
    explanation: "L'habitat dispersé se caractérise par des habitations éloignées les unes des autres, typique des zones rurales."
  },
  {
    question: "Quel élément caractérise un paysage humanisé ?",
    options: [
      "L'absence d'humains",
      "La présence de forêts vierges",
      "Les traces de l'activité humaine (routes, champs, villes)",
      "Seulement les animaux sauvages"
    ],
    correctAnswer: 2,
    explanation: "Un paysage humanisé montre les traces visibles des activités humaines comme les infrastructures et les aménagements."
  }
];

export const espaceGeographiqueMatching = [
  { id: "1", question: "Milieu urbain", answer: "Zone à forte densité de population" },
  { id: "2", question: "Milieu rural", answer: "Zone à faible densité, dominée par l'agriculture" },
  { id: "3", question: "Paysage naturel", answer: "Peu modifié par l'homme" },
  { id: "4", question: "Paysage humanisé", answer: "Transformé par les activités humaines" },
  { id: "5", question: "Aménagement", answer: "Organisation du territoire" },
  { id: "6", question: "Habitat dispersé", answer: "Habitations éloignées" }
];

// ===== LEÇON 3: LA TERRE, PRODUIT DE L'HUMANISATION =====
export const terreHumanisationQuiz = [
  {
    question: "Qu'est-ce que l'humanisation de la Terre ?",
    options: [
      "La création de la Terre",
      "La transformation de l'environnement naturel par l'homme",
      "La destruction de la nature",
      "La naissance de l'humanité"
    ],
    correctAnswer: 1,
    explanation: "L'humanisation est le processus par lequel les humains transforment et modifient leur environnement naturel pour répondre à leurs besoins."
  },
  {
    question: "Quel a été l'impact de la révolution agricole sur le paysage ?",
    options: [
      "Aucun impact",
      "Transformation des forêts en champs cultivés",
      "Augmentation des forêts",
      "Disparition des rivières"
    ],
    correctAnswer: 1,
    explanation: "La révolution agricole a transformé les paysages naturels en zones cultivées, modifiant profondément l'environnement."
  },
  {
    question: "Qu'est-ce qu'une infrastructure ?",
    options: [
      "Un type de plante",
      "Un ensemble d'équipements (routes, ponts, écoles, etc.)",
      "Un animal",
      "Un cours d'eau"
    ],
    correctAnswer: 1,
    explanation: "Les infrastructures sont les équipements et installations construits par l'homme (routes, ponts, écoles, hôpitaux, etc.)."
  },
  {
    question: "Comment l'urbanisation affecte-t-elle l'environnement ?",
    options: [
      "Elle n'a aucun effet",
      "Elle remplace les espaces naturels par des constructions",
      "Elle augmente les forêts",
      "Elle crée plus de rivières"
    ],
    correctAnswer: 1,
    explanation: "L'urbanisation remplace progressivement les espaces naturels par des zones bâties (maisons, routes, usines)."
  },
  {
    question: "Qu'est-ce que la déforestation ?",
    options: [
      "La plantation d'arbres",
      "La destruction des forêts",
      "La protection des forêts",
      "L'étude des arbres"
    ],
    correctAnswer: 1,
    explanation: "La déforestation est la destruction ou la coupe massive des forêts, souvent pour l'agriculture ou l'urbanisation."
  },
  {
    question: "Pourquoi l'homme construit-il des barrages ?",
    options: [
      "Pour décorer le paysage",
      "Pour produire de l'électricité et contrôler l'eau",
      "Pour détruire les rivières",
      "Pour empêcher la pluie"
    ],
    correctAnswer: 1,
    explanation: "Les barrages sont construits pour produire de l'électricité hydroélectrique, contrôler les inondations et stocker l'eau."
  }
];

export const terreHumanisationMatching = [
  { id: "1", question: "Humanisation", answer: "Transformation de la nature par l'homme" },
  { id: "2", question: "Infrastructure", answer: "Équipements construits (routes, ponts, écoles)" },
  { id: "3", question: "Urbanisation", answer: "Extension des villes" },
  { id: "4", question: "Déforestation", answer: "Destruction des forêts" },
  { id: "5", question: "Barrage", answer: "Construction pour contrôler l'eau" },
  { id: "6", question: "Agriculture", answer: "Culture de la terre" }
];

// ===== LEÇON 4: CULTURE ET SOCIÉTÉ =====
export const cultureSocieteQuiz = [
  {
    question: "Qu'est-ce que la culture ?",
    options: [
      "Seulement l'art et la musique",
      "L'ensemble des connaissances, croyances et coutumes d'un groupe",
      "L'agriculture",
      "Les bâtiments"
    ],
    correctAnswer: 1,
    explanation: "La culture englobe l'ensemble des connaissances, croyances, traditions, langues et coutumes qui caractérisent un groupe humain."
  },
  {
    question: "Qu'est-ce qu'une tradition ?",
    options: [
      "Une nouvelle invention",
      "Une coutume transmise de génération en génération",
      "Un type de nourriture",
      "Une danse moderne"
    ],
    correctAnswer: 1,
    explanation: "Une tradition est une pratique ou croyance transmise de génération en génération au sein d'une communauté."
  },
  {
    question: "Quelle est la langue officielle d'Haïti ?",
    options: [
      "Seulement le français",
      "Le français et le créole haïtien",
      "Seulement le créole",
      "L'anglais"
    ],
    correctAnswer: 1,
    explanation: "Haïti a deux langues officielles : le français et le créole haïtien, qui font partie de son patrimoine culturel."
  },
  {
    question: "Qu'est-ce que le patrimoine culturel ?",
    options: [
      "Seulement l'argent",
      "L'héritage culturel d'un peuple (monuments, traditions, langues)",
      "Les maisons modernes",
      "Les voitures"
    ],
    correctAnswer: 1,
    explanation: "Le patrimoine culturel est l'ensemble des biens matériels et immatériels hérités du passé (monuments, traditions, langues, savoir-faire)."
  },
  {
    question: "Pourquoi est-il important de préserver les traditions ?",
    options: [
      "Ce n'est pas important",
      "Pour garder l'identité culturelle d'un peuple",
      "Pour empêcher le progrès",
      "Pour rejeter la modernité"
    ],
    correctAnswer: 1,
    explanation: "Préserver les traditions permet de maintenir l'identité culturelle d'un peuple et de transmettre son histoire aux générations futures."
  },
  {
    question: "Qu'est-ce qu'une coutume ?",
    options: [
      "Une loi écrite",
      "Une habitude ou pratique sociale établie",
      "Un costume",
      "Un monument"
    ],
    correctAnswer: 1,
    explanation: "Une coutume est une pratique ou habitude sociale établie et acceptée par une communauté."
  }
];

export const cultureSocieteMatching = [
  { id: "1", question: "Culture", answer: "Ensemble des croyances et coutumes d'un groupe" },
  { id: "2", question: "Tradition", answer: "Coutume transmise de génération en génération" },
  { id: "3", question: "Patrimoine", answer: "Héritage culturel d'un peuple" },
  { id: "4", question: "Langue", answer: "Système de communication" },
  { id: "5", question: "Coutume", answer: "Pratique sociale établie" },
  { id: "6", question: "Identité culturelle", answer: "Caractéristiques propres à un groupe" }
];

// ===== LEÇON 5: LES FORMES D'ORGANISATION SOCIALE =====
export const formesOrganisationQuiz = [
  {
    question: "Qu'est-ce qu'une organisation sociale ?",
    options: [
      "Un événement sportif",
      "La façon dont une société structure ses relations et institutions",
      "Une fête",
      "Un type de nourriture"
    ],
    correctAnswer: 1,
    explanation: "L'organisation sociale désigne la manière dont une société structure ses relations, ses institutions et ses règles de fonctionnement."
  },
  {
    question: "Quelle est la cellule de base de la société ?",
    options: [
      "L'État",
      "La famille",
      "L'école",
      "L'entreprise"
    ],
    correctAnswer: 1,
    explanation: "La famille est considérée comme la cellule de base de toute société, où commence l'éducation et la socialisation."
  },
  {
    question: "Qu'est-ce qu'une institution sociale ?",
    options: [
      "Un bâtiment",
      "Une organisation établie pour remplir des fonctions sociales (famille, école, État)",
      "Un sport",
      "Une religion seulement"
    ],
    correctAnswer: 1,
    explanation: "Les institutions sociales sont des organisations établies qui remplissent des fonctions essentielles dans la société (famille, école, État, religion, etc.)."
  },
  {
    question: "Quel est le rôle de l'école dans la société ?",
    options: [
      "Seulement garder les enfants",
      "Éduquer et socialiser les jeunes",
      "Remplacer la famille",
      "Punir les enfants"
    ],
    correctAnswer: 1,
    explanation: "L'école a pour rôle d'éduquer, de transmettre des connaissances et de socialiser les jeunes pour en faire des citoyens."
  },
  {
    question: "Qu'est-ce qu'une communauté ?",
    options: [
      "Un groupe de personnes partageant des intérêts communs",
      "Un bâtiment",
      "Une ville seulement",
      "Un pays"
    ],
    correctAnswer: 0,
    explanation: "Une communauté est un groupe de personnes partageant des intérêts, des valeurs ou un territoire communs."
  },
  {
    question: "Quel est le rôle de l'État ?",
    options: [
      "Seulement collecter les impôts",
      "Organiser la société et assurer le bien-être collectif",
      "Contrôler tout",
      "N'a aucun rôle"
    ],
    correctAnswer: 1,
    explanation: "L'État organise la société, fait respecter les lois et assure le bien-être collectif (sécurité, santé, éducation, etc.)."
  }
];

export const formesOrganisationMatching = [
  { id: "1", question: "Famille", answer: "Cellule de base de la société" },
  { id: "2", question: "Institution", answer: "Organisation remplissant des fonctions sociales" },
  { id: "3", question: "École", answer: "Institution d'éducation" },
  { id: "4", question: "État", answer: "Organisation politique d'une société" },
  { id: "5", question: "Communauté", answer: "Groupe partageant des intérêts communs" },
  { id: "6", question: "Socialisation", answer: "Processus d'intégration dans la société" }
];

// ===== LEÇON 6: L'ESPACE CARIBÉEN =====
export const espaceCaraibeenQuiz = [
  {
    question: "Où est située la région caribéenne ?",
    options: [
      "En Europe",
      "Entre l'Amérique du Nord et l'Amérique du Sud",
      "En Afrique",
      "En Asie"
    ],
    correctAnswer: 1,
    explanation: "La région caribéenne est située entre l'Amérique du Nord et l'Amérique du Sud, comprenant les îles de la mer des Caraïbes."
  },
  {
    question: "Combien d'îles principales composent les Grandes Antilles ?",
    options: [
      "2",
      "4 (Cuba, Jamaïque, Hispaniola, Porto Rico)",
      "10",
      "20"
    ],
    correctAnswer: 1,
    explanation: "Les Grandes Antilles comprennent quatre îles principales : Cuba, la Jamaïque, Hispaniola (Haïti et République Dominicaine) et Porto Rico."
  },
  {
    question: "Quelle île partagent Haïti et la République Dominicaine ?",
    options: [
      "Cuba",
      "Hispaniola",
      "Porto Rico",
      "Jamaïque"
    ],
    correctAnswer: 1,
    explanation: "Haïti et la République Dominicaine partagent l'île d'Hispaniola, la deuxième plus grande île des Caraïbes."
  },
  {
    question: "Quel climat caractérise la région caribéenne ?",
    options: [
      "Climat polaire",
      "Climat tropical",
      "Climat désertique",
      "Climat tempéré"
    ],
    correctAnswer: 1,
    explanation: "La région caribéenne a un climat tropical, caractérisé par des températures chaudes toute l'année et des saisons humides et sèches."
  },
  {
    question: "Qu'est-ce qu'un ouragan ?",
    options: [
      "Une petite pluie",
      "Une puissante tempête tropicale avec des vents violents",
      "Un tremblement de terre",
      "Une éruption volcanique"
    ],
    correctAnswer: 1,
    explanation: "Un ouragan est une puissante tempête tropicale caractérisée par des vents violents et de fortes pluies, fréquent dans les Caraïbes."
  },
  {
    question: "Quelle ressource naturelle importante trouve-t-on dans les Caraïbes ?",
    options: [
      "Le pétrole seulement",
      "Le tourisme, la pêche, l'agriculture tropicale",
      "Le charbon",
      "Le diamant"
    ],
    correctAnswer: 1,
    explanation: "Les Caraïbes ont plusieurs ressources importantes : le tourisme, la pêche, l'agriculture tropicale (canne à sucre, café, cacao) et parfois le pétrole."
  }
];

export const espaceCaraibeenMatching = [
  { id: "1", question: "Grandes Antilles", answer: "Grandes îles (Cuba, Hispaniola, Jamaïque, Porto Rico)" },
  { id: "2", question: "Petites Antilles", answer: "Petites îles des Caraïbes" },
  { id: "3", question: "Hispaniola", answer: "Île partagée par Haïti et Rep. Dom." },
  { id: "4", question: "Climat tropical", answer: "Chaud et humide toute l'année" },
  { id: "5", question: "Ouragan", answer: "Tempête tropicale violente" },
  { id: "6", question: "Mer des Caraïbes", answer: "Mer bordant les Antilles" }
];

// ===== LEÇON 7: LE RELIEF HAÏTIEN =====
export const reliefHaitienQuiz = [
  {
    question: "Quel est le point culminant d'Haïti ?",
    options: [
      "Le Morne l'Hôpital",
      "Le Pic la Selle",
      "Le Massif de la Hotte",
      "Le Morne du Cap"
    ],
    correctAnswer: 1,
    explanation: "Le Pic la Selle, situé dans le Massif de la Selle, est le point culminant d'Haïti avec 2 680 mètres d'altitude."
  },
  {
    question: "Combien de massifs montagneux compte Haïti ?",
    options: [
      "2",
      "5",
      "10",
      "15"
    ],
    correctAnswer: 1,
    explanation: "Haïti compte cinq massifs montagneux principaux qui traversent le pays d'est en ouest."
  },
  {
    question: "Qu'est-ce qu'une plaine ?",
    options: [
      "Une zone montagneuse",
      "Une étendue de terre plate ou peu ondulée",
      "Une rivière",
      "Une forêt"
    ],
    correctAnswer: 1,
    explanation: "Une plaine est une étendue de terre relativement plate ou peu ondulée, généralement propice à l'agriculture."
  },
  {
    question: "Quelle est la plus grande plaine d'Haïti ?",
    options: [
      "La Plaine du Nord",
      "La Plaine de l'Artibonite",
      "La Plaine du Cul-de-Sac",
      "La Plaine des Gonaïves"
    ],
    correctAnswer: 1,
    explanation: "La Plaine de l'Artibonite est la plus grande et la plus fertile d'Haïti, connue comme le 'grenier d'Haïti'."
  },
  {
    question: "Pourquoi le relief montagneux d'Haïti est-il important ?",
    options: [
      "Il n'a aucune importance",
      "Il influence le climat et l'agriculture",
      "Il empêche la pluie",
      "Il cache le soleil"
    ],
    correctAnswer: 1,
    explanation: "Le relief montagneux influence fortement le climat local, les précipitations et détermine les zones propices à l'agriculture."
  },
  {
    question: "Qu'est-ce qu'un massif montagneux ?",
    options: [
      "Une seule montagne",
      "Un ensemble compact de montagnes",
      "Une plaine",
      "Une rivière"
    ],
    correctAnswer: 1,
    explanation: "Un massif montagneux est un ensemble compact et étendu de montagnes reliées entre elles."
  }
];

export const reliefHaitienMatching = [
  { id: "1", question: "Pic la Selle", answer: "Point culminant d'Haïti (2 680 m)" },
  { id: "2", question: "Plaine", answer: "Étendue de terre plate" },
  { id: "3", question: "Artibonite", answer: "Plus grande plaine d'Haïti" },
  { id: "4", question: "Massif", answer: "Ensemble de montagnes" },
  { id: "5", question: "Relief", answer: "Ensemble des formes du terrain" },
  { id: "6", question: "Altitude", answer: "Hauteur par rapport au niveau de la mer" }
];

// ===== LEÇON 8: LE SYSTÈME SOLAIRE ET LA TERRE =====
export const systemeSolaireQuiz = [
  {
    question: "Combien de planètes compte le système solaire ?",
    options: ["6", "7", "8", "9"],
    correctAnswer: 2,
    explanation: "Le système solaire compte 8 planètes : Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus et Neptune."
  },
  {
    question: "Quelle est la planète la plus proche du Soleil ?",
    options: ["Vénus", "Mercure", "Terre", "Mars"],
    correctAnswer: 1,
    explanation: "Mercure est la planète la plus proche du Soleil dans notre système solaire."
  },
  {
    question: "Quelle planète est surnommée la 'planète bleue' ?",
    options: ["Mars", "Neptune", "Terre", "Uranus"],
    correctAnswer: 2,
    explanation: "La Terre est surnommée la 'planète bleue' en raison de l'abondance d'eau à sa surface."
  },
  {
    question: "Qu'est-ce qui permet la vie sur Terre ?",
    options: [
      "La distance au Soleil, l'eau, l'atmosphère",
      "Seulement l'eau",
      "Seulement l'air",
      "La lune"
    ],
    correctAnswer: 0,
    explanation: "La vie sur Terre est possible grâce à la bonne distance au Soleil, la présence d'eau liquide et une atmosphère protectrice."
  },
  {
    question: "Combien de temps met la Terre pour tourner autour du Soleil ?",
    options: ["24 heures", "1 mois", "365 jours (1 an)", "10 ans"],
    correctAnswer: 2,
    explanation: "La Terre met environ 365 jours (une année) pour faire une révolution complète autour du Soleil."
  },
  {
    question: "Qu'est-ce qu'une étoile ?",
    options: [
      "Une planète",
      "Un astre qui produit sa propre lumière",
      "Un satellite",
      "Un astéroïde"
    ],
    correctAnswer: 1,
    explanation: "Une étoile est un astre qui produit sa propre lumière et chaleur par fusion nucléaire, comme le Soleil."
  }
];

export const systemeSolaireMatching = [
  { id: "1", question: "Soleil", answer: "Étoile au centre du système solaire" },
  { id: "2", question: "Planète", answer: "Corps céleste en orbite autour d'une étoile" },
  { id: "3", question: "Terre", answer: "Planète bleue, seule avec de la vie" },
  { id: "4", question: "Révolution", answer: "Tour complet autour du Soleil (1 an)" },
  { id: "5", question: "Rotation", answer: "Tour sur elle-même (1 jour)" },
  { id: "6", question: "Atmosphère", answer: "Couche de gaz entourant la Terre" }
];

// ===== LEÇON 9: LES CIVILISATIONS ANCIENNES =====
export const civilisationsAnciennesQuiz = [
  {
    question: "Qu'est-ce qu'une civilisation ?",
    options: [
      "Un groupe de maisons",
      "Une société organisée avec une culture, des lois et des institutions",
      "Une ville",
      "Un pays moderne"
    ],
    correctAnswer: 1,
    explanation: "Une civilisation est une société humaine organisée avec une culture développée, des lois, des institutions et souvent une écriture."
  },
  {
    question: "Quelle civilisation a construit les pyramides ?",
    options: [
      "Les Romains",
      "Les Égyptiens",
      "Les Grecs",
      "Les Mayas"
    ],
    correctAnswer: 1,
    explanation: "Les anciens Égyptiens ont construit les pyramides il y a plus de 4 000 ans comme tombeaux pour leurs pharaons."
  },
  {
    question: "Quelle invention majeure a permis de conserver les connaissances ?",
    options: [
      "Le téléphone",
      "L'écriture",
      "L'ordinateur",
      "La télévision"
    ],
    correctAnswer: 1,
    explanation: "L'invention de l'écriture a permis aux civilisations de conserver et transmettre leurs connaissances à travers le temps."
  },
  {
    question: "Quelle civilisation a inventé la démocratie ?",
    options: [
      "Les Romains",
      "Les Grecs",
      "Les Égyptiens",
      "Les Chinois"
    ],
    correctAnswer: 1,
    explanation: "Les Grecs anciens, particulièrement à Athènes, ont inventé la démocratie où les citoyens participaient aux décisions."
  },
  {
    question: "Qu'est-ce qu'un empire ?",
    options: [
      "Un petit village",
      "Un vaste territoire sous l'autorité d'un empereur",
      "Une république",
      "Une démocratie"
    ],
    correctAnswer: 1,
    explanation: "Un empire est un vaste territoire regroupant plusieurs peuples sous l'autorité d'un empereur ou d'un souverain puissant."
  },
  {
    question: "Quelle civilisation antique était célèbre pour son droit et ses lois ?",
    options: [
      "Les Grecs",
      "Les Romains",
      "Les Égyptiens",
      "Les Perses"
    ],
    correctAnswer: 1,
    explanation: "L'Empire romain était célèbre pour son système juridique sophistiqué dont les principes influencent encore le droit moderne."
  }
];

export const civilisationsAnciennesMatching = [
  { id: "1", question: "Civilisation", answer: "Société organisée avec culture et institutions" },
  { id: "2", question: "Égypte ancienne", answer: "Civilisation des pyramides et pharaons" },
  { id: "3", question: "Grèce antique", answer: "Berceau de la démocratie" },
  { id: "4", question: "Empire romain", answer: "Célèbre pour son droit et ses lois" },
  { id: "5", question: "Écriture", answer: "Système de conservation des connaissances" },
  { id: "6", question: "Pharaon", answer: "Roi de l'Égypte ancienne" }
];

// ===== LEÇON 10: LA FAMILLE COMME ORGANISATION SOCIALE =====
export const familleOrganisationQuiz = [
  {
    question: "Pourquoi dit-on que la famille est la cellule de base de la société ?",
    options: [
      "Parce qu'elle est petite",
      "Parce que c'est le premier lieu de socialisation",
      "Parce qu'elle est importante seulement",
      "Parce qu'elle est ancienne"
    ],
    correctAnswer: 1,
    explanation: "La famille est le premier lieu où l'enfant apprend les règles sociales, les valeurs et se prépare à vivre en société."
  },
  {
    question: "Qu'est-ce qu'une famille nucléaire ?",
    options: [
      "Une famille très nombreuse",
      "Parents et leurs enfants vivant ensemble",
      "Toute la famille élargie",
      "Les grands-parents seulement"
    ],
    correctAnswer: 1,
    explanation: "La famille nucléaire est composée des parents (père et mère) et de leurs enfants vivant sous le même toit."
  },
  {
    question: "Qu'est-ce qu'une famille élargie ?",
    options: [
      "Seulement les parents et enfants",
      "Famille incluant grands-parents, oncles, tantes, cousins",
      "Une famille riche",
      "Une famille nombreuse"
    ],
    correctAnswer: 1,
    explanation: "La famille élargie inclut plusieurs générations et branches : grands-parents, oncles, tantes, cousins, etc."
  },
  {
    question: "Quel est un rôle principal de la famille ?",
    options: [
      "Gagner de l'argent seulement",
      "Éduquer et protéger les enfants",
      "Construire des maisons",
      "Diriger le pays"
    ],
    correctAnswer: 1,
    explanation: "La famille a pour rôle principal d'éduquer, protéger et assurer le bien-être physique et émotionnel des enfants."
  },
  {
    question: "Qu'est-ce que la transmission des valeurs ?",
    options: [
      "Donner de l'argent",
      "Enseigner les principes moraux et culturels aux enfants",
      "Acheter des cadeaux",
      "Construire une maison"
    ],
    correctAnswer: 1,
    explanation: "La transmission des valeurs est le processus par lequel les parents enseignent à leurs enfants les principes moraux, culturels et sociaux."
  },
  {
    question: "Comment la famille contribue-t-elle à la société ?",
    options: [
      "Elle ne contribue pas",
      "En formant des citoyens responsables",
      "En construisant des routes",
      "En créant des lois"
    ],
    correctAnswer: 1,
    explanation: "La famille forme les futurs citoyens en leur enseignant les valeurs, le respect et les règles de vie en société."
  }
];

export const familleOrganisationMatching = [
  { id: "1", question: "Famille nucléaire", answer: "Parents et enfants" },
  { id: "2", question: "Famille élargie", answer: "Plusieurs générations ensemble" },
  { id: "3", question: "Socialisation", answer: "Apprentissage des règles sociales" },
  { id: "4", question: "Valeurs", answer: "Principes moraux et culturels" },
  { id: "5", question: "Éducation", answer: "Formation et instruction des enfants" },
  { id: "6", question: "Protection", answer: "Sécurité physique et émotionnelle" }
];

// ===== LEÇON 11: LES FOSSES MARINES =====
export const fossesMarinesQuiz = [
  {
    question: "Qu'est-ce qu'une fosse marine ?",
    options: [
      "Une montagne sous-marine",
      "Une dépression profonde au fond de l'océan",
      "Une île",
      "Un volcan"
    ],
    correctAnswer: 1,
    explanation: "Une fosse marine est une dépression très profonde au fond de l'océan, formée par la collision des plaques tectoniques."
  },
  {
    question: "Quelle est la fosse marine la plus profonde du monde ?",
    options: [
      "La fosse de Porto Rico",
      "La fosse des Mariannes",
      "La fosse de Java",
      "La fosse du Pérou"
    ],
    correctAnswer: 1,
    explanation: "La fosse des Mariannes, dans l'océan Pacifique, est la plus profonde avec environ 11 000 mètres de profondeur."
  },
  {
    question: "Comment se forment les fosses marines ?",
    options: [
      "Par l'érosion de l'eau",
      "Par la subduction d'une plaque tectonique sous une autre",
      "Par les vagues",
      "Par les poissons"
    ],
    correctAnswer: 1,
    explanation: "Les fosses marines se forment quand une plaque tectonique océanique plonge sous une autre plaque (phénomène de subduction)."
  },
  {
    question: "Pourquoi les fosses marines sont-elles dangereuses ?",
    options: [
      "Elles ne sont pas dangereuses",
      "Elles peuvent causer des tremblements de terre et tsunamis",
      "Elles sont trop froides",
      "Elles sont trop chaudes"
    ],
    correctAnswer: 1,
    explanation: "Les mouvements tectoniques dans les fosses marines peuvent déclencher de puissants tremblements de terre et tsunamis."
  },
  {
    question: "Quelle fosse se trouve près d'Haïti ?",
    options: [
      "La fosse des Mariannes",
      "La fosse de Porto Rico",
      "La fosse du Japon",
      "La fosse de Java"
    ],
    correctAnswer: 1,
    explanation: "La fosse de Porto Rico, dans l'Atlantique, est située près des Caraïbes et d'Haïti, avec environ 8 600 mètres de profondeur."
  },
  {
    question: "Qu'est-ce que la subduction ?",
    options: [
      "Un type de poisson",
      "Le plongement d'une plaque tectonique sous une autre",
      "Un volcan",
      "Une montagne"
    ],
    correctAnswer: 1,
    explanation: "La subduction est le phénomène géologique où une plaque tectonique plonge sous une autre, créant des fosses marines."
  }
];

export const fossesMarinesMatching = [
  { id: "1", question: "Fosse marine", answer: "Dépression profonde de l'océan" },
  { id: "2", question: "Mariannes", answer: "Fosse la plus profonde du monde" },
  { id: "3", question: "Subduction", answer: "Plongement d'une plaque sous une autre" },
  { id: "4", question: "Tsunami", answer: "Vague géante causée par un séisme" },
  { id: "5", question: "Plaque tectonique", answer: "Segment de la croûte terrestre" },
  { id: "6", question: "Porto Rico", answer: "Fosse près des Caraïbes" }
];

// ===== LEÇON 12: LE CLIMAT D'HAÏTI =====
export const climatHaitiQuiz = [
  {
    question: "Quel type de climat caractérise Haïti ?",
    options: [
      "Climat polaire",
      "Climat tropical",
      "Climat désertique",
      "Climat tempéré"
    ],
    correctAnswer: 1,
    explanation: "Haïti a un climat tropical, caractérisé par des températures chaudes toute l'année et une alternance de saisons sèches et humides."
  },
  {
    question: "Combien de saisons principales y a-t-il en Haïti ?",
    options: [
      "1 saison",
      "2 saisons (sèche et humide)",
      "4 saisons",
      "6 saisons"
    ],
    correctAnswer: 1,
    explanation: "Haïti connaît deux saisons principales : la saison sèche (novembre à mars) et la saison humide ou pluvieuse (avril à octobre)."
  },
  {
    question: "Quand se situe la saison des ouragans en Haïti ?",
    options: [
      "Janvier à mars",
      "Juin à novembre",
      "Toute l'année",
      "Décembre"
    ],
    correctAnswer: 1,
    explanation: "La saison des ouragans s'étend de juin à novembre, avec un pic d'activité en août-septembre."
  },
  {
    question: "Qu'est-ce qui influence le climat local en Haïti ?",
    options: [
      "Seulement la mer",
      "Le relief montagneux et l'altitude",
      "Seulement le vent",
      "La lune"
    ],
    correctAnswer: 1,
    explanation: "Le relief montagneux crée des microclimats : les montagnes sont plus fraîches et plus humides, tandis que certaines vallées sont plus sèches."
  },
  {
    question: "Quelle température moyenne fait-il généralement en Haïti ?",
    options: [
      "0-10°C",
      "25-30°C",
      "40-50°C",
      "15-20°C"
    ],
    correctAnswer: 1,
    explanation: "Haïti a une température moyenne annuelle de 25-30°C dans les plaines, avec des variations selon l'altitude."
  },
  {
    question: "Pourquoi Haïti est-il vulnérable aux catastrophes naturelles ?",
    options: [
      "Il ne l'est pas",
      "À cause de sa position géographique et de la déforestation",
      "Seulement à cause des volcans",
      "Parce qu'il est petit"
    ],
    correctAnswer: 1,
    explanation: "Haïti est vulnérable aux ouragans, inondations et séismes en raison de sa position dans les Caraïbes et de la déforestation qui aggrave l'érosion."
  }
];

export const climatHaitiMatching = [
  { id: "1", question: "Climat tropical", answer: "Chaud et humide toute l'année" },
  { id: "2", question: "Saison sèche", answer: "Novembre à mars" },
  { id: "3", question: "Saison humide", answer: "Avril à octobre" },
  { id: "4", question: "Ouragan", answer: "Tempête tropicale violente" },
  { id: "5", question: "Microclimat", answer: "Climat local influencé par le relief" },
  { id: "6", question: "Déforestation", answer: "Destruction des forêts" }
];

// ===== LEÇON 13: LES SOCIÉTÉS ANTILLAISES AVANT COLOMB =====
export const societesAntillaisesQuiz = [
  {
    question: "Qui étaient les premiers habitants des Antilles ?",
    options: [
      "Les Européens",
      "Les peuples amérindiens (Taïnos et Caraïbes)",
      "Les Africains",
      "Les Asiatiques"
    ],
    correctAnswer: 1,
    explanation: "Les premiers habitants des Antilles étaient des peuples amérindiens, principalement les Taïnos et les Caraïbes."
  },
  {
    question: "Comment s'appelaient les habitants d'Haïti avant l'arrivée de Christophe Colomb ?",
    options: [
      "Les Aztèques",
      "Les Taïnos",
      "Les Incas",
      "Les Mayas"
    ],
    correctAnswer: 1,
    explanation: "Les Taïnos (aussi appelés Arawaks) étaient les habitants d'Haïti (qu'ils appelaient Ayiti) avant 1492."
  },
  {
    question: "De quoi vivaient principalement les Taïnos ?",
    options: [
      "De l'industrie",
      "De l'agriculture, la pêche et la chasse",
      "Du commerce seulement",
      "De l'élevage de chevaux"
    ],
    correctAnswer: 1,
    explanation: "Les Taïnos pratiquaient l'agriculture (manioc, maïs), la pêche et la chasse pour se nourrir."
  },
  {
    question: "Qu'est-ce qu'un cacique ?",
    options: [
      "Un type de nourriture",
      "Un chef ou dirigeant taïno",
      "Un bateau",
      "Un outil"
    ],
    correctAnswer: 1,
    explanation: "Le cacique était le chef ou dirigeant d'un village ou d'une région chez les Taïnos."
  },
  {
    question: "Quel aliment important les Taïnos cultivaient-ils ?",
    options: [
      "Le blé",
      "Le manioc (kassav)",
      "Le riz",
      "Les pommes"
    ],
    correctAnswer: 1,
    explanation: "Le manioc était l'aliment de base des Taïnos, utilisé pour faire le pain kassav encore consommé aujourd'hui."
  },
  {
    question: "Qu'est-il arrivé aux Taïnos après l'arrivée des Européens ?",
    options: [
      "Ils sont devenus plus nombreux",
      "Ils ont presque disparu à cause des maladies et de l'exploitation",
      "Ils sont partis en Europe",
      "Il ne s'est rien passé"
    ],
    correctAnswer: 1,
    explanation: "La population taïno a été décimée par les maladies européennes, le travail forcé et les mauvais traitements."
  }
];

export const societesAntillaisesMatching = [
  { id: "1", question: "Taïnos", answer: "Premiers habitants d'Haïti" },
  { id: "2", question: "Cacique", answer: "Chef taïno" },
  { id: "3", question: "Manioc", answer: "Aliment de base des Taïnos" },
  { id: "4", question: "Ayiti", answer: "Nom taïno d'Haïti (terre montagneuse)" },
  { id: "5", question: "Kassav", answer: "Pain de manioc" },
  { id: "6", question: "Amérindiens", answer: "Peuples autochtones des Amériques" }
];

// ===== LEÇON 14: FORME ET CONSTITUTION DE LA TERRE =====
export const formeConstitutionTerreQuiz = [
  {
    question: "Quelle est la forme de la Terre ?",
    options: [
      "Plate",
      "Sphérique (légèrement aplatie aux pôles)",
      "Carrée",
      "Triangulaire"
    ],
    correctAnswer: 1,
    explanation: "La Terre a une forme sphérique, légèrement aplatie aux pôles et renflée à l'équateur (géoïde)."
  },
  {
    question: "Combien de couches principales constituent l'intérieur de la Terre ?",
    options: [
      "2",
      "3 (croûte, manteau, noyau)",
      "5",
      "10"
    ],
    correctAnswer: 1,
    explanation: "L'intérieur de la Terre est composé de trois couches principales : la croûte, le manteau et le noyau."
  },
  {
    question: "Quelle est la couche la plus externe de la Terre ?",
    options: [
      "Le noyau",
      "La croûte terrestre",
      "Le manteau",
      "L'atmosphère"
    ],
    correctAnswer: 1,
    explanation: "La croûte terrestre est la couche solide la plus externe de la Terre, où nous vivons."
  },
  {
    question: "De quoi est principalement composé le noyau terrestre ?",
    options: [
      "De roches",
      "De fer et de nickel",
      "D'eau",
      "De gaz"
    ],
    correctAnswer: 1,
    explanation: "Le noyau de la Terre est principalement composé de fer et de nickel, avec une partie liquide et une partie solide."
  },
  {
    question: "Comment sait-on que la Terre est ronde ?",
    options: [
      "On ne le sait pas",
      "Photos de l'espace, navigation, éclipses lunaires",
      "Seulement par les photos",
      "Par la magie"
    ],
    correctAnswer: 1,
    explanation: "Nous savons que la Terre est ronde grâce aux photos satellites, la navigation autour du globe et la forme de l'ombre lors des éclipses lunaires."
  },
  {
    question: "Qu'est-ce que le manteau terrestre ?",
    options: [
      "La surface de la Terre",
      "Une couche de roches chaudes entre la croûte et le noyau",
      "L'atmosphère",
      "Le centre de la Terre"
    ],
    correctAnswer: 1,
    explanation: "Le manteau est une épaisse couche de roches très chaudes située entre la croûte terrestre et le noyau."
  }
];

export const formeConstitutionTerreMatching = [
  { id: "1", question: "Géoïde", answer: "Forme réelle de la Terre (sphère aplatie)" },
  { id: "2", question: "Croûte", answer: "Couche externe solide" },
  { id: "3", question: "Manteau", answer: "Couche de roches chaudes" },
  { id: "4", question: "Noyau", answer: "Centre de la Terre (fer et nickel)" },
  { id: "5", question: "Sphère", answer: "Forme arrondie" },
  { id: "6", question: "Équateur", answer: "Ligne imaginaire au milieu de la Terre" }
];

// ===== LEÇON 15: LES PREMIERS HABITANTS DES ANTILLES =====
export const premiersHabitantsQuiz = [
  {
    question: "D'où venaient probablement les premiers habitants des Antilles ?",
    options: [
      "D'Europe",
      "D'Amérique du Sud",
      "D'Afrique",
      "D'Asie"
    ],
    correctAnswer: 1,
    explanation: "Les premiers habitants des Antilles seraient venus d'Amérique du Sud, migrant progressivement d'île en île."
  },
  {
    question: "Quel était le principal moyen de transport des peuples amérindiens ?",
    options: [
      "Le cheval",
      "Les pirogues (canots)",
      "Les voitures",
      "Les avions"
    ],
    correctAnswer: 1,
    explanation: "Les peuples amérindiens utilisaient des pirogues (canots creusés dans des troncs d'arbres) pour naviguer entre les îles."
  },
  {
    question: "Quelle était l'organisation sociale des Taïnos ?",
    options: [
      "Anarchie",
      "Société organisée avec des caciques (chefs)",
      "Pas d'organisation",
      "Une démocratie moderne"
    ],
    correctAnswer: 1,
    explanation: "Les Taïnos avaient une société organisée en caciquats (territoires) dirigés par des caciques (chefs)."
  },
  {
    question: "Quelle activité artisanale pratiquaient les Taïnos ?",
    options: [
      "La métallurgie",
      "La poterie et le tissage",
      "L'électronique",
      "La mécanique"
    ],
    correctAnswer: 1,
    explanation: "Les Taïnos étaient habiles en poterie, tissage et fabrication d'objets en bois et en pierre."
  },
  {
    question: "Quelle était la religion des Taïnos ?",
    options: [
      "Le christianisme",
      "Animisme (croyance en des esprits de la nature)",
      "L'islam",
      "Ils n'avaient pas de religion"
    ],
    correctAnswer: 1,
    explanation: "Les Taïnos pratiquaient l'animisme, croyant en des esprits (zemis) présents dans la nature."
  },
  {
    question: "Que signifie 'Ayiti' en langue taïno ?",
    options: [
      "Île plate",
      "Terre de hautes montagnes",
      "Île heureuse",
      "Grande mer"
    ],
    correctAnswer: 1,
    explanation: "Ayiti signifie 'terre de hautes montagnes' en taïno, nom donné à l'île en raison de son relief montagneux."
  }
];

export const premiersHabitantsMatching = [
  { id: "1", question: "Pirogue", answer: "Canot amérindien" },
  { id: "2", question: "Caciquat", answer: "Territoire dirigé par un cacique" },
  { id: "3", question: "Zemi", answer: "Esprit ou divinité taïno" },
  { id: "4", question: "Poterie", answer: "Art de fabriquer des objets en argile" },
  { id: "5", question: "Animisme", answer: "Croyance en des esprits de la nature" },
  { id: "6", question: "Migration", answer: "Déplacement de population" }
];

// ===== LEÇON 16: LES MOUVEMENTS DE LA TERRE =====
export const mouvementsTerreQuiz = [
  {
    question: "Combien de mouvements principaux la Terre effectue-t-elle ?",
    options: [
      "1",
      "2 (rotation et révolution)",
      "5",
      "10"
    ],
    correctAnswer: 1,
    explanation: "La Terre effectue deux mouvements principaux : la rotation (sur elle-même) et la révolution (autour du Soleil)."
  },
  {
    question: "Combien de temps dure une rotation complète de la Terre ?",
    options: [
      "12 heures",
      "24 heures (1 jour)",
      "1 mois",
      "1 an"
    ],
    correctAnswer: 1,
    explanation: "La Terre met environ 24 heures pour effectuer une rotation complète sur elle-même, créant le cycle jour/nuit."
  },
  {
    question: "Qu'est-ce que la rotation de la Terre provoque ?",
    options: [
      "Les saisons",
      "L'alternance du jour et de la nuit",
      "Les années",
      "Les mois"
    ],
    correctAnswer: 1,
    explanation: "La rotation de la Terre sur son axe provoque l'alternance du jour et de la nuit."
  },
  {
    question: "Combien de temps dure une révolution complète de la Terre autour du Soleil ?",
    options: [
      "24 heures",
      "365 jours (1 an)",
      "1 mois",
      "1 semaine"
    ],
    correctAnswer: 1,
    explanation: "La Terre met environ 365 jours (une année) pour faire une révolution complète autour du Soleil."
  },
  {
    question: "Qu'est-ce que la révolution de la Terre provoque ?",
    options: [
      "Le jour et la nuit",
      "Les saisons",
      "Les marées",
      "Les vents"
    ],
    correctAnswer: 1,
    explanation: "La révolution de la Terre autour du Soleil, combinée à l'inclinaison de son axe, provoque les saisons."
  },
  {
    question: "Pourquoi avons-nous des saisons ?",
    options: [
      "À cause de la Lune",
      "À cause de l'inclinaison de l'axe terrestre",
      "À cause des nuages",
      "À cause des océans"
    ],
    correctAnswer: 1,
    explanation: "Les saisons sont causées par l'inclinaison de l'axe de la Terre (23,5°) pendant sa révolution autour du Soleil."
  }
];

export const mouvementsTerreMatching = [
  { id: "1", question: "Rotation", answer: "Tour de la Terre sur elle-même (24h)" },
  { id: "2", question: "Révolution", answer: "Tour de la Terre autour du Soleil (365j)" },
  { id: "3", question: "Jour", answer: "Résultat de la rotation" },
  { id: "4", question: "Saisons", answer: "Résultat de la révolution et de l'inclinaison" },
  { id: "5", question: "Axe terrestre", answer: "Ligne imaginaire de pôle à pôle" },
  { id: "6", question: "Orbite", answer: "Trajectoire de la Terre autour du Soleil" }
];

// ===== LEÇON 17: L'HUMANITÉ DANS LA CARAÏBE =====
export const humaniteCaraibeQuiz = [
  {
    question: "Quels sont les trois principaux groupes qui ont formé la population caribéenne ?",
    options: [
      "Européens, Asiatiques, Africains",
      "Amérindiens, Européens, Africains",
      "Américains, Chinois, Indiens",
      "Français, Anglais, Espagnols"
    ],
    correctAnswer: 1,
    explanation: "La population caribéenne est le résultat du mélange entre les Amérindiens (premiers habitants), les Européens (colonisateurs) et les Africains (amenés comme esclaves)."
  },
  {
    question: "Qu'est-ce que le métissage ?",
    options: [
      "Une séparation des peuples",
      "Le mélange de différentes cultures et ethnies",
      "Un type de nourriture",
      "Une religion"
    ],
    correctAnswer: 1,
    explanation: "Le métissage est le mélange de différentes cultures, ethnies et traditions, créant une nouvelle identité culturelle."
  },
  {
    question: "Quelle institution terrible a marqué l'histoire des Caraïbes ?",
    options: [
      "L'éducation",
      "L'esclavage",
      "Le commerce",
      "L'agriculture"
    ],
    correctAnswer: 1,
    explanation: "L'esclavage, où des millions d'Africains ont été amenés de force dans les Caraïbes, a profondément marqué l'histoire de la région."
  },
  {
    question: "Qu'est-ce que la diversité culturelle caribéenne ?",
    options: [
      "Une seule culture",
      "La coexistence de multiples cultures et traditions",
      "L'absence de culture",
      "Une culture européenne seulement"
    ],
    correctAnswer: 1,
    explanation: "La diversité culturelle caribéenne est la richesse créée par le mélange des traditions amérindiennes, européennes, africaines et asiatiques."
  },
  {
    question: "Quelle est la principale langue parlée en Haïti ?",
    options: [
      "L'espagnol",
      "Le créole et le français",
      "L'anglais",
      "Le portugais"
    ],
    correctAnswer: 1,
    explanation: "Haïti a deux langues officielles : le créole haïtien (parlé par tous) et le français, héritage de la colonisation."
  },
  {
    question: "Qu'est-ce qui caractérise la cuisine caribéenne ?",
    options: [
      "Une seule tradition culinaire",
      "Un mélange d'influences amérindiennes, africaines et européennes",
      "Seulement la cuisine française",
      "Pas de caractéristique"
    ],
    correctAnswer: 1,
    explanation: "La cuisine caribéenne est un mélange savoureux d'influences amérindiennes, africaines et européennes."
  }
];

export const humaniteCaraibeMatching = [
  { id: "1", question: "Métissage", answer: "Mélange de cultures et ethnies" },
  { id: "2", question: "Esclavage", answer: "Travail forcé et privation de liberté" },
  { id: "3", question: "Créole", answer: "Langue issue du mélange linguistique" },
  { id: "4", question: "Diversité", answer: "Coexistence de multiples cultures" },
  { id: "5", question: "Colonisation", answer: "Domination par une puissance étrangère" },
  { id: "6", question: "Patrimoine", answer: "Héritage culturel commun" }
];

// ===== LEÇON 18: PARTICULARITÉS CLIMATIQUES DES CARAÏBES =====
export const particularitesClimatiquesQuiz = [
  {
    question: "Quel type de climat domine dans les Caraïbes ?",
    options: [
      "Climat polaire",
      "Climat tropical maritime",
      "Climat désertique",
      "Climat continental"
    ],
    correctAnswer: 1,
    explanation: "Les Caraïbes ont un climat tropical maritime, chaud et humide toute l'année avec influence de la mer."
  },
  {
    question: "Qu'est-ce qu'un alizé ?",
    options: [
      "Un type d'ouragan",
      "Un vent régulier soufflant de l'est",
      "Une pluie",
      "Un courant marin"
    ],
    correctAnswer: 1,
    explanation: "Les alizés sont des vents réguliers soufflant de l'est vers l'ouest, rafraîchissant les îles caribéennes."
  },
  {
    question: "Quand se situe généralement la saison des ouragans dans les Caraïbes ?",
    options: [
      "Janvier à mars",
      "Juin à novembre",
      "Toute l'année",
      "Décembre"
    ],
    correctAnswer: 1,
    explanation: "La saison des ouragans s'étend de juin à novembre, avec un pic d'activité en août, septembre et octobre."
  },
  {
    question: "Pourquoi les îles caribéennes reçoivent-elles beaucoup de pluie ?",
    options: [
      "À cause de la neige",
      "À cause de l'évaporation de l'eau de mer chaude",
      "À cause du désert",
      "À cause de la Lune"
    ],
    correctAnswer: 1,
    explanation: "L'eau chaude de la mer des Caraïbes s'évapore, forme des nuages et retombe en pluie abondante."
  },
  {
    question: "Qu'est-ce qu'un cyclone tropical ?",
    options: [
      "Un petit vent",
      "Une puissante tempête tournante avec des vents violents",
      "Une vague",
      "Un tremblement de terre"
    ],
    correctAnswer: 1,
    explanation: "Un cyclone tropical (ou ouragan) est une puissante tempête tournante avec des vents très violents formée au-dessus des eaux chaudes."
  },
  {
    question: "Quelle température moyenne fait-il dans les Caraïbes ?",
    options: [
      "10-15°C",
      "25-30°C",
      "0-5°C",
      "40-45°C"
    ],
    correctAnswer: 1,
    explanation: "Les Caraïbes ont une température moyenne de 25-30°C toute l'année, avec peu de variations saisonnières."
  }
];

export const particularitesClimatiquesMatching = [
  { id: "1", question: "Climat tropical maritime", answer: "Chaud et humide avec influence marine" },
  { id: "2", question: "Alizés", answer: "Vents réguliers de l'est" },
  { id: "3", question: "Cyclone", answer: "Tempête tropicale violente" },
  { id: "4", question: "Saison humide", answer: "Période de fortes pluies" },
  { id: "5", question: "Évaporation", answer: "Transformation de l'eau en vapeur" },
  { id: "6", question: "Précipitations", answer: "Pluie tombant au sol" }
];

// ===== LEÇON 19: LA VIE ÉCONOMIQUE =====
export const vieEconomiqueQuiz = [
  {
    question: "Qu'est-ce que l'économie ?",
    options: [
      "L'étude des animaux",
      "L'ensemble des activités de production et d'échange",
      "L'étude des plantes",
      "L'histoire"
    ],
    correctAnswer: 1,
    explanation: "L'économie est l'ensemble des activités humaines de production, distribution et consommation de biens et services."
  },
  {
    question: "Quels sont les trois secteurs économiques principaux ?",
    options: [
      "Agriculture, industrie, services",
      "Pêche, chasse, cueillette",
      "Import, export, vente",
      "Nord, Sud, Centre"
    ],
    correctAnswer: 0,
    explanation: "Les trois secteurs économiques sont : primaire (agriculture, pêche), secondaire (industrie), tertiaire (services)."
  },
  {
    question: "Qu'est-ce que le secteur primaire ?",
    options: [
      "Les services",
      "L'extraction et la production de matières premières (agriculture, pêche)",
      "L'industrie",
      "Le commerce"
    ],
    correctAnswer: 1,
    explanation: "Le secteur primaire regroupe les activités d'extraction et de production de matières premières : agriculture, pêche, mines."
  },
  {
    question: "Que produit le secteur secondaire ?",
    options: [
      "Des aliments bruts",
      "Des biens manufacturés et transformés",
      "Des services",
      "Des idées"
    ],
    correctAnswer: 1,
    explanation: "Le secteur secondaire transforme les matières premières en produits finis (industrie, construction)."
  },
  {
    question: "Qu'est-ce que le secteur tertiaire ?",
    options: [
      "L'agriculture",
      "Les services (éducation, santé, commerce)",
      "L'industrie",
      "La pêche"
    ],
    correctAnswer: 1,
    explanation: "Le secteur tertiaire regroupe toutes les activités de services : éducation, santé, commerce, transport, tourisme."
  },
  {
    question: "Pourquoi le commerce est-il important pour un pays ?",
    options: [
      "Il ne l'est pas",
      "Il permet l'échange de biens et la création de richesses",
      "Pour faire joli",
      "Pour imiter les autres"
    ],
    correctAnswer: 1,
    explanation: "Le commerce permet aux pays d'échanger des biens, de générer des revenus et de créer des emplois."
  }
];

export const vieEconomiqueMatching = [
  { id: "1", question: "Économie", answer: "Production et échange de biens" },
  { id: "2", question: "Secteur primaire", answer: "Agriculture, pêche, mines" },
  { id: "3", question: "Secteur secondaire", answer: "Industrie et transformation" },
  { id: "4", question: "Secteur tertiaire", answer: "Services" },
  { id: "5", question: "Commerce", answer: "Échange de biens et services" },
  { id: "6", question: "Production", answer: "Création de biens" }
];

// ===== LEÇON 20: REPRÉSENTATION DE LA TERRE =====
export const representationTerreQuiz = [
  {
    question: "Quel est le meilleur moyen de représenter la Terre avec exactitude ?",
    options: [
      "Une carte plate",
      "Un globe terrestre",
      "Un dessin",
      "Une photo"
    ],
    correctAnswer: 1,
    explanation: "Le globe terrestre est la représentation la plus exacte de la Terre car il respecte sa forme sphérique."
  },
  {
    question: "Qu'est-ce qu'une carte géographique ?",
    options: [
      "Une photo de la Terre",
      "Une représentation plane d'une partie de la Terre",
      "Un globe",
      "Un livre"
    ],
    correctAnswer: 1,
    explanation: "Une carte géographique est une représentation plane (à plat) simplifiée d'une partie ou de toute la surface de la Terre."
  },
  {
    question: "Qu'est-ce qu'une échelle sur une carte ?",
    options: [
      "Un escalier",
      "Le rapport entre les distances sur la carte et les distances réelles",
      "Un outil",
      "Une couleur"
    ],
    correctAnswer: 1,
    explanation: "L'échelle indique le rapport entre les distances mesurées sur la carte et les distances réelles sur le terrain."
  },
  {
    question: "À quoi servent les lignes de latitude et longitude ?",
    options: [
      "À décorer la carte",
      "À localiser précisément un point sur la Terre",
      "À mesurer la hauteur",
      "À indiquer les pays"
    ],
    correctAnswer: 1,
    explanation: "Les latitudes (parallèles) et longitudes (méridiens) forment un système de coordonnées pour localiser n'importe quel point sur Terre."
  },
  {
    question: "Qu'est-ce que l'équateur ?",
    options: [
      "Un pays",
      "La ligne imaginaire au milieu de la Terre (latitude 0°)",
      "Une montagne",
      "Un océan"
    ],
    correctAnswer: 1,
    explanation: "L'équateur est une ligne imaginaire qui divise la Terre en deux hémisphères (Nord et Sud) à latitude 0°."
  },
  {
    question: "Pourquoi les cartes déforment-elles toujours un peu la réalité ?",
    options: [
      "Par erreur",
      "Parce qu'il est impossible de représenter une sphère sur une surface plane sans déformation",
      "Par mauvaise volonté",
      "Parce qu'elles sont vieilles"
    ],
    correctAnswer: 1,
    explanation: "Il est mathématiquement impossible de représenter une surface sphérique sur un plan sans introduire des déformations."
  }
];

export const representationTerreMatching = [
  { id: "1", question: "Globe terrestre", answer: "Représentation sphérique de la Terre" },
  { id: "2", question: "Carte", answer: "Représentation plane de la Terre" },
  { id: "3", question: "Échelle", answer: "Rapport distances carte/réel" },
  { id: "4", question: "Latitude", answer: "Coordonnée nord-sud (parallèles)" },
  { id: "5", question: "Longitude", answer: "Coordonnée est-ouest (méridiens)" },
  { id: "6", question: "Équateur", answer: "Ligne à 0° de latitude" }
];

// ===== LEÇON 21: RÉGIONS CLIMATIQUES DU GLOBE =====
export const regionsClimatiquesQuiz = [
  {
    question: "Combien de grandes zones climatiques trouve-t-on sur Terre ?",
    options: [
      "2",
      "5 (polaire, tempérée froide, tempérée, tropicale, équatoriale)",
      "10",
      "20"
    ],
    correctAnswer: 1,
    explanation: "On distingue généralement 5 grandes zones climatiques basées sur la température et les précipitations."
  },
  {
    question: "Quelle zone climatique se trouve à l'équateur ?",
    options: [
      "Zone polaire",
      "Zone équatoriale (chaude et humide)",
      "Zone tempérée",
      "Zone désertique"
    ],
    correctAnswer: 1,
    explanation: "La zone équatoriale, près de l'équateur, est caractérisée par des températures élevées et des précipitations abondantes toute l'année."
  },
  {
    question: "Comment est le climat aux pôles Nord et Sud ?",
    options: [
      "Chaud",
      "Très froid avec glace permanente",
      "Tropical",
      "Tempéré"
    ],
    correctAnswer: 1,
    explanation: "Les zones polaires (Arctique et Antarctique) ont un climat très froid avec des températures négatives et de la glace permanente."
  },
  {
    question: "Qu'est-ce qui détermine principalement le climat d'une région ?",
    options: [
      "La couleur du sol",
      "La latitude, l'altitude, la distance à la mer",
      "La taille des maisons",
      "Les animaux"
    ],
    correctAnswer: 1,
    explanation: "Le climat d'une région dépend principalement de la latitude (distance à l'équateur), de l'altitude et de la proximité de la mer."
  },
  {
    question: "Quel climat caractérise l'Europe de l'Ouest ?",
    options: [
      "Tropical",
      "Tempéré avec quatre saisons",
      "Polaire",
      "Désertique"
    ],
    correctAnswer: 1,
    explanation: "L'Europe de l'Ouest a un climat tempéré avec quatre saisons distinctes et des précipitations régulières."
  },
  {
    question: "Dans quelle zone climatique se trouve Haïti ?",
    options: [
      "Polaire",
      "Tropicale",
      "Tempérée",
      "Désertique"
    ],
    correctAnswer: 1,
    explanation: "Haïti se situe dans la zone tropicale, avec des températures chaudes toute l'année et une saison des pluies."
  }
];

export const regionsClimatiquesMatching = [
  { id: "1", question: "Zone équatoriale", answer: "Chaud et humide toute l'année" },
  { id: "2", question: "Zone tropicale", answer: "Chaud avec saison sèche et humide" },
  { id: "3", question: "Zone tempérée", answer: "Quatre saisons distinctes" },
  { id: "4", question: "Zone polaire", answer: "Très froid, glace permanente" },
  { id: "5", question: "Latitude", answer: "Distance à l'équateur" },
  { id: "6", question: "Précipitations", answer: "Pluie et neige tombant au sol" }
];

// ===== LEÇON 22: MODES DE FIGURATION DU RELIEF =====
export const modesFigurationQuiz = [
  {
    question: "Comment peut-on représenter le relief sur une carte ?",
    options: [
      "Seulement en couleur",
      "Par courbes de niveau, couleurs hypsométriques, hachures",
      "Avec des photos",
      "On ne peut pas"
    ],
    correctAnswer: 1,
    explanation: "Le relief peut être représenté sur une carte par différentes techniques : courbes de niveau, couleurs hypsométriques (vert, jaune, marron), hachures."
  },
  {
    question: "Qu'est-ce qu'une courbe de niveau ?",
    options: [
      "Une route",
      "Une ligne reliant des points de même altitude",
      "Une rivière",
      "Une frontière"
    ],
    correctAnswer: 1,
    explanation: "Une courbe de niveau est une ligne imaginaire qui relie tous les points situés à la même altitude sur le terrain."
  },
  {
    question: "Que signifie généralement la couleur verte sur une carte de relief ?",
    options: [
      "Les montagnes",
      "Les basses altitudes (plaines)",
      "La mer",
      "Le désert"
    ],
    correctAnswer: 1,
    explanation: "La couleur verte sur une carte hypsométrique indique généralement les basses altitudes (plaines, vallées)."
  },
  {
    question: "Que représente la couleur marron foncé sur une carte de relief ?",
    options: [
      "La mer",
      "Les hautes montagnes",
      "Les plaines",
      "Les forêts"
    ],
    correctAnswer: 1,
    explanation: "Le marron foncé ou le blanc représente les altitudes élevées (hautes montagnes, sommets)."
  },
  {
    question: "Qu'est-ce qu'un profil topographique ?",
    options: [
      "Une photo",
      "Une coupe verticale montrant l'élévation du terrain",
      "Une carte normale",
      "Un dessin d'arbre"
    ],
    correctAnswer: 1,
    explanation: "Un profil topographique est une représentation en coupe verticale qui montre les variations d'altitude le long d'une ligne."
  },
  {
    question: "Pourquoi les courbes de niveau rapprochées indiquent-elles une pente forte ?",
    options: [
      "Par erreur",
      "Parce que l'altitude change rapidement sur une courte distance",
      "Par hasard",
      "Elles ne l'indiquent pas"
    ],
    correctAnswer: 1,
    explanation: "Quand les courbes de niveau sont rapprochées, cela signifie que l'altitude change beaucoup sur une petite distance, donc une pente forte."
  }
];

export const modesFigurationMatching = [
  { id: "1", question: "Courbe de niveau", answer: "Ligne d'égale altitude" },
  { id: "2", question: "Couleur verte", answer: "Basses altitudes (plaines)" },
  { id: "3", question: "Couleur marron", answer: "Hautes altitudes (montagnes)" },
  { id: "4", question: "Profil topographique", answer: "Coupe verticale du terrain" },
  { id: "5", question: "Altitude", answer: "Hauteur par rapport à la mer" },
  { id: "6", question: "Pente", answer: "Inclinaison du terrain" }
];

// ===== LEÇON 23: LE POTENTIEL HYDRAULIQUE =====
export const potentielHydrauliqueQuiz = [
  {
    question: "Qu'est-ce que le potentiel hydraulique ?",
    options: [
      "La quantité de poissons",
      "La capacité des cours d'eau à produire de l'énergie",
      "La profondeur de la mer",
      "La couleur de l'eau"
    ],
    correctAnswer: 1,
    explanation: "Le potentiel hydraulique est la capacité des cours d'eau et chutes d'eau à produire de l'énergie électrique (hydroélectricité)."
  },
  {
    question: "Comment l'eau peut-elle produire de l'électricité ?",
    options: [
      "En restant immobile",
      "En faisant tourner des turbines grâce à son mouvement",
      "En s'évaporant",
      "En gelant"
    ],
    correctAnswer: 1,
    explanation: "L'eau en mouvement (chutes, barrages) fait tourner des turbines qui produisent de l'électricité."
  },
  {
    question: "Quel équipement permet de produire de l'hydroélectricité ?",
    options: [
      "Un puits",
      "Un barrage hydroélectrique",
      "Une fontaine",
      "Un aqueduc"
    ],
    correctAnswer: 1,
    explanation: "Un barrage hydroélectrique retient l'eau et utilise sa force pour faire tourner des turbines et produire de l'électricité."
  },
  {
    question: "Pourquoi l'hydroélectricité est-elle considérée comme une énergie renouvelable ?",
    options: [
      "Parce qu'elle est chère",
      "Parce que le cycle de l'eau se renouvelle naturellement",
      "Parce qu'elle est rare",
      "Parce qu'elle pollue"
    ],
    correctAnswer: 1,
    explanation: "L'hydroélectricité est renouvelable car le cycle de l'eau (évaporation, précipitations) se renouvelle constamment grâce au soleil."
  },
  {
    question: "Quels sont les avantages de l'hydroélectricité ?",
    options: [
      "Elle pollue beaucoup",
      "Énergie propre et renouvelable",
      "Elle est très dangereuse",
      "Elle coûte trop cher"
    ],
    correctAnswer: 1,
    explanation: "L'hydroélectricité est une source d'énergie propre (pas de CO2), renouvelable et relativement peu coûteuse une fois installée."
  },
  {
    question: "Quel cours d'eau important d'Haïti pourrait avoir un bon potentiel hydraulique ?",
    options: [
      "Il n'y en a pas",
      "L'Artibonite et ses affluents",
      "Le Nil",
      "L'Amazone"
    ],
    correctAnswer: 1,
    explanation: "L'Artibonite, le plus grand fleuve d'Haïti, et ses affluents ont un potentiel hydraulique grâce à leur débit et leur relief."
  }
];

export const potentielHydrauliqueMatching = [
  { id: "1", question: "Potentiel hydraulique", answer: "Capacité à produire de l'énergie de l'eau" },
  { id: "2", question: "Hydroélectricité", answer: "Électricité produite par l'eau" },
  { id: "3", question: "Barrage", answer: "Construction pour retenir l'eau" },
  { id: "4", question: "Turbine", answer: "Machine transformant le mouvement en électricité" },
  { id: "5", question: "Énergie renouvelable", answer: "Source d'énergie qui se renouvelle" },
  { id: "6", question: "Cours d'eau", answer: "Rivière ou fleuve" }
];

// ===== LEÇON 24: LA SOCIÉTÉ PRÉCOLOMBIENNE =====
export const societePrecolombienneQuiz = [
  {
    question: "Que signifie 'précolombien' ?",
    options: [
      "Après Christophe Colomb",
      "Avant l'arrivée de Christophe Colomb (avant 1492)",
      "Pendant Christophe Colomb",
      "Sans rapport avec Colomb"
    ],
    correctAnswer: 1,
    explanation: "Précolombien signifie 'avant Colomb', c'est-à-dire la période avant l'arrivée de Christophe Colomb en 1492."
  },
  {
    question: "Quelle grande civilisation se trouvait au Mexique avant les Européens ?",
    options: [
      "Les Romains",
      "Les Aztèques",
      "Les Grecs",
      "Les Égyptiens"
    ],
    correctAnswer: 1,
    explanation: "Les Aztèques étaient une puissante civilisation au Mexique, célèbre pour sa capitale Tenochtitlan et ses pyramides."
  },
  {
    question: "Quelle civilisation a construit le Machu Picchu au Pérou ?",
    options: [
      "Les Mayas",
      "Les Incas",
      "Les Aztèques",
      "Les Taïnos"
    ],
    correctAnswer: 1,
    explanation: "Les Incas ont construit le Machu Picchu, une cité célèbre dans les montagnes du Pérou."
  },
  {
    question: "Qu'est-ce qui caractérise les sociétés précolomb</end>iennes ?",
    options: [
      "Aucune organisation",
      "Civilisations avancées avec agriculture, architecture, astronomie",
      "Pas de culture",
      "Aucune connaissance"
    ],
    correctAnswer: 1,
    explanation: "Les sociétés précolonbiennes avaient des civilisations très avancées avec agriculture développée, architecture monumentale et connaissances en astronomie."
  },
  {
    question: "Quel aliment important les civilisations précolombiennes ont-elles cultivé ?",
    options: [
      "Le blé",
      "Le maïs",
      "Le riz",
      "Les pommes"
    ],
    correctAnswer: 1,
    explanation: "Le maïs était l'aliment de base des civilisations précolombiennes (Mayas, Aztèques, Incas, Taïnos)."
  },
  {
    question: "Qu'est-il arrivé à ces civilisations après l'arrivée des Européens ?",
    options: [
      "Elles se sont renforcées",
      "Elles ont été conquises et largement détruites",
      "Rien n'a changé",
      "Elles sont parties"
    ],
    correctAnswer: 1,
    explanation: "Les civilisations précolombiennes ont été conquises par les Espagnols (Cortés, Pizarro) et largement détruites au 16e siècle."
  }
];

export const societePrecolombienneMatching = [
  { id: "1", question: "Précolombien", answer: "Avant l'arrivée de Colomb (avant 1492)" },
  { id: "2", question: "Aztèques", answer: "Civilisation du Mexique" },
  { id: "3", question: "Incas", answer: "Civilisation des Andes (Pérou)" },
  { id: "4", question: "Mayas", answer: "Civilisation d'Amérique centrale" },
  { id: "5", question: "Maïs", answer: "Aliment de base précolombien" },
  { id: "6", question: "Conquête", answer: "Prise de contrôle par la force" }
];

// ===== LEÇON 25: FORMATIONS VÉGÉTALES DE LA CARAÏBE =====
export const formationsVegetalesCaraibeQuiz = [
  {
    question: "Qu'est-ce qu'une formation végétale ?",
    options: [
      "Un type de danse",
      "Un ensemble de plantes caractéristiques d'une région",
      "Un bâtiment",
      "Un animal"
    ],
    correctAnswer: 1,
    explanation: "Une formation végétale est un ensemble de plantes qui poussent naturellement dans une région donnée selon le climat et le sol."
  },
  {
    question: "Quel type de forêt trouve-t-on dans les zones humides des Caraïbes ?",
    options: [
      "Forêt boréale",
      "Forêt tropicale humide",
      "Forêt tempérée",
      "Toundra"
    ],
    correctAnswer: 1,
    explanation: "Les zones humides des Caraïbes abritent des forêts tropicales humides avec une végétation dense et une grande biodiversité."
  },
  {
    question: "Qu'est-ce qu'une mangrove ?",
    options: [
      "Une montagne",
      "Une forêt côtière avec des arbres adaptés à l'eau salée",
      "Un désert",
      "Une prairie"
    ],
    correctAnswer: 1,
    explanation: "La mangrove est une forêt côtière unique avec des arbres (palétuviers) qui ont des racines adaptées pour vivre dans l'eau salée."
  },
  {
    question: "Pourquoi les mangroves sont-elles importantes ?",
    options: [
      "Elles ne sont pas importantes",
      "Protection côtière, nurserie pour poissons, biodiversité",
      "Pour la beauté seulement",
      "Pour le bois seulement"
    ],
    correctAnswer: 1,
    explanation: "Les mangroves protègent les côtes de l'érosion, servent de nurserie aux poissons et abritent une riche biodiversité."
  },
  {
    question: "Quel type de végétation trouve-t-on dans les zones sèches des Caraïbes ?",
    options: [
      "Forêt dense",
      "Végétation xérophile (cactus, arbustes épineux)",
      "Toundra",
      "Forêt de bambous"
    ],
    correctAnswer: 1,
    explanation: "Les zones sèches ont une végétation xérophile adaptée à la sécheresse : cactus, arbustes épineux, plantes grasses."
  },
  {
    question: "Qu'est-ce qui menace les formations végétales caribéennes ?",
    options: [
      "Rien",
      "La déforestation, l'urbanisation, le changement climatique",
      "Trop de pluie",
      "Trop de froid"
    ],
    correctAnswer: 1,
    explanation: "Les formations végétales sont menacées par la déforestation, l'urbanisation rapide et les effets du changement climatique."
  }
];

export const formationsVegetalesCaraibeMatching = [
  { id: "1", question: "Forêt tropicale", answer: "Végétation dense et humide" },
  { id: "2", question: "Mangrove", answer: "Forêt côtière dans l'eau salée" },
  { id: "3", question: "Palétuvier", answer: "Arbre de mangrove" },
  { id: "4", question: "Végétation xérophile", answer: "Plantes adaptées à la sécheresse" },
  { id: "5", question: "Biodiversité", answer: "Variété d'espèces vivantes" },
  { id: "6", question: "Déforestation", answer: "Destruction des forêts" }
];

// ===== LEÇON 26: LE SYSTÈME ÉCOLOGIQUE =====
export const systemeEcologiqueQuiz = [
  {
    question: "Qu'est-ce qu'un écosystème ?",
    options: [
      "Un type de machine",
      "Un ensemble formé par des êtres vivants et leur environnement",
      "Un ordinateur",
      "Une ville"
    ],
    correctAnswer: 1,
    explanation: "Un écosystème est un ensemble formé par des êtres vivants (plantes, animaux) et leur environnement physique (sol, eau, air) en interaction."
  },
  {
    question: "Qu'est-ce qu'une chaîne alimentaire ?",
    options: [
      "Un magasin",
      "Le transfert d'énergie d'un être vivant à un autre par l'alimentation",
      "Une décoration",
      "Un bijou"
    ],
    correctAnswer: 1,
    explanation: "Une chaîne alimentaire montre comment l'énergie passe d'un organisme à un autre : plante → herbivore → carnivore."
  },
  {
    question: "Quel est le rôle des producteurs dans un écosystème ?",
    options: [
      "Manger d'autres animaux",
      "Produire leur nourriture par photosynthèse (plantes)",
      "Détruire",
      "Dormir"
    ],
    correctAnswer: 1,
    explanation: "Les producteurs (plantes) fabriquent leur propre nourriture grâce à la photosynthèse, base de toute chaîne alimentaire."
  },
  {
    question: "Qu'est-ce qu'un consommateur primaire ?",
    options: [
      "Un carnivore",
      "Un herbivore qui mange des plantes",
      "Une plante",
      "Un décomposeur"
    ],
    correctAnswer: 1,
    explanation: "Un consommateur primaire est un herbivore qui se nourrit directement de plantes (ex : lapin, vache, chenille)."
  },
  {
    question: "Quel est le rôle des décomposeurs ?",
    options: [
      "Construire",
      "Recycler la matière organique morte",
      "Chasser",
      "Voler"
    ],
    correctAnswer: 1,
    explanation: "Les décomposeurs (bactéries, champignons) recyclent la matière organique morte en nutriments pour le sol."
  },
  {
    question: "Que se passe-t-il si on retire un maillon d'une chaîne alimentaire ?",
    options: [
      "Rien",
      "L'équilibre de l'écosystème est perturbé",
      "Tout s'améliore",
      "Les plantes disparaissent"
    ],
    correctAnswer: 1,
    explanation: "Si on retire un maillon, l'équilibre de l'écosystème est perturbé : certaines espèces peuvent proliférer, d'autres disparaître."
  }
];

export const systemeEcologiqueMatching = [
  { id: "1", question: "Écosystème", answer: "Êtres vivants + environnement en interaction" },
  { id: "2", question: "Producteur", answer: "Organisme fabriquant sa nourriture (plante)" },
  { id: "3", question: "Consommateur primaire", answer: "Herbivore mangeant des plantes" },
  { id: "4", question: "Consommateur secondaire", answer: "Carnivore mangeant des herbivores" },
  { id: "5", question: "Décomposeur", answer: "Recycle la matière morte" },
  { id: "6", question: "Chaîne alimentaire", answer: "Transfert d'énergie entre organismes" }
];

// ===== LEÇON 27: L'HYDROSPHÈRE =====
export const hydrosphereQuiz = [
  {
    question: "Qu'est-ce que l'hydrosphère ?",
    options: [
      "L'air",
      "L'ensemble de toute l'eau présente sur Terre",
      "Le sol",
      "Les montagnes"
    ],
    correctAnswer: 1,
    explanation: "L'hydrosphère désigne l'ensemble de toute l'eau présente sur Terre : océans, mers, lacs, rivières, glaces, nappes souterraines."
  },
  {
    question: "Quelle proportion de la surface terrestre est couverte d'eau ?",
    options: [
      "25%",
      "Environ 71%",
      "50%",
      "90%"
    ],
    correctAnswer: 1,
    explanation: "Environ 71% de la surface de la Terre est couverte d'eau, principalement par les océans."
  },
  {
    question: "Quelle est la plus grande réserve d'eau douce sur Terre ?",
    options: [
      "Les rivières",
      "Les glaciers et calottes glaciaires",
      "Les lacs",
      "Les nuages"
    ],
    correctAnswer: 1,
    explanation: "La plus grande réserve d'eau douce se trouve dans les glaciers et calottes glaciaires (environ 69% de l'eau douce)."
  },
  {
    question: "Qu'est-ce que le cycle de l'eau ?",
    options: [
      "Un sport",
      "La circulation continue de l'eau (évaporation, précipitation, ruissellement)",
      "Un véhicule",
      "Une danse"
    ],
    correctAnswer: 1,
    explanation: "Le cycle de l'eau est la circulation continue de l'eau : évaporation → condensation → précipitations → ruissellement → océans."
  },
  {
    question: "Pourquoi l'eau est-elle essentielle à la vie ?",
    options: [
      "Elle ne l'est pas",
      "Tous les êtres vivants en ont besoin pour survivre",
      "Pour la décoration",
      "Pour faire du bruit"
    ],
    correctAnswer: 1,
    explanation: "L'eau est indispensable à tous les êtres vivants : elle constitue 60-70% du corps humain et est nécessaire à tous les processus vitaux."
  },
  {
    question: "Qu'est-ce qu'une nappe phréatique ?",
    options: [
      "Une rivière",
      "Une réserve d'eau souterraine",
      "Un océan",
      "Un lac"
    ],
    correctAnswer: 1,
    explanation: "Une nappe phréatique est une réserve d'eau souterraine située dans les roches poreuses, accessible par puits ou sources."
  }
];

export const hydrosphereMatching = [
  { id: "1", question: "Hydrosphère", answer: "Toute l'eau sur Terre" },
  { id: "2", question: "Océan", answer: "Grande étendue d'eau salée" },
  { id: "3", question: "Eau douce", answer: "Eau non salée (rivières, lacs)" },
  { id: "4", question: "Glacier", answer: "Masse de glace" },
  { id: "5", question: "Cycle de l'eau", answer: "Circulation continue de l'eau" },
  { id: "6", question: "Nappe phréatique", answer: "Eau souterraine" }
];

// ===== LEÇON 28: FORMATIONS VÉGÉTALES D'HAÏTI =====
export const formationsVegetalesHaitiQuiz = [
  {
    question: "Quel est le principal problème environnemental d'Haïti ?",
    options: [
      "Trop de forêts",
      "La déforestation massive",
      "Trop d'eau",
      "Trop de glace"
    ],
    correctAnswer: 1,
    explanation: "Haïti souffre d'une déforestation massive : moins de 2% du territoire est encore couvert de forêts naturelles."
  },
  {
    question: "Quelles formations végétales trouve-t-on en Haïti ?",
    options: [
      "Seulement des déserts",
      "Forêts de pins, forêts sèches, mangroves",
      "Seulement la toundra",
      "Aucune végétation"
    ],
    correctAnswer: 1,
    explanation: "Haïti possède (ou possédait) différentes formations : forêts de pins en montagne, forêts sèches, mangroves côtières."
  },
  {
    question: "Où trouve-t-on les forêts de pins en Haïti ?",
    options: [
      "Sur les plages",
      "Dans les régions montagneuses",
      "Sous l'eau",
      "Dans les villes"
    ],
    correctAnswer: 1,
    explanation: "Les forêts de pins se trouvent dans les zones montagneuses d'Haïti, comme le Massif de la Selle et la chaîne des Matheux."
  },
  {
    question: "Quelles sont les conséquences de la déforestation en Haïti ?",
    options: [
      "Plus de pluie",
      "Érosion des sols, inondations, glissements de terrain",
      "Plus d'arbres",
      "Aucune conséquence"
    ],
    correctAnswer: 1,
    explanation: "La déforestation cause l'érosion des sols, des inondations dévastatrices, des glissements de terrain et la perte de biodiversité."
  },
  {
    question: "Pourquoi les arbres sont-ils importants pour Haïti ?",
    options: [
      "Ils ne sont pas importants",
      "Protection des sols, régulation de l'eau, biodiversité",
      "Seulement pour la beauté",
      "Pour bloquer le soleil"
    ],
    correctAnswer: 1,
    explanation: "Les arbres protègent les sols de l'érosion, régulent le cycle de l'eau, fournissent de l'oxygène et abritent la biodiversité."
  },
  {
    question: "Quelle solution peut aider à restaurer la végétation en Haïti ?",
    options: [
      "Couper plus d'arbres",
      "Le reboisement et la protection des forêts existantes",
      "Construire plus de maisons",
      "Ne rien faire"
    ],
    correctAnswer: 1,
    explanation: "Le reboisement (planter des arbres), la protection des forêts restantes et l'éducation environnementale sont essentiels."
  }
];

export const formationsVegetalesHaitiMatching = [
  { id: "1", question: "Déforestation", answer: "Destruction massive des forêts" },
  { id: "2", question: "Forêt de pins", answer: "Forêt de montagne en Haïti" },
  { id: "3", question: "Érosion", answer: "Usure et perte du sol" },
  { id: "4", question: "Reboisement", answer: "Plantation d'arbres" },
  { id: "5", question: "Biodiversité", answer: "Variété des espèces vivantes" },
  { id: "6", question: "Mangrove", answer: "Forêt côtière" }
];

// ===== LEÇON 29: ANALYSE CLIMATOLOGIQUE =====
export const analyseClimatologiqueQuiz = [
  {
    question: "Qu'est-ce que la climatologie ?",
    options: [
      "L'étude des animaux",
      "L'étude du climat et de ses variations",
      "L'étude des plantes",
      "L'étude des roches"
    ],
    correctAnswer: 1,
    explanation: "La climatologie est la science qui étudie le climat, ses caractéristiques, ses variations et ses changements à long terme."
  },
  {
    question: "Quelle est la différence entre météo et climat ?",
    options: [
      "Il n'y a pas de différence",
      "La météo est à court terme, le climat est la moyenne à long terme",
      "La météo est plus importante",
      "Le climat change chaque jour"
    ],
    correctAnswer: 1,
    explanation: "La météo décrit les conditions atmosphériques du moment, le climat est la moyenne des conditions sur 30 ans ou plus."
  },
  {
    question: "Quels éléments analyse-t-on pour étudier le climat ?",
    options: [
      "Seulement la pluie",
      "Température, précipitations, vent, humidité, pression",
      "Seulement le vent",
      "Rien"
    ],
    correctAnswer: 1,
    explanation: "L'analyse climatique étudie la température, les précipitations, le vent, l'humidité, la pression atmosphérique, etc."
  },
  {
    question: "Qu'est-ce qu'un climogramme ?",
    options: [
      "Un animal",
      "Un graphique montrant température et précipitations mensuelles",
      "Une photo",
      "Un instrument"
    ],
    correctAnswer: 1,
    explanation: "Un climogramme est un graphique qui représente les températures et précipitations moyennes mensuelles d'un lieu."
  },
  {
    question: "Qu'est-ce que le changement climatique ?",
    options: [
      "Un changement de vêtements",
      "La modification à long terme des températures et conditions climatiques",
      "Un changement de saison",
      "Un changement de pays"
    ],
    correctAnswer: 1,
    explanation: "Le changement climatique est la modification à long terme des températures et des modèles météorologiques de la Terre."
  },
  {
    question: "Quelle est une conséquence du changement climatique pour les Caraïbes ?",
    options: [
      "Plus de neige",
      "Augmentation du niveau de la mer et ouragans plus intenses",
      "Températures plus froides",
      "Aucune conséquence"
    ],
    correctAnswer: 1,
    explanation: "Le changement climatique menace les Caraïbes avec la montée du niveau de la mer, des ouragans plus violents et des sécheresses."
  }
];

export const analyseClimatologiqueMatching = [
  { id: "1", question: "Climatologie", answer: "Science qui étudie le climat" },
  { id: "2", question: "Météo", answer: "Conditions atmosphériques du moment" },
  { id: "3", question: "Climat", answer: "Moyenne des conditions sur 30+ ans" },
  { id: "4", question: "Climogramme", answer: "Graphique température/précipitations" },
  { id: "5", question: "Changement climatique", answer: "Modification à long terme du climat" },
  { id: "6", question: "Précipitations", answer: "Pluie, neige tombant au sol" }
];

// ===== LEÇON 30: LANGUES AFRICAINES EN HAÏTI =====
export const languesAfricainesQuiz = [
  {
    question: "D'où vient le créole haïtien ?",
    options: [
      "D'Europe seulement",
      "Du mélange du français et de langues africaines",
      "D'Asie",
      "D'Amérique du Nord"
    ],
    correctAnswer: 1,
    explanation: "Le créole haïtien est né du contact entre le français des colonisateurs et les langues africaines des esclaves."
  },
  {
    question: "Pourquoi les esclaves ont-ils créé le créole ?",
    options: [
      "Pour s'amuser",
      "Pour communiquer entre eux malgré leurs différentes langues",
      "Par hasard",
      "Pour écrire des livres"
    ],
    correctAnswer: 1,
    explanation: "Les esclaves africains, parlant différentes langues, ont créé le créole pour pouvoir communiquer entre eux et avec les colonisateurs."
  },
  {
    question: "Quelles influences africaines trouve-t-on dans le créole haïtien ?",
    options: [
      "Aucune",
      "Vocabulaire, structures grammaticales, expressions",
      "Seulement les chiffres",
      "Seulement les couleurs"
    ],
    correctAnswer: 1,
    explanation: "Le créole haïtien contient de nombreux mots, structures grammaticales et expressions d'origine africaine (wolof, fon, kikongo, etc.)."
  },
  {
    question: "Quand le créole est-il devenu langue officielle d'Haïti ?",
    options: [
      "En 1492",
      "En 1987",
      "En 2000",
      "En 1804"
    ],
    correctAnswer: 1,
    explanation: "Le créole haïtien est devenu langue officielle d'Haïti aux côtés du français avec la Constitution de 1987."
  },
  {
    question: "Pourquoi le créole est-il important pour l'identité haïtienne ?",
    options: [
      "Il ne l'est pas",
      "C'est la langue parlée par tous les Haïtiens, symbole d'identité",
      "Pour ressembler aux autres",
      "Par obligation"
    ],
    correctAnswer: 1,
    explanation: "Le créole est la langue maternelle de tous les Haïtiens, un symbole fort d'identité nationale et culturelle."
  },
  {
    question: "Qu'est-ce qu'une langue créole ?",
    options: [
      "Une langue ancienne",
      "Une langue née du contact entre différentes langues",
      "Une langue inventée",
      "Une langue morte"
    ],
    correctAnswer: 1,
    explanation: "Une langue créole naît du contact et du mélange entre différentes langues dans un contexte particulier (souvent colonial)."
  }
];

export const languesAfricainesMatching = [
  { id: "1", question: "Créole haïtien", answer: "Langue issue du mélange français-africain" },
  { id: "2", question: "Langue créole", answer: "Langue née du contact entre langues" },
  { id: "3", question: "Wolof", answer: "Langue africaine (Sénégal)" },
  { id: "4", question: "Fon", answer: "Langue africaine (Bénin)" },
  { id: "5", question: "Identité", answer: "Ce qui caractérise un peuple" },
  { id: "6", question: "Patrimoine linguistique", answer: "Héritage des langues" }
];
