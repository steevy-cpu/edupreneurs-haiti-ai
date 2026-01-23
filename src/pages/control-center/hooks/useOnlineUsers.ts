import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Jude (AI assistant) is always shown as online - use actual UUID
const JUDE_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';

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
    // Check both topic AND name for channel lookup (like Community.tsx)
    const onlineChannel = allChannels.find(ch => 
      ch.topic === 'realtime:online-users' || 
      (ch as any).name === 'online-users'
    );
    
    if (onlineChannel) {
      const state = onlineChannel.presenceState();
      const userIds = new Set<string>([JUDE_USER_ID]);
      
      // Extract user IDs from BOTH presence keys AND nested data
      Object.entries(state).forEach(([key, presences]: [string, any]) => {
        // The key is the user_id (from Layout's presence config)
        if (key && key !== JUDE_USER_ID) {
          userIds.add(key);
        }
        // Also check inside presence data for user_id field
        if (Array.isArray(presences)) {
          presences.forEach((p: any) => {
            if (p.user_id && p.user_id !== JUDE_USER_ID) {
              userIds.add(p.user_id);
            }
          });
        }
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
