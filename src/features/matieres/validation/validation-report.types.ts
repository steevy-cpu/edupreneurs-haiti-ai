/**
 * Validation Report Types
 * Used for tracking content quality and alignment
 */

export interface QualityCheck {
  check: string;
  passed: boolean;
  message?: string;
}

export interface ValidationReport {
  passed: boolean;
  schemaErrors: string[];
  alignmentScore: number; // 0-1
  alignmentIssues: string[];
  qualityChecks: QualityCheck[];
  validatedAt: string;
  validatedBy?: string;
}

export type AssetKind = 'quiz_final' | 'activities' | 'outline' | 'keywords';
export type AssetStatus = 'draft' | 'validating' | 'validated' | 'rejected' | 'published';

export interface LessonAsset {
  id: string;
  lesson_id: string;
  kind: AssetKind;
  schema_version: number;
  payload_json: unknown;
  status: AssetStatus;
  validation_report_json: ValidationReport | null;
  generated_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Check context alignment between content and lesson keywords
 * Returns a score from 0 to 1
 */
export function calculateAlignmentScore(
  contentTags: string[],
  lessonKeywords: string[]
): { score: number; issues: string[] } {
  if (lessonKeywords.length === 0) {
    return { score: 1, issues: [] }; // No keywords to check against
  }

  const normalizedContent = contentTags.map(t => t.toLowerCase().trim());
  const normalizedKeywords = lessonKeywords.map(k => k.toLowerCase().trim());

  let matchCount = 0;
  const missingKeywords: string[] = [];

  for (const keyword of normalizedKeywords) {
    const found = normalizedContent.some(tag => 
      tag.includes(keyword) || keyword.includes(tag)
    );
    if (found) {
      matchCount++;
    } else {
      missingKeywords.push(keyword);
    }
  }

  const score = matchCount / normalizedKeywords.length;
  const issues = missingKeywords.length > 0 
    ? [`Missing keywords: ${missingKeywords.join(', ')}`] 
    : [];

  return { score, issues };
}

/**
 * Build a validation report from validation results
 */
export function buildValidationReport(
  schemaErrors: string[],
  alignmentScore: number,
  alignmentIssues: string[],
  qualityChecks: QualityCheck[],
  validatedBy?: string
): ValidationReport {
  const schemaValid = schemaErrors.length === 0;
  const alignmentValid = alignmentScore >= 0.5; // 50% keyword overlap required
  const qualityValid = qualityChecks.every(c => c.passed);

  return {
    passed: schemaValid && alignmentValid && qualityValid,
    schemaErrors,
    alignmentScore,
    alignmentIssues,
    qualityChecks,
    validatedAt: new Date().toISOString(),
    validatedBy,
  };
}
