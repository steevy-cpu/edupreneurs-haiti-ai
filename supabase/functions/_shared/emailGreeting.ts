/**
 * Time-aware greeting helper for email templates.
 * Returns a French greeting appropriate to the current time in Haiti (UTC-5).
 */
export function getTimeAwareGreeting(name: string): string {
  const now = new Date();
  // Resolve current hour in Haiti timezone (America/Port-au-Prince)
  const haitiHour = new Date(
    now.toLocaleString('en-US', { timeZone: 'America/Port-au-Prince' })
  ).getHours();

  if (haitiHour >= 5 && haitiHour < 12) {
    return `Bonjour ${name} ! ☀️`;
  } else if (haitiHour >= 12 && haitiHour < 18) {
    return `Bon après-midi ${name} ! 🌤️`;
  } else if (haitiHour >= 18 && haitiHour < 22) {
    return `Bonsoir ${name} ! 🌙`;
  } else {
    return `Bonne nuit ${name} ! 🌟`;
  }
}
