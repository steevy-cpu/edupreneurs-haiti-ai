/**
 * Hook to determine if the PushPermissionPrompt should be shown.
 * Checks 4 conditions + applies a 3-second delay so shell renders first.
 * Plan C — smart push permission prompt on second login.
 */

import { useState, useEffect } from 'react';
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';

/**
 * Returns true when all conditions are met after a 3s delay:
 * 1. login_count >= 2
 * 2. Notification.permission === 'default'
 * 3. push_prompt_dismissed not set
 * 4. Onboarding tour completed
 */
export function usePushPromptEligible(): boolean {
  const [eligible, setEligible] = useState(false);
  const { tourCompleted, isLoading: tourLoading } = useFirstTimeUser();

  useEffect(() => {
    // Wait until tour status is loaded before evaluating
    if (tourLoading) return;

    const count = parseInt(localStorage.getItem('edupreneurs_login_count') || '0', 10);
    const permissionDefault = 'Notification' in window && Notification.permission === 'default';
    const hasServiceWorker = 'serviceWorker' in navigator;

    // 7-day re-prompt logic: timestamp = soft dismiss, 'permanent' = never show again
    const dismissed = localStorage.getItem('push_prompt_dismissed');
    let notDismissed = !dismissed;
    if (dismissed && dismissed !== 'permanent') {
      const dismissedAt = parseInt(dismissed, 10);
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      // NaN from legacy 'true' values → treated as permanent (safe default)
      notDismissed = !isNaN(dismissedAt) && Date.now() - dismissedAt > sevenDaysMs;
    }

    const shouldShow = count >= 2 && permissionDefault && notDismissed && tourCompleted && hasServiceWorker;

    if (!shouldShow) return;

    // 3-second delay lets the shell fully render before sliding in
    const timer = setTimeout(() => setEligible(true), 3000);
    return () => clearTimeout(timer);
  }, [tourCompleted, tourLoading]);

  return eligible;
}
