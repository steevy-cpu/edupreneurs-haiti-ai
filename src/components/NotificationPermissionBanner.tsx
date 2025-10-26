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

interface NotificationPermissionBannerProps {
  userId: string;
}

export const NotificationPermissionBanner = ({ userId }: NotificationPermissionBannerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [browser, setBrowser] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Detect iOS, PWA mode, and browser
    const iOS = isIOSDevice();
    const standalone = isStandalonePWA();
    const detectedBrowser = detectBrowser();
    
    setIsIOS(iOS);
    setIsPWA(standalone);
    setBrowser(detectedBrowser);
    
    console.log('═══════════════════════════════════════════');
    console.log('📱 DEVICE DETECTION');
    console.log('═══════════════════════════════════════════');
    console.log('🌐 Browser:', detectedBrowser);
    console.log('📱 iOS:', iOS);
    console.log('📲 PWA Mode:', standalone);
    console.log('═══════════════════════════════════════════\n');
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported in this browser');
      setError(`Les notifications ne sont pas supportées par ${detectedBrowser}`);
      return;
    }

    // Safari desktop doesn't support push
    if (detectedBrowser === 'Safari' && !iOS) {
      console.warn('⚠️ Safari desktop does not support web push');
      setError('Safari desktop ne supporte pas les notifications push. Utilisez Chrome, Edge ou Firefox.');
      return;
    }
    
    // Show dialog if permission is default (not yet decided)
    const checkPermission = () => {
      const permission = Notification.permission;
      
      console.log('🔔 Current notification permission:', permission);
      
      // For iOS, only show if running as PWA
      if (iOS && !standalone) {
        console.log('ℹ️ iOS non-PWA detected, will show installation guide');
        setTimeout(() => setShowDialog(true), 1000);
        return;
      }
      
      // Always show if permission is default (not yet asked)
      if (permission === 'default') {
        console.log('📋 Permission not yet requested, showing dialog...');
        setTimeout(() => setShowDialog(true), 1000);
      } else if (permission === 'denied') {
        console.log('❌ Permission previously denied');
        setError(`Notifications bloquées. Changez les paramètres de ${detectedBrowser} pour ce site.`);
      } else if (permission === 'granted') {
        console.log('✅ Permission already granted');
      }
    };

    checkPermission();
  }, []);

  const handleAllow = async () => {
    setIsRequesting(true);
    setError(null);
    
    try {
      console.log('═══════════════════════════════════════════');
      console.log('🔔 USER INITIATED NOTIFICATION SETUP');
      console.log('═══════════════════════════════════════════\n');
      
      // Request permission
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        console.log('✅ Permission granted, proceeding with setup...\n');
        
        // Register service worker
        const registration = await registerServiceWorker();
        if (registration) {
          // Subscribe to push notifications
          const success = await subscribeToPushNotifications(registration, userId);
          
          if (success) {
            console.log('🎉 All done! Notifications are enabled.\n');
            setShowDialog(false);
          } else {
            setError('Échec de l\'abonnement. Vérifiez votre connexion et réessayez.');
          }
        } else {
          setError(`Service worker non disponible. ${browser === 'Safari' ? 'iOS nécessite l\'installation PWA.' : 'Réessayez plus tard.'}`);
        }
      } else if (permission === 'denied') {
        console.log('❌ User denied permission\n');
        setError(`Vous avez refusé les notifications. Changez cela dans les paramètres de ${browser}.`);
      } else {
        console.log('⚠️ Permission prompt dismissed\n');
      }
    } catch (error: any) {
      console.error('❌ Unexpected error:', error);
      setError(`Erreur: ${error.message || 'Impossible d\'activer les notifications'}`);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeny = () => {
    console.log('ℹ️ User dismissed notification dialog');
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
                <p className="font-medium text-orange-500">
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
            disabled={isRequesting || !!error}
            className="w-full bg-primary hover:bg-primary/90"
            size="default"
          >
            {isRequesting ? 'Activation...' : 'Autoriser les notifications'}
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
