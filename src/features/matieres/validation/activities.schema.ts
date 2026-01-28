import { z } from 'zod';

/**
 * Canonical Activities Schema v1
 * Strict JSON structure for AI-generated interactive activities
 */

// Activity type-specific data schemas
const FillBlankDataSchema = z.object({
  text: z.string().min(10),
  blanks: z.array(z.object({
    position: z.number(),
    answer: z.string(),
    hint: z.string().optional(),
  })).min(1).max(10),
});

const MatchingDataSchema = z.object({
  pairs: z.array(z.object({
    left: z.string(),
    right: z.string(),
  })).min(3).max(8),
});

const OrderingDataSchema = z.object({
  items: z.array(z.string()).min(3).max(10),
  correctOrder: z.array(z.number()),
});

const TrueFalseDataSchema = z.object({
  statement: z.string().min(10),
  isTrue: z.boolean(),
  explanation: z.string().optional(),
});

const ShortAnswerDataSchema = z.object({
  question: z.string().min(10),
  acceptedAnswers: z.array(z.string()).min(1),
  caseSensitive: z.boolean().default(false),
});

export const ActivitySchema = z.object({
  type: z.enum(['fill-blank', 'matching', 'ordering', 'true-false', 'short-answer']),
  title: z.string().max(100),
  instructions: z.string().max(300),
  expectedOutcome: z.string().max(200),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).max(5).default([]),
  data: z.union([
    FillBlankDataSchema,
    MatchingDataSchema,
    OrderingDataSchema,
    TrueFalseDataSchema,
    ShortAnswerDataSchema,
  ]),
});

export const ActivitiesPayloadSchema = z.object({
  version: z.literal(1),
  lessonSlug: z.string().min(1),
  gradeLevel: z.string().min(1),
  subjectSlug: z.string().min(1),
  language: z.enum(['fr', 'ht', 'en', 'es']).default('fr'),
  activities: z.array(ActivitySchema).min(3, 'Must have at least 3 activities').max(8, 'Must have at most 8 activities'),
});

// Types
export type Activity = z.infer<typeof ActivitySchema>;
export type ActivitiesPayload = z.infer<typeof ActivitiesPayloadSchema>;
export type FillBlankData = z.infer<typeof FillBlankDataSchema>;
export type MatchingData = z.infer<typeof MatchingDataSchema>;
export type OrderingData = z.infer<typeof OrderingDataSchema>;
export type TrueFalseData = z.infer<typeof TrueFalseDataSchema>;
export type ShortAnswerData = z.infer<typeof ShortAnswerDataSchema>;

// Validation result type
export interface ActivitiesValidationResult {
  valid: boolean;
  errors: string[];
  payload?: ActivitiesPayload;
}

/**
 * Validate an activities payload against the schema
 */
export function validateActivitiesPayload(data: unknown): ActivitiesValidationResult {
  const result = ActivitiesPayloadSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: [], payload: result.data };
  }
  
  return {
    valid: false,
    errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}
