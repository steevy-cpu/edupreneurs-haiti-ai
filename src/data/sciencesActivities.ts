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
