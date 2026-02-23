/**
 * FeatureGate — Renders a blurred lock overlay for expired/unsubscribed users.
 * Active, free-access, founder, and legacy users see children normally.
 * Keeps the feature preview visible (blur + pointer-events-none) so students
 * know what they're missing — gentle nudge toward renewal.
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

interface FeatureGateProps {
  /** Human-readable feature name shown in the lock card */
  featureName: string;
  children: ReactNode;
}

export function FeatureGate({ featureName, children }: FeatureGateProps) {
  const navigate = useNavigate();
  const { isActive } = useSubscription();

  // Active users (paid, free, founder, legacy) — render normally
  if (isActive) return <>{children}</>;

  // Expired or no-subscription users — blurred preview + lock overlay
  return (
    <div className="relative">
      {/* Blurred, non-interactive preview of the feature */}
      <div className="pointer-events-none select-none blur-sm opacity-60" aria-hidden="true">
        {children}
      </div>

      {/* Lock overlay card — centered on top of the blurred content */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="max-w-xs w-full mx-4 p-6 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-xl text-center space-y-4 animate-in fade-in duration-500">
          {/* Amber lock icon */}
          <div className="mx-auto w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center">
            <Lock className="h-7 w-7 text-amber-500" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-foreground">
              Fonctionnalité verrouillée
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Renouvelez votre abonnement pour accéder à <span className="font-semibold text-foreground">{featureName}</span>.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/settings?tab=account#subscription')}
          >
            Renouveler mon abonnement
          </Button>
        </div>
      </div>
    </div>
  );
}
