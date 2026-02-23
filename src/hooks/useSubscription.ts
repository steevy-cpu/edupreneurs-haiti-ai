/**
 * useSubscription — Single source of truth for subscription status.
 *
 * Replaces the 3 independent subscription queries that were scattered across
 * SubscriptionGate, SubscriptionExpiryBannerWrapper, and Settings.
 * All subscription UI should consume this hook instead of querying profiles directly.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { isFounder } from '@/lib/founderConstants';

// Users created before this date bypass subscription checks (legacy users)
const SUBSCRIPTION_CUTOFF_DATE = new Date('2026-02-10T00:00:00Z');

export interface SubscriptionResult {
  /** User has active access (free, founder, legacy, or paid active) */
  isActive: boolean;
  /** subscription_status === 'expired' */
  isExpired: boolean;
  /** has_free_access flag is true */
  isFreeAccess: boolean;
  /** User is a platform founder */
  isFounder: boolean;
  /** Legacy user created before subscription system with no subscription */
  isLegacy: boolean;
  /** Waiting for family member to pay */
  isPendingGift: boolean;
  /** Never had a subscription (new user, status === 'none') */
  isNone: boolean;
  /** Days remaining on active subscription, null if not applicable */
  daysRemaining: number | null;
  /** Raw end date string */
  subscriptionEndDate: string | null;
  /** Raw status from DB */
  subscriptionStatus: string | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useSubscription(): SubscriptionResult {
  const { user, isAuthenticated } = useSessionAuth();
  const queryClient = useQueryClient();
  const userId = user?.id ?? null;
  const userIsFounder = isFounder(userId);

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['subscription', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('has_free_access, subscription_status, subscription_end_date, created_at')
        .eq('user_id', userId)
        .maybeSingle();
      return data;
    },
    enabled: !!userId && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min — matches TanStack defaults
    // Poll every 10s when waiting for gift payment so UI auto-refreshes
    refetchInterval: (query) => {
      const d = query.state.data;
      return d?.subscription_status === 'pending_gift' ? 10_000 : false;
    },
  });

  // Detect pending_gift → active transitions and invalidate related queries
  const prevStatusRef = useRef<string | null>(null);
  useEffect(() => {
    const currentStatus = profile?.subscription_status ?? null;
    if (prevStatusRef.current === 'pending_gift' && currentStatus === 'active') {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-banner'] });
    }
    prevStatusRef.current = currentStatus;
  }, [profile?.subscription_status, queryClient]);

  // Derive all flags from profile data
  const hasFreeAccess = profile?.has_free_access ?? false;
  const status = profile?.subscription_status ?? null;
  const endDateStr = profile?.subscription_end_date ?? null;
  const createdAt = profile?.created_at ?? null;

  const endDate = endDateStr ? new Date(endDateStr) : null;
  const isPaidActive = status === 'active' && endDate !== null && endDate.getTime() > Date.now();
  const isExpired = status === 'expired';
  const isPendingGift = status === 'pending_gift';
  const isNone = !status || status === 'none';

  // Legacy: user created before subscription system with no subscription
  const isLegacy = isNone && !!createdAt && new Date(createdAt) < SUBSCRIPTION_CUTOFF_DATE;

  // Active = any bypass OR paid active subscription
  const isActive = hasFreeAccess || userIsFounder || isLegacy || isPaidActive;

  // Calculate days remaining for active paid subscriptions
  let daysRemaining: number | null = null;
  if (isPaidActive && endDate) {
    daysRemaining = Math.max(0, Math.floor((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  return {
    isActive,
    isExpired,
    isFreeAccess: hasFreeAccess,
    isFounder: userIsFounder,
    isLegacy,
    isPendingGift,
    isNone,
    daysRemaining,
    subscriptionEndDate: endDateStr,
    subscriptionStatus: status,
    isLoading,
    isError,
    refetch,
  };
}

export default useSubscription;
