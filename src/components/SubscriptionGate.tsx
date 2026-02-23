/**
 * SubscriptionGate - Blocks access for expired/missing subscriptions.
 *
 * Decision tree (order matters):
 * 1. Not authenticated → pass through (auth guard handles)
 * 2. Loading / error   → skeleton / retry UI
 * 3. isFreeAccess      → pass through
 * 4. isFounder         → pass through
 * 5. isLegacy          → pass through
 * 6. isActive          → pass through
 * 7. isPendingGift     → PendingGiftPrompt
 * 8. isExpired         → ExpiredPrompt (softer tone for returning users)
 * 9. isNone            → RenewalPrompt (new users who never subscribed)
 * 10. fallback         → RenewalPrompt
 */

import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CalendarX2, Clock, CreditCard, Gift, Loader2, RefreshCw } from 'lucide-react';
import { StripeRenewalButton } from '@/components/subscription/StripeRenewalButton';
import { RenewalGiftLink } from '@/components/subscription/RenewalGiftLink';
import { toast } from 'sonner';

interface SubscriptionGateProps {
  children: ReactNode;
}

export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { isAuthenticated } = useSessionAuth();
  const sub = useSubscription();

  // 10-second timeout to detect stuck loading on 3G
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (!sub.isLoading || sub.isError || !isAuthenticated) return;
    setTimedOut(false);
    const timer = setTimeout(() => setTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, [sub.isLoading, sub.isError, isAuthenticated]);

  // 1. Not authenticated — let auth guard handle redirect
  if (!isAuthenticated) return <>{children}</>;

  // 2. Query failed or timed out — show retry UI
  if (sub.isError || (timedOut && sub.isLoading)) {
    return <SubscriptionErrorState onRetry={() => { setTimedOut(false); sub.refetch(); }} />;
  }

  // 2b. Still loading — show skeleton (critical on 3G)
  if (sub.isLoading) return <SubscriptionLoadingSkeleton />;

  // 3–6. All bypass paths: free access, founder, legacy, or active paid
  if (sub.isActive) return <>{children}</>;

  // 7. Pending gift — waiting for family member to pay
  if (sub.isPendingGift) return <PendingGiftPrompt />;

  // 8. Expired — softer tone for returning users
  if (sub.isExpired) return <ExpiredPrompt />;

  // 9–10. Never subscribed or fallback — standard prompt for new users
  return <RenewalPrompt />;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Skeleton shown while subscription profile is loading.
 * Approximates the dashboard layout to prevent blank-screen flash on 3G.
 */
function SubscriptionLoadingSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl bg-muted h-24" />
        ))}
      </div>
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

/**
 * MonCash/Stripe payment tabs — shared between RenewalPrompt and ExpiredPrompt.
 */
function PaymentActions() {
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
    <div className="space-y-3 text-left">
      {/* Payment method tabs — MonCash and Carte (Stripe) */}
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

      {/* Shareable renewal link for family/gift payments */}
      <RenewalGiftLink />
    </div>
  );
}

/**
 * RenewalPrompt — shown to NEW users who never had a subscription (status === 'none').
 */
function RenewalPrompt() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in duration-500">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Clock className="h-8 w-8 text-destructive" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Abonnement requis</h2>
          <p className="text-muted-foreground mt-2">
            Pour accéder à la plateforme, souscrivez à un abonnement de 30 jours.
          </p>
        </div>

        <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
          <div className="text-3xl font-bold text-primary">200 HTG</div>
          <div className="text-sm text-muted-foreground">/ 30 jours</div>
        </div>

        <PaymentActions />
      </div>
    </div>
  );
}

/**
 * ExpiredPrompt — shown to RETURNING users whose subscription expired.
 * Softer tone that acknowledges their past usage.
 */
function ExpiredPrompt() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in duration-500">
        <div className="mx-auto w-16 h-16 rounded-full bg-accent flex items-center justify-center">
          <CalendarX2 className="h-8 w-8 text-accent-foreground" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Votre abonnement a pris fin</h2>
          <p className="text-muted-foreground mt-2">
            Merci d'avoir utilisé Edupreneurs ! Renouvelez votre abonnement pour retrouver l'accès à tous vos cours et activités.
          </p>
        </div>

        <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
          <div className="text-3xl font-bold text-primary">200 HTG</div>
          <div className="text-sm text-muted-foreground">/ 30 jours</div>
        </div>

        <PaymentActions />
      </div>
    </div>
  );
}

/**
 * PendingGiftPrompt — shown when a family member needs to complete payment.
 */
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
