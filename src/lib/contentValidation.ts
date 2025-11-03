// Content quality validation system

export interface QualityMetrics {
  wordCount: number;
  hasHtmlTags: boolean;
  hasTailwindClasses: boolean;
  hasEmojis: boolean;
  mentionsHaiti: boolean;
  structureScore: number;  // 0-100
  readabilityScore: number;  // 0-100
  overallScore: number;  // 0-100
  warnings: string[];
  suggestions: string[];
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ValidationConfig {
  minWords: number;
  maxWords: number;
  requireHtml?: boolean;
  requireEmojis?: boolean;
  requireHaitianContext?: boolean;
}

const GRADE_THRESHOLDS = {
  'A+': 90,
  'A': 80,
  'B': 70,
  'C': 60,
  'D': 50,
  'F': 0,
};

export const validateGeneratedContent = (
  content: string,
  config: ValidationConfig
): QualityMetrics => {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let totalScore = 0;

  // Word count validation
  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount < config.minWords) {
    warnings.push(`Contenu trop court (${wordCount} mots, minimum: ${config.minWords})`);
    totalScore -= 20;
  } else if (wordCount > config.maxWords) {
    warnings.push(`Contenu trop long (${wordCount} mots, maximum: ${config.maxWords})`);
    totalScore -= 10;
  } else {
    totalScore += 30;
  }

  // HTML structure validation
  const hasHtmlTags = /<[^>]+>/.test(content);
  if (config.requireHtml && !hasHtmlTags) {
    warnings.push('Contenu ne contient pas de balises HTML');
    totalScore -= 15;
  } else if (hasHtmlTags) {
    totalScore += 20;
  }

  // Tailwind classes validation
  const hasTailwindClasses = /class="[^"]*(?:bg-|text-|p-|m-|border-|rounded-|flex|grid)/.test(content);
  if (hasHtmlTags && !hasTailwindClasses) {
    suggestions.push('Ajouter des classes Tailwind pour un meilleur style');
    totalScore -= 10;
  } else if (hasTailwindClasses) {
    totalScore += 15;
  }

  // Check for dark mode compatibility
  const hasDarkModeClasses = /dark:/.test(content);
  if (hasTailwindClasses && !hasDarkModeClasses) {
    suggestions.push('Ajouter des classes dark: pour compatibilité mode sombre');
  }

  // Emoji validation
  const hasEmojis = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u.test(content);
  if (config.requireEmojis && !hasEmojis) {
    suggestions.push('Ajouter des émojis pour rendre le contenu plus attrayant');
    totalScore -= 5;
  } else if (hasEmojis) {
    totalScore += 10;
  }

  // Haitian context validation
  const haitianKeywords = [
    'haïti', 'haïtien', 'port-au-prince', 'jacmel', 'cap-haïtien',
    'caraïbe', 'caribéen', 'créole', 'kreyòl', 'gourde',
    'antilles', 'hispaniola', 'ouest', 'artibonite', 'nord',
  ];
  const contentLower = content.toLowerCase();
  const mentionsHaiti = haitianKeywords.some(keyword => contentLower.includes(keyword));
  
  if (config.requireHaitianContext && !mentionsHaiti) {
    warnings.push('Contenu manque de contextualisation haïtienne');
    totalScore -= 15;
  } else if (mentionsHaiti) {
    totalScore += 15;
  }

  // Structure validation (headings, lists, etc.)
  let structureScore = 0;
  const hasHeadings = /<h[2-4]/.test(content);
  const hasLists = /<[uo]l|<li/.test(content);
  const hasParagraphs = /<p/.test(content) || content.split('\n').length > 3;
  
  if (hasHeadings) structureScore += 30;
  if (hasLists) structureScore += 30;
  if (hasParagraphs) structureScore += 40;
  
  totalScore += structureScore * 0.1; // Structure worth 10 points

  // Readability check (basic)
  const avgWordLength = content.replace(/<[^>]*>/g, '').split(/\s+/).reduce((sum, word) => sum + word.length, 0) / wordCount;
  let readabilityScore = 100;
  
  if (avgWordLength > 8) {
    warnings.push('Mots moyens trop longs, simplifier le vocabulaire');
    readabilityScore -= 20;
  }
  
  totalScore += readabilityScore * 0.1; // Readability worth 10 points

  // Calculate overall score (cap at 100)
  const overallScore = Math.min(Math.max(totalScore + 100, 0), 100);

  // Determine grade
  let grade: QualityMetrics['grade'] = 'F';
  for (const [gradeLabel, threshold] of Object.entries(GRADE_THRESHOLDS) as [QualityMetrics['grade'], number][]) {
    if (overallScore >= threshold) {
      grade = gradeLabel;
      break;
    }
  }

  // Add general suggestions
  if (overallScore < 70) {
    suggestions.push('Considérer une régénération avec plus de contexte');
  }
  if (!hasHeadings && content.length > 500) {
    suggestions.push('Ajouter des titres (h3, h4) pour structurer le contenu');
  }
  if (!hasLists && content.length > 300) {
    suggestions.push('Utiliser des listes (ul, ol) pour clarifier les points');
  }

  return {
    wordCount,
    hasHtmlTags,
    hasTailwindClasses,
    hasEmojis,
    mentionsHaiti,
    structureScore,
    readabilityScore,
    overallScore: Math.round(overallScore),
    warnings,
    suggestions,
    grade,
  };
};

export const getGradeColor = (grade: QualityMetrics['grade']): string => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-500';
    case 'B':
    case 'C':
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500';
    case 'D':
    case 'F':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-500';
  }
};

export const getScoreLabel = (score: number): string => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Très bon';
  if (score >= 70) return 'Bon';
  if (score >= 60) return 'Satisfaisant';
  if (score >= 50) return 'Passable';
  return 'À améliorer';
};
