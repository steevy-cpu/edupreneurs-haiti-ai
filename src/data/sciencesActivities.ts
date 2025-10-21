// Quiz questions for different sciences topics

// ===== GÉOLOGIE: STRUCTURE DE LA TERRE =====
export const structureTerreQuiz = [
  {
    question: "Combien de couches principales constituent la structure du globe terrestre selon le cours ?",
    options: ["2 couches", "3 couches", "4 couches", "5 couches"],
    correctAnswer: 2,
    explanation: "Le globe terrestre est constitué de 4 couches principales : l'atmosphère, la lithosphère, l'hydrosphère et l'endosphère."
  },
  {
    question: "Quelle est la couche gazeuse qui entoure la Terre ?",
    options: ["La lithosphère", "L'atmosphère", "L'hydrosphère", "L'endosphère"],
    correctAnswer: 1,
    explanation: "L'atmosphère est la couche gazeuse qui entoure la Terre et contient l'air que nous respirons."
  },
  {
    question: "Quelle couche contient toute l'eau de la planète ?",
    options: ["L'atmosphère", "La lithosphère", "L'hydrosphère", "Le manteau"],
    correctAnswer: 2,
    explanation: "L'hydrosphère regroupe toute l'eau présente sur Terre : océans, mers, lacs, rivières et glaces."
  },
  {
    question: "Quelle est la couche la plus externe de la Terre solide ?",
    options: ["Le noyau", "Le manteau", "La croûte terrestre", "L'atmosphère"],
    correctAnswer: 2,
    explanation: "La croûte terrestre est la couche la plus externe et la plus fine de la lithosphère, où nous vivons."
  },
  {
    question: "Les tremblements de terre sont des manifestations :",
    options: ["D'origine externe", "D'origine interne", "D'origine atmosphérique", "D'origine spatiale"],
    correctAnswer: 1,
    explanation: "Les tremblements de terre, comme les volcans, sont des manifestations d'origine interne du globe terrestre."
  },
  {
    question: "Quelle partie de l'endosphère est composée principalement de fer et de nickel ?",
    options: ["La croûte", "Le manteau", "Le noyau", "L'atmosphère"],
    correctAnswer: 2,
    explanation: "Le noyau, situé au centre de la Terre, est composé principalement de fer et de nickel."
  },
  {
    question: "L'érosion par le vent et l'eau est une manifestation :",
    options: ["D'origine interne", "D'origine externe", "Volcanique", "Sismique"],
    correctAnswer: 1,
    explanation: "L'érosion est causée par des agents externes comme le vent, l'eau et la température."
  },
  {
    question: "Quelle couche de la Terre est la plus épaisse ?",
    options: ["La croûte", "Le manteau", "Le noyau externe", "Le noyau interne"],
    correctAnswer: 1,
    explanation: "Le manteau est la couche la plus épaisse de la Terre, située entre la croûte et le noyau."
  }
];

// ===== GÉOLOGIE: LES VOLCANS =====
export const volcansQuiz = [
  {
    question: "Qu'est-ce que le magma ?",
    options: [
      "De l'eau très chaude",
      "Des roches fondues à l'intérieur de la Terre",
      "De la lave refroidie",
      "Des gaz volcaniques"
    ],
    correctAnswer: 1,
    explanation: "Le magma est une roche fondue à très haute température qui se trouve à l'intérieur de la Terre."
  },
  {
    question: "Comment appelle-t-on le magma une fois qu'il sort du volcan ?",
    options: ["Roche", "Cendre", "Lave", "Vapeur"],
    correctAnswer: 2,
    explanation: "Une fois que le magma atteint la surface et sort du volcan, on l'appelle la lave."
  },
  {
    question: "Où se forme le magma dans un volcan ?",
    options: [
      "Dans la cheminée volcanique",
      "Dans la chambre magmatique",
      "Au sommet du volcan",
      "Dans la croûte terrestre"
    ],
    correctAnswer: 1,
    explanation: "Le magma s'accumule dans une grande poche souterraine appelée chambre magmatique avant de remonter."
  },
  {
    question: "Pourquoi le magma remonte-t-il vers la surface ?",
    options: [
      "Parce qu'il est attiré par la lumière",
      "Parce qu'il est moins dense que les roches environnantes",
      "Parce qu'il est poussé par l'eau",
      "Parce qu'il est plus lourd"
    ],
    correctAnswer: 1,
    explanation: "Le magma est moins dense (plus léger) que les roches qui l'entourent, ce qui le fait remonter vers la surface."
  },
  {
    question: "Quel type d'éruption est le plus dangereux ?",
    options: [
      "L'éruption effusive",
      "L'éruption explosive",
      "L'éruption sous-marine",
      "L'éruption de boue"
    ],
    correctAnswer: 1,
    explanation: "Les éruptions explosives sont les plus dangereuses car elles projettent violemment des cendres, des roches et des gaz."
  },
  {
    question: "Quelle est une conséquence FAVORABLE des volcans ?",
    options: [
      "Destruction des habitations",
      "Enrichissement des sols agricoles",
      "Pollution de l'air",
      "Pertes humaines"
    ],
    correctAnswer: 1,
    explanation: "Les cendres volcaniques enrichissent les sols et les rendent très fertiles pour l'agriculture."
  },
  {
    question: "Combien y a-t-il environ de volcans actifs dans le monde ?",
    options: ["Environ 150", "Environ 500", "Environ 1 500", "Environ 5 000"],
    correctAnswer: 2,
    explanation: "Il existe environ 1 500 volcans actifs dans le monde, dont 50 à 70 entrent en éruption chaque année."
  },
  {
    question: "Quelle source d'énergie peut-on obtenir grâce aux volcans ?",
    options: [
      "L'énergie solaire",
      "L'énergie éolienne",
      "L'énergie géothermique",
      "L'énergie nucléaire"
    ],
    correctAnswer: 2,
    explanation: "L'énergie géothermique utilise la chaleur du sous-sol volcanique pour produire de l'électricité et du chauffage."
  }
];

// Matching games
export const structureTerreMatching = [
  { id: "1", question: "Atmosphère", answer: "Couche gazeuse qui entoure la Terre" },
  { id: "2", question: "Lithosphère", answer: "Partie solide externe de la Terre" },
  { id: "3", question: "Hydrosphère", answer: "Ensemble de toute l'eau sur Terre" },
  { id: "4", question: "Endosphère", answer: "Partie interne de la Terre (manteau et noyau)" },
  { id: "5", question: "Croûte terrestre", answer: "Couche la plus externe et la plus fine" },
  { id: "6", question: "Manteau", answer: "Couche la plus épaisse entre la croûte et le noyau" }
];

export const volcansMatching = [
  { id: "1", question: "Magma", answer: "Roches fondues à l'intérieur de la Terre" },
  { id: "2", question: "Lave", answer: "Magma qui coule à la surface" },
  { id: "3", question: "Chambre magmatique", answer: "Poche où s'accumule le magma" },
  { id: "4", question: "Cheminée volcanique", answer: "Conduit par où remonte le magma" },
  { id: "5", question: "Cratère", answer: "Ouverture au sommet du volcan" },
  { id: "6", question: "Éruption explosive", answer: "Éruption violente avec projections" }
];

// ===== ÉLECTRICITÉ: UTILISATION DE LA BALANCE =====
export const balanceQuiz = [
  {
    question: "À quoi sert une balance ?",
    options: ["Mesurer la longueur", "Mesurer la masse", "Mesurer le volume", "Mesurer la température"],
    correctAnswer: 1,
    explanation: "Une balance sert à mesurer la masse d'un objet, c'est-à-dire la quantité de matière qu'il contient."
  },
  {
    question: "Quelle est l'unité de mesure de la masse ?",
    options: ["Le mètre", "Le litre", "Le gramme", "Le degré"],
    correctAnswer: 2,
    explanation: "La masse se mesure en grammes (g) ou kilogrammes (kg). Le kilogramme est l'unité de base."
  },
  {
    question: "Que doit-on faire avant d'utiliser une balance ?",
    options: ["La chauffer", "La tarer (mettre à zéro)", "La refroidir", "La secouer"],
    correctAnswer: 1,
    explanation: "Il faut toujours tarer la balance (la mettre à zéro) avant de peser un objet pour obtenir une mesure précise."
  },
  {
    question: "Quel type de balance utilise des poids marqués ?",
    options: ["Balance électronique", "Balance à plateau", "Balance de Roberval", "Balance de cuisine"],
    correctAnswer: 2,
    explanation: "La balance de Roberval utilise deux plateaux et des poids marqués pour équilibrer et mesurer la masse."
  },
  {
    question: "Sur quelle surface doit-on placer une balance pour une mesure précise ?",
    options: ["Surface inclinée", "Surface plane et stable", "Surface molle", "Surface en mouvement"],
    correctAnswer: 1,
    explanation: "Pour obtenir une mesure précise, la balance doit être placée sur une surface plane et stable."
  },
  {
    question: "Si un objet pèse 0,5 kg, combien pèse-t-il en grammes ?",
    options: ["5 g", "50 g", "500 g", "5000 g"],
    correctAnswer: 2,
    explanation: "1 kg = 1000 g, donc 0,5 kg = 500 g. Il faut multiplier par 1000 pour convertir des kg en g."
  }
];

export const balanceMatching = [
  { id: "1", question: "Balance", answer: "Instrument pour mesurer la masse" },
  { id: "2", question: "Masse", answer: "Quantité de matière d'un objet" },
  { id: "3", question: "Tarer", answer: "Remettre la balance à zéro" },
  { id: "4", question: "Gramme", answer: "Unité de mesure de la masse" },
  { id: "5", question: "Balance de Roberval", answer: "Balance avec deux plateaux et des poids" },
  { id: "6", question: "Kilogramme", answer: "1000 grammes" }
];

// ===== ÉLECTRICITÉ: COURTS-CIRCUITS =====
export const courtsCircuitsQuiz = [
  {
    question: "Qu'est-ce qu'un court-circuit ?",
    options: [
      "Un circuit très court",
      "Un circuit où le courant passe directement sans passer par les appareils",
      "Un circuit avec beaucoup d'appareils",
      "Un circuit éteint"
    ],
    correctAnswer: 1,
    explanation: "Un court-circuit se produit quand le courant électrique trouve un chemin direct sans passer par les appareils, créant un passage à très faible résistance."
  },
  {
    question: "Que se passe-t-il lors d'un court-circuit ?",
    options: [
      "Les lampes s'allument mieux",
      "Le courant devient très intense et chauffe les fils",
      "Le circuit fonctionne normalement",
      "Le courant s'arrête complètement"
    ],
    correctAnswer: 1,
    explanation: "Lors d'un court-circuit, le courant devient très intense car il ne rencontre presque aucune résistance, ce qui chauffe dangereusement les fils."
  },
  {
    question: "Quel danger principal présente un court-circuit ?",
    options: ["Économie d'électricité", "Risque d'incendie", "Amélioration du circuit", "Aucun danger"],
    correctAnswer: 1,
    explanation: "Le principal danger du court-circuit est le risque d'incendie causé par la surchauffe des fils électriques."
  },
  {
    question: "Comment peut-on se protéger d'un court-circuit ?",
    options: [
      "En utilisant plus d'appareils",
      "En installant un fusible ou un disjoncteur",
      "En augmentant la tension",
      "En mouillant les fils"
    ],
    correctAnswer: 1,
    explanation: "Les fusibles et disjoncteurs coupent automatiquement le courant en cas de court-circuit pour protéger l'installation."
  },
  {
    question: "Que fait un fusible quand le courant devient trop fort ?",
    options: ["Il fond et coupe le circuit", "Il s'allume", "Il augmente la tension", "Il refroidit les fils"],
    correctAnswer: 0,
    explanation: "Un fusible contient un fil fin qui fond (se coupe) quand le courant est trop fort, coupant ainsi le circuit pour éviter les dangers."
  },
  {
    question: "Quelle situation peut provoquer un court-circuit ?",
    options: [
      "Des fils électriques bien isolés",
      "Deux fils dénudés qui se touchent",
      "Une lampe qui s'allume",
      "Un interrupteur ouvert"
    ],
    correctAnswer: 1,
    explanation: "Quand deux fils dénudés (sans isolation) se touchent, ils créent un chemin direct pour le courant, provoquant un court-circuit."
  }
];

export const courtsCircuitsMatching = [
  { id: "1", question: "Court-circuit", answer: "Passage direct du courant sans résistance" },
  { id: "2", question: "Fusible", answer: "Dispositif de protection qui fond en cas de surintensité" },
  { id: "3", question: "Disjoncteur", answer: "Interrupteur automatique de sécurité" },
  { id: "4", question: "Surintensité", answer: "Courant électrique trop fort" },
  { id: "5", question: "Surchauffe", answer: "Élévation dangereuse de la température des fils" },
  { id: "6", question: "Risque d'incendie", answer: "Principal danger du court-circuit" }
];

// ===== ÉLECTRICITÉ: LA PILE ÉLECTRIQUE =====
export const pileElectriqueQuiz = [
  {
    question: "Quel est le rôle d'une pile dans un circuit électrique ?",
    options: [
      "Allumer les lampes",
      "Fournir l'énergie électrique",
      "Couper le courant",
      "Mesurer le courant"
    ],
    correctAnswer: 1,
    explanation: "La pile est le générateur du circuit : elle fournit l'énergie électrique nécessaire au fonctionnement des appareils."
  },
  {
    question: "Combien de bornes possède une pile ?",
    options: ["1 borne", "2 bornes", "3 bornes", "4 bornes"],
    correctAnswer: 1,
    explanation: "Une pile possède 2 bornes : une borne positive (+) et une borne négative (-)."
  },
  {
    question: "Par quel symbole représente-t-on la borne positive d'une pile ?",
    options: ["–", "+", "×", "÷"],
    correctAnswer: 1,
    explanation: "La borne positive de la pile est représentée par le symbole plus (+)."
  },
  {
    question: "Que se passe-t-il si on branche une pile à l'envers dans un circuit simple ?",
    options: [
      "Le circuit ne fonctionne pas du tout",
      "Le circuit fonctionne mais dans le sens inverse",
      "La pile explose",
      "Le circuit fonctionne normalement"
    ],
    correctAnswer: 1,
    explanation: "Si on inverse la pile, le courant circule dans le sens inverse et le circuit peut fonctionner (les lampes s'allument quand même dans un circuit simple)."
  },
  {
    question: "Comment appelle-t-on la tension fournie par une pile ?",
    options: ["Le voltage", "L'ampérage", "La résistance", "La puissance"],
    correctAnswer: 0,
    explanation: "La tension fournie par une pile s'appelle le voltage et se mesure en volts (V)."
  },
  {
    question: "Que peut-on faire pour augmenter la tension dans un circuit ?",
    options: [
      "Ajouter des lampes",
      "Mettre plusieurs piles en série",
      "Mouiller la pile",
      "Utiliser des fils plus courts"
    ],
    correctAnswer: 1,
    explanation: "En mettant plusieurs piles bout à bout en série (+ d'une pile avec – de l'autre), on additionne leurs tensions."
  },
  {
    question: "Une pile de 1,5 V et une pile de 1,5 V montées en série fournissent :",
    options: ["1,5 V", "3 V", "0,75 V", "4,5 V"],
    correctAnswer: 1,
    explanation: "En montage série, les tensions s'additionnent : 1,5 V + 1,5 V = 3 V."
  }
];

export const pileElectriqueMatching = [
  { id: "1", question: "Pile", answer: "Générateur d'énergie électrique" },
  { id: "2", question: "Borne positive", answer: "Marquée par le symbole +" },
  { id: "3", question: "Borne négative", answer: "Marquée par le symbole –" },
  { id: "4", question: "Tension", answer: "Mesurée en volts (V)" },
  { id: "5", question: "Montage en série", answer: "Piles bout à bout, tensions additionnées" },
  { id: "6", question: "Volt", answer: "Unité de mesure de la tension électrique" }
];

// ===== ÉLECTRICITÉ: MONTAGE EN SÉRIE =====
export const montageSerieQuiz = [
  {
    question: "Dans un montage en série, comment sont branchés les appareils ?",
    options: [
      "Les uns à côté des autres",
      "Les uns à la suite des autres",
      "Chacun sur une branche différente",
      "Tous sur la borne positive"
    ],
    correctAnswer: 1,
    explanation: "En montage série, les appareils sont branchés les uns à la suite des autres, formant une seule boucle."
  },
  {
    question: "Combien de chemins le courant peut-il emprunter dans un circuit en série ?",
    options: ["Aucun chemin", "Un seul chemin", "Deux chemins", "Plusieurs chemins"],
    correctAnswer: 1,
    explanation: "Dans un circuit en série, le courant ne peut emprunter qu'un seul chemin pour circuler."
  },
  {
    question: "Que se passe-t-il si une lampe grille dans un circuit en série ?",
    options: [
      "Les autres lampes continuent de fonctionner",
      "Toutes les lampes s'éteignent",
      "Les autres lampes brillent plus fort",
      "Rien ne se passe"
    ],
    correctAnswer: 1,
    explanation: "Si une lampe grille en série, elle coupe le circuit et toutes les autres lampes s'éteignent car le courant ne peut plus circuler."
  },
  {
    question: "Que se passe-t-il avec l'éclat des lampes quand on ajoute une lampe en série ?",
    options: [
      "Elles brillent plus fort",
      "Elles brillent moins fort",
      "Elles gardent le même éclat",
      "Elles s'éteignent"
    ],
    correctAnswer: 1,
    explanation: "En ajoutant une lampe en série, l'énergie de la pile est partagée entre plus de lampes, donc chacune brille moins fort."
  },
  {
    question: "Quel est l'inconvénient principal d'un circuit en série ?",
    options: [
      "Il consomme trop d'énergie",
      "Si un appareil tombe en panne, tout s'arrête",
      "Il est trop compliqué",
      "Il nécessite plusieurs piles"
    ],
    correctAnswer: 1,
    explanation: "L'inconvénient majeur du montage série est que si un seul appareil ne fonctionne plus, tout le circuit s'arrête."
  },
  {
    question: "Dans un circuit série avec 3 lampes identiques, comment se répartit la tension de la pile ?",
    options: [
      "Toute la tension va à la première lampe",
      "La tension est partagée également entre les 3 lampes",
      "Seules 2 lampes reçoivent de la tension",
      "La tension double"
    ],
    correctAnswer: 1,
    explanation: "La tension de la pile se répartit également entre toutes les lampes en série : chacune reçoit 1/3 de la tension totale."
  }
];

export const montageSerieMatching = [
  { id: "1", question: "Montage série", answer: "Appareils branchés les uns après les autres" },
  { id: "2", question: "Boucle unique", answer: "Un seul chemin pour le courant" },
  { id: "3", question: "Partage de tension", answer: "La tension se divise entre les appareils" },
  { id: "4", question: "Dépendance", answer: "Si un appareil s'arrête, tout s'arrête" },
  { id: "5", question: "Éclat diminué", answer: "Plus d'appareils = moins d'éclat" },
  { id: "6", question: "Guirlande", answer: "Exemple de montage en série" }
];

// ===== ÉLECTRICITÉ: MONTAGE EN PARALLÈLE =====
export const montageParalleleQuiz = [
  {
    question: "Dans un montage en parallèle, comment sont branchés les appareils ?",
    options: [
      "Les uns après les autres",
      "Chacun directement aux bornes de la pile",
      "Tous sur la même borne",
      "En forme de cercle"
    ],
    correctAnswer: 1,
    explanation: "En montage parallèle, chaque appareil est branché directement entre les deux bornes de la pile, formant des branches indépendantes."
  },
  {
    question: "Combien de chemins peut emprunter le courant dans un circuit en parallèle ?",
    options: ["Un seul chemin", "Deux chemins", "Plusieurs chemins", "Aucun chemin"],
    correctAnswer: 2,
    explanation: "Dans un circuit parallèle, le courant peut emprunter plusieurs chemins différents, un pour chaque branche."
  },
  {
    question: "Que se passe-t-il si une lampe grille dans un circuit en parallèle ?",
    options: [
      "Toutes les lampes s'éteignent",
      "Les autres lampes continuent de fonctionner normalement",
      "Les autres lampes brillent moins",
      "Le circuit explose"
    ],
    correctAnswer: 1,
    explanation: "Si une lampe grille en parallèle, les autres continuent de fonctionner car chaque branche est indépendante."
  },
  {
    question: "Comment est l'éclat des lampes en montage parallèle par rapport au montage série ?",
    options: [
      "Plus faible",
      "Identique",
      "Plus fort",
      "Variable"
    ],
    correctAnswer: 2,
    explanation: "En parallèle, chaque lampe reçoit toute la tension de la pile, donc elles brillent plus fort qu'en série."
  },
  {
    question: "Quel est l'avantage principal du montage en parallèle ?",
    options: [
      "Il consomme moins d'énergie",
      "Chaque appareil fonctionne indépendamment",
      "Il est plus simple à réaliser",
      "Il nécessite moins de fils"
    ],
    correctAnswer: 1,
    explanation: "L'avantage majeur du parallèle est l'indépendance des appareils : chacun peut fonctionner sans affecter les autres."
  },
  {
    question: "Comment est branché le circuit électrique d'une maison ?",
    options: ["En série", "En parallèle", "Mixte", "Sans circuit"],
    correctAnswer: 1,
    explanation: "Le circuit électrique d'une maison est en parallèle pour que chaque appareil puisse fonctionner indépendamment."
  },
  {
    question: "Si on ajoute une lampe en parallèle, que se passe-t-il avec les autres ?",
    options: [
      "Elles brillent moins",
      "Elles brillent plus",
      "Leur éclat ne change pas",
      "Elles s'éteignent"
    ],
    correctAnswer: 2,
    explanation: "En parallèle, ajouter une lampe n'affecte pas les autres car chacune reçoit toujours toute la tension de la pile."
  }
];

export const montageParalleleMatching = [
  { id: "1", question: "Montage parallèle", answer: "Appareils branchés sur des branches indépendantes" },
  { id: "2", question: "Branches multiples", answer: "Plusieurs chemins pour le courant" },
  { id: "3", question: "Indépendance", answer: "Chaque appareil fonctionne seul" },
  { id: "4", question: "Tension constante", answer: "Chaque branche reçoit toute la tension" },
  { id: "5", question: "Éclat maximum", answer: "Lampes brillent à pleine puissance" },
  { id: "6", question: "Circuit domestique", answer: "Exemple de montage en parallèle" }
];

// ===== BIOLOGIE: LES VERTÉBRÉS - POISSONS =====
export const poissonsQuiz = [
  {
    question: "Où vivent les poissons ?",
    options: ["Dans l'air", "Dans l'eau", "Sur la terre", "Dans les arbres"],
    correctAnswer: 1,
    explanation: "Les poissons sont des animaux aquatiques qui vivent exclusivement dans l'eau (douce ou salée)."
  },
  {
    question: "Avec quoi respirent les poissons ?",
    options: ["Des poumons", "Des branchies", "La peau", "Ils ne respirent pas"],
    correctAnswer: 1,
    explanation: "Les poissons respirent grâce à leurs branchies qui extraient l'oxygène dissous dans l'eau."
  },
  {
    question: "Comment est le corps des poissons ?",
    options: ["Couvert de poils", "Couvert d'écailles", "Couvert de plumes", "Peau nue"],
    correctAnswer: 1,
    explanation: "Le corps des poissons est recouvert d'écailles qui les protègent et facilitent la nage."
  },
  {
    question: "Comment se déplacent les poissons ?",
    options: ["En marchant", "En volant", "En nageant avec leurs nageoires", "En rampant"],
    correctAnswer: 2,
    explanation: "Les poissons nagent en utilisant leurs nageoires et en ondulant leur corps."
  },
  {
    question: "Quelle est la température du corps des poissons ?",
    options: [
      "Toujours chaude",
      "Variable selon l'eau (sang froid)",
      "Toujours froide",
      "Ils n'ont pas de température"
    ],
    correctAnswer: 1,
    explanation: "Les poissons sont des animaux à sang froid : leur température corporelle varie selon celle de l'eau."
  },
  {
    question: "Comment se reproduisent la plupart des poissons ?",
    options: [
      "Par des œufs pondus dans l'eau",
      "Par des bébés vivants",
      "Par division",
      "Ils ne se reproduisent pas"
    ],
    correctAnswer: 0,
    explanation: "La plupart des poissons pondent des œufs dans l'eau. Les petits naissent ensuite de ces œufs."
  }
];

export const poissonsMatching = [
  { id: "1", question: "Branchies", answer: "Organes respiratoires des poissons" },
  { id: "2", question: "Écailles", answer: "Protection recouvrant le corps des poissons" },
  { id: "3", question: "Nageoires", answer: "Organes de locomotion dans l'eau" },
  { id: "4", question: "Ovipare", answer: "Animal qui pond des œufs" },
  { id: "5", question: "Sang froid", answer: "Température variable selon l'environnement" },
  { id: "6", question: "Aquatique", answer: "Qui vit dans l'eau" }
];

// ===== BIOLOGIE: LES VERTÉBRÉS - AMPHIBIENS =====
export const amphibiensQuiz = [
  {
    question: "Où vivent les amphibiens adultes ?",
    options: [
      "Uniquement dans l'eau",
      "Uniquement sur terre",
      "À la fois dans l'eau et sur terre",
      "Dans les arbres seulement"
    ],
    correctAnswer: 2,
    explanation: "Les amphibiens vivent une double vie : ils passent leur temps à la fois dans l'eau et sur terre. C'est pourquoi on les appelle amphibiens (amphi = double, bios = vie)."
  },
  {
    question: "Qu'est-ce qui caractérise la peau des amphibiens ?",
    options: [
      "Elle est couverte d'écailles",
      "Elle est nue, lisse et humide",
      "Elle est couverte de poils",
      "Elle est couverte de plumes"
    ],
    correctAnswer: 1,
    explanation: "Les amphibiens ont une peau nue, lisse et constamment humide. Ils peuvent respirer à travers leur peau."
  },
  {
    question: "Comment respirent les têtards (bébés grenouilles) ?",
    options: ["Avec des poumons", "Avec des branchies", "Par la peau", "Ils ne respirent pas"],
    correctAnswer: 1,
    explanation: "Les têtards respirent avec des branchies comme les poissons car ils vivent entièrement dans l'eau."
  },
  {
    question: "Comment respirent les grenouilles adultes ?",
    options: [
      "Uniquement avec des branchies",
      "Avec des poumons et par la peau",
      "Uniquement par la peau",
      "Elles ne respirent pas"
    ],
    correctAnswer: 1,
    explanation: "Les grenouilles adultes respirent avec des poumons (comme nous) et aussi à travers leur peau humide."
  },
  {
    question: "Quels sont des exemples d'amphibiens ?",
    options: [
      "Poissons et requins",
      "Grenouilles, crapauds et salamandres",
      "Serpents et lézards",
      "Oiseaux et chauves-souris"
    ],
    correctAnswer: 1,
    explanation: "Les grenouilles, les crapauds et les salamandres sont des amphibiens."
  },
  {
    question: "Comment se reproduisent les amphibiens ?",
    options: [
      "Par des œufs pondus dans l'eau",
      "Par des bébés vivants",
      "Par des œufs pondus sur terre",
      "Ils ne se reproduisent pas"
    ],
    correctAnswer: 0,
    explanation: "Les amphibiens pondent leurs œufs dans l'eau. Les petits (têtards) vivent d'abord dans l'eau avant de se transformer en adultes."
  }
];

export const amphibiensMatching = [
  { id: "1", question: "Amphibien", answer: "Animal vivant dans l'eau et sur terre" },
  { id: "2", question: "Peau nue", answer: "Peau lisse et humide sans écailles" },
  { id: "3", question: "Têtard", answer: "Larve aquatique des amphibiens" },
  { id: "4", question: "Métamorphose", answer: "Transformation du têtard en adulte" },
  { id: "5", question: "Poumons", answer: "Organes respiratoires des amphibiens adultes" },
  { id: "6", question: "Grenouille", answer: "Exemple d'amphibien" }
];

// ===== BIOLOGIE: LES VERTÉBRÉS - REPTILES =====
export const reptilesQuiz = [
  {
    question: "Où vivent principalement les reptiles ?",
    options: ["Dans l'eau", "Sur la terre ferme", "Dans les airs", "Sous terre uniquement"],
    correctAnswer: 1,
    explanation: "Les reptiles vivent principalement sur la terre ferme, bien que certains comme les crocodiles passent du temps dans l'eau."
  },
  {
    question: "De quoi est recouverte la peau des reptiles ?",
    options: ["De poils", "D'écailles dures", "De plumes", "Elle est nue"],
    correctAnswer: 1,
    explanation: "Les reptiles ont une peau sèche recouverte d'écailles dures ou de plaques qui les protègent."
  },
  {
    question: "Comment respirent les reptiles ?",
    options: ["Avec des branchies", "Avec des poumons", "Par la peau", "Ils ne respirent pas"],
    correctAnswer: 1,
    explanation: "Tous les reptiles respirent avec des poumons, même ceux qui vivent dans l'eau comme les tortues marines."
  },
  {
    question: "Quels sont des exemples de reptiles ?",
    options: [
      "Grenouilles et crapauds",
      "Serpents, lézards, tortues et crocodiles",
      "Poissons et requins",
      "Oiseaux et chauves-souris"
    ],
    correctAnswer: 1,
    explanation: "Les serpents, lézards, tortues et crocodiles sont tous des reptiles."
  },
  {
    question: "Comment se reproduisent la plupart des reptiles ?",
    options: [
      "Par des œufs avec une coquille dure pondus sur terre",
      "Par des œufs pondus dans l'eau",
      "Par des bébés vivants",
      "Par division"
    ],
    correctAnswer: 0,
    explanation: "La plupart des reptiles pondent des œufs avec une coquille dure sur la terre ferme (contrairement aux amphibiens qui pondent dans l'eau)."
  },
  {
    question: "Les reptiles sont des animaux :",
    options: [
      "À sang chaud",
      "À sang froid",
      "Sans sang",
      "Qui changent de température"
    ],
    correctAnswer: 1,
    explanation: "Les reptiles sont des animaux à sang froid : ils doivent se réchauffer au soleil pour être actifs."
  },
  {
    question: "Comment se déplacent les serpents malgré l'absence de pattes ?",
    options: [
      "Ils volent",
      "Ils ondulent leur corps",
      "Ils roulent",
      "Ils sautent"
    ],
    correctAnswer: 1,
    explanation: "Les serpents se déplacent en ondulant leur corps de manière sinueuse et en utilisant leurs écailles ventrales."
  }
];

export const reptilesMatching = [
  { id: "1", question: "Reptile", answer: "Animal à peau écailleuse vivant sur terre" },
  { id: "2", question: "Écailles dures", answer: "Protection sèche de la peau des reptiles" },
  { id: "3", question: "Poumons", answer: "Organes respiratoires des reptiles" },
  { id: "4", question: "Ovipare terrestre", answer: "Pond des œufs sur terre" },
  { id: "5", question: "Sang froid", answer: "Se réchauffe au soleil" },
  { id: "6", question: "Serpent", answer: "Reptile sans pattes qui ondule" }
];

// ===== BIOLOGIE: LES VERTÉBRÉS - OISEAUX =====
export const oiseauxQuiz = [
  {
    question: "Qu'est-ce qui recouvre le corps des oiseaux ?",
    options: ["Des poils", "Des écailles", "Des plumes", "Une peau nue"],
    correctAnswer: 2,
    explanation: "Les oiseaux sont les seuls animaux dont le corps est recouvert de plumes."
  },
  {
    question: "Comment respirent les oiseaux ?",
    options: ["Avec des branchies", "Avec des poumons", "Par la peau", "Ils ne respirent pas"],
    correctAnswer: 1,
    explanation: "Les oiseaux respirent avec des poumons très efficaces qui leur permettent de voler à haute altitude."
  },
  {
    question: "Les oiseaux sont des animaux :",
    options: ["À sang froid", "À sang chaud", "Sans sang", "Qui ne régulent pas leur température"],
    correctAnswer: 1,
    explanation: "Les oiseaux sont des animaux à sang chaud : ils maintiennent une température corporelle constante, indépendamment de l'environnement."
  },
  {
    question: "Comment se reproduisent les oiseaux ?",
    options: [
      "Par des bébés vivants",
      "Par des œufs qu'ils couvent",
      "Par division",
      "Par des œufs dans l'eau"
    ],
    correctAnswer: 1,
    explanation: "Les oiseaux pondent des œufs à coquille dure qu'ils couvent (réchauffent) jusqu'à l'éclosion des oisillons."
  },
  {
    question: "À quoi servent les plumes des oiseaux ?",
    options: [
      "Uniquement à voler",
      "À voler, se protéger du froid et attirer les partenaires",
      "Uniquement pour la beauté",
      "Elles ne servent à rien"
    ],
    correctAnswer: 1,
    explanation: "Les plumes servent à plusieurs choses : permettre le vol, isoler du froid, repousser l'eau et attirer les partenaires avec les couleurs."
  },
  {
    question: "Qu'est-ce qu'un bec ?",
    options: [
      "Les dents des oiseaux",
      "Une bouche sans dents adaptée à leur alimentation",
      "Leur nez",
      "Leurs oreilles"
    ],
    correctAnswer: 1,
    explanation: "Le bec est une bouche sans dents. Sa forme est adaptée au régime alimentaire de chaque oiseau (insectes, graines, poissons...)."
  },
  {
    question: "Tous les oiseaux peuvent-ils voler ?",
    options: [
      "Oui, tous volent",
      "Non, certains comme l'autruche et le pingouin ne volent pas",
      "Seuls les petits oiseaux volent",
      "Aucun oiseau ne vole"
    ],
    correctAnswer: 1,
    explanation: "La plupart des oiseaux volent, mais certains comme l'autruche, le manchot et le kiwi ont perdu cette capacité au cours de l'évolution."
  }
];

export const oiseauxMatching = [
  { id: "1", question: "Plumes", answer: "Recouvrement unique aux oiseaux" },
  { id: "2", question: "Bec", answer: "Bouche sans dents des oiseaux" },
  { id: "3", question: "Sang chaud", answer: "Température corporelle constante" },
  { id: "4", question: "Couvaison", answer: "Action de réchauffer les œufs" },
  { id: "5", question: "Ailes", answer: "Membres transformés pour le vol" },
  { id: "6", question: "Ovipare", answer: "Pond des œufs qu'il couve" }
];

// ===== BIOLOGIE: LES VERTÉBRÉS - MAMMIFÈRES =====
export const mammifieresQuiz = [
  {
    question: "Qu'est-ce qui recouvre le corps de la plupart des mammifères ?",
    options: ["Des plumes", "Des écailles", "Des poils ou des cheveux", "Une peau nue"],
    correctAnswer: 2,
    explanation: "La plupart des mammifères ont un corps recouvert de poils ou de cheveux qui les protègent et les réchauffent."
  },
  {
    question: "Comment les bébés mammifères se nourrissent-ils à la naissance ?",
    options: [
      "Ils mangent des graines",
      "Ils boivent le lait de leur mère",
      "Ils chassent tout seuls",
      "Ils ne mangent pas"
    ],
    correctAnswer: 1,
    explanation: "Les bébés mammifères se nourrissent du lait produit par les mamelles de leur mère. C'est la caractéristique qui donne leur nom aux mammifères."
  },
  {
    question: "Les mammifères sont des animaux :",
    options: ["À sang froid", "À sang chaud", "Sans sang", "Qui changent de température"],
    correctAnswer: 1,
    explanation: "Les mammifères sont des animaux à sang chaud : ils maintiennent une température corporelle constante."
  },
  {
    question: "Comment respirent les mammifères ?",
    options: ["Avec des branchies", "Avec des poumons", "Par la peau", "Ils ne respirent pas"],
    correctAnswer: 1,
    explanation: "Tous les mammifères respirent avec des poumons, même les mammifères aquatiques comme les baleines et les dauphins."
  },
  {
    question: "Comment naissent la plupart des mammifères ?",
    options: [
      "Ils sortent d'œufs",
      "Ils naissent directement du ventre de leur mère (vivipares)",
      "Par division",
      "Dans l'eau"
    ],
    correctAnswer: 1,
    explanation: "La plupart des mammifères sont vivipares : le bébé se développe dans le ventre de la mère et naît déjà formé."
  },
  {
    question: "L'humain est-il un mammifère ?",
    options: [
      "Non",
      "Oui, car nous avons des poils, allaitons nos bébés et sommes à sang chaud",
      "Seulement les femmes",
      "Seulement les hommes"
    ],
    correctAnswer: 1,
    explanation: "Oui ! L'humain est un mammifère car nous avons toutes les caractéristiques : poils, allaitement, sang chaud, poumons, vivipares."
  },
  {
    question: "Quels animaux sont des mammifères ?",
    options: [
      "Poisson, requin, sardine",
      "Chien, chat, éléphant, baleine, chauve-souris",
      "Aigle, moineau, perroquet",
      "Grenouille, serpent, lézard"
    ],
    correctAnswer: 1,
    explanation: "Les chiens, chats, éléphants, baleines et chauves-souris sont tous des mammifères, malgré leurs différences."
  }
];

export const mammifieresMatching = [
  { id: "1", question: "Mammifère", answer: "Animal qui allaite ses petits" },
  { id: "2", question: "Poils", answer: "Recouvrement du corps des mammifères" },
  { id: "3", question: "Mamelles", answer: "Glandes produisant du lait" },
  { id: "4", question: "Vivipare", answer: "Les petits naissent du ventre de la mère" },
  { id: "5", question: "Sang chaud", answer: "Température constante" },
  { id: "6", question: "Allaitement", answer: "Nourrir avec du lait maternel" }
];

// ===== BIOLOGIE: LES PLANTES - PARTIES D'UNE PLANTE =====
export const partiesPlantesQuiz = [
  {
    question: "Quelles sont les principales parties d'une plante ?",
    options: [
      "Tête, tronc, branches",
      "Racines, tige, feuilles, fleurs",
      "Bras, jambes, tête",
      "Haut et bas"
    ],
    correctAnswer: 1,
    explanation: "Une plante est composée de racines, d'une tige, de feuilles et souvent de fleurs et de fruits."
  },
  {
    question: "Quel est le rôle des racines ?",
    options: [
      "Faire de l'ombre",
      "Fixer la plante au sol et absorber l'eau et les nutriments",
      "Produire des fleurs",
      "Faire des fruits"
    ],
    correctAnswer: 1,
    explanation: "Les racines fixent la plante dans le sol et absorbent l'eau et les sels minéraux nécessaires à sa croissance."
  },
  {
    question: "Quel est le rôle de la tige ?",
    options: [
      "Absorber l'eau du sol",
      "Soutenir la plante et transporter l'eau et les nutriments",
      "Faire la photosynthèse",
      "Produire des graines"
    ],
    correctAnswer: 1,
    explanation: "La tige soutient la plante et transporte l'eau et les nutriments des racines vers les feuilles, et la nourriture des feuilles vers toute la plante."
  },
  {
    question: "Quel est le rôle principal des feuilles ?",
    options: [
      "Décorer la plante",
      "Fabriquer la nourriture par la photosynthèse",
      "Absorber l'eau du sol",
      "Protéger les racines"
    ],
    correctAnswer: 1,
    explanation: "Les feuilles fabriquent la nourriture de la plante grâce à la photosynthèse en utilisant la lumière du soleil, l'eau et le CO2."
  },
  {
    question: "De quoi ont besoin les plantes pour la photosynthèse ?",
    options: [
      "Uniquement de l'eau",
      "Lumière du soleil, eau et dioxyde de carbone (CO2)",
      "Uniquement de la terre",
      "De l'obscurité"
    ],
    correctAnswer: 1,
    explanation: "Pour la photosynthèse, les plantes ont besoin de lumière du soleil, d'eau et de dioxyde de carbone (CO2) de l'air."
  },
  {
    question: "Quel est le rôle de la fleur ?",
    options: [
      "Uniquement décorer",
      "Permettre la reproduction de la plante",
      "Absorber l'eau",
      "Faire de l'ombre"
    ],
    correctAnswer: 1,
    explanation: "La fleur est l'organe de reproduction de la plante. Elle produit des graines après la pollinisation."
  },
  {
    question: "Que produit une plante lors de la photosynthèse ?",
    options: [
      "Du dioxyde de carbone",
      "Du glucose (sucre) et de l'oxygène",
      "De l'eau",
      "De la terre"
    ],
    correctAnswer: 1,
    explanation: "Lors de la photosynthèse, la plante produit du glucose (sa nourriture) et libère de l'oxygène dans l'air que nous respirons."
  }
];

export const partiesPlantesMatching = [
  { id: "1", question: "Racines", answer: "Fixent la plante et absorbent l'eau" },
  { id: "2", question: "Tige", answer: "Soutient et transporte les substances" },
  { id: "3", question: "Feuilles", answer: "Fabriquent la nourriture par photosynthèse" },
  { id: "4", question: "Fleur", answer: "Organe de reproduction" },
  { id: "5", question: "Photosynthèse", answer: "Fabrication de nourriture avec la lumière" },
  { id: "6", question: "Chlorophylle", answer: "Pigment vert qui capte la lumière" }
];

// ===== BIOLOGIE: LES PLANTES - BESOINS DES PLANTES =====
export const besoinsPlantesQuiz = [
  {
    question: "De quoi les plantes ont-elles besoin pour vivre et grandir ?",
    options: [
      "Uniquement de lumière",
      "Lumière, eau, air et nutriments du sol",
      "Uniquement d'eau",
      "Elles n'ont besoin de rien"
    ],
    correctAnswer: 1,
    explanation: "Les plantes ont besoin de quatre éléments essentiels : la lumière du soleil, l'eau, l'air (CO2) et les nutriments du sol."
  },
  {
    question: "Pourquoi les plantes ont-elles besoin de lumière ?",
    options: [
      "Pour voir",
      "Pour fabriquer leur nourriture par photosynthèse",
      "Pour se réchauffer",
      "Pour décorer"
    ],
    correctAnswer: 1,
    explanation: "La lumière est nécessaire pour la photosynthèse, le processus qui permet aux plantes de fabriquer leur propre nourriture."
  },
  {
    question: "Que se passe-t-il si une plante ne reçoit pas assez d'eau ?",
    options: [
      "Elle pousse plus vite",
      "Elle se fane et peut mourir",
      "Elle devient plus verte",
      "Elle produit plus de fleurs"
    ],
    correctAnswer: 1,
    explanation: "Sans assez d'eau, la plante se fane (devient molle) car l'eau donne sa rigidité à la plante. Elle peut mourir si le manque d'eau dure longtemps."
  },
  {
    question: "Que se passe-t-il si une plante ne reçoit pas assez de lumière ?",
    options: [
      "Elle devient plus forte",
      "Elle devient jaune et pousse mal",
      "Elle produit plus de feuilles",
      "Rien ne change"
    ],
    correctAnswer: 1,
    explanation: "Sans assez de lumière, les feuilles deviennent jaunes (jaunissement) car la plante ne peut pas fabriquer de chlorophylle ni faire la photosynthèse."
  },
  {
    question: "D'où viennent les nutriments dont les plantes ont besoin ?",
    options: [
      "Du soleil",
      "Du sol et des engrais",
      "De l'air uniquement",
      "Des nuages"
    ],
    correctAnswer: 1,
    explanation: "Les nutriments (azote, phosphore, potassium...) viennent principalement du sol. On peut ajouter des engrais pour enrichir le sol."
  },
  {
    question: "Quel gaz de l'air les plantes utilisent-elles ?",
    options: [
      "L'oxygène",
      "Le dioxyde de carbone (CO2)",
      "L'azote",
      "L'hydrogène"
    ],
    correctAnswer: 1,
    explanation: "Les plantes absorbent le dioxyde de carbone (CO2) de l'air pour faire la photosynthèse et libèrent de l'oxygène."
  },
  {
    question: "Quelle partie de la plante absorbe l'eau et les nutriments du sol ?",
    options: ["Les feuilles", "La tige", "Les racines", "Les fleurs"],
    correctAnswer: 2,
    explanation: "Ce sont les racines qui absorbent l'eau et les nutriments dissous dans le sol grâce à leurs nombreux poils absorbants."
  }
];

export const besoinsPlantesMatching = [
  { id: "1", question: "Lumière", answer: "Énergie nécessaire à la photosynthèse" },
  { id: "2", question: "Eau", answer: "Transporte les nutriments et donne la rigidité" },
  { id: "3", question: "CO2", answer: "Gaz de l'air utilisé pour la photosynthèse" },
  { id: "4", question: "Nutriments", answer: "Éléments minéraux du sol (azote, phosphore...)" },
  { id: "5", question: "Fanaison", answer: "Plante qui devient molle par manque d'eau" },
  { id: "6", question: "Jaunissement", answer: "Feuilles qui deviennent jaunes par manque de lumière" }
];

// ===== ÉCOLOGIE: LES CHAÎNES ALIMENTAIRES =====
export const chainesAlimentairesQuiz = [
  {
    question: "Qu'est-ce qu'une chaîne alimentaire ?",
    options: [
      "Un collier fait avec de la nourriture",
      "Une suite d'êtres vivants où chacun mange le précédent",
      "Une liste de courses",
      "Un restaurant"
    ],
    correctAnswer: 1,
    explanation: "Une chaîne alimentaire montre qui mange qui dans la nature. Elle commence toujours par une plante et se termine par un prédateur."
  },
  {
    question: "Par quoi commence toujours une chaîne alimentaire ?",
    options: [
      "Un gros animal",
      "Une plante (producteur)",
      "Un humain",
      "Un champignon"
    ],
    correctAnswer: 1,
    explanation: "Toute chaîne alimentaire commence par une plante (le producteur) car les plantes fabriquent leur propre nourriture grâce au soleil."
  },
  {
    question: "Comment appelle-t-on les animaux qui mangent des plantes ?",
    options: ["Carnivores", "Herbivores", "Omnivores", "Prédateurs"],
    correctAnswer: 1,
    explanation: "Les herbivores sont les animaux qui se nourrissent uniquement de plantes (exemples : lapin, vache, éléphant)."
  },
  {
    question: "Comment appelle-t-on les animaux qui mangent d'autres animaux ?",
    options: ["Herbivores", "Producteurs", "Carnivores", "Végétariens"],
    correctAnswer: 2,
    explanation: "Les carnivores sont les animaux qui mangent d'autres animaux (exemples : lion, loup, aigle)."
  },
  {
    question: "Comment appelle-t-on les animaux qui mangent à la fois des plantes et des animaux ?",
    options: ["Herbivores", "Carnivores", "Omnivores", "Producteurs"],
    correctAnswer: 2,
    explanation: "Les omnivores mangent à la fois des plantes et des animaux (exemples : ours, humain, cochon)."
  },
  {
    question: "Dans la chaîne : Herbe → Lapin → Renard, qui est le prédateur final ?",
    options: ["L'herbe", "Le lapin", "Le renard", "Le soleil"],
    correctAnswer: 2,
    explanation: "Le renard est le prédateur final car il est au sommet de cette chaîne : il mange le lapin mais n'est mangé par personne."
  },
  {
    question: "Que se passe-t-il si on enlève un maillon d'une chaîne alimentaire ?",
    options: [
      "Rien ne change",
      "Toute la chaîne est perturbée",
      "Les autres animaux sont plus heureux",
      "Ça ne concerne que cet animal"
    ],
    correctAnswer: 1,
    explanation: "Si on enlève un maillon, toute la chaîne est perturbée : les animaux qui le mangeaient n'ont plus de nourriture, et ceux qu'il mangeait deviennent trop nombreux."
  },
  {
    question: "D'où vient l'énergie de départ de toutes les chaînes alimentaires ?",
    options: ["De l'eau", "Du soleil", "Du vent", "De la terre"],
    correctAnswer: 1,
    explanation: "Toute l'énergie des chaînes alimentaires vient du soleil. Les plantes capturent cette énergie par photosynthèse, puis elle passe aux animaux."
  }
];

export const chainesAlimentairesMatching = [
  { id: "1", question: "Producteur", answer: "Plante qui fabrique sa nourriture (soleil)" },
  { id: "2", question: "Herbivore", answer: "Animal qui mange des plantes" },
  { id: "3", question: "Carnivore", answer: "Animal qui mange d'autres animaux" },
  { id: "4", question: "Omnivore", answer: "Animal qui mange plantes et animaux" },
  { id: "5", question: "Prédateur", answer: "Animal qui chasse d'autres animaux" },
  { id: "6", question: "Proie", answer: "Animal chassé par un prédateur" }
];

// ===== ÉCOLOGIE: LES ÉCOSYSTÈMES =====
export const ecosystemesQuiz = [
  {
    question: "Qu'est-ce qu'un écosystème ?",
    options: [
      "Un type d'animal",
      "Un ensemble d'êtres vivants et leur environnement qui interagissent",
      "Une forêt uniquement",
      "Un ordinateur"
    ],
    correctAnswer: 1,
    explanation: "Un écosystème est un ensemble formé par un milieu de vie (environnement) et tous les êtres vivants qui y habitent et interagissent ensemble."
  },
  {
    question: "Quels sont des exemples d'écosystèmes ?",
    options: [
      "Forêt, océan, désert, prairie",
      "Maison, école, magasin",
      "Voiture, vélo, train",
      "Livre, cahier, stylo"
    ],
    correctAnswer: 0,
    explanation: "Les forêts, océans, déserts, prairies, lacs sont tous des écosystèmes naturels où vivent de nombreuses espèces."
  },
  {
    question: "Que comprend un écosystème ?",
    options: [
      "Uniquement des animaux",
      "Des êtres vivants (animaux, plantes) ET des éléments non-vivants (eau, air, sol)",
      "Uniquement des plantes",
      "Uniquement l'environnement"
    ],
    correctAnswer: 1,
    explanation: "Un écosystème comprend à la fois les êtres vivants (animaux, plantes, micro-organismes) et les éléments non-vivants (eau, air, sol, lumière)."
  },
  {
    question: "Pourquoi les écosystèmes sont-ils importants ?",
    options: [
      "Ils ne sont pas importants",
      "Ils fournissent nourriture, eau, air pur et habitat à tous les êtres vivants",
      "Uniquement pour les animaux sauvages",
      "Pour décorer la planète"
    ],
    correctAnswer: 1,
    explanation: "Les écosystèmes sont essentiels car ils fournissent nourriture, eau potable, air pur, climat régulé et habitat pour tous les êtres vivants, y compris les humains."
  },
  {
    question: "Qu'est-ce que l'équilibre d'un écosystème ?",
    options: [
      "Quand il y a autant de plantes que d'animaux",
      "Quand toutes les espèces coexistent en harmonie sans se détruire",
      "Quand il ne pleut jamais",
      "Quand il n'y a qu'une seule espèce"
    ],
    correctAnswer: 1,
    explanation: "L'équilibre écologique signifie que toutes les espèces d'un écosystème coexistent de manière harmonieuse : les prédateurs régulent les proies, les plantes nourrissent les herbivores, etc."
  },
  {
    question: "Que se passe-t-il si un écosystème est perturbé ou détruit ?",
    options: [
      "Rien de grave",
      "Les espèces qui y vivent perdent leur habitat et peuvent disparaître",
      "D'autres animaux viennent automatiquement",
      "Ça s'arrange tout seul rapidement"
    ],
    correctAnswer: 1,
    explanation: "Quand un écosystème est détruit (déforestation, pollution...), les espèces perdent leur habitat, leur nourriture et peuvent disparaître. L'équilibre est rompu."
  },
  {
    question: "Comment les humains peuvent-ils protéger les écosystèmes ?",
    options: [
      "En construisant des routes partout",
      "En réduisant la pollution, en protégeant les forêts et en respectant la nature",
      "En chassant tous les animaux",
      "En coupant tous les arbres"
    ],
    correctAnswer: 1,
    explanation: "Nous pouvons protéger les écosystèmes en réduisant la pollution, en protégeant les forêts et océans, en créant des réserves naturelles et en respectant la biodiversité."
  },
  {
    question: "Qu'est-ce que la biodiversité ?",
    options: [
      "Un type de plante",
      "La variété de toutes les formes de vie dans un écosystème",
      "Un animal rare",
      "Une maladie"
    ],
    correctAnswer: 1,
    explanation: "La biodiversité est la variété des espèces vivantes (plantes, animaux, micro-organismes) dans un écosystème. Plus elle est grande, plus l'écosystème est en bonne santé."
  }
];

export const ecosystemesMatching = [
  { id: "1", question: "Écosystème", answer: "Milieu de vie et êtres vivants qui interagissent" },
  { id: "2", question: "Habitat", answer: "Lieu où vit une espèce" },
  { id: "3", question: "Biodiversité", answer: "Variété des espèces vivantes" },
  { id: "4", question: "Équilibre écologique", answer: "Harmonie entre les espèces" },
  { id: "5", question: "Pollution", answer: "Dégradation de l'environnement" },
  { id: "6", question: "Conservation", answer: "Protection des écosystèmes et espèces" }
];
