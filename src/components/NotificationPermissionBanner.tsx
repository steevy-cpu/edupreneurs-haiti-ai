import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requestNotificationPermission, registerServiceWorker, subscribeToPushNotifications, isIOSDevice, isStandalonePWA } from "@/utils/pushNotifications";
import { IOSPushNotificationGuide } from "./IOSPushNotificationGuide";

interface NotificationPermissionBannerProps {
  userId: string;
}

export const NotificationPermissionBanner = ({ userId }: NotificationPermissionBannerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detect iOS and PWA mode
    const iOS = isIOSDevice();
    const standalone = isStandalonePWA();
    setIsIOS(iOS);
    setIsPWA(standalone);
    
    console.log('Device detection:', { iOS, standalone });
    
    // Show dialog if permission is default (not yet decided)
    const checkPermission = () => {
      if ('Notification' in window) {
        const permission = Notification.permission;
        
        console.log('🔔 Notification permission status:', permission);
        
        // For iOS, only show if running as PWA
        if (iOS && !standalone) {
          console.log('🔔 iOS device not in PWA mode, skipping notification prompt');
          return;
        }
        
        // Always show if permission is default (not yet asked)
        if (permission === 'default') {
          console.log('🔔 Showing notification dialog...');
          // Show dialog after a short delay for better UX
          setTimeout(() => setShowDialog(true), 1000);
        }
      }
    };

    checkPermission();
  }, []);

  const handleAllow = async () => {
    setIsRequesting(true);
    
    try {
      console.log('Requesting notification permission...');
      
      // Request permission
      const permission = await requestNotificationPermission();
      console.log('Permission result:', permission);
      
      if (permission === 'granted') {
        console.log('Permission granted! Setting up push notifications...');
        
        // Register service worker
        const registration = await registerServiceWorker();
        if (registration) {
          // Subscribe to push notifications
          await subscribeToPushNotifications(registration, userId);
          console.log('Push notifications fully set up!');
        }
        
        setShowDialog(false);
      } else if (permission === 'denied') {
        console.log('Permission denied by user');
        setShowDialog(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
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
            disabled={isRequesting}
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
