/**
 * Quiz Battle Utility Functions
 * 
 * Level calculation formula: XP required per level = 100 * level^1.5
 * 
 * Level progression:
 * - Level 1: 0 XP
 * - Level 2: 100 XP
 * - Level 3: 383 XP
 * - Level 4: 800 XP
 * - Level 5: 1,318 XP
 * - Level 10: 5,623 XP
 */

/**
 * Calculate level based on total XP
 */
export const calculateLevel = (totalXp: number): number => {
  if (totalXp < 0) return 1;
  
  let level = 1;
  let xpAccumulated = 0;
  
  while (true) {
    const xpRequired = Math.floor(100 * Math.pow(level, 1.5));
    if (xpAccumulated + xpRequired > totalXp) {
      return level;
    }
    xpAccumulated += xpRequired;
    level++;
    
    // Safety: max level 100
    if (level > 100) return 100;
  }
};

/**
 * Get total XP required to reach a specific level
 */
export const getXpForLevel = (level: number): number => {
  if (level <= 1) return 0;
  
  let xpAccumulated = 0;
  for (let l = 1; l < level; l++) {
    xpAccumulated += Math.floor(100 * Math.pow(l, 1.5));
  }
  return xpAccumulated;
};

/**
 * Get XP remaining to reach the next level
 */
export const getXpToNextLevel = (totalXp: number): number => {
  const currentLevel = calculateLevel(totalXp);
  if (currentLevel >= 100) return 0;
  
  const xpForNextLevel = getXpForLevel(currentLevel + 1);
  return xpForNextLevel - totalXp;
};

/**
 * Get progress percentage towards next level (0-100)
 */
export const getLevelProgress = (totalXp: number): number => {
  const currentLevel = calculateLevel(totalXp);
  if (currentLevel >= 100) return 100;
  
  const xpForCurrentLevel = getXpForLevel(currentLevel);
  const xpForNextLevel = getXpForLevel(currentLevel + 1);
  const xpInCurrentLevel = totalXp - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  
  return Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);
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
