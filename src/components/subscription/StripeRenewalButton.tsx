/**
 * StripeRenewalButton - Self-pay via Stripe for subscription renewal
 * 
 * Calls create-stripe-renewal edge function and redirects to Stripe Checkout.
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StripeRenewalButtonProps {
  size?: "default" | "lg";
  className?: string;
}

export function StripeRenewalButton({ size = "default", className = "w-full" }: StripeRenewalButtonProps) {
  const { session } = useSessionAuth();
  const [loading, setLoading] = useState(false);

  const handleStripeRenewal = async () => {
    if (!session?.access_token) {
      toast.error("Vous devez être connecté");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-stripe-renewal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error || !data?.url) {
        toast.error("Erreur lors de la création du paiement");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch {
      toast.error("Erreur réseau — vérifiez votre connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size={size}
      className={className}
      onClick={handleStripeRenewal}
      disabled={loading}
    >
      {loading ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Préparation...</>
      ) : (
        <><CreditCard className="mr-2 h-4 w-4" />Renouveler avec Carte — $2 USD</>
      )}
    </Button>
  );
}

export default StripeRenewalButton;
