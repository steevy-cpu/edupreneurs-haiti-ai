/**
 * @file getTimeBasedGreeting.ts
 * @description Returns French greetings appropriate to the current time of day, aligned with Haiti timezone conventions.
 * @module utils
 *
 * @example
 * const { greeting } = getTimeBasedGreeting(); // → "Bonjour" (morning)
 */

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeGreeting {
  greeting: string;
  period: TimePeriod;
  periodFr: string;
  hour: number;
}

/**
 * Returns appropriate French greeting based on current time of day.
 * Haiti uses Eastern Time (same as US East Coast).
 * 
 * Time ranges:
 * - Morning (6:00-11:59): "Bonjour"
 * - Afternoon (12:00-17:59): "Bon après-midi"
 * - Evening/Night (18:00-5:59): "Bonsoir"
 */
export function getTimeBasedGreeting(): TimeGreeting {
  const hour = new Date().getHours();
  
  // Morning (6-12): Bonjour
  if (hour >= 6 && hour < 12) {
    return { 
      greeting: 'Bonjour', 
      period: 'morning', 
      periodFr: 'le matin',
      hour 
    };
  }
  
  // Afternoon (12-18): Bon après-midi
  if (hour >= 12 && hour < 18) {
    return { 
      greeting: 'Bon après-midi', 
      period: 'afternoon', 
      periodFr: "l'après-midi",
      hour 
    };
  }
  
  // Evening & Night (18-6): Bonsoir
  return { 
    greeting: 'Bonsoir', 
    period: hour >= 18 ? 'evening' : 'night',
    periodFr: 'le soir',
    hour 
  };
}

/**
 * Get greeting from a specific hour (for backend use)
 */
export function getGreetingFromHour(hour: number): { greeting: string; periodFr: string } {
  if (hour >= 6 && hour < 12) {
    return { greeting: 'Bonjour', periodFr: 'le matin' };
  }
  if (hour >= 12 && hour < 18) {
    return { greeting: 'Bon après-midi', periodFr: "l'après-midi" };
  }
  return { greeting: 'Bonsoir', periodFr: 'le soir' };
}
