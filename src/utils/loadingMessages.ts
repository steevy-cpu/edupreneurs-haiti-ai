/**
 * @file loadingMessages.ts
 * @description Messages de chargement motivants et contextuels pour Edupreneurs.
 * Utilisés à la place des "Chargement..." génériques pour humaniser l'attente.
 */

export const LOADING_MESSAGES = {
  default: [
    "Jude prépare tout pour toi... ⚡",
    "Un instant, on charge tes données... 📚",
    "Presque prêt... 🚀",
    "Chargement en cours... ✨",
  ],
  lesson: [
    "Jude prépare ta leçon... 📖",
    "Chargement de la leçon... 🎓",
    "On prépare ton contenu... ⚡",
  ],
  course: [
    "Chargement de ton cours... 📚",
    "Jude récupère tes matières... 🎯",
    "Un instant... 🚀",
  ],
  notifications: [
    "Chargement de tes notifications... 🔔",
    "On vérifie tes messages... 💬",
  ],
} as const;

/** Pick a random message from the specified category */
export function getRandomLoadingMessage(type: keyof typeof LOADING_MESSAGES = 'default'): string {
  const messages = LOADING_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
}
