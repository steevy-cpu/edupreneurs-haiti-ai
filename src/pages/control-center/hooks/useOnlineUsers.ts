import { useCallback } from 'react';
import { usePresence, JUDE_USER_ID } from '@/contexts/PresenceContext';

/**
 * Hook to track online users from the global presence channel.
 * Uses the centralized PresenceContext instead of polling.
 * 
 * @param _pollInterval - Deprecated: no longer used (kept for API compatibility)
 */
export function useOnlineUsers(_pollInterval = 10000) {
  const { onlineUserIds, onlineCount, isConnected, isOnline } = usePresence();

  return {
    onlineUserIds,
    onlineCount,
    isConnected,
    isOnline: useCallback((userId: string) => isOnline(userId), [isOnline]),
  };
}

export { JUDE_USER_ID };
