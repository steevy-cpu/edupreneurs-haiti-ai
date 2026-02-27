/**
 * StreakContext — Global streak state, updated once per session.
 *
 * On mount (if authenticated & not founder): calls update-streak edge function.
 * Exposes current streak, milestones, and pending milestone for the modal.
 * Safe defaults outside provider — never crashes.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { isFounder } from '@/lib/founderConstants';

export interface MilestoneData {
  days: number;
  title: string;
  iconUrl: string;
  freezeReward?: number;
}

interface StreakContextValue {
  currentStreak: number;
  longestStreak: number;
  freezeCount: number;
  pendingMilestone: MilestoneData | null;
  clearPendingMilestone: () => void;
  isLoading: boolean;
  /** Whether the streak was incremented in this session */
  streakIncremented: boolean;
}

const defaultValue: StreakContextValue = {
  currentStreak: 0,
  longestStreak: 0,
  freezeCount: 0,
  pendingMilestone: null,
  clearPendingMilestone: () => {},
  isLoading: false,
  streakIncremented: false,
};

const StreakCtx = createContext<StreakContextValue>(defaultValue);

/** Safe hook — returns zeros if used outside provider */
export function useStreak(): StreakContextValue {
  return useContext(StreakCtx);
}

interface StreakProviderProps {
  children: ReactNode;
}

export function StreakProvider({ children }: StreakProviderProps) {
  const { user, session } = useSessionAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [freezeCount, setFreezeCount] = useState(0);
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streakIncremented, setStreakIncremented] = useState(false);

  // Prevent double-calls in StrictMode
  const calledRef = useRef(false);

  const clearPendingMilestone = useCallback(() => setPendingMilestone(null), []);

  useEffect(() => {
    // Skip for founders or unauthenticated
    if (!user?.id || !session?.access_token || isFounder(user.id)) return;
    if (calledRef.current) return;
    calledRef.current = true;

    const callStreak = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('update-streak', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (error) {
          console.error('[StreakContext] Edge function error:', error);
          return;
        }

        // Founder response — skip silently
        if (data?.isFounder) return;

        setCurrentStreak(data?.currentStreak ?? 0);
        setLongestStreak(data?.longestStreak ?? 0);
        setFreezeCount(data?.freezeCount ?? 0);
        setStreakIncremented(data?.streakIncremented ?? false);

        if (data?.newMilestone) {
          setPendingMilestone(data.newMilestone);
        }
      } catch (err) {
        console.error('[StreakContext] Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    callStreak();
  }, [user?.id, session?.access_token]);

  return (
    <StreakCtx.Provider
      value={{
        currentStreak,
        longestStreak,
        freezeCount,
        pendingMilestone,
        clearPendingMilestone,
        isLoading,
        streakIncremented,
      }}
    >
      {children}
    </StreakCtx.Provider>
  );
}
