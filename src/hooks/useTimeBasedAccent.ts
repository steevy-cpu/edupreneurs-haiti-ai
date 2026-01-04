import { useState, useEffect, useRef } from 'react';

interface TimeBasedAccent {
  accentColor: string;
  accentHsl: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

/**
 * Hook that provides time-based accent colors for a dynamic,
 * personalized chat experience. Updates hourly.
 */
export function useTimeBasedAccent(): TimeBasedAccent {
  const getTimeBasedAccent = (): TimeBasedAccent => {
    const hour = new Date().getHours();
    
    // Morning (6-12): Warm amber
    if (hour >= 6 && hour < 12) {
      return {
        accentColor: 'hsl(35, 90%, 55%)',
        accentHsl: '35 90% 55%',
        period: 'morning',
      };
    }
    
    // Afternoon (12-18): Sky blue
    if (hour >= 12 && hour < 18) {
      return {
        accentColor: 'hsl(200, 90%, 55%)',
        accentHsl: '200 90% 55%',
        period: 'afternoon',
      };
    }
    
    // Evening (18-22): Soft purple
    if (hour >= 18 && hour < 22) {
      return {
        accentColor: 'hsl(270, 70%, 60%)',
        accentHsl: '270 70% 60%',
        period: 'evening',
      };
    }
    
    // Night (22-6): Deep indigo
    return {
      accentColor: 'hsl(230, 60%, 50%)',
      accentHsl: '230 60% 50%',
      period: 'night',
    };
  };

  const [accent, setAccent] = useState<TimeBasedAccent>(getTimeBasedAccent);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update on mount
    setAccent(getTimeBasedAccent());
    
    // Calculate time until next hour
    const now = new Date();
    const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;
    
    // Set timeout to sync with the hour, then interval every hour
    const timeout = setTimeout(() => {
      setAccent(getTimeBasedAccent());
      
      // Then update every hour
      intervalRef.current = setInterval(() => {
        setAccent(getTimeBasedAccent());
      }, 60 * 60 * 1000);
    }, msUntilNextHour);
    
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return accent;
}
