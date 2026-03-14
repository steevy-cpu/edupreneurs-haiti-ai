/**
 * @file GoogleSetupPage.tsx
 * @description Post-OAuth subscription selection for Google users.
 * Google sign-in creates a profile with subscription_status="none" via useEnsureProfile.
 * This page lets them choose an access method (trial, promo, MonCash, gift)
 * and activates the subscription via UPDATE (not INSERT).
 * @module pages/auth
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { activateSubscriptionForExistingProfile, type GoogleSubscriptionData } from "@/auth/services/googleSubscription.service";
import { validatePromoCode } from "@/auth/services/promo.service";
import { createSignupPayment } from "@/auth/services/payment.service";
import { saveSignupProgress, getSignupProgress } from "@/auth/store/authFlow.store";
import { cn } from "@/lib/utils";
import GiftLinkTab from "@/auth/routes/signup/GiftLinkTab";

type AccessTab = "trial" | "promo" | "moncash" | "gift";

export default function GoogleSetupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, user } = useSessionAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<AccessTab>("promo");

  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [promoGrantsFreeAccess, setPromoGrantsFreeAccess] = useState(false);
  const [promoNetworkError, setPromoNetworkError] = useState(false);
  const [promoValidationAttempted, setPromoValidationAttempted] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // MonCash payment state
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Shared state
  const [privacy, setPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard: redirect if setup not needed or not authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/auth/login", { replace: true });
      return;
    }

    // No setup flag — user already completed setup or is a returning Google user
    if (sessionStorage.getItem("google_needs_setup") !== "true") {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Seed email for GiftLinkTab compatibility (merge, not overwrite)
    if (user?.email) {
      saveSignupProgress({ email: user.email });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  // Load saved progress (MonCash return scenario)
  useEffect(() => {
    const saved = getSignupProgress();
    if (saved.promoCode) setPromoCode(saved.promoCode);
    if (saved.promoCodeValid) setPromoCodeValid(saved.promoCodeValid);
    if (saved.promoGrantsFreeAccess) setPromoGrantsFreeAccess(saved.promoGrantsFreeAccess);
    if (saved.privacy) setPrivacy(saved.privacy);
    if (saved.accessMethod) setActiveTab(saved.accessMethod);
    if (saved.paymentCompleted) setPaymentCompleted(true);
    if (saved.paymentOrderId) setPaymentOrderId(saved.paymentOrderId);
  }, []);

  const handlePromoValidation = async () => {
    setPromoValidationAttempted(true);
    setIsValidatingPromo(true);

    const result = await validatePromoCode(promoCode);

    setPromoCodeValid(result.valid);
    setPromoGrantsFreeAccess(result.grantsFreeAccess || false);
    setPromoNetworkError(result.networkError || false);
    setIsValidatingPromo(false);

    saveSignupProgress({
      promoCode,
      promoCodeValid: result.valid,
      promoGrantsFreeAccess: result.grantsFreeAccess,
      accessMethod: "promo",
    });
  };

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    if (promoCodeValid || promoValidationAttempted) {
      setPromoCodeValid(false);
      setPromoGrantsFreeAccess(false);
      setPromoValidationAttempted(false);
    }
  };

  const handleMonCashPayment = async () => {
    setIsCreatingPayment(true);

    const email = user?.email;
    if (!email) {
      toast({ title: "Erreur", description: "Email non trouvé.", variant: "destructive" });
      setIsCreatingPayment(false);
      return;
    }

    // Save progress before redirect to MonCash
    saveSignupProgress({ accessMethod: "moncash", privacy });

    const result = await createSignupPayment(email);

    if (!result.success || !result.redirectUrl) {
      toast({ title: "Erreur de paiement", description: result.error || "Impossible de créer le paiement", variant: "destructive" });
      setIsCreatingPayment(false);
      return;
    }

    // Redirect to MonCash payment gateway
    window.location.href = result.redirectUrl;
  };

  // Can submit: promo needs valid code, moncash needs payment, trial/gift always OK
  const canSubmit =
    activeTab === "promo"
      ? promoCodeValid
      : activeTab === "moncash"
        ? paymentCompleted
        : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({ title: "Erreur", description: "Session non trouvée", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const subscriptionData: GoogleSubscriptionData = {
      accessMethod: activeTab,
      paymentOrderId: activeTab === "moncash" ? paymentOrderId : undefined,
      paymentCompleted: activeTab === "moncash" ? paymentCompleted : undefined,
      promoCode: activeTab === "promo" ? promoCode : undefined,
      promoGrantsFreeAccess: activeTab === "promo" ? promoGrantsFreeAccess : undefined,
    };

    // UPDATE existing profile — never INSERT
    const result = await activateSubscriptionForExistingProfile(user.id, subscriptionData);

    if (!result.success) {
      toast({ title: "Erreur", description: result.error || "Impossible d'activer l'abonnement", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    toast({ title: "Bienvenue ! 🎉", description: "Votre accès est maintenant activé" });

    // Clear setup flag AFTER successful activation, then redirect
    sessionStorage.removeItem("google_needs_setup");
    navigate("/dashboard", { replace: true });
  };

  // Don't render until auth is resolved
  if (authLoading) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">Choisissez votre formule</h3>
        <p className="text-sm text-muted-foreground">Sélectionnez votre méthode d'accès pour commencer</p>
      </div>

      {/* Tab Toggle — same layout as Step3 */}
      <div className="flex gap-1 p-1 rounded-lg border border-input bg-muted/30">
        <button
          type="button"
          onClick={() => setActiveTab("promo")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors rounded-md",
            activeTab === "promo"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          🎁 Code Promo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("trial")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors rounded-md",
            activeTab === "trial"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          🎉 Essai gratuit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("moncash")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors rounded-md",
            activeTab === "moncash"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          💳 MonCash
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("gift")}
          className={cn(
            "flex-1 py-2.5 text-xs font-medium transition-colors rounded-md",
            activeTab === "gift"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          👨‍👩‍👧 Famille
        </button>
      </div>

      {/* Trial Tab */}
      {activeTab === "trial" && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center space-y-3 animate-in fade-in duration-200">
          <div className="text-4xl">🎉</div>
          <h3 className="font-bold text-lg text-foreground">7 jours d'accès complet gratuit</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 text-left max-w-xs mx-auto">
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> Tous les cours et leçons
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> Tous les examens officiels
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> Jude, ton tuteur IA personnel
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary font-bold">✓</span> Aucune carte bancaire requise
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Après 7 jours, choisissez de continuer à 200 HTG/mois
          </p>
        </div>
      )}

      {/* Promo Code Tab */}
      {activeTab === "promo" && (
        <div className="space-y-3 p-4 border-2 border-primary rounded-lg bg-primary/5 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <strong className="text-sm">Code promotionnel</strong>
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Requis</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Entrez votre code promotionnel"
              value={promoCode}
              onChange={(e) => handlePromoCodeChange(e.target.value)}
              autoCapitalize="characters"
              spellCheck="false"
              className="auth-input flex-1"
            />
            <Button
              type="button"
              onClick={handlePromoValidation}
              disabled={isValidatingPromo || promoCode.trim().length < 3}
              className="shrink-0 px-4"
            >
              {isValidatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Vérifier"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Utilisez le code{" "}
            <button
              type="button"
              onClick={() => handlePromoCodeChange("JUDE2026")}
              className="font-mono bg-muted px-1.5 py-0.5 rounded cursor-pointer hover:bg-muted/80 transition-colors font-semibold"
            >
              jude2026
            </button>
            {" "}pour un accès gratuit (période de test)
          </p>
          {promoCode && promoCode.trim().length >= 3 && !isValidatingPromo && promoValidationAttempted && (
            <>
              {promoNetworkError ? (
                <p className="text-xs text-amber-600">⚠️ Erreur de connexion - vérifiez votre internet</p>
              ) : promoCodeValid ? (
                <p className="text-xs text-success">✓ Code valide ! Vous pouvez activer votre accès.</p>
              ) : (
                <p className="text-xs text-destructive">✗ Code invalide ou expiré</p>
              )}
            </>
          )}
        </div>
      )}

      {/* MonCash Tab */}
      {activeTab === "moncash" && (
        <div className="space-y-3 p-4 border-2 border-primary rounded-lg bg-primary/5 animate-in fade-in duration-200">
          <div className="text-center space-y-2">
            <h4 className="font-bold text-base">Accès Premium</h4>
            <div className="text-3xl font-bold text-primary">200 HTG</div>
            <p className="text-xs text-muted-foreground">/ 30 jours d'accès complet</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✅ Accès à tous les cours et leçons</li>
            <li>✅ Exercices interactifs et quiz</li>
            <li>✅ Assistant IA Jude</li>
            <li>✅ Renouvellement mensuel simple</li>
          </ul>
          {paymentCompleted ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <span className="text-sm font-medium text-green-700">Paiement confirmé !</span>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleMonCashPayment}
              disabled={isCreatingPayment}
              className="w-full"
              size="lg"
            >
              {isCreatingPayment ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Préparation...</>
              ) : (
                <><CreditCard className="mr-2 h-4 w-4" />Payer avec MonCash</>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Gift Link Tab — uses email seeded via saveSignupProgress */}
      {activeTab === "gift" && <GiftLinkTab />}

      {/* Privacy Checkbox */}
      <div className="flex items-start gap-3 p-4 border border-input rounded-lg bg-muted/30">
        <input
          type="checkbox"
          id="privacy-google"
          required
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded"
        />
        <Label htmlFor="privacy-google" className="text-sm text-muted-foreground leading-relaxed">
          J'accepte les{" "}
          <Link to="/privacy-policy" className="text-primary underline font-medium" target="_blank">
            politiques de confidentialité
          </Link>
          {" "}et les{" "}
          <Link to="/terms" className="text-primary underline font-medium" target="_blank">
            conditions d'utilisation
          </Link>.
        </Label>
      </div>

      {/* Submit — no "Back" button, Google users don't have previous signup steps */}
      <Button type="submit" disabled={isSubmitting || !canSubmit} className="w-full">
        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Activation...</> : "Activer mon accès 🎉"}
      </Button>
    </form>
  );
}
