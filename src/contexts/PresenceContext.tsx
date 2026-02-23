import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { logger } from '@/utils/logger';
import { persistLastSeen, persistLastSeenBeacon, HEARTBEAT_INTERVAL_MS } from '@/services/lastSeenService';

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
  
  // Retry state for CHANNEL_ERROR recovery (exponential backoff: 2s, 4s, 8s)
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const MAX_RETRIES = 3;

  /**
   * Extract online user IDs from presence state.
   * Handles both presence keys and nested user_id fields.
   */
  const extractOnlineUsers = useCallback((state: Record<string, any[]>): Set<string> => {
    const userIds = new Set<string>([JUDE_USER_ID]); // Jude is always online
    
    logger.log('[Presence] Extracting users from state:', state);
    
    Object.entries(state).forEach(([key, presences]) => {
      if (key && key !== JUDE_USER_ID) {
        logger.log('[Presence] Adding user from key:', key);
        userIds.add(key);
      }
      if (Array.isArray(presences)) {
        presences.forEach((p: any) => {
          if (p.user_id && p.user_id !== JUDE_USER_ID) {
            logger.log('[Presence] Adding user from presence data:', p.user_id);
            userIds.add(p.user_id);
          }
        });
      }
    });
    
    logger.log('[Presence] Extracted user IDs:', Array.from(userIds));
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
      logger.log('[Presence] Sync - Previous:', prevArray, 'New:', newArray);
      if (JSON.stringify(prevArray) === JSON.stringify(newArray)) {
        logger.log('[Presence] No change, skipping update');
        return prev;
      }
      logger.log('[Presence] Updating online users to:', newArray);
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

    /**
     * Creates and subscribes the presence channel.
     * Extracted so it can be called on initial mount AND on retry after CHANNEL_ERROR.
     */
    const setupChannel = () => {
      logger.log('[Presence] Creating channel for user:', user.id);

      const channel = supabase.channel('online-users', {
        config: { presence: { key: user.id } }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          logger.log('[Presence] Sync event - raw state:', state);
          handleSync(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          logger.log('[Presence] Join event - key:', key, 'presences:', newPresences);
          if (key) handleUserOnline(key);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          logger.log('[Presence] Leave event - key:', key, 'presences:', leftPresences);
          if (key) handleUserOffline(key);
        })
        .subscribe(async (status) => {
          logger.log('[Presence] Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            // Reset retry counter on successful connection
            retryCountRef.current = 0;

            // Track current user's presence
            const trackResult = await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
            logger.log('[Presence] Track result:', trackResult, 'for user:', user.id);

            // Persist last_seen to database on initial connection
            persistLastSeen(user.id);

            // Manually trigger a sync after tracking to ensure we get the updated state
            setTimeout(() => {
              const state = channel.presenceState();
              logger.log('[Presence] Post-track state:', state);
              handleSync(state);
            }, 100);
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);

            // Retry with exponential backoff: 2s, 4s, 8s
            if (retryCountRef.current < MAX_RETRIES) {
              const delay = 2000 * Math.pow(2, retryCountRef.current);
              retryCountRef.current += 1;
              logger.log(`[Presence] CHANNEL_ERROR — retry ${retryCountRef.current}/${MAX_RETRIES} in ${delay}ms`);

              retryTimerRef.current = setTimeout(() => {
                // Tear down the failed channel before creating a new one
                if (channelRef.current) {
                  supabase.removeChannel(channelRef.current);
                  channelRef.current = null;
                }
                setupChannel();
              }, delay);
            } else {
              logger.log('[Presence] CHANNEL_ERROR — max retries reached, giving up');
            }
          } else if (status === 'CLOSED') {
            // Intentional close (cleanup) — do not retry
            setIsConnected(false);
          }
        });

      channelRef.current = channel;
    };

    setupChannel();

    return () => {
      logger.log('[Presence] Cleaning up channel for user:', user.id);
      // Clear all pending offline timers
      pendingOfflineRef.current.forEach(timer => clearTimeout(timer));
      pendingOfflineRef.current.clear();

      if (graceTimerRef.current) {
        clearTimeout(graceTimerRef.current);
      }

      // Clear any pending retry timer
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // Reset retry counter on cleanup
      retryCountRef.current = 0;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, handleSync, handleUserOnline, handleUserOffline]);

  // Heartbeat: Keep last_seen fresh while connected
  useEffect(() => {
    if (!user || !isConnected) return;
    
    const heartbeat = setInterval(() => {
      persistLastSeen(user.id);
    }, HEARTBEAT_INTERVAL_MS);
    
    return () => clearInterval(heartbeat);
  }, [user?.id, isConnected]);

  // Final last_seen on tab close
  useEffect(() => {
    if (!user) return;
    
    const handleUnload = () => {
      persistLastSeenBeacon(user.id);
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user?.id]);

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
