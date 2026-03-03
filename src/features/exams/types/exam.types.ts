/**
 * ExamHub Type Definitions
 * Canonical types for the unified exam platform
 */

// ============= Content Blocks (KaTeX support) =============
export interface ContentBlock {
  type: 'text' | 'math-inline' | 'math-block';
  content?: string;
  latex?: string;
}

// ============= Tutor Contract =============
export interface TutorAction {
  type: 'hint' | 'reveal' | 'next' | 'youtube' | 'reference';
  label: string;
  payload?: any;
}

export interface TutorGrading {
  isCorrect?: boolean;
  partialScore?: number;  // 0-100 percentage (0, 25, 50, 75, 100)
  pointsAwarded?: number;
  correctAnswer?: string;
}

export interface TutorResponse {
  blocks: ContentBlock[];
  actions?: TutorAction[];
  grading?: TutorGrading;
  shouldAutoAdvance?: boolean;
  youtubeQuery?: string;
  // Backward compat
  response?: string;
}

// ============= Exam Types =============
export type ExamTrack = '9AF' | 'NS4';
export type ExamType = 'official' | 'model' | 'practice' | 'rattrapage';
export type ExamSeries = 'SMP' | 'SES' | 'SVT' | 'LLA';
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';
export type PracticeMode = 'practice' | 'timed' | 'review';

export interface Exam {
  id: string;
  title: string;
  subject: string;
  subject_slug: string | null;
  grade_level: string;
  track: string | null;
  year: number;
  total_exercises: number;
  total_points: number;
  pdf_url: string | null;
  series: string | null;
  session: string | null;
  is_model_exam: boolean | null;
  version: number | null;
  version_number?: number | null;
  exam_type: string | null;
  reference_texts: unknown;
  /** MENFP official exam duration in minutes (e.g. 120 or 180) */
  duration_minutes?: number | null;
  created_at: string;
}

export interface ReferenceText {
  section?: string;
  title?: string;
  text: string;
}

export interface ExamExercise {
  id: string;
  exam_id: string;
  exercise_number: number;
  exercise_type: 'multiple_choice' | 'open_ended';
  question_text: string;
  prompt_blocks: ContentBlock[] | null;
  options: string[] | null;
  options_json: Record<string, { blocks: ContentBlock[]; value: string }> | null;
  correct_answer: string | null;
  answer_json: { index: number; value: string; blocks?: ContentBlock[] } | null;
  explanation: string | null;
  explanation_blocks: ContentBlock[] | null;
  points: number;
  concept: string;
  difficulty: ExerciseDifficulty;
  concept_tags: string[] | null;
}

export interface ExamPracticeSession {
  id: string;
  exam_id: string;
  user_id: string;
  current_exercise: number;
  completed_exercises: Record<string, boolean>;
  score: number;
  mode: PracticeMode;
  time_remaining: number | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ============= UI Types =============
export interface SubjectInfo {
  name: string;
  slug: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface SeriesInfo {
  value: ExamSeries;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  examCount: number;
}

export type HubStep = 'track' | 'series' | 'subject' | 'exams';
