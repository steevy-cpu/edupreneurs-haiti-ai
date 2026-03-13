/**
 * @file batch-generation.types.ts
 * @description Business/data model types for batch lesson generation and validation.
 * @module types
 */

import type { ParsedQuestion, ParsedActivity } from "@/utils/quizActivityParsing";

/** Status of a single lesson's generation pipeline */
export type GenerationStatus = 'pending' | 'in_progress' | 'completed' | 'error';

/** Tracks per-lesson generation progress, sections, quality, and optional audio URLs */
export interface LessonGenerationStatus {
  lessonId: string;
  title: string;
  status: GenerationStatus;
  sectionsGenerated: string[];
  generationTime: number;
  qualityScore?: number;
  error?: string;
  generatedContent?: Record<string, any>;
  audioUrls?: {
    objectif?: string;
    introduction?: string;
    contenu?: string;
    exemples?: string;
  };
}

/** Validation result for a single lesson's quiz and activity content */
export interface LessonValidation {
  lesson: {
    id: string;
    title: string;
    slug: string;
    grade_level: string;
    subject_name: string;
  };
  quizParsed: ParsedQuestion[];
  quizErrors: string[];
  activitiesParsed: ParsedActivity[];
  activityErrors: string[];
  originalActivityContent?: string;
  originalQuizContent?: string;
  aiValidation?: {
    confidence: number;
    issues: Array<{ questionIndex: number; issue: string; suggestedFix?: string }>;
  };
  activityAIValidation?: {
    confidence: number;
    issues: Array<{ activityIndex: number; issue: string; suggestedFix?: string }>;
  };
}

/** Aggregate validation statistics for a batch */
export interface ValidationStats {
  total: number;
  quizValid: number;
  quizInvalid: number;
  activitiesValid: number;
  activitiesInvalid: number;
}

/** Preview of AI-corrected content before applying regeneration */
export interface RegenerationPreview {
  lessonId: string;
  lessonTitle: string;
  type: 'quiz' | 'activity';
  correctedItems: any[];
  newContent: string;
  issuesFixed: number;
}
