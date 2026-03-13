/**
 * @file index.ts
 * @description Barrel export for shared library utilities.
 * @module lib
 */

export * from './authValidation';
export * from './avatarMap';
export * from './eventListeners';
export * from './founderConstants'; // canonical source for FOUNDER_USER_IDS + isFounder
export * from './gamesConfig';
export * from './lessonPrompts';
export * from './matieresConstants';
export * from './sanitize';
export * from './slugNormalization';
export * from './streakConstants';
export * from './text-utils';
export * from './textModeration';
export * from './utils';

// quizBattleUtils — explicit named exports to avoid collision with founderConstants re-exports
export {
  calculateLevel,
  getXpForLevel,
  getXpToNextLevel,
  getLevelProgress,
  MATH_SUBJECTS,
  SCIENCE_SUBJECTS,
  LANGUAGE_SUBJECTS,
  SUBJECT_BADGE_THRESHOLDS,
  getWeekStart,
} from './quizBattleUtils';

// Analytics sub-module
export * from './analytics/googleAnalytics';
export * from './analytics/tiktokPixel';
