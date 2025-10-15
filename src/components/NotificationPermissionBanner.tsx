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

interface NotificationPermissionBannerProps {
  userId: string;
}

export const NotificationPermissionBanner = ({ userId }: NotificationPermissionBannerProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Show dialog if permission is default (not yet decided)
    const checkPermission = () => {
      if ('Notification' in window) {
        const permission = Notification.permission;
        const dismissed = localStorage.getItem('notification-permission-asked');
        
        console.log('Notification permission status:', permission);
        
        if (permission === 'default' && !dismissed) {
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
        localStorage.setItem('notification-permission-asked', 'true');
      } else if (permission === 'denied') {
        console.log('Permission denied by user');
        setShowDialog(false);
        localStorage.setItem('notification-permission-asked', 'true');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeny = () => {
    setShowDialog(false);
    localStorage.setItem('notification-permission-asked', 'true');
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">
            Activez les notifications
          </DialogTitle>
          <DialogDescription className="text-center">
            Recevez des notifications instantanées pour:
            <ul className="mt-3 space-y-2 text-left text-sm">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Nouveaux messages de vos amis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Activités importantes dans vos groupes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Mises à jour de votre progression
              </li>
            </ul>
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
