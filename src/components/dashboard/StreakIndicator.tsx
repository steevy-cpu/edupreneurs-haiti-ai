/**
 * StreakIndicator — Animated flame KPI card for the dashboard.
 *
 * Shows current streak with animated flame GIF.
 * Greyscale when streak is 0. Snowflake badge when freezes available.
 * Founders see nothing (returns null).
 */

import { useEffect, useState } from 'react';
import { useStreak } from '@/contexts/StreakContext';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { isFounder } from '@/lib/founderConstants';
import { STREAK_FLAME_URL } from '@/lib/streakConstants';

export function StreakIndicator() {
  const { user } = useSessionAuth();
  const { currentStreak, freezeCount, streakIncremented } = useStreak();
  const [bursting, setBursting] = useState(false);

  // Play burst animation on mount if streak was just incremented today
  useEffect(() => {
    if (streakIncremented && currentStreak > 0) {
      setBursting(true);
      const timer = setTimeout(() => setBursting(false), 600);
      return () => clearTimeout(timer);
    }
  }, [streakIncremented, currentStreak]);

  // Founders excluded — render nothing
  if (isFounder(user?.id)) return null;

  const isInactive = currentStreak === 0;

  return (
    <div className="flex flex-col items-center text-center relative">
      {/* Flame container with optional glow */}
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1.5 relative
          ${isInactive ? 'bg-muted' : 'bg-orange-100 dark:bg-orange-500/20 animate-streak-glow'}
        `}
      >
        <img
          src={STREAK_FLAME_URL}
          alt="Streak flame"
          className={`w-6 h-6 sm:w-7 sm:h-7 object-contain
            ${isInactive ? 'grayscale opacity-40' : ''}
            ${bursting ? 'animate-flame-burst' : 'animate-flame-idle'}
          `}
          loading="lazy"
        />
        {/* Freeze badge — small snowflake overlay */}
        {freezeCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center"
            title={`${freezeCount} freeze${freezeCount > 1 ? 's' : ''} disponible${freezeCount > 1 ? 's' : ''}`}
          >
            ❄️
          </span>
        )}
      </div>
      <span className="text-lg sm:text-xl font-bold text-foreground">{currentStreak}</span>
      <span className="text-[10px] sm:text-xs text-muted-foreground">
        {currentStreak === 1 ? 'jour' : 'jours'}
      </span>
      {/* Motivational nudge when streak is cold */}
      {currentStreak === 0 && (
        <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
          Lance ta série ! 🔥
        </span>
      )}
    </div>
  );
}
