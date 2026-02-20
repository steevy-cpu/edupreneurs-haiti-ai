/**
 * Pure function to check if the push permission hint (amber dot) should be visible.
 * Used by sidebar and mobile nav to show a pulsing dot on the notification bell.
 * Plan C — no database dependency, fully client-side.
 */
export function isPushHintVisible(): boolean {
  if (typeof window === 'undefined') return false;

  // Requires at least 2 logins before showing any push hint
  const count = parseInt(localStorage.getItem('edupreneurs_login_count') || '0', 10);
  // Only show when permission hasn't been decided yet
  const permission = 'Notification' in window ? Notification.permission : 'denied';
  // Respect user's explicit dismissal of the prompt
  const dismissed = localStorage.getItem('push_prompt_dismissed') === 'true';

  return count >= 2 && permission === 'default' && !dismissed;
}
