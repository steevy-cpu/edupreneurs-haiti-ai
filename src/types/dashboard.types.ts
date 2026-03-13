/**
 * @file dashboard.types.ts
 * @description Business/data model types for the Dashboard and its tab components.
 * @module types
 */

/** Generic wrapper for feature-level independent loading/error states */
export interface FeatureState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/** A user's lesson note with optional navigation metadata */
export interface Note {
  id: string;
  lesson_id: string;
  notes: string | null;
  updated_at: string;
  lesson_slug?: string;
  lesson_title?: string;
  subject_slug?: string;
  subject_name?: string;
}

/** A leaderboard entry with rank and profile info */
export interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string;
  nickname: string;
  avatar_url: string | null;
  gold_earned: number;
  academic_grade: string;
  rank: number;
}

/** Recent subject activity with progress percentage */
export interface RecentSubjectProgress {
  subject: string;
  subjectSlug: string;
  lastLessonSlug: string;
  lastLessonTitle: string;
  progress: number;
  lastActivity: string;
}
