/**
 * SubscriptionExpiryBanner Wrapper for FloatingLayer
 * Reads subscription data from profile and passes to banner.
 */

import { lazy, Suspense } from 'react';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionExpiryBanner = lazy(() => import('@/components/SubscriptionExpiryBanner'));

export function SubscriptionExpiryBannerWrapper() {
  const { user, isAuthenticated } = useSessionAuth();

  const { data: profile } = useQuery({
    queryKey: ['subscription-banner', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('has_free_access, subscription_end_date')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 min - not critical data
  });

  if (!profile) return null;

  return (
    <Suspense fallback={null}>
      <SubscriptionExpiryBanner
        subscriptionEndDate={profile.subscription_end_date}
        hasFreeAccess={profile.has_free_access || false}
      />
    </Suspense>
  );
}
