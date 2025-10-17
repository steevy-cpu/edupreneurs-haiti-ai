import { useEffect, useRef, useCallback } from 'react';
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

    console.log(`📡 Setting up realtime subscription: ${channelName}`);

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
          console.log(`📨 Realtime event on ${table}:`, payload.eventType);
          callbackRef.current(payload);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for ${channelName}:`, status);
      });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log(`🧹 Cleaning up subscription: ${channelName}`);
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
 * Hook for managing presence subscriptions
 */
export function usePresenceSubscription(
  channelName: string,
  userId: string,
  enabled: boolean = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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
      })
      .on('presence', { event: 'join' }, ({ key }: any) => {
        console.log(`👋 User joined: ${key}`);
      })
      .on('presence', { event: 'leave' }, ({ key }: any) => {
        console.log(`👋 User left: ${key}`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      console.log(`🧹 Cleaning up presence: ${channelName}`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
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

  const getPresenceState = useCallback(() => {
    return channelRef.current?.presenceState() || {};
  }, []);

  return {
    updatePresence,
    getPresenceState,
    unsubscribe: useCallback(() => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    }, []),
  };
}
