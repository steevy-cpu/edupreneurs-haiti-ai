/**
 * MonCash Gift Payment Callback - /gift/moncash/callback
 * 
 * Handles the return from MonCash after payment attempt.
 * Reads orderId and token from URL params, verifies payment.
 */

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyMonCashGiftPayment } from "@/auth/services/gift-moncash.service";

export default function GiftMonCashCallback() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<"verifying" | "success" | "pending" | "error">("verifying");
  const [studentName, setStudentName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const pollCount = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const verify = async () => {
    if (!token || !orderId) {
      setStatus("error");
      setErrorMsg("Paramètres manquants");
      return;
    }

    const result = await verifyMonCashGiftPayment(token, orderId);

    if (result.success) {
      setStudentName(result.studentName || "");
      setStatus("success");
      return;
    }

    if (result.status === "pending" && pollCount.current < 6) {
      setStudentName(result.studentName || "");
      setStatus("pending");
      pollCount.current++;
      pollTimerRef.current = setTimeout(verify, 5000);
      return;
    }

    setStatus("error");
    setErrorMsg(result.error || "Paiement non confirmé");
  };

  useEffect(() => {
    verify();
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold">🇭🇹 Edupreneurs Haiti</h1>
            <p className="text-xs text-muted-foreground">Vérification du paiement MonCash</p>
          </div>

          {status === "verifying" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Vérification du paiement...</p>
            </div>
          )}

          {status === "pending" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Clock className="h-10 w-10 text-amber-500 animate-pulse" />
              <h2 className="text-lg font-bold">Paiement en cours...</h2>
              <p className="text-sm text-muted-foreground">
                En attente de confirmation MonCash. Vérification automatique en cours...
              </p>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h2 className="text-lg font-bold">Paiement confirmé! 🎉</h2>
              <p className="text-sm text-muted-foreground">
                L'abonnement de <strong>{studentName}</strong> est maintenant actif pour 30 jours.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Mèsi anpil pou sipò ou! 💚🇭🇹
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-lg font-bold">Erreur de vérification</h2>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <Button
                variant="outline"
                onClick={() => { pollCount.current = 0; setStatus("verifying"); verify(); }}
                className="mt-2"
              >
                Réessayer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
