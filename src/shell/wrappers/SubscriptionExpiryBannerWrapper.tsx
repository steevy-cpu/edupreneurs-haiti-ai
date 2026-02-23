/**
 * SubscriptionExpiryBanner Wrapper for FloatingLayer
 * Uses the shared useSubscription hook as single source of truth.
 */

import { lazy, Suspense } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionExpiryBanner = lazy(() => import('@/components/SubscriptionExpiryBanner'));

export function SubscriptionExpiryBannerWrapper() {
  const { subscriptionEndDate, isFreeAccess, isActive } = useSubscription();

  // Only show banner for active paid users (not free/founder/legacy)
  if (!isActive || isFreeAccess || !subscriptionEndDate) return null;

  return (
    <Suspense fallback={null}>
      <SubscriptionExpiryBanner
        subscriptionEndDate={subscriptionEndDate}
        hasFreeAccess={isFreeAccess}
      />
    </Suspense>
  );
}
