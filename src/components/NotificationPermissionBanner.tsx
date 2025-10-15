import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { requestNotificationPermission, registerServiceWorker, subscribeToPushNotifications } from "@/utils/pushNotifications";

interface NotificationPermissionBannerProps {
  userId: string;
}

export const NotificationPermissionBanner = ({ userId }: NotificationPermissionBannerProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    const checkPermission = () => {
      if ('Notification' in window) {
        const permission = Notification.permission;
        const dismissed = localStorage.getItem('notification-banner-dismissed');
        
        console.log('Notification permission status:', permission);
        console.log('Banner dismissed:', dismissed);
        
        // Show banner if permission is default (not yet asked) and not dismissed
        if (permission === 'default' && !dismissed) {
          setShowBanner(true);
        }
      }
    };

    checkPermission();
  }, []);

  const handleEnableNotifications = async () => {
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
        
        setShowBanner(false);
      } else if (permission === 'denied') {
        console.log('Permission denied by user');
        alert('Vous avez refusé les notifications. Pour les activer, allez dans les paramètres de votre navigateur.');
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <Alert className="mb-4 border-primary/20 bg-primary/5">
      <Bell className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="font-medium text-sm">Activez les notifications pour ne rien manquer!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Recevez des notifications pour les nouveaux messages et les activités importantes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            className="bg-primary hover:bg-primary/90"
          >
            {isRequesting ? 'Activation...' : 'Activer'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
