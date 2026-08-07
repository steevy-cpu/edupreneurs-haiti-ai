/**
 * Pure helpers for push prompt visibility.
 * Used by sidebar / mobile nav (amber dot) and by usePushPromptEligible,
 * so both interpret the stored dismissal value identically.
 * Plan C — no database dependency, fully client-side.
 */

/** 7-day soft-dismissal backoff */
export const PUSH_DISMISS_BACKOFF_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Single source of truth for the 'push_prompt_dismissed' localStorage value.
 * Values written by PushPermissionPrompt:
 *   - 'permanent'        → user interacted with the browser prompt, never ask again
 *   - a Date.now() string → soft dismissal, re-ask after 7 days
 *   - legacy 'true'      → treated as permanent (safe default)
 * Anything else / absent → not dismissed.
 */
export function isPushPromptDismissed(): boolean {
  if (typeof window === 'undefined') return true;

  const raw = localStorage.getItem('push_prompt_dismissed');
  if (!raw) return false;
  if (raw === 'permanent' || raw === 'true') return true;

  const dismissedAt = parseInt(raw, 10);
  // Unparseable values are treated as permanent rather than ignored
  if (isNaN(dismissedAt)) return true;

  return Date.now() - dismissedAt <= PUSH_DISMISS_BACKOFF_MS;
}

/**
 * Whether the push permission hint (amber dot) should be visible.
 */
export function isPushHintVisible(): boolean {
  if (typeof window === 'undefined') return false;

  // Show from the first session (matches usePushPromptEligible's soft-ask timing)
  const count = parseInt(localStorage.getItem('edupreneurs_login_count') || '1', 10);
  // Only show when permission hasn't been decided yet
  const permission = 'Notification' in window ? Notification.permission : 'denied';

  return count >= 1 && permission === 'default' && !isPushPromptDismissed();
}
