/**
 * SubscriptionGate - Blocks access for expired subscriptions
 * 
 * Wraps protected content. Users with has_free_access = true bypass entirely.
 * Expired users see a full-screen renewal prompt.
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, CreditCard, Gift } from 'lucide-react';

// Users created before this date are legacy (before subscription system)
const SUBSCRIPTION_CUTOFF_DATE = new Date('2026-02-10T00:00:00Z');

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
        .select('has_free_access, subscription_status, subscription_end_date, created_at')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && isAuthenticated,
    staleTime: 5 * 60 * 1000,
    // Poll every 10s when waiting for gift payment so UI auto-refreshes
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.subscription_status === 'pending_gift' ? 10_000 : false;
    },
  });

  // Track previous status to detect pending_gift → active transition
  const queryClient = useQueryClient();
  const prevStatusRef = useRef<string | null>(null);

  useEffect(() => {
    const currentStatus = profile?.subscription_status ?? null;
    if (prevStatusRef.current === 'pending_gift' && currentStatus === 'active') {
      // Invalidate all subscription-related queries so tour context + banner pick up the change
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-banner'] });
    }
    prevStatusRef.current = currentStatus;
  }, [profile?.subscription_status, queryClient]);

  // Not authenticated - let auth guard handle redirect
  if (!isAuthenticated) return <>{children}</>;

  // Profile still loading - block content until we know subscription status
  if (!profile) return null;

  // Promo users always pass
  if (profile.has_free_access) return <>{children}</>;

  // Legacy users (created before subscription system) with no subscription - allow through
  const isLegacyUser = profile.created_at && new Date(profile.created_at) < SUBSCRIPTION_CUTOFF_DATE;
  if ((!profile.subscription_status || profile.subscription_status === 'none') && isLegacyUser) {
    return <>{children}</>;
  }

  // New users with 'none' status - show payment prompt
  if (!profile.subscription_status || profile.subscription_status === 'none') {
    return <RenewalPrompt />;
  }

  // Pending gift - waiting for family member to pay
  if (profile.subscription_status === 'pending_gift') {
    return <PendingGiftPrompt />;
  }

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

function PendingGiftPrompt() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in duration-500">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Gift className="h-8 w-8 text-primary" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">En attente du paiement</h2>
          <p className="text-muted-foreground mt-2">
            Votre compte est créé ! Un membre de votre famille doit compléter le paiement 
            via le lien cadeau pour activer votre accès.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
          <p>Partagez votre lien cadeau avec votre parent ou tuteur pour qu'il puisse payer votre abonnement.</p>
        </div>

        <div className="space-y-2">
          <Button size="lg" className="w-full" onClick={() => navigate('/settings?tab=preferences#subscription')}>
            <CreditCard className="mr-2 h-5 w-5" />Payer moi-même (200 HTG)
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionGate;
