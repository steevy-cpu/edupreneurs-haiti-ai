/**
 * Utility to categorize validation failure reasons
 */

export type IssueCategoryKey = 
  | 'concept_not_in_content'
  | 'specific_data_missing'
  | 'cultural_knowledge'
  | 'formula_missing'
  | 'other';

export interface IssueCategory {
  key: IssueCategoryKey;
  label: string;
  description: string;
  icon: string;
}

export const ISSUE_CATEGORIES: Record<IssueCategoryKey, IssueCategory> = {
  concept_not_in_content: {
    key: 'concept_not_in_content',
    label: 'Concept not in content',
    description: 'A key concept required to answer the question is not mentioned in the lesson content',
    icon: '📚',
  },
  specific_data_missing: {
    key: 'specific_data_missing',
    label: 'Specific data missing',
    description: 'A specific date, number, formula, or detail is not present in the content',
    icon: '🔢',
  },
  cultural_knowledge: {
    key: 'cultural_knowledge',
    label: 'Cultural knowledge',
    description: 'Requires general knowledge or cultural context not mentioned in the lesson',
    icon: '🌍',
  },
  formula_missing: {
    key: 'formula_missing',
    label: 'Formula missing',
    description: 'A mathematical or chemical formula is not provided in the content',
    icon: '∑',
  },
  other: {
    key: 'other',
    label: 'Other issues',
    description: 'Validation issue that does not fit other categories',
    icon: '❓',
  },
};

/**
 * Categorize a validation failure reason into a standard category
 */
export function categorizeValidationIssue(reason: string): IssueCategoryKey {
  const lowerReason = reason.toLowerCase();

  // Check for concept-related issues
  if (lowerReason.includes('non mentionné') || lowerReason.includes('not mentioned')) {
    if (lowerReason.includes('concept') || lowerReason.includes('topic') || lowerReason.includes('sujet')) {
      return 'concept_not_in_content';
    }
  }

  // Check for formula-related issues
  if (
    lowerReason.includes('formule') ||
    lowerReason.includes('formula') ||
    lowerReason.includes('équation') ||
    lowerReason.includes('equation')
  ) {
    return 'formula_missing';
  }

  // Check for specific data/detail issues
  if (
    lowerReason.includes('date') ||
    lowerReason.includes('chiffre') ||
    lowerReason.includes('number') ||
    lowerReason.includes('détail') ||
    lowerReason.includes('detail') ||
    lowerReason.includes('spécifique') ||
    lowerReason.includes('specific') ||
    lowerReason.includes('pas présent') ||
    lowerReason.includes('not present') ||
    lowerReason.includes('not provided')
  ) {
    return 'specific_data_missing';
  }

  // Check for cultural/general knowledge issues
  if (
    lowerReason.includes('culture') ||
    lowerReason.includes('connaissances générales') ||
    lowerReason.includes('general knowledge') ||
    lowerReason.includes('common knowledge') ||
    lowerReason.includes('außenseite') ||
    lowerReason.includes('outside')
  ) {
    return 'cultural_knowledge';
  }

  // Default to other
  return 'other';
}

/**
 * Aggregate off-content questions by category
 */
export function aggregateIssuesByCategory(
  offContentQuestions: Array<{ index: number; question: string; reason: string }>
): Record<IssueCategoryKey, number> {
  const aggregated: Record<IssueCategoryKey, number> = {
    concept_not_in_content: 0,
    specific_data_missing: 0,
    cultural_knowledge: 0,
    formula_missing: 0,
    other: 0,
  };

  for (const issue of offContentQuestions) {
    const category = categorizeValidationIssue(issue.reason);
    aggregated[category]++;
  }

  return aggregated;
}

/**
 * Get top N issue categories from aggregated data
 */
export function getTopIssueCategories(
  aggregated: Record<IssueCategoryKey, number>,
  limit: number = 3
): Array<{ category: IssueCategory; count: number }> {
  return Object.entries(aggregated)
    .filter(([, count]) => count > 0)
    .map(([key, count]) => ({
      category: ISSUE_CATEGORIES[key as IssueCategoryKey],
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
