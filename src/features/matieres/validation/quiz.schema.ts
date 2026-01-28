import { z } from 'zod';

/**
 * Canonical Quiz Schema v1
 * Strict JSON structure for AI-generated quizzes
 */

export const QuizQuestionMCQSchema = z.object({
  type: z.literal('mcq'),
  prompt: z.string().min(10, 'Question too short').max(500, 'Question too long'),
  choices: z.array(z.string().max(200)).length(4, 'MCQ must have exactly 4 choices'),
  answerIndex: z.number().min(0).max(3, 'Answer index must be 0-3'),
  explanation: z.string().min(10, 'Explanation too short').max(500, 'Explanation too long'),
  tags: z.array(z.string()).max(5).default([]),
});

export const QuizQuestionShortSchema = z.object({
  type: z.literal('short'),
  prompt: z.string().min(10, 'Question too short').max(500, 'Question too long'),
  answer: z.string().min(1, 'Answer required').max(200, 'Answer too long'),
  explanation: z.string().min(10, 'Explanation too short').max(500, 'Explanation too long'),
  tags: z.array(z.string()).max(5).default([]),
});

export const QuizQuestionSchema = z.discriminatedUnion('type', [
  QuizQuestionMCQSchema,
  QuizQuestionShortSchema,
]);

export const QuizPayloadSchema = z.object({
  version: z.literal(1),
  lessonSlug: z.string().min(1),
  gradeLevel: z.string().min(1),
  subjectSlug: z.string().min(1),
  language: z.enum(['fr', 'ht', 'en', 'es']).default('fr'),
  questions: z.array(QuizQuestionMCQSchema).min(10, 'Quiz must have at least 10 questions').max(15, 'Quiz must have at most 15 questions'),
});

// Types
export type QuizQuestionMCQ = z.infer<typeof QuizQuestionMCQSchema>;
export type QuizQuestionShort = z.infer<typeof QuizQuestionShortSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizPayload = z.infer<typeof QuizPayloadSchema>;

// Validation result type
export interface QuizValidationResult {
  valid: boolean;
  errors: string[];
  payload?: QuizPayload;
}

/**
 * Validate a quiz payload against the schema
 */
export function validateQuizPayload(data: unknown): QuizValidationResult {
  const result = QuizPayloadSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [], payload: result.data };
  }
  
  return {
    valid: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

/**
 * Convert legacy HTML quiz to JSON payload (for migration)
 * This is a basic parser that extracts questions from HTML structure
 */
export function parseHTMLQuizToPayload(
  html: string,
  lessonSlug: string,
  gradeLevel: string,
  subjectSlug: string
): Partial<QuizPayload> | null {
  try {
    const questions: QuizQuestionMCQ[] = [];
    
    // Match quiz-question divs
    const questionRegex = /<div[^>]*class="quiz-question"[^>]*data-number="(\d+)"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="quiz-question"|<\/div>\s*$)/gi;
    const matches = html.matchAll(questionRegex);
    
    for (const match of matches) {
      const content = match[2];
      
      // Extract question text
      const promptMatch = content.match(/<p>([^<]+)\?<\/p>/);
      const prompt = promptMatch ? promptMatch[1].trim() + '?' : '';
      
      // Extract options
      const optionMatches = [...content.matchAll(/<div[^>]*class="option"[^>]*data-answer="([A-D])"[^>]*>([^<]*)<\/div>/gi)];
      const choices = optionMatches.map(m => m[2].replace(/^[A-D]\)\s*/, '').trim());
      
      // Extract correct answer
      const correctMatch = content.match(/data-correct="([A-D])"/);
      const answerLetter = correctMatch ? correctMatch[1] : 'A';
      const answerIndex = ['A', 'B', 'C', 'D'].indexOf(answerLetter);
      
      // Extract explanation
      const explanationMatch = content.match(/<div[^>]*class="correct-answer"[^>]*>[\s\S]*?<p>([^<]+)<\/p>/);
      const explanation = explanationMatch ? explanationMatch[1].trim() : 'Voir la leçon pour plus de détails.';
      
      if (prompt && choices.length === 4) {
        questions.push({
          type: 'mcq',
          prompt,
          choices,
          answerIndex: answerIndex >= 0 ? answerIndex : 0,
          explanation: explanation.length >= 10 ? explanation : 'Voir la leçon pour plus de détails.',
          tags: [],
        });
      }
    }
    
    if (questions.length === 0) return null;
    
    return {
      version: 1,
      lessonSlug,
      gradeLevel,
      subjectSlug,
      language: 'fr',
      questions,
    };
  } catch (error) {
    console.error('Failed to parse HTML quiz:', error);
    return null;
  }
}
