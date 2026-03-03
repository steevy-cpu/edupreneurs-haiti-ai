import { useState, useEffect } from 'react';
import { useSessionAuth } from '@/contexts/SessionAuthContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isPromptAvailable: boolean;
  showPrompt: boolean;
  showCelebration: boolean;
  installApp: () => Promise<void>;
  dismissPrompt: () => void;
  closeCelebration: () => void;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_COUNT_KEY = 'pwa-dismiss-count';
const SHOW_DELAY = 5000; // 5 seconds — allows shell to render first

/** Tiered backoff: 7d → 14d → 30d for repeated dismissals */
const DISMISS_DURATIONS = [
  7 * 24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
];

export const usePWAInstall = (): PWAInstallState => {
  const { user } = useSessionAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPromptAvailable, setIsPromptAvailable] = useState(false);

  // Check if running inside Capacitor native shell
  const isCapacitor = !!(window as any).Capacitor?.isNativePlatform?.();

  // Check if running on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // Check if running in standalone mode (already installed)
  const isInStandaloneMode = isCapacitor ||
                            window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone === true ||
                            document.referrer.includes('android-app://');

  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    // Fix 1 — Auth gate: only show to authenticated users with 2+ logins
    if (!user?.id) return;

    const loginCount = parseInt(localStorage.getItem('edupreneurs_login_count') || '0', 10);
    if (loginCount < 2) return;

    // Don't show if already installed
    if (isInStandaloneMode) {
      setIsInstalled(true);
      return;
    }

    // Don't show on non-mobile devices
    if (!isMobile) return;

    // Fix 5 — Tiered dismiss backoff based on dismiss count
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      const dismissCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10);
      // Pick duration tier: 7d → 14d → 30d (capped at last)
      const duration = DISMISS_DURATIONS[Math.min(Math.max(dismissCount - 1, 0), DISMISS_DURATIONS.length - 1)];
      if (Date.now() - dismissTime < duration) {
        return;
      }
      // Cooldown expired — remove old timestamp, keep count for next tier
      localStorage.removeItem(DISMISS_KEY);
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsPromptAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after delay — lets shell render first
    const timer = setTimeout(() => {
      if (!isInStandaloneMode) {
        setShowPrompt(true);
      }
    }, SHOW_DELAY);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [isInStandaloneMode, isMobile, isIOS, user?.id]);

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
        // Fix 4 — Show celebration after successful install
        setShowCelebration(true);
        window.dispatchEvent(new Event('pwa-installed'));
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const dismissPrompt = () => {
    // Fix 5 — Increment dismiss count for tiered backoff
    const currentCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10);
    localStorage.setItem(DISMISS_COUNT_KEY, (currentCount + 1).toString());
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  return {
    isInstallable: !!deferredPrompt || isIOS,
    isInstalled: isInStandaloneMode,
    isIOS,
    isPromptAvailable,
    showPrompt: showPrompt && !isInstalled,
    showCelebration,
    installApp,
    dismissPrompt,
    closeCelebration,
  };
};
