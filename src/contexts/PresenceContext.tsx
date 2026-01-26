import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';

// Jude (AI assistant) is always shown as online
const JUDE_USER_ID = '68f2f959-e14a-47f9-8277-07df3a6fcd79';

// Grace period before marking user as offline (handles brief disconnections)
const OFFLINE_GRACE_PERIOD_MS = 30000;

interface PresenceContextValue {
  /** Check if a specific user is online */
  isOnline: (userId: string) => boolean;
  /** Set of all online user IDs (for bulk operations) */
  onlineUserIds: Set<string>;
  /** Number of online users */
  onlineCount: number;
  /** Timestamp of last presence update */
  lastUpdated: number;
  /** Whether the presence channel is connected */
  isConnected: boolean;
}

const PresenceContext = createContext<PresenceContextValue | undefined>(undefined);

// Safe defaults for when context is not available
const SAFE_DEFAULTS: PresenceContextValue = {
  isOnline: (userId: string) => userId === JUDE_USER_ID,
  onlineUserIds: new Set([JUDE_USER_ID]),
  onlineCount: 1,
  lastUpdated: Date.now(),
  isConnected: false,
};

interface PresenceProviderProps {
  children: ReactNode;
}

export function PresenceProvider({ children }: PresenceProviderProps) {
  const { user } = useSessionAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set([JUDE_USER_ID]));
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingOfflineRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Extract online user IDs from presence state.
   * Handles both presence keys and nested user_id fields.
   */
  const extractOnlineUsers = useCallback((state: Record<string, any[]>): Set<string> => {
    const userIds = new Set<string>([JUDE_USER_ID]); // Jude is always online
    
    Object.entries(state).forEach(([key, presences]) => {
      // The key itself is often the user_id (from Layout's presence key config)
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
    
    return userIds;
  }, []);

  /**
   * Handle a user coming online - cancel any pending offline timer
   */
  const handleUserOnline = useCallback((userId: string) => {
    // Cancel any pending offline timer for this user
    const existingTimer = pendingOfflineRef.current.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      pendingOfflineRef.current.delete(userId);
    }
    
    setOnlineUserIds(prev => {
      if (prev.has(userId)) return prev;
      const next = new Set(prev);
      next.add(userId);
      return next;
    });
    setLastUpdated(Date.now());
  }, []);

  /**
   * Handle a user going offline - use grace period before removing
   */
  const handleUserOffline = useCallback((userId: string) => {
    // Don't set Jude offline
    if (userId === JUDE_USER_ID) return;
    
    // Cancel any existing timer for this user
    const existingTimer = pendingOfflineRef.current.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Start grace period before marking offline
    const timer = setTimeout(() => {
      setOnlineUserIds(prev => {
        if (!prev.has(userId)) return prev;
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      setLastUpdated(Date.now());
      pendingOfflineRef.current.delete(userId);
    }, OFFLINE_GRACE_PERIOD_MS);
    
    pendingOfflineRef.current.set(userId, timer);
  }, []);

  /**
   * Full sync of presence state
   */
  const handleSync = useCallback((state: Record<string, any[]>) => {
    const newOnlineUsers = extractOnlineUsers(state);
    
    setOnlineUserIds(prev => {
      // Only update if there's an actual change
      const prevArray = Array.from(prev).sort();
      const newArray = Array.from(newOnlineUsers).sort();
      if (JSON.stringify(prevArray) === JSON.stringify(newArray)) {
        return prev;
      }
      return newOnlineUsers;
    });
    setLastUpdated(Date.now());
  }, [extractOnlineUsers]);

  useEffect(() => {
    // Skip for visitors or unauthenticated users
    if (!user) {
      setIsConnected(false);
      return;
    }
    
    // Create the global presence channel with user's ID as the key
    const channel = supabase.channel('online-users', {
      config: { presence: { key: user.id } }
    });
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        handleSync(state);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key) handleUserOnline(key);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key) handleUserOffline(key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track current user's presence
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });
    
    channelRef.current = channel;
    
    return () => {
      // Clear all pending offline timers
      pendingOfflineRef.current.forEach(timer => clearTimeout(timer));
      pendingOfflineRef.current.clear();
      
      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
      }
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, handleSync, handleUserOnline, handleUserOffline]);

  /**
   * Selector function - only causes re-render if THIS user's status changes
   */
  const isOnline = useCallback((userId: string): boolean => {
    if (userId === JUDE_USER_ID) return true;
    return onlineUserIds.has(userId);
  }, [onlineUserIds]);

  const value = useMemo<PresenceContextValue>(() => ({
    isOnline,
    onlineUserIds,
    onlineCount: onlineUserIds.size,
    lastUpdated,
    isConnected,
  }), [isOnline, onlineUserIds, lastUpdated, isConnected]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

/**
 * Hook to access the full presence context.
 * For per-user status checks, prefer useUserPresence(userId) for better performance.
 */
export function usePresence(): PresenceContextValue {
  const context = useContext(PresenceContext);
  
  // Return safe defaults if used outside provider (prevents React error #310)
  if (context === undefined) {
    return SAFE_DEFAULTS;
  }
  
  return context;
}

/**
 * Selector hook for checking a single user's online status.
 * Only re-renders when THIS user's status changes.
 */
export function useUserPresence(userId: string): boolean {
  const { isOnline } = usePresence();
  return useMemo(() => isOnline(userId), [isOnline, userId]);
}

/**
 * Hook to get all online user IDs.
 * Use sparingly - prefer useUserPresence for individual checks.
 */
export function useOnlineUserIds(): Set<string> {
  const { onlineUserIds } = usePresence();
  return onlineUserIds;
}

export { JUDE_USER_ID };
