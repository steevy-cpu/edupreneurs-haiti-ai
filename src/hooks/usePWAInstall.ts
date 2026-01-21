import { useState, useEffect } from 'react';

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
  installApp: () => Promise<void>;
  dismissPrompt: () => void;
}

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const SHOW_DELAY = 5000; // 5 seconds - more time for browser engagement

export const usePWAInstall = (): PWAInstallState => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPromptAvailable, setIsPromptAvailable] = useState(false);

  // Check if running on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  
  // Check if running in standalone mode (already installed)
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                            (window.navigator as any).standalone === true ||
                            document.referrer.includes('android-app://');

  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    console.log('PWA Install Hook:', { isInStandaloneMode, isMobile, isIOS });
    
    // Don't show if already installed
    if (isInStandaloneMode) {
      console.log('Banner hidden - Already installed');
      setIsInstalled(true);
      return;
    }

    // Don't show on non-mobile devices
    if (!isMobile) {
      console.log('Banner hidden - Not on mobile device');
      return;
    }

    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) {
        console.log('Banner hidden - Recently dismissed');
        return;
      } else {
        localStorage.removeItem(DISMISS_KEY);
      }
    }

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt event captured');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsPromptAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt after delay
    const timer = setTimeout(() => {
      if (!isInStandaloneMode) {
        console.log('Showing PWA install banner');
        setShowPrompt(true);
      }
    }, SHOW_DELAY);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [isInStandaloneMode, isMobile, isIOS]);

  const installApp = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const dismissPrompt = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShowPrompt(false);
  };

  return {
    isInstallable: !!deferredPrompt || isIOS,
    isInstalled: isInStandaloneMode,
    isIOS,
    isPromptAvailable,
    showPrompt: showPrompt && !isInstalled,
    installApp,
    dismissPrompt
  };
};
