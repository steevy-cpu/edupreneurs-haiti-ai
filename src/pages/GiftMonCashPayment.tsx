/**
 * Public MonCash Gift Payment Page - /gift/moncash/:token
 * 
 * Page for family members in Haiti to pay a student's subscription via MonCash.
 */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle, Smartphone } from "lucide-react";
import { getGiftInfo } from "@/auth/services/gift.service";
import { createMonCashGiftPayment } from "@/auth/services/gift-moncash.service";

export default function GiftMonCashPayment() {
  const { token } = useParams<{ token: string }>();
  const [studentName, setStudentName] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "paying" | "completed" | "expired" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMsg("Lien invalide"); return; }

    getGiftInfo(token).then((result) => {
      if (!result.success) {
        setStatus(result.error?.includes("expiré") ? "expired" : "error");
        setErrorMsg(result.error || "Lien introuvable");
        return;
      }
      setStudentName(result.studentName || "");
      if (result.status === "completed") {
        setStatus("completed");
      } else {
        setStatus("ready");
      }
    });
  }, [token]);

  const handlePay = async () => {
    if (!token) return;
    setStatus("paying");

    const result = await createMonCashGiftPayment(token);
    if (result.success && result.redirectUrl) {
      window.location.href = result.redirectUrl;
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Erreur lors du paiement");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">🇭🇹 Edupreneurs Haiti</h1>
          <p className="text-sm text-muted-foreground">Paiement d'abonnement via MonCash</p>
        </div>

        {/* Card */}
        <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Chargement...</p>
            </div>
          )}

          {status === "ready" && (
            <>
              <div className="text-center space-y-2">
                <p className="text-muted-foreground text-sm">Abonnement 30 jours pour</p>
                <p className="text-xl font-bold">{studentName}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary">200 HTG</p>
                <p className="text-xs text-muted-foreground mt-1">Via MonCash</p>
              </div>
              <Button onClick={handlePay} className="w-full" size="lg">
                <Smartphone className="mr-2 h-5 w-5" />
                Payer via MonCash
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ⏳ Ce lien expire dans 15 minutes
              </p>
            </>
          )}

          {status === "paying" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Redirection vers MonCash...</p>
            </div>
          )}

          {status === "completed" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h2 className="text-lg font-bold">Paiement déjà effectué ✅</h2>
              <p className="text-sm text-muted-foreground">
                L'abonnement de <strong>{studentName}</strong> est déjà actif.
              </p>
            </div>
          )}

          {status === "expired" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500" />
              <h2 className="text-lg font-bold">Lien expiré ⏰</h2>
              <p className="text-sm text-muted-foreground">
                Ce lien de paiement a expiré. Demandez à l'étudiant d'en générer un nouveau.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-lg font-bold">Erreur</h2>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
