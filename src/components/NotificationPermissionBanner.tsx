import { useState, useEffect } from "react";
import { Bell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  requestNotificationPermission, 
  registerServiceWorker, 
  subscribeToPushNotifications, 
  isIOSDevice, 
  isStandalonePWA,
  detectBrowser 
} from "@/utils/pushNotifications";
import { IOSPushNotificationGuide } from "./IOSPushNotificationGuide";
import { useCookieConsent, onConsentChange } from "@/hooks/useCookieConsent";

interface NotificationPermissionBannerProps {
  userId: string;
}

const DEBUG_NOTIFICATIONS = import.meta.env.DEV;

export const NotificationPermissionBanner = ({ userId }: NotificationPermissionBannerProps) => {
  // isStable guard: prevents null dispatcher crash on lazy-load mount.
  // Follows the exact same pattern as HomeChatbot, JudeChatbot, GlobalMusicPlayer,
  // QuickMessageFAB, and CookieConsent — double requestAnimationFrame defers
  // all hook calls until the React dispatcher is fully initialized.
  const [isStable, setIsStable] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [browser, setBrowser] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { hasDecided, hasAccepted } = useCookieConsent();

  useEffect(() => {
    const iOS = isIOSDevice();
    const standalone = isStandalonePWA();
    const detectedBrowser = detectBrowser();
    
    setIsIOS(iOS);
    setIsPWA(standalone);
    setBrowser(detectedBrowser);
    
    if (DEBUG_NOTIFICATIONS) {
      console.log('📱 Device: iOS:', iOS, '| PWA:', standalone, '| Browser:', detectedBrowser);
    }
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      if (DEBUG_NOTIFICATIONS) console.warn('⚠️ Notifications not supported');
      return;
    }

    // Safari desktop doesn't support push
    if (detectedBrowser === 'Safari' && !iOS) {
      if (DEBUG_NOTIFICATIONS) console.warn('⚠️ Safari desktop - no push support');
      return;
    }

    const shouldShowDialog = () => {
      const permission = Notification.permission;
      
      // Wait for cookie consent first
      if (!hasDecided) {
        if (DEBUG_NOTIFICATIONS) console.log('⏳ Waiting for cookie consent...');
        return false;
      }

      // Don't show if cookies were declined
      if (!hasAccepted) {
        if (DEBUG_NOTIFICATIONS) console.log('🚫 Cookies declined, skipping notification prompt');
        return false;
      }
      
      // For iOS non-PWA, show installation guide
      if (iOS && !standalone) {
        return true;
      }
      
      // Show if permission is default (not yet asked)
      if (permission === 'default') {
        return true;
      } else if (permission === 'denied') {
        setError(`Notifications bloquées. Changez les paramètres de ${detectedBrowser} pour ce site.`);
      }
      
      return false;
    };

    // Delay showing notification dialog after cookie consent (8s to avoid dialog fatigue)
    if (shouldShowDialog()) {
      const timer = setTimeout(() => setShowDialog(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [hasDecided, hasAccepted]);

  // Listen for cookie consent changes
  useEffect(() => {
    const unsubscribe = onConsentChange((accepted) => {
      if (accepted && Notification.permission === 'default') {
        setTimeout(() => {
          setShowDialog(true);
        }, 8000); // 8s delay to avoid dialog fatigue
      }
    });
    return () => { unsubscribe(); };
  }, []);

  // isStable guard: prevents null dispatcher crash on lazy-load mount.
  // Double RAF defers rendering until React dispatcher is fully initialized.
  // Follows exact same pattern as HomeChatbot, JudeChatbot, GlobalMusicPlayer,
  // QuickMessageFAB, and CookieConsent.
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsStable(true));
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!isStable) return null;

  const handleAllow = async () => {
    setIsRequesting(true);
    setError(null);
    
    try {
      if (DEBUG_NOTIFICATIONS) console.log('🔔 Starting notification setup...');
      
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        const registration = await registerServiceWorker();
        if (registration) {
          const success = await subscribeToPushNotifications(registration, userId);
          
          if (success) {
            if (DEBUG_NOTIFICATIONS) console.log('🎉 Notifications enabled!');
            setShowDialog(false);
          } else {
            setError('Échec de l\'abonnement. Vérifiez votre connexion et réessayez.');
          }
        } else {
          setError(`Service worker non disponible. ${browser === 'Safari' ? 'iOS nécessite l\'installation PWA.' : 'Réessayez plus tard.'}`);
        }
      } else if (permission === 'denied') {
        setError(`Vous avez refusé les notifications. Changez cela dans les paramètres de ${browser}.`);
      }
    } catch (error: any) {
      console.error('❌ Notification setup error:', error);
      setError(`Erreur: ${error.message || 'Impossible d\'activer les notifications'}`);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeny = () => {
    setShowDialog(false);
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-md max-h-[85dvh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg sm:text-xl leading-tight px-2">
            {isIOS && !isPWA ? '📱 Installation requise' : 'Restez connecté, même hors ligne'}
          </DialogTitle>
          <DialogDescription className="text-center space-y-3">
            {error && (
              <Alert variant="destructive" className="text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            
            {isIOS && !isPWA ? (
              <div className="space-y-3 text-sm">
                <p className="font-medium text-warning">
                  Sur iPhone, installez d'abord l'application pour activer les notifications
                </p>
                <div className="max-h-[45dvh] overflow-y-auto -mx-2 px-2">
                  <IOSPushNotificationGuide />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="font-medium text-sm sm:text-base px-2">
                  Autorisez les notifications pour rester informé même quand vous n'êtes pas sur le site
                </p>
                
                <p className="text-xs text-muted-foreground px-2">
                  Compatible: Chrome, Edge, Samsung Internet{isIOS ? ', Safari iOS 16.4+' : ''}
                </p>
                
                {isIOS && isPWA && (
                  <div className="max-h-[30dvh] overflow-y-auto -mx-2 px-2">
                    <IOSPushNotificationGuide />
                  </div>
                )}
            
                <ul className="space-y-2 text-left text-xs sm:text-sm px-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>Nouveaux messages instantanés (même si le site est fermé)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>Activités dans vos groupes en temps réel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>Alertes importantes sur votre progression</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>Notifications en arrière-plan 24/7</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground px-2">
                  Vous recevrez des notifications même lorsque vous ne visitez pas le site
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 mt-2 sm:mt-4">
          <Button
            onClick={handleAllow}
            disabled={isRequesting || !!error || (isIOS && !isPWA)}
            className="w-full bg-primary hover:bg-primary/90"
            size="default"
          >
            {isIOS && !isPWA 
              ? 'Installez l\'app d\'abord' 
              : isRequesting 
                ? 'Activation...' 
                : 'Autoriser les notifications'}
          </Button>
          <Button
            onClick={handleDeny}
            variant="ghost"
            className="w-full"
            size="default"
            disabled={isRequesting}
          >
            Non merci
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
