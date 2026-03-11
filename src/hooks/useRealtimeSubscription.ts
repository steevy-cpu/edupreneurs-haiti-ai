import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type PostgresChangesEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions {
  table: string;
  event?: PostgresChangesEvent;
  schema?: string;
  filter?: string;
  callback: (payload: any) => void;
  enabled?: boolean;
}

/**
 * Consolidated hook for managing Supabase realtime subscriptions
 * Prevents duplicate subscriptions and handles cleanup automatically
 */
export function useRealtimeSubscription({
  table,
  event = '*',
  schema = 'public',
  filter,
  callback,
  enabled = true,
}: UseRealtimeSubscriptionOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Create unique channel name
    const channelName = filter 
      ? `${table}-${event}-${filter}`
      : `${table}-${event}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema,
          table,
          filter,
        } as any,
        (payload: any) => {
          callbackRef.current(payload);
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup function
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, event, schema, filter, enabled]);

  return {
    unsubscribe: useCallback(() => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }, []),
  };
}

/**
 * Hook for managing presence subscriptions with reactive state updates.
 * Returns presenceState that updates on sync/join/leave events (no polling needed).
 */
export function usePresenceSubscription(
  channelName: string,
  userId: string,
  enabled: boolean = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [presenceState, setPresenceState] = useState<Record<string, any[]>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!enabled || !userId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setPresenceState({});
      setIsReady(false);
      return;
    }

    console.log(`👥 Setting up presence for: ${channelName}`);

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        console.log(`🔄 Presence synced: ${channelName}`);
        // Update reactive state - triggers re-render only when state changes
        setPresenceState({ ...channel.presenceState() });
      })
      .on('presence', { event: 'join' }, ({ key }: any) => {
        console.log(`👋 User joined: ${key}`);
        // Update state on join
        setPresenceState({ ...channel.presenceState() });
      })
      .on('presence', { event: 'leave' }, ({ key }: any) => {
        console.log(`👋 User left: ${key}`);
        // Update state on leave
        setPresenceState({ ...channel.presenceState() });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
          setIsReady(true);
          // Get initial state after subscribe
          setPresenceState({ ...channel.presenceState() });
        }
      });

    channelRef.current = channel;

    return () => {
      console.log(`🧹 Cleaning up presence: ${channelName}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setPresenceState({});
      setIsReady(false);
    };
  }, [channelName, userId, enabled]);

  const updatePresence = useCallback(async (state: any) => {
    if (channelRef.current) {
      await channelRef.current.track({
        user_id: userId,
        ...state,
      });
    }
  }, [userId]);

  // Deprecated: use presenceState directly for reactive updates
  const getPresenceState = useCallback(() => {
    return channelRef.current?.presenceState() || {};
  }, []);

  return {
    updatePresence,
    getPresenceState, // Kept for backward compatibility
    presenceState,    // NEW: Reactive state that updates on events
    isReady,          // NEW: Whether channel is subscribed and ready
    unsubscribe: useCallback(() => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }, []),
  };
}
