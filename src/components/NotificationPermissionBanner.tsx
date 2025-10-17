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
import { requestNotificationPermission, registerServiceWorker, subscribeToPushNotifications } from "@/utils/pushNotifications";
import { IOSPushNotificationGuide } from "./IOSPushNotificationGuide";

interface NotificationPermissionBannerProps {
  userId: string;
}

export const NotificationPermissionBanner = ({ userId }: NotificationPermissionBannerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    // Show dialog if permission is default (not yet decided)
    const checkPermission = () => {
      if ('Notification' in window) {
        const permission = Notification.permission;
        
        console.log('🔔 Notification permission status:', permission);
        
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Restez connecté, même hors ligne
          </DialogTitle>
          <DialogDescription className="text-center">
            <p className="mb-3 font-medium">
              Autorisez les notifications pour rester informé même quand vous n'êtes pas sur le site
            </p>
            
            {isIOS && <IOSPushNotificationGuide />}
            
            <ul className="mt-3 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Nouveaux messages instantanés (même si le site est fermé)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Activités dans vos groupes en temps réel
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Alertes importantes sur votre progression
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Notifications en arrière-plan 24/7
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Vous recevrez des notifications même lorsque vous ne visitez pas le site
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleAllow}
            disabled={isRequesting}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {isRequesting ? 'Activation...' : 'Autoriser les notifications'}
          </Button>
          <Button
            onClick={handleDeny}
            variant="ghost"
            className="w-full"
            size="lg"
            disabled={isRequesting}
          >
            Non merci
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
