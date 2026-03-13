/**
 * @file dateUtils.ts
 * @description French-localized relative time formatting for timestamps (e.g. "Il y a 5m", "Hier").
 * @module utils
 *
 * @example
 * formatTimeAgo('2026-03-13T10:00:00Z') // → "Il y a 2h"
 */

/**
 * Formats a timestamp into a human-readable relative time string in French
 */
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 172800) return "Hier";
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};
