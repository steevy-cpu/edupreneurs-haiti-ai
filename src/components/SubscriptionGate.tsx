/**
 * SubscriptionGate - Blocks access for expired subscriptions
 * 
 * Wraps protected content. Users with has_free_access = true bypass entirely.
 * Expired users see a full-screen renewal prompt.
 */

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, CreditCard, Gift, Loader2, RefreshCw } from 'lucide-react';
import { StripeRenewalButton } from '@/components/subscription/StripeRenewalButton';
import { RenewalGiftLink } from '@/components/subscription/RenewalGiftLink';
import { toast } from 'sonner';

// Users created before this date are legacy (before subscription system)
const SUBSCRIPTION_CUTOFF_DATE = new Date('2026-02-10T00:00:00Z');

interface SubscriptionGateProps {
  children: ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { user, isAuthenticated } = useSessionAuth();

  const { data: profile, isError, refetch } = useQuery({
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

  // 10-second timeout to detect stuck loading state on 3G
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (profile || isError || !isAuthenticated) return;
    setTimedOut(false);
    const timer = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, [profile, isError, isAuthenticated]);

  // Not authenticated - let auth guard handle redirect
  if (!isAuthenticated) return <>{children}</>;

  // Query failed or timed out — show retry UI instead of infinite skeleton
  if (isError || (timedOut && !profile)) {
    return <SubscriptionErrorState onRetry={() => { setTimedOut(false); refetch(); }} />;
  }

  // Profile still loading - show skeleton instead of null blank screen (critical on 3G)
  if (!profile) return <SubscriptionLoadingSkeleton />;

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

/**
 * Skeleton shown while subscription profile is loading.
 * Approximates the dashboard layout to prevent blank-screen flash on 3G.
 */
function SubscriptionLoadingSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-pulse">
      {/* Page header */}
      <div className="h-8 w-48 rounded-lg bg-muted" />

      {/* KPI cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-muted h-24" />
        ))}
      </div>

      {/* Main content blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="rounded-xl bg-muted h-40" />
          <div className="rounded-xl bg-muted h-32" />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl bg-muted h-36" />
          <div className="rounded-xl bg-muted h-28" />
        </div>
      </div>
    </div>
  );
}

/**
 * Error state shown when subscription query fails or times out on 3G.
 * Provides a retry button so users aren't stuck forever.
 */
function SubscriptionErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-sm w-full text-center space-y-5 animate-in fade-in duration-500">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Impossible de vérifier votre abonnement</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Vérifiez votre connexion internet et réessayez.
          </p>
        </div>
        <Button onClick={onRetry} variant="outline" size="lg" className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Réessayer
        </Button>
      </div>
    </div>
  );
}

function RenewalPrompt() {
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState<"moncash" | "stripe">("moncash");
  const [renewLoading, setRenewLoading] = useState(false);

  const handleMonCashRenewal = async () => {
    setRenewLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('moncash-create-payment', {
        body: { amount: 200, description: 'Renouvellement Edupreneurs - 30 jours' },
      });
      if (error || !data?.redirectUrl) {
        toast.error("Erreur lors de la création du paiement");
        setRenewLoading(false);
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      toast.error("Erreur réseau");
      setRenewLoading(false);
    }
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

        {/* Payment method tabs — MonCash and Carte (Stripe) only */}
        <div className="space-y-3 text-left">
          <div className="flex rounded-lg border border-input overflow-hidden">
            <button
              type="button"
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                paymentMethod === "moncash"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setPaymentMethod("moncash")}
            >
              MonCash
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                paymentMethod === "stripe"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
              onClick={() => setPaymentMethod("stripe")}
            >
              Carte
            </button>
          </div>

          {paymentMethod === "moncash" ? (
            <Button
              size="lg"
              className="w-full"
              onClick={handleMonCashRenewal}
              disabled={renewLoading}
            >
              {renewLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Préparation...</>
              ) : (
                <><CreditCard className="mr-2 h-5 w-5" />Renouveler avec MonCash — 200 HTG</>
              )}
            </Button>
          ) : (
            <StripeRenewalButton size="lg" />
          )}

          {/* Shareable renewal link */}
          <RenewalGiftLink />
        </div>
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
          <Button size="lg" className="w-full" onClick={() => navigate('/settings?tab=account#subscription')}>
            <CreditCard className="mr-2 h-5 w-5" />Payer moi-même (200 HTG)
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionGate;
