/**
 * Wrapper for PWAInstallPrompt — provides props via usePWAInstall hook.
 * Wraps in AnimatePresence for enter/exit animations.
 */

import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePWAInstall } from '@/hooks/usePWAInstall';

const PWAInstallPrompt = lazy(() =>
  import('@/components/PWAInstallPrompt').then(m => ({ default: m.PWAInstallPrompt }))
);

export function PWAPromptWrapper() {
  const { showPrompt, showCelebration, isIOS, isPromptAvailable, installApp, dismissPrompt, closeCelebration } = usePWAInstall();

  // Show when prompt is active OR celebration is playing
  const isVisible = showPrompt || showCelebration;

  return (
    <AnimatePresence>
      {isVisible && (
        <Suspense fallback={null}>
          <PWAInstallPrompt
            isIOS={isIOS}
            isPromptAvailable={isPromptAvailable}
            showCelebration={showCelebration}
            onInstall={installApp}
            onDismiss={dismissPrompt}
            onCloseCelebration={closeCelebration}
          />
        </Suspense>
      )}
    </AnimatePresence>
  );
}

export default PWAPromptWrapper;
