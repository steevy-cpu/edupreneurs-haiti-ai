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
    const notDismissed = localStorage.getItem('push_prompt_dismissed') !== 'true';
    const hasServiceWorker = 'serviceWorker' in navigator;

    const shouldShow = count >= 2 && permissionDefault && notDismissed && tourCompleted && hasServiceWorker;

    if (!shouldShow) return;

    // 3-second delay lets the shell fully render before sliding in
    const timer = setTimeout(() => setEligible(true), 3000);
    return () => clearTimeout(timer);
  }, [tourCompleted, tourLoading]);

  return eligible;
}
