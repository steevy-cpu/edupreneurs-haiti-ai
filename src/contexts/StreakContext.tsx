/**
 * StreakContext — Global streak state, read-only from profiles + realtime.
 *
 * Streak updates now happen via DB trigger (update_streak_on_activity)
 * which fires on gold_earned increments. This context only reads
 * current values and listens for realtime changes.
 * Founders are excluded from display (returns zeros).
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
  /** Whether the streak was incremented today (last_activity_date = today) */
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

/** Today as YYYY-MM-DD in UTC */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StreakProvider({ children }: StreakProviderProps) {
  const { user } = useSessionAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [freezeCount, setFreezeCount] = useState(0);
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streakIncremented, setStreakIncremented] = useState(false);

  // Prevent double-calls in StrictMode
  const calledRef = useRef(false);

  const clearPendingMilestone = useCallback(() => setPendingMilestone(null), []);

  /** Check if a milestone was earned today and hasn't been shown yet */
  const checkForTodayMilestone = useCallback(async (userId: string) => {
    try {
      const today = todayUTC();
      const { data: todayMilestone } = await supabase
        .from('streak_milestones')
        .select('milestone_days, badge_title, badge_icon_url')
        .eq('user_id', userId)
        .gte('earned_at', today)
        .order('earned_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (todayMilestone) {
        setPendingMilestone({
          days: todayMilestone.milestone_days,
          title: todayMilestone.badge_title,
          iconUrl: todayMilestone.badge_icon_url,
        });
      }
    } catch (err) {
      console.error('[StreakContext] Milestone check error:', err);
    }
  }, []);

  useEffect(() => {
    // Skip for founders or unauthenticated
    if (!user?.id || isFounder(user.id)) return;
    if (calledRef.current) return;
    calledRef.current = true;

    const userId = user.id;
    const today = todayUTC();

    // --- Initial fetch: read streak data from profiles ---
    const fetchStreak = async () => {
      setIsLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('current_streak, longest_streak, streak_freeze_count, last_activity_date')
          .eq('user_id', userId)
          .single();

        if (error || !profile) {
          console.error('[StreakContext] Profile fetch error:', error);
          return;
        }

        setCurrentStreak(profile.current_streak ?? 0);
        setLongestStreak(profile.longest_streak ?? 0);
        setFreezeCount(profile.streak_freeze_count ?? 0);
        // Streak was incremented today if last_activity_date matches
        setStreakIncremented(profile.last_activity_date === today);

        // Check for milestone earned today (from DB trigger)
        await checkForTodayMilestone(userId);
      } catch (err) {
        console.error('[StreakContext] Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();

    // --- Realtime subscription: update streak when DB trigger fires ---
    const channel = supabase
      .channel('streak-profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown>;
          const old = payload.old as Record<string, unknown>;

          setCurrentStreak((updated.current_streak as number) ?? 0);
          setLongestStreak((updated.longest_streak as number) ?? 0);
          setFreezeCount((updated.streak_freeze_count as number) ?? 0);
          setStreakIncremented((updated.last_activity_date as string) === todayUTC());

          // If streak changed, check for new milestone
          if (updated.current_streak !== old.current_streak) {
            checkForTodayMilestone(userId);
          }
        }
      )
      .subscribe();

    // Cleanup realtime channel on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, checkForTodayMilestone]);

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
