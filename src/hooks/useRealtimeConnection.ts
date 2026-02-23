/**
 * useRealtimeConnection — monitors Supabase realtime WebSocket state.
 * 
 * Polls supabase.realtime.connectionState() every 2s (no network cost,
 * just reads local WebSocket readyState). Implements a 3-second grace
 * period before showing "disconnected" to avoid flashing on brief drops.
 * Shows "connected" briefly (2s) after recovery so users see feedback.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// How often to poll the WebSocket readyState (ms)
const POLL_INTERVAL_MS = 2000;

// Grace period before showing disconnect UI — avoids flash on brief drops
const DISCONNECT_GRACE_MS = 3000;

// How long to show the "reconnected" banner before hiding
const RECONNECTED_DISPLAY_MS = 2000;

export type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';

interface UseRealtimeConnectionResult {
  /** Current connection state with grace period applied */
  connectionState: ConnectionState;
  /** True when disconnected (grace period elapsed) */
  isDisconnected: boolean;
  /** True when reconnecting after a disconnect */
  isReconnecting: boolean;
}

export function useRealtimeConnection(): UseRealtimeConnectionResult {
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');

  // Track whether we were previously disconnected (to trigger recovery banner)
  const wasDisconnectedRef = useRef(false);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recoveryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearGraceTimer = useCallback(() => {
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
  }, []);

  const clearRecoveryTimer = useCallback(() => {
    if (recoveryTimerRef.current) {
      clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const poll = setInterval(() => {
      // Read local WebSocket state — no network call
      const rawState = supabase.realtime.connectionState();

      if (rawState === 'open') {
        // Connection is healthy
        clearGraceTimer();

        if (wasDisconnectedRef.current) {
          // Just recovered — show green banner briefly
          wasDisconnectedRef.current = false;
          setConnectionState('connected');

          // Auto-hide recovery banner after 2s
          clearRecoveryTimer();
          recoveryTimerRef.current = setTimeout(() => {
            // State stays 'connected' — banner component handles visibility
          }, RECONNECTED_DISPLAY_MS);
        } else {
          setConnectionState('connected');
        }
      } else if (rawState === 'connecting') {
        // Actively reconnecting — only show if we were already disconnected
        if (wasDisconnectedRef.current) {
          clearGraceTimer();
          setConnectionState('reconnecting');
        } else if (!graceTimerRef.current) {
          // Start grace period — might reconnect before it elapses
          graceTimerRef.current = setTimeout(() => {
            wasDisconnectedRef.current = true;
            setConnectionState('reconnecting');
            graceTimerRef.current = null;
          }, DISCONNECT_GRACE_MS);
        }
      } else {
        // 'closed' or 'closing' — start grace period if not already running
        if (!graceTimerRef.current && !wasDisconnectedRef.current) {
          graceTimerRef.current = setTimeout(() => {
            wasDisconnectedRef.current = true;
            setConnectionState('disconnected');
            graceTimerRef.current = null;
          }, DISCONNECT_GRACE_MS);
        } else if (wasDisconnectedRef.current) {
          setConnectionState('disconnected');
        }
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(poll);
      clearGraceTimer();
      clearRecoveryTimer();
    };
  }, [clearGraceTimer, clearRecoveryTimer]);

  return {
    connectionState,
    isDisconnected: connectionState === 'disconnected',
    isReconnecting: connectionState === 'reconnecting',
  };
}
