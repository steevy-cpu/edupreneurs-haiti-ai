/**
 * Hook to determine if the PushPermissionPrompt should be shown.
 * Checks 4 conditions + applies a 3-second delay so shell renders first.
 * Plan C — smart push permission prompt on second login.
 */

import { useState, useEffect } from 'react';
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';
import { isPushPromptDismissed } from './usePushHintVisible';


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

    // Soft-ask right after the onboarding tour (1st login) instead of waiting for a 2nd
    // session — most users never came back, so the ask never fired.
    const count = parseInt(localStorage.getItem('edupreneurs_login_count') || '1', 10);

    const permissionDefault = 'Notification' in window && Notification.permission === 'default';
    const hasServiceWorker = 'serviceWorker' in navigator;

    // Shared interpretation: timestamp = 7-day backoff, 'permanent' = never again
    const notDismissed = !isPushPromptDismissed();

    const shouldShow = count >= 1 && permissionDefault && notDismissed && tourCompleted && hasServiceWorker;


    if (!shouldShow) return;

    // 3-second delay lets the shell fully render before sliding in
    const timer = setTimeout(() => setEligible(true), 3000);
    return () => clearTimeout(timer);
  }, [tourCompleted, tourLoading]);

  return eligible;
}
