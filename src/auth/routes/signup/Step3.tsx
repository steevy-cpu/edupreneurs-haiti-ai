/**
 * Step3 - Finalization (Access Method: Promo Code OR MonCash Payment)
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAccount, validateStep3 } from "../../services/signup.service";
import { validatePromoCode } from "../../services/promo.service";
import { createSignupPayment } from "../../services/payment.service";
import { saveSignupProgress, getSignupProgress, getAuthFlow } from "../../store/authFlow.store";
import { cn } from "@/lib/utils";

type AccessTab = 'promo' | 'moncash';

export default function SignupStep3() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<AccessTab>('promo');
  
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

  // Load saved progress
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
    
    saveSignupProgress({ promoCode, promoCodeValid: result.valid, promoGrantsFreeAccess: result.grantsFreeAccess, accessMethod: 'promo' });
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
    
    const saved = getSignupProgress();
    if (!saved.email) {
      toast({ title: "Erreur", description: "Email non trouvé. Retournez à l'étape 1.", variant: "destructive" });
      setIsCreatingPayment(false);
      return;
    }

    // Save current progress before redirect
    saveSignupProgress({ accessMethod: 'moncash', privacy });

    const result = await createSignupPayment(saved.email);
    
    if (!result.success || !result.redirectUrl) {
      toast({ title: "Erreur de paiement", description: result.error || "Impossible de créer le paiement", variant: "destructive" });
      setIsCreatingPayment(false);
      return;
    }

    // Redirect to MonCash
    window.location.href = result.redirectUrl;
  };

  const handleBack = () => {
    saveSignupProgress({ 
      promoCode, promoCodeValid, promoGrantsFreeAccess, privacy,
      accessMethod: activeTab, paymentCompleted, paymentOrderId
    });
    navigate('/auth/signup/step-2');
  };

  const canSubmit = activeTab === 'promo' ? promoCodeValid : paymentCompleted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationData = activeTab === 'promo'
      ? { promoCodeValid, privacy, accessMethod: 'promo' as const }
      : { paymentCompleted, privacy, accessMethod: 'moncash' as const };
    
    const validation = validateStep3(validationData);
    if (!validation.valid) {
      toast({ title: "Données invalides", description: validation.error, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    const signupData = getSignupProgress();
    const authFlow = getAuthFlow();
    
    const accountData = activeTab === 'promo'
      ? { ...signupData, promoCode, promoCodeValid, promoGrantsFreeAccess, privacy, accessMethod: 'promo' as const }
      : { ...signupData, privacy, accessMethod: 'moncash' as const, paymentCompleted: true, paymentOrderId };
    
    const result = await createAccount(accountData, authFlow?.referralCode);
    
    if (!result.success) {
      toast({ title: "Erreur d'inscription", description: result.error, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    toast({ title: "Inscription réussie ! 🎉", description: "Un code de vérification a été envoyé à votre email" });
    navigate('/auth/verify-email');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">Dernière étape !</h3>
        <p className="text-sm text-muted-foreground">Choisissez votre méthode d'accès</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex rounded-lg border border-input overflow-hidden">
        <button
          type="button"
          onClick={() => setActiveTab('promo')}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === 'promo'
              ? "bg-primary text-primary-foreground"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
          )}
        >
          🎁 Code Promo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('moncash')}
          className={cn(
            "flex-1 py-2.5 text-sm font-medium transition-colors",
            activeTab === 'moncash'
              ? "bg-primary text-primary-foreground"
              : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
          )}
        >
          💳 MonCash
        </button>
      </div>

      {/* Promo Code Tab */}
      {activeTab === 'promo' && (
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
          {promoCode && promoCode.trim().length >= 3 && !isValidatingPromo && promoValidationAttempted && (
            <>
              {promoNetworkError ? (
                <p className="text-xs text-amber-600">⚠️ Erreur de connexion - vérifiez votre internet</p>
              ) : promoCodeValid ? (
                <p className="text-xs text-success">✓ Code valide ! Vous pouvez créer votre compte.</p>
              ) : (
                <p className="text-xs text-destructive">✗ Code invalide ou expiré</p>
              )}
            </>
          )}
        </div>
      )}

      {/* MonCash Tab */}
      {activeTab === 'moncash' && (
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

      {/* Privacy Checkbox */}
      <div className="flex items-start gap-3 p-4 border border-input rounded-lg bg-muted/30">
        <input
          type="checkbox"
          id="privacy"
          required
          checked={privacy}
          onChange={(e) => setPrivacy(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded"
        />
        <Label htmlFor="privacy" className="text-sm text-muted-foreground leading-relaxed">
          J'accepte les{" "}
          <Link to="/privacy-policy" className="text-primary underline font-medium" target="_blank">
            politiques de confidentialité
          </Link>
          {" "}et les conditions d'utilisation.
        </Label>
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
          ← Retour
        </Button>
        <Button type="submit" disabled={isSubmitting || !canSubmit} className="flex-1">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : "Créer mon compte 🎉"}
        </Button>
      </div>
    </form>
  );
}
