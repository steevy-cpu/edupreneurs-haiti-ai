/**
 * ExamHub Practice - Runner State Types
 * State machine for the Question Runner UI
 */

import type { ContentBlock, TutorResponse } from '../types/exam.types';

// ============= Runner State Machine =============
export type RunnerState = 
  | 'idle'        // Prompt shown, waiting for answer
  | 'checking'    // API call in progress
  | 'correct'     // Answer validated, show success
  | 'incorrect'   // Answer wrong, show explanation
  | 'revealed'    // User clicked reveal
  | 'error';      // API error

export interface RunnerContext {
  state: RunnerState;
  hintLevel: number;           // 0-3 progressive hints
  selectedAnswer: string | null;
  feedback: TutorResponse | null;
  errorMessage?: string;
}

// ============= Tutor Action Types =============
export type TutorActionType = 'check' | 'hint' | 'reveal' | 'ask' | 'next';

export interface TutorActionPayload {
  action: TutorActionType;
  exercise_id: string;
  answer?: {
    type: 'mcq' | 'short';
    value: string;
  };
  hint_level?: number;
  question?: string;
}

// ============= Exercise Display Types =============
export interface ExerciseForRunner {
  id: string;
  exercise_number: number;
  question_text: string;
  prompt_blocks?: ContentBlock[] | null;
  options?: string[] | null;
  options_json?: Record<string, { blocks: ContentBlock[]; value: string }> | null;
  correct_answer: string | null;
  answer_json?: { index: number; value: string; blocks?: ContentBlock[] } | null;
  concept: string;
  points: number;
  explanation?: string | null;
  explanation_blocks?: ContentBlock[] | null;
  exercise_type: 'multiple_choice' | 'open_ended';
}

export interface SessionForRunner {
  id: string;
  exam_id: string;
  current_exercise: number;
  score: number;
  totalExercises: number;
  completedExercises: number[];
}

// ============= Reference Texts =============
export interface ReferenceText {
  section?: string;
  title?: string;
  text: string;
}
