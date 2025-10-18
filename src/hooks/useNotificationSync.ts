import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSyncMessage {
  type: 'notification_received' | 'notification_read';
  notificationId?: string;
  category?: string;
}

export const useNotificationSync = (onSync?: () => void) => {
  const handleMessage = useCallback(async (event: MessageEvent<NotificationSyncMessage>) => {
    console.log('📨 Notification sync message:', event.data);

    if (event.data.type === 'notification_received') {
      // New notification received via push while app was in background
      console.log('🔔 New notification received, refreshing...');
      onSync?.();
    } else if (event.data.type === 'notification_read' && event.data.notificationId) {
      // Notification marked as read from service worker
      console.log('✓ Notification marked as read, syncing local state...');
      
      // Update local cache
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', event.data.notificationId);
      
      if (error) {
        console.error('Failed to sync read state:', error);
      }
      
      onSync?.();
    }
  }, [onSync]);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if BroadcastChannel is supported
    if (!('BroadcastChannel' in window)) {
      console.warn('BroadcastChannel not supported');
      return;
    }

    const channel = new BroadcastChannel('edupreneurs-notifications');
    
    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [handleMessage]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Broadcast to other tabs
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('edupreneurs-notifications');
        channel.postMessage({
          type: 'notification_read',
          notificationId
        });
        channel.close();
      }

      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }, []);

  return { markAsRead };
};
