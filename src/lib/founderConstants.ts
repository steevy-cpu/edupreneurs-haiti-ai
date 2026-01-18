// Founder user IDs - these users are platform founders/co-founders
// They should not appear in leaderboards and have special profile display rules
// NOTE: Keep in sync with src/lib/quizBattleUtils.ts

export const FOUNDER_USER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy
  '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood
];

export const isFounder = (userId: string | null | undefined): boolean => {
  if (!userId) return false;
  return FOUNDER_USER_IDS.includes(userId);
};
