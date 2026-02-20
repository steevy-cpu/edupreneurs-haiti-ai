/**
 * Quiz Battle Utility Functions
 * 
 * Level formula matches DB function level_from_xp():
 *   level = floor(sqrt(xp / 100))
 *   xp_for_level = 100 * level^2
 * 
 * Level progression:
 * - Level 1: 100 XP
 * - Level 2: 400 XP
 * - Level 3: 900 XP
 * - Level 5: 2,500 XP
 * - Level 10: 10,000 XP
 */

/**
 * Calculate level from total XP — matches DB level_from_xp() exactly
 */
export const calculateLevel = (totalXp: number): number => {
  if (totalXp < 0) return 1;
  return Math.max(1, Math.floor(Math.sqrt(totalXp / 100)));
};

/**
 * Get total XP required to reach a specific level — matches DB xp_for_level()
 */
export const getXpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return 100 * level * level;
};

/**
 * Get XP remaining to reach the next level
 */
export const getXpToNextLevel = (totalXp: number): number => {
  const currentLevel = calculateLevel(totalXp);
  if (currentLevel >= 100) return 0;
  return getXpForLevel(currentLevel + 1) - totalXp;
};

/**
 * Get progress percentage towards next level (0-100)
 */
export const getLevelProgress = (totalXp: number): number => {
  const currentLevel = calculateLevel(totalXp);
  if (currentLevel >= 100) return 100;
  
  const xpForCurrent = getXpForLevel(currentLevel);
  const xpForNext = getXpForLevel(currentLevel + 1);
  const xpInLevel = totalXp - xpForCurrent;
  const xpNeeded = xpForNext - xpForCurrent;
  
  // Guard against division by zero (level 0→1 edge case)
  if (xpNeeded <= 0) return 0;
  return Math.round((xpInLevel / xpNeeded) * 100);
};

// Single source of truth — re-exported from founderConstants to eliminate duplication.
// BattleLeaderboardPreview and QuizBattleLeaderboard import from here; import path unchanged.
export { FOUNDER_USER_IDS, isFounder } from '@/lib/founderConstants';

/**
 * Subject names that count for the math_expert badge
 */
export const MATH_SUBJECTS = ['Mathématiques'];

/**
 * Subject names that count for the science_master badge
 */
export const SCIENCE_SUBJECTS = [
  'Physique',
  'Chimie',
  'Biologie et géologie',
  'Biologie et Géologie',
  'Sciences Expérimentales',
];

/**
 * Subject names that count for the language_pro badge
 * (User needs success in 3 different languages)
 */
export const LANGUAGE_SUBJECTS = [
  'Français',
  'Anglais',
  'Espagnol',
  'Créole',
  'Kreyòl',
  'KREYÒL',
  'Kreyòl Ayisyen',
];

/**
 * Required correct answers to unlock subject badges
 */
export const SUBJECT_BADGE_THRESHOLDS = {
  math_expert: 50,
  science_master: 50,
  language_pro: 10, // 10 correct answers in each of 3 languages
};

/**
 * Get the start of the current week (Monday) as YYYY-MM-DD
 */
export const getWeekStart = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0]; // YYYY-MM-DD
};
