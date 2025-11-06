// Centralized prompt templates for AI lesson generation

export const DEFAULT_WORD_COUNTS = {
  objectif: 200,
  introduction: 300,
  contenu: 1000,
  exemples_exercices: 500,
  activites_interactives: 800,
} as const;

export const SECTION_RANGES = {
  objectif: { min: 150, max: 250 },
  introduction: { min: 250, max: 350 },
  contenu: { min: 800, max: 1200 },
  exemples_exercices: { min: 400, max: 700 },
  activites_interactives: { min: 600, max: 1000 },
} as const;

export type SectionName = keyof typeof DEFAULT_WORD_COUNTS;

export const SECTION_DESCRIPTIONS: Record<SectionName, string> = {
  objectif: "Objectifs d'apprentissage",
  introduction: "Introduction à la leçon",
  contenu: "Contenu principal détaillé",
  exemples_exercices: "Exemples et exercices pratiques",
  activites_interactives: "Activités interactives",
};

// Subject-specific guidance for AI
export const SUBJECT_SPECIFIC_ADDITIONS: Record<string, Record<SectionName, string>> = {
  mathematiques: {
    objectif: "Inclure des objectifs de résolution de problèmes et de raisonnement logique.",
    introduction: "Introduire les concepts mathématiques avec des exemples du quotidien haïtien.",
    contenu: "Utiliser des formules mathématiques, des étapes détaillées, des graphiques explicatifs.",
    exemples_exercices: "Inclure des problèmes avec solutions détaillées étape par étape, exercices progressifs.",
    activites_interactives: "Activités interactives de calcul, résolution de problèmes et jeux mathématiques.",
  },
  sciences: {
    objectif: "Inclure des objectifs d'observation, d'expérimentation et de méthode scientifique.",
    introduction: "Présenter le phénomène scientifique avec des observations du contexte haïtien.",
    contenu: "Décrire des expériences, observations, phénomènes naturels haïtiens et caribéens.",
    exemples_exercices: "Proposer des expériences simples réalisables avec du matériel local haïtien.",
    activites_interactives: "Quiz scientifiques, expériences virtuelles et activités d'observation.",
  },
  francais: {
    objectif: "Inclure des objectifs de compréhension, expression écrite/orale et analyse littéraire.",
    introduction: "Présenter le thème avec des références à la littérature haïtienne.",
    contenu: "Utiliser des extraits de textes haïtiens, règles de grammaire, conjugaisons.",
    exemples_exercices: "Exercices de conjugaison, rédaction, compréhension de texte avec contexte haïtien.",
    activites_interactives: "Jeux de vocabulaire, exercices de grammaire interactifs et quiz de compréhension.",
  },
  anglais: {
    objectif: "Inclure des objectifs de communication orale et écrite en anglais.",
    introduction: "Présenter le thème en anglais avec des situations pratiques haïtiennes.",
    contenu: "Vocabulaire thématique, structures grammaticales, dialogues pratiques.",
    exemples_exercices: "Dialogues à compléter, traductions, exercices de conversation avec contexte local.",
    activites_interactives: "Exercices de vocabulaire, quiz de grammaire et activités de compréhension.",
  },
  espagnol: {
    objectif: "Inclure des objectifs de communication en espagnol.",
    introduction: "Présenter le thème en espagnol avec des liens culturels caribéens.",
    contenu: "Vocabulaire, conjugaisons, expressions idiomatiques, comparaisons créole-espagnol.",
    exemples_exercices: "Dialogues, exercices de conjugaison, traductions avec références haïtiennes.",
    activites_interactives: "Jeux de vocabulaire espagnol, quiz de conjugaison et exercices interactifs.",
  },
  'sciences-sociales': {
    objectif: "Inclure des objectifs d'analyse historique, géographique et civique.",
    introduction: "Contextualiser avec l'histoire et la géographie d'Haïti.",
    contenu: "Utiliser des cartes, chronologies, documents historiques haïtiens et caribéens.",
    exemples_exercices: "Analyses de documents historiques haïtiens, études de cas locaux, recherches.",
    activites_interactives: "Quiz d'histoire haïtienne, jeux de géographie et analyses interactives.",
  },
  kreyol: {
    objectif: "Inclure des objectifs de maîtrise de la langue créole haïtienne.",
    introduction: "Valoriser la richesse de la langue créole haïtienne.",
    contenu: "Structures grammaticales créoles, expressions idiomatiques, comparaisons avec le français.",
    exemples_exercices: "Exercices de traduction, proverbes créoles, expressions de la vie quotidienne.",
    activites_interactives: "Activités ludiques et interactives pour pratiquer le créole haïtien.",
  },
};

// Note: activites_interactives uses a specialized edge function
// and doesn't follow the standard prompt template
export const ACTIVITES_SECTION_NOTE = 
  "La section 'activites_interactives' est générée via l'edge function 'generate-interactive-activities' " +
  "qui transforme le contenu de 'exemples_exercices' en format interactif structuré.";

// Tailwind HTML component templates
export const HTML_TEMPLATES = {
  objectiveBox: (content: string) => `
    <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 mb-4 rounded-lg">
      <h4 class="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
        🎯 Objectif
      </h4>
      <p class="text-gray-700 dark:text-gray-300">${content}</p>
    </div>
  `,
  
  didYouKnowBox: (content: string) => `
    <div class="bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500 p-4 mb-4 rounded-lg">
      <h4 class="font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">
        💡 Le savais-tu ?
      </h4>
      <p class="text-gray-700 dark:text-gray-300">${content}</p>
    </div>
  `,
  
  haitianExampleBox: (content: string) => `
    <div class="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 p-4 mb-4 rounded-lg">
      <h4 class="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
        🇭🇹 Exemple Haïtien
      </h4>
      <p class="text-gray-700 dark:text-gray-300">${content}</p>
    </div>
  `,
  
  exerciseBox: (title: string, content: string) => `
    <div class="bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500 p-4 mb-4 rounded-lg">
      <h4 class="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
        ✏️ ${title}
      </h4>
      <div class="text-gray-700 dark:text-gray-300">${content}</div>
    </div>
  `,
};

// Helper to get subject-specific additions
export const getSubjectAdditions = (subject: string, section: SectionName): string => {
  const normalizedSubject = subject.toLowerCase()
    .replace('mathématiques', 'mathematiques')
    .replace('français', 'francais')
    .replace('créole', 'kreyol');
  
  return SUBJECT_SPECIFIC_ADDITIONS[normalizedSubject]?.[section] || '';
};

// Build prompt template
export const buildPromptTemplate = (
  sectionName: SectionName,
  lessonTitle: string,
  gradeLevel: string,
  targetWords: number,
  context?: string
): string => {
  return `Génère le contenu pour {{section_name}} selon {{lesson_topic}} pour {{student_grade}} avec au moins {{words_count}} mots.

Variables:
- {{section_name}}: ${sectionName}
- {{lesson_topic}}: "${lessonTitle}"
- {{student_grade}}: ${gradeLevel}
- {{words_count}}: ${targetWords}

${context ? `Instructions additionnelles: ${context}` : ''}`;
};
