/**
 * Public Gift Payment Page - /gift/pay/:token
 * 
 * Lightweight page for family members to pay a student's subscription via Stripe.
 * No login required. Optimized for 3G.
 */

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CreditCard, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { getGiftInfo, createGiftCheckout } from "@/auth/services/gift.service";

export default function GiftPayment() {
  const { token } = useParams<{ token: string }>();
  const [studentName, setStudentName] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "completed" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"one_time" | "recurring">("one_time");

  useEffect(() => {
    if (!token) { setStatus("error"); setErrorMsg("Lien invalide"); return; }
    
    getGiftInfo(token).then((result) => {
      if (!result.success) {
        setStatus("error");
        setErrorMsg(result.error || "Lien introuvable");
      } else if (result.status === "completed") {
        setStudentName(result.studentName || "");
        setStatus("completed");
      } else {
        setStudentName(result.studentName || "");
        setStatus("ready");
      }
    });
  }, [token]);

  const handlePay = async () => {
    if (!token) return;
    setIsPaying(true);
    const result = await createGiftCheckout(token, paymentMode);
    if (result.success && result.url) {
      window.location.href = result.url;
    } else {
      setErrorMsg(result.error || "Erreur");
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">🎓 Edupreneurs Haiti</h1>
          <p className="text-sm text-blue-600 mt-1">Plateforme éducative haïtienne</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          {status === "loading" && (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
              <p className="mt-3 text-sm text-gray-500">Chargement...</p>
            </div>
          )}

          {status === "error" && (
            <div className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
              <h2 className="mt-3 text-lg font-semibold text-gray-900">Lien invalide</h2>
              <p className="mt-2 text-sm text-gray-500">{errorMsg}</p>
            </div>
          )}

          {status === "completed" && (
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <h2 className="mt-3 text-lg font-semibold text-gray-900">Déjà payé !</h2>
              <p className="mt-2 text-sm text-gray-500">
                L'abonnement de <strong>{studentName}</strong> est déjà activé. Merci ! 🎉
              </p>
            </div>
          )}

          {status === "ready" && (
            <>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white text-center">
                <Heart className="h-8 w-8 mx-auto mb-2 opacity-90" />
                <h2 className="text-xl font-bold">
                  Payez l'abonnement de {studentName}
                </h2>
                <p className="text-sm mt-1 text-blue-100">
                  Aidez un étudiant haïtien à accéder à l'éducation
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Payment mode selector */}
                <RadioGroup
                  value={paymentMode}
                  onValueChange={(v) => setPaymentMode(v as "one_time" | "recurring")}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="one_time"
                    className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      paymentMode === "one_time"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="one_time" id="one_time" className="sr-only" />
                    <span className="text-2xl font-bold text-gray-900">$2.00</span>
                    <span className="text-xs text-gray-500 text-center">Paiement unique</span>
                    <span className="text-xs text-gray-400">30 jours</span>
                  </label>
                  <label
                    htmlFor="recurring"
                    className={`relative flex flex-col items-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      paymentMode === "recurring"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="recurring" id="recurring" className="sr-only" />
                    <span className="text-2xl font-bold text-gray-900">$2.00</span>
                    <span className="text-xs text-gray-500 text-center">Par mois</span>
                    <span className="text-[10px] text-blue-600 font-medium">♻️ Automatique</span>
                  </label>
                </RadioGroup>

                {paymentMode === "recurring" && (
                  <p className="text-xs text-center text-blue-600 bg-blue-50 rounded-lg p-2">
                    L'abonnement se renouvelle automatiquement chaque mois. Annulable à tout moment.
                  </p>
                )}

                <ul className="text-sm text-gray-600 space-y-2 bg-blue-50 rounded-lg p-4">
                  <li>✅ Accès à tous les cours et leçons</li>
                  <li>✅ Exercices interactifs et quiz</li>
                  <li>✅ Assistant IA éducatif</li>
                  <li>✅ Activation automatique du compte</li>
                </ul>

                <Button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isPaying ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirection vers Stripe...</>
                  ) : (
                    <><CreditCard className="mr-2 h-4 w-4" />
                      {paymentMode === "recurring" ? "S'abonner à $2.00/mois" : "Payer $2.00 par carte"}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-400">
                  Paiement sécurisé via Stripe 🔒
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
