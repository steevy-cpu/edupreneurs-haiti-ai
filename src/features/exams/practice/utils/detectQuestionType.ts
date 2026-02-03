/**
 * Question Type Detection System
 * Pure functions for detecting question types based on exercise data
 */

import type { ExerciseForRunner } from '../types';

export type QuestionType = 'mcq' | 'matching' | 'essay' | 'short';

// ============= Matching Detection Patterns =============
const MATCHING_PATTERNS = [
  /Kol[òo]n\s*A[\s\S]*?Kol[òo]n\s*B/i,     // Creole: "Kolòn A ... Kolòn B"
  /Column\s*A[\s\S]*?Column\s*B/i,          // English: "Column A ... Column B"
  /Colonne\s*A[\s\S]*?Colonne\s*B/i,        // French: "Colonne A ... Colonne B"
  /Asosye\s+[\s\S]+?ak\s+/i,                // Creole: "Asosye X ak Y"
  /Relie[rz]?\s+[\s\S]+?[àa]\s+/i,          // French: "Relie X à Y"
  /Match\s+[\s\S]+?to\s+/i,                 // English: "Match X to Y"
  /Fè\s+kor[eè]spondans/i,                  // Creole: "Fè korèspondans"
  /Faire\s+correspondre/i,                  // French: "Faire correspondre"
];

// ============= Essay Detection Patterns =============
const ESSAY_KEYWORDS = [
  /d[eé]veloppe[rz]?/i,                     // "Développe", "Développer"
  /r[eé]daction/i,                          // "Rédaction"
  /paragraphe/i,                            // "paragraphe"
  /\d+\s*[àa]\s*\d+\s*lignes/i,             // "15 à 20 lignes"
  /dissertation/i,                          // "dissertation"
  /essai/i,                                 // "essai"
  /texte\s+argument/i,                      // "texte argumentatif"
  /production\s+[eé]crite/i,                // "production écrite"
];

const ESSAY_CONCEPTS = [
  'production écrite',
  'rédaction',
  'dissertation',
  'expression écrite',
  'composition',
];

// Minimum points threshold for essay detection
const ESSAY_POINTS_THRESHOLD = 25;

// ============= Helper Functions =============

/**
 * Check if exercise has MCQ options (array or object format)
 */
function hasOptions(exercise: ExerciseForRunner): boolean {
  // Check options_json first (structured format with blocks)
  if (exercise.options_json && Object.keys(exercise.options_json).length > 0) {
    return true;
  }

  // Check options as array
  if (exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0) {
    return true;
  }

  // Check options as object (e.g., {A: "...", B: "..."})
  if (
    exercise.options &&
    typeof exercise.options === 'object' &&
    !Array.isArray(exercise.options) &&
    Object.keys(exercise.options as Record<string, unknown>).length > 0
  ) {
    return true;
  }

  return false;
}

/**
 * Check if question text matches matching question patterns
 */
function isMatchingQuestion(text: string): boolean {
  if (!text) return false;
  return MATCHING_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Check if exercise is an essay question based on multiple indicators
 */
function isEssayQuestion(exercise: ExerciseForRunner): boolean {
  const { question_text, points, concept } = exercise;

  // High point value strongly indicates essay
  if (points >= ESSAY_POINTS_THRESHOLD) {
    return true;
  }

  // Concept-based detection
  if (concept) {
    const lowerConcept = concept.toLowerCase();
    if (ESSAY_CONCEPTS.some(c => lowerConcept.includes(c))) {
      return true;
    }
  }

  // Keyword detection in question text
  if (question_text) {
    if (ESSAY_KEYWORDS.some(pattern => pattern.test(question_text))) {
      return true;
    }

    // Multi-part question detection (a), b), c) structure)
    const multiPartPattern = /[abc]\)\s*[\s\S]+?[abc]\)/;
    if (multiPartPattern.test(question_text)) {
      return true;
    }
  }

  return false;
}

// ============= Main Detection Function =============

/**
 * Detect the question type based on exercise data
 * Priority: MCQ > Matching > Essay > Short
 */
export function detectQuestionType(exercise: ExerciseForRunner): QuestionType {
  // Priority 1: Has explicit options → MCQ
  if (hasOptions(exercise)) {
    return 'mcq';
  }

  // Priority 2: Matching patterns in text
  if (isMatchingQuestion(exercise.question_text)) {
    return 'matching';
  }

  // Priority 3: Essay indicators (points, keywords, concept)
  if (isEssayQuestion(exercise)) {
    return 'essay';
  }

  // Default: Short answer
  return 'short';
}

// Export helper functions for testing
export { hasOptions, isMatchingQuestion, isEssayQuestion };
