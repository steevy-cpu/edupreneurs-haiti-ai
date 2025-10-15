import { useState, useEffect } from "react";
import { Bell, X, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { requestNotificationPermission, registerServiceWorker, subscribeToPushNotifications } from "@/utils/pushNotifications";

interface NotificationPermissionBannerProps {
  userId: string;
}

export const NotificationPermissionBanner = ({ userId }: NotificationPermissionBannerProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  useEffect(() => {
    // Check if we should show the banner
    const checkPermission = () => {
      if ('Notification' in window) {
        const permission = Notification.permission;
        const dismissed = localStorage.getItem('notification-banner-dismissed');
        
        console.log('Notification permission status:', permission);
        console.log('Banner dismissed:', dismissed);
        
        if (permission === 'denied') {
          setIsDenied(true);
          setShowBanner(!dismissed);
        } else if (permission === 'default' && !dismissed) {
          setShowBanner(true);
        }
      }
    };

    checkPermission();
  }, []);

  const handleEnableNotifications = async () => {
    if (isDenied) {
      // Show instructions for enabling in browser settings
      alert(
        '🔔 Pour activer les notifications:\n\n' +
        '1. Cliquez sur l\'icône de cadenas/info dans la barre d\'adresse\n' +
        '2. Trouvez "Notifications" dans les paramètres\n' +
        '3. Changez à "Autoriser"\n' +
        '4. Rechargez la page'
      );
      return;
    }

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
        localStorage.removeItem('notification-banner-dismissed');
      } else if (permission === 'denied') {
        console.log('Permission denied by user');
        setIsDenied(true);
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
    <Alert className={`mb-4 border-primary/20 ${isDenied ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-primary/5'}`}>
      {isDenied ? (
        <Settings className="h-4 w-4 text-yellow-600" />
      ) : (
        <Bell className="h-4 w-4 text-primary" />
      )}
      <AlertDescription className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {isDenied ? (
            <>
              <p className="font-medium text-sm">Les notifications sont bloquées</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cliquez sur "Paramètres" pour savoir comment les réactiver dans votre navigateur.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-sm">Activez les notifications pour ne rien manquer!</p>
              <p className="text-xs text-muted-foreground mt-1">
                Recevez des notifications pour les nouveaux messages et les activités importantes.
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            className={isDenied ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-primary hover:bg-primary/90'}
          >
            {isRequesting ? 'Activation...' : isDenied ? 'Paramètres' : 'Activer'}
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
