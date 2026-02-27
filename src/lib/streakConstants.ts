/**
 * Streak milestone definitions — single source of truth.
 * Used by StreakContext, StreakIndicator, StreakMilestoneModal,
 * and mirrored in the update-streak edge function.
 */

export const STREAK_MILESTONES = [
  { days: 3,   title: 'Débutant',    icon: 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/sprout.gif',  freezeReward: 0 },
  { days: 7,   title: 'Guerrier',    icon: 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/sword.gif',   freezeReward: 1 },
  { days: 14,  title: 'Persévérant', icon: 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/shield.gif',  freezeReward: 0 },
  { days: 30,  title: 'Conquérant',  icon: 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/crown.gif',   freezeReward: 1 },
  { days: 60,  title: 'Champion',    icon: 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/trophy.gif',  freezeReward: 1 },
  { days: 100, title: 'Légende',     icon: 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/star.gif',    freezeReward: 1 },
  { days: 365, title: 'Immortel',    icon: 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/diamond.gif', freezeReward: 2 },
] as const;

/** Flame GIF used by StreakIndicator */
export const STREAK_FLAME_URL = 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/flame.gif';

export type StreakMilestone = typeof STREAK_MILESTONES[number];
