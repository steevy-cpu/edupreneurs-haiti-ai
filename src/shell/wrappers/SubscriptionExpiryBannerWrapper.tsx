/**
 * SubscriptionExpiryBanner Wrapper for FloatingLayer
 * Uses the shared useSubscription hook as single source of truth.
 * Shows countdown for both paid subscribers AND trial users.
 */

import { lazy, Suspense } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionExpiryBanner = lazy(() => import('@/components/SubscriptionExpiryBanner'));

export function SubscriptionExpiryBannerWrapper() {
  const { subscriptionEndDate, isFreeAccess, isActive, isTrial } = useSubscription();

  // Show banner for active paid users AND active trial users
  // Exclude promo/founder free access (but not trial — trial users need the countdown)
  if (!isActive || (isFreeAccess && !isTrial) || !subscriptionEndDate) return null;

  return (
    <Suspense fallback={null}>
      <SubscriptionExpiryBanner
        subscriptionEndDate={subscriptionEndDate}
        hasFreeAccess={isFreeAccess && !isTrial}
      />
    </Suspense>
  );
}
