/**
 * StripeRenewalCallback - Handles redirect after Stripe Checkout for renewal
 * 
 * Reads session_id from URL, calls verify-stripe-renewal, shows result.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "success" | "error";

const StripeRenewalCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("loading");
  const [endDate, setEndDate] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("Session manquante");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-stripe-renewal", {
          body: { sessionId },
        });

        if (error || !data?.success) {
          setStatus("error");
          setErrorMsg(data?.error || "Erreur de vérification");
          return;
        }

        setStatus("success");
        if (data.subscriptionEnd) {
          setEndDate(
            new Date(data.subscriptionEnd).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          );
        }

        // Invalidate all subscription queries
        queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
        queryClient.invalidateQueries({ queryKey: ["subscription-banner"] });
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });

        // Auto-redirect after 3 seconds
        setTimeout(() => navigate("/dashboard"), 3000);
      } catch {
        setStatus("error");
        setErrorMsg("Erreur réseau");
      }
    };

    verify();
  }, [searchParams, navigate, queryClient]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in duration-500">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-bold">Vérification du paiement...</h2>
            <p className="text-muted-foreground">Veuillez patienter</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-[hsl(var(--success))]/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-[hsl(var(--success))]" />
            </div>
            <h2 className="text-2xl font-bold">Abonnement renouvelé!</h2>
            {endDate && (
              <p className="text-muted-foreground">
                Accès actif jusqu'au <strong>{endDate}</strong>
              </p>
            )}
            <p className="text-sm text-muted-foreground">Redirection vers le tableau de bord...</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              Aller au tableau de bord
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Erreur</h2>
            <p className="text-muted-foreground">{errorMsg}</p>
            <Button onClick={() => navigate("/settings?tab=account#subscription")}>
              Retour aux paramètres
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default StripeRenewalCallback;
