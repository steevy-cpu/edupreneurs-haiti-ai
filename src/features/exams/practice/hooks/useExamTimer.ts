/**
 * useExamTimer — Countdown timer for timed exam mode.
 * Decrements every second, persists to DB every 30s, pauses on tab-hide.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseExamTimerProps {
  sessionId: string;
  /** Initial seconds — from session.time_remaining on resume, else duration_minutes * 60 */
  initialSeconds: number;
  /** Only tick when exam is active (not showing results, not paused) */
  isActive: boolean;
  /** Fires once when timer reaches 0 — triggers handleExamComplete */
  onTimeUp: () => void;
}

interface UseExamTimerReturn {
  timeRemaining: number;
  /** Formatted as MM:SS or H:MM:SS if > 1 hour */
  formattedTime: string;
  /** Less than 5 minutes remaining */
  isWarning: boolean;
  /** Less than 1 minute remaining */
  isCritical: boolean;
}

/** Format seconds into human-readable countdown string */
function formatTime(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const DB_PERSIST_INTERVAL = 30; // persist every 30 seconds to avoid write storms on 3G

export function useExamTimer({
  sessionId,
  initialSeconds,
  isActive,
  onTimeUp,
}: UseExamTimerProps): UseExamTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
  const lastPersistedRef = useRef(initialSeconds);
  const ticksSinceLastPersist = useRef(0);
  const hasCalledTimeUp = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  // Reset when session or initial value changes (new exam or resume)
  useEffect(() => {
    setTimeRemaining(initialSeconds);
    lastPersistedRef.current = initialSeconds;
    ticksSinceLastPersist.current = 0;
    hasCalledTimeUp.current = false;
  }, [sessionId, initialSeconds]);

  /** Persist current time_remaining to DB — batched, not every tick */
  const persistToDb = useCallback(async (seconds: number) => {
    if (!sessionId) return;
    await supabase
      .from('exam_practice_sessions')
      .update({ time_remaining: seconds })
      .eq('id', sessionId);
    lastPersistedRef.current = seconds;
  }, [sessionId]);

  // Main countdown interval — only ticks when isActive
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const next = prev - 1;

        // Persist to DB every DB_PERSIST_INTERVAL ticks
        ticksSinceLastPersist.current += 1;
        if (ticksSinceLastPersist.current >= DB_PERSIST_INTERVAL) {
          ticksSinceLastPersist.current = 0;
          persistToDb(next);
        }

        // Time's up — fire callback once
        if (next <= 0 && !hasCalledTimeUp.current) {
          hasCalledTimeUp.current = true;
          // Defer to avoid setState-during-render issues
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeRemaining <= 0, persistToDb]);

  // Pause timer when tab is hidden — prevents cheating by switching tabs
  useEffect(() => {
    if (!isActive) return;

    const handleVisibility = () => {
      if (document.hidden) {
        // Tab hidden — persist current time immediately
        persistToDb(timeRemaining);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive, timeRemaining, persistToDb]);

  // Flush remaining time to DB on unmount (e.g. navigating away)
  useEffect(() => {
    return () => {
      if (sessionId && timeRemaining > 0 && timeRemaining !== lastPersistedRef.current) {
        persistToDb(timeRemaining);
      }
    };
  }, [sessionId, timeRemaining, persistToDb]);

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isWarning: timeRemaining > 0 && timeRemaining <= 300, // 5 minutes
    isCritical: timeRemaining > 0 && timeRemaining <= 60,  // 1 minute
  };
}
