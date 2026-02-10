/**
 * Subscription Countdown Hook
 * 
 * Provides a live countdown to subscription expiration.
 * Updates every 60 seconds to save battery on 3G connections.
 */

import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // <= 7 days
  isUrgent: boolean; // <= 3 days
  formattedTime: string; // "Xj Xh Xm"
}

const EXPIRING_SOON_DAYS = 7;
const URGENT_DAYS = 3;

function calcCountdown(endDate: string | null): CountdownResult {
  if (!endDate) {
    return { daysLeft: 0, hoursLeft: 0, minutesLeft: 0, isExpired: true, isExpiringSoon: false, isUrgent: false, formattedTime: '' };
  }

  const now = Date.now();
  const end = new Date(endDate).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return { daysLeft: 0, hoursLeft: 0, minutesLeft: 0, isExpired: true, isExpiringSoon: false, isUrgent: false, formattedTime: '' };
  }

  const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const isExpiringSoon = daysLeft < EXPIRING_SOON_DAYS;
  const isUrgent = daysLeft < URGENT_DAYS;

  const parts: string[] = [];
  if (daysLeft > 0) parts.push(`${daysLeft}j`);
  if (hoursLeft > 0 || daysLeft > 0) parts.push(`${hoursLeft}h`);
  parts.push(`${minutesLeft}m`);

  return {
    daysLeft,
    hoursLeft,
    minutesLeft,
    isExpired: false,
    isExpiringSoon,
    isUrgent,
    formattedTime: parts.join(' '),
  };
}

export function useSubscriptionCountdown(subscriptionEndDate: string | null): CountdownResult {
  const [countdown, setCountdown] = useState<CountdownResult>(() => calcCountdown(subscriptionEndDate));

  const update = useCallback(() => {
    setCountdown(calcCountdown(subscriptionEndDate));
  }, [subscriptionEndDate]);

  useEffect(() => {
    update();
    // Update every 60 seconds - battery-friendly for 3G
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [update]);

  return countdown;
}

export default useSubscriptionCountdown;
