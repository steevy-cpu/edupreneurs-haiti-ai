/**
 * SubscriptionGate - Blocks access for expired subscriptions
 * 
 * Wraps protected content. Users with has_free_access = true bypass entirely.
 * Expired users see a full-screen renewal prompt.
 */

import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard } from 'lucide-react';

interface SubscriptionGateProps {
  children: ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, isAuthenticated } = useSessionAuth();

  const { data: profile } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('has_free_access, subscription_status, subscription_end_date')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Not loaded yet or not authenticated - allow through (auth guard handles redirect)
  if (!isAuthenticated || !profile) return <>{children}</>;

  // Promo users always pass
  if (profile.has_free_access) return <>{children}</>;

  // No subscription set up (legacy users before this feature) - allow through
  if (!profile.subscription_status || profile.subscription_status === 'none') return <>{children}</>;

  // Check if subscription is active and not expired
  const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
  const isActive = profile.subscription_status === 'active' && endDate && endDate.getTime() > Date.now();

  if (isActive) return <>{children}</>;

  // Expired - show renewal prompt
  return <RenewalPrompt />;
}

function RenewalPrompt() {
  const navigate = useNavigate();

  const handleRenew = () => {
    navigate('/settings?tab=preferences#subscription');
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in duration-500">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Clock className="h-8 w-8 text-destructive" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Abonnement expiré</h2>
          <p className="text-muted-foreground mt-2">
            Votre abonnement de 30 jours a expiré. Renouvelez pour continuer à accéder à la plateforme.
          </p>
        </div>

        <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
          <div className="text-3xl font-bold text-primary">200 HTG</div>
          <div className="text-sm text-muted-foreground">/ 30 jours</div>
        </div>

        <Button size="lg" className="w-full" onClick={handleRenew}>
          <CreditCard className="mr-2 h-5 w-5" />Renouveler mon abonnement
        </Button>
      </div>
    </div>
  );
}

export default SubscriptionGate;
