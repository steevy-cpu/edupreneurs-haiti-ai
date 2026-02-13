/**
 * Gift Payment Success Page - /gift/success?token=<token>
 * 
 * Thank-you page shown after successful Stripe payment.
 * Verifies payment and activates student subscription.
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { verifyGiftPayment } from "@/auth/services/gift.service";

export default function GiftPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [studentName, setStudentName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMsg("Token manquant"); return; }

    verifyGiftPayment(token).then((result) => {
      if (result.success) {
        setStudentName(result.studentName || "");
        setStatus("success");
      } else {
        setErrorMsg(result.error || "Erreur de vérification");
        setStatus("error");
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">🎓 Edupreneurs Haiti</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 text-center">
          {status === "verifying" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-green-500" />
              <h2 className="mt-4 text-lg font-semibold">Vérification du paiement...</h2>
              <p className="text-sm text-gray-500 mt-2">Un instant s'il vous plaît</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Mèsi anpil ! 🎉</h2>
              <p className="mt-3 text-gray-600">
                L'abonnement de <strong className="text-green-700">{studentName}</strong> a été activé avec succès !
              </p>
              <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm text-green-700">
                <p>✅ 30 jours d'accès complet</p>
                <p className="mt-1">L'étudiant a été notifié automatiquement.</p>
              </div>
              <p className="mt-6 text-xs text-gray-400">
                Vous pouvez fermer cette page en toute sécurité.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
              <h2 className="mt-4 text-lg font-semibold text-gray-900">Erreur</h2>
              <p className="mt-2 text-sm text-gray-500">{errorMsg}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
