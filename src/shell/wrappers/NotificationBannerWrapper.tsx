/**
 * Wrapper for NotificationPermissionBanner that provides the userId from auth context.
 * Used in FloatingLayer for centralized placement.
 */

import { lazy, Suspense } from 'react';
import { useSessionAuth } from '@/contexts/SessionAuthContext';

const NotificationPermissionBanner = lazy(() => 
  import('@/components/NotificationPermissionBanner').then(m => ({ default: m.NotificationPermissionBanner }))
);

export function NotificationBannerWrapper() {
  const { user } = useSessionAuth();
  
  // Only render if we have an authenticated user
  if (!user?.id) {
    return null;
  }
  
  return (
    <Suspense fallback={null}>
      <NotificationPermissionBanner userId={user.id} />
    </Suspense>
  );
}

export default NotificationBannerWrapper;
