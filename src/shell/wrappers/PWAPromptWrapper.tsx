/**
 * Wrapper for PWAInstallPrompt that provides all required props via usePWAInstall hook.
 * Used in FloatingLayer for centralized placement.
 */

import { lazy, Suspense } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const PWAInstallPrompt = lazy(() => 
  import('@/components/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt }))
);

export function PWAPromptWrapper() {
  const { showPrompt, isIOS, isPromptAvailable, installApp, dismissPrompt } = usePWAInstall();
  
  // Only render if the prompt should be shown
  if (!showPrompt) {
    return null;
  }
  
  return (
    <Suspense fallback={null}>
      <PWAInstallPrompt
        isIOS={isIOS}
        isPromptAvailable={isPromptAvailable}
        onInstall={installApp}
        onDismiss={dismissPrompt}
      />
    </Suspense>
  );
}

export default PWAPromptWrapper;
