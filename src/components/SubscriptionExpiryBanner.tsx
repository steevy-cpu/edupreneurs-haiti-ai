/**
 * SubscriptionExpiryBanner - Countdown warning banner
 * 
 * Shows when subscription is expiring within 7 days.
 * Integrates with useBannerPriority for dismissal management.
 * Updates every 60 seconds (battery-friendly for 3G).
 */

import { useNavigate } from 'react-router-dom';
import { X, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscriptionCountdown } from '@/hooks/useSubscriptionCountdown';
import { useBannerPriority } from '@/hooks/useBannerPriority';
import { cn } from '@/lib/utils';

interface SubscriptionExpiryBannerProps {
  subscriptionEndDate: string | null;
  hasFreeAccess: boolean;
}

const BANNER_ID = 'subscription-expiry';

export function SubscriptionExpiryBanner({ subscriptionEndDate, hasFreeAccess }: SubscriptionExpiryBannerProps) {
  const navigate = useNavigate();
  const { dismissBanner, isBannerDismissed } = useBannerPriority();
  const countdown = useSubscriptionCountdown(subscriptionEndDate);

  // Don't show for promo users or if not expiring soon
  if (hasFreeAccess) return null;
  if (!countdown.isExpiringSoon) return null;
  if (countdown.isExpired) return null; // SubscriptionGate handles expired state
  if (isBannerDismissed(BANNER_ID)) return null;

  const handleRenew = () => {
    navigate('/settings?tab=account#subscription');
  };

  const handleDismiss = () => {
    dismissBanner(BANNER_ID, 1); // Reappears after 24 hours
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[1100] px-4 py-2.5 lg:pl-[260px] flex items-center justify-between gap-3 text-sm font-medium shadow-md transition-colors',
        countdown.isUrgent
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-amber-500 text-white'
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Clock className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Votre abonnement expire dans <strong>{countdown.formattedTime}</strong>
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant={countdown.isUrgent ? 'secondary' : 'outline'}
          className="h-7 text-xs px-3"
          onClick={handleRenew}
        >
          <CreditCard className="mr-1 h-3 w-3" />
          Renouveler
        </Button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default SubscriptionExpiryBanner;
