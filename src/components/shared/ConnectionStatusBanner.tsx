/**
 * ConnectionStatusBanner — fixed-position overlay showing realtime connection state.
 * 
 * Only visible when the WebSocket is disconnected or reconnecting.
 * Shows a brief green "Connexion rétablie!" flash on recovery.
 * Sits above mobile bottom nav (bottom-16 on mobile, bottom-0 on desktop).
 */

import { useState, useEffect, useRef } from 'react';
import { WifiOff, CheckCircle, Loader2 } from 'lucide-react';
import { useRealtimeConnection, ConnectionState } from '@/hooks/useRealtimeConnection';

// How long to show the green "reconnected" banner
const RECOVERY_DISPLAY_MS = 2000;

export function ConnectionStatusBanner() {
  const { connectionState } = useRealtimeConnection();
  const [visible, setVisible] = useState(false);
  const [displayState, setDisplayState] = useState<ConnectionState>('connected');
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevStateRef = useRef<ConnectionState>('connected');

  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = connectionState;

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (connectionState === 'disconnected' || connectionState === 'reconnecting') {
      // Show amber banner immediately
      setDisplayState(connectionState);
      setVisible(true);
    } else if (connectionState === 'connected' && (prev === 'disconnected' || prev === 'reconnecting')) {
      // Just recovered — show green banner then auto-hide
      setDisplayState('connected');
      setVisible(true);
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, RECOVERY_DISPLAY_MS);
    } else {
      // Normal connected state — hide
      setVisible(false);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [connectionState]);

  // Determine visual style based on display state
  const isRecovery = displayState === 'connected';

  // CSS transition replaces the former framer-motion slide (300ms easeOut,
  // 100px vertical travel). Kept mounted so the exit transition still plays;
  // pointer-events are disabled while hidden so it never blocks the UI.
  return (
    <div
      className={`fixed bottom-16 lg:bottom-0 left-0 right-0 z-[999] py-2 px-4 flex items-center justify-center gap-2 text-white text-sm font-medium transition-all duration-300 ease-out ${
        isRecovery ? 'bg-green-600' : 'bg-amber-600'
      } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      {isRecovery ? (
        <>
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Connexion rétablie!</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Connexion perdue. Reconnexion en cours...</span>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        </>
      )}
    </div>
  );
}
