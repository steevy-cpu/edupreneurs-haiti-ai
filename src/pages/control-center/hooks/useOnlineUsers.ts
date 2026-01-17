import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Jude (AI assistant) is always shown as online
const JUDE_USER_ID = 'jude-ai-assistant';

/**
 * Hook to track online users from the global 'online-users' presence channel.
 * Uses the same pattern as Community.tsx - polls the shared channel set up by Layout.tsx
 * 
 * @param pollInterval - How often to poll for presence updates (default: 10 seconds)
 */
export function useOnlineUsers(pollInterval = 10000) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set([JUDE_USER_ID]));
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getOnlineUsers = useCallback(() => {
    const allChannels = supabase.getChannels();
    const onlineChannel = allChannels.find(ch => ch.topic === 'realtime:online-users');
    
    if (onlineChannel) {
      const state = onlineChannel.presenceState();
      const userIds = new Set<string>([JUDE_USER_ID]);
      
      Object.values(state).forEach((presences: any) => {
        presences.forEach((p: any) => {
          if (p.user_id) userIds.add(p.user_id);
        });
      });
      
      setOnlineUserIds(prev => {
        // Only update if the set has changed
        if (prev.size !== userIds.size || ![...userIds].every(id => prev.has(id))) {
          return userIds;
        }
        return prev;
      });
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    getOnlineUsers();

    // Set up polling interval
    intervalRef.current = setInterval(getOnlineUsers, pollInterval);

    // Also listen for presence sync events on a dedicated listener channel
    const channel = supabase.channel('control-center-presence-listener');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        getOnlineUsers();
      })
      .subscribe();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [pollInterval, getOnlineUsers]);

  return {
    onlineUserIds,
    onlineCount: onlineUserIds.size,
    isConnected,
    isOnline: useCallback((userId: string) => onlineUserIds.has(userId), [onlineUserIds]),
  };
}
