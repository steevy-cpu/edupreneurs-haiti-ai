// Founder user IDs - these users are platform founders/co-founders
// They should not appear in leaderboards and have special profile display rules
// Single source of truth — quizBattleUtils.ts re-exports from here

export const FOUNDER_USER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy
  '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood
  'a72154dd-97ae-4dfe-a939-b48ecc7764fb', // Rose
];

export const isFounder = (userId: string | null | undefined): boolean => {
  if (!userId) return false;
  return FOUNDER_USER_IDS.includes(userId);
};
