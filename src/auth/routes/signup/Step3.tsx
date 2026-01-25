/**
 * Step3 - Finalization (Promo Code, Privacy)
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAccount, validateStep3 } from "../../services/signup.service";
import { validatePromoCode } from "../../services/promo.service";
import { saveSignupProgress, getSignupProgress, getAuthFlow } from "../../store/authFlow.store";

export default function SignupStep3() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Local form state
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [promoGrantsFreeAccess, setPromoGrantsFreeAccess] = useState(false);
  const [promoNetworkError, setPromoNetworkError] = useState(false);
  const [promoValidationAttempted, setPromoValidationAttempted] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved progress
  useEffect(() => {
    const saved = getSignupProgress();
    if (saved.promoCode) setPromoCode(saved.promoCode);
    if (saved.promoCodeValid) setPromoCodeValid(saved.promoCodeValid);
    if (saved.promoGrantsFreeAccess) setPromoGrantsFreeAccess(saved.promoGrantsFreeAccess);
    if (saved.privacy) setPrivacy(saved.privacy);
  }, []);

  const handlePromoValidation = async () => {
    setPromoValidationAttempted(true);
    setIsValidatingPromo(true);
    
    const result = await validatePromoCode(promoCode);
    
    setPromoCodeValid(result.valid);
    setPromoGrantsFreeAccess(result.grantsFreeAccess || false);
    setPromoNetworkError(result.networkError || false);
    setIsValidatingPromo(false);
    
    // Save to progress
    saveSignupProgress({ promoCode, promoCodeValid: result.valid, promoGrantsFreeAccess: result.grantsFreeAccess });
  };

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    if (promoCodeValid || promoValidationAttempted) {
      setPromoCodeValid(false);
      setPromoGrantsFreeAccess(false);
      setPromoValidationAttempted(false);
    }
  };

  const handleBack = () => {
    saveSignupProgress({ promoCode, promoCodeValid, promoGrantsFreeAccess, privacy });
    navigate('/auth/signup/step-2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateStep3({ promoCodeValid, privacy });
    if (!validation.valid) {
      toast({ title: "Données invalides", description: validation.error, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    
    // Get all signup data from storage
    const signupData = getSignupProgress();
    const authFlow = getAuthFlow();
    
    const result = await createAccount(
      { ...signupData, promoCode, promoCodeValid, promoGrantsFreeAccess, privacy },
      authFlow?.referralCode
    );
    
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
        <p className="text-sm text-muted-foreground">Entrez votre code promotionnel pour continuer</p>
      </div>

      {/* Promo Code Section */}
      <div className="space-y-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <strong className="text-sm">Code promotionnel *</strong>
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
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Création...</> : "Créer mon compte 🎉"}
        </Button>
      </div>
    </form>
  );
}
