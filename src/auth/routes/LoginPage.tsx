/**
 * LoginPage - Route-based login form with persistent lockout
 * 
 * Effect 6: Sequential form field fade-in (desktop only)
 * Gated by shouldAnimate from useAnimationConfig
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Eye, EyeOff, KeyRound, Telescope, Shield, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail, handleDeviceTracking, validateLoginCredentials } from "../services/login.service";
import { checkLoginAllowed } from "../services/loginAttempts.service";
import { hasPendingPasswordReset } from "../store/authFlow.store";
import { VisitorTypeSelector } from "@/components/visitor";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

// Effect 6 — Staggered container orchestrates child delays
const formVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.4 } }
};

// Each field slides in from the left with a fade
const fieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.4, ease: "easeOut" as const }
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { shouldAnimate } = useAnimationConfig();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);
  
  // Lockout state
  const [isLocked, setIsLocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  
  // Debounce ref for email lockout check
  const lockCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get returnTo URL from location state OR sessionStorage
  const returnTo = (location.state as { returnTo?: string })?.returnTo 
    || sessionStorage.getItem('quiz_battle_return_url');

  // Check for pending lockout on mount (survives page refresh)
  useEffect(() => {
    const resetState = hasPendingPasswordReset();
    if (resetState.pending && resetState.email) {
      setEmail(resetState.email);
      setIsLocked(true);
      setRemainingAttempts(0);
    }
  }, []);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (lockCheckTimeoutRef.current) {
        clearTimeout(lockCheckTimeoutRef.current);
      }
    };
  }, []);

  // Debounced email lockout check (3G optimized - 500ms delay)
  const handleEmailChange = useCallback((newEmail: string) => {
    setEmail(newEmail);
    
    // Clear previous timeout
    if (lockCheckTimeoutRef.current) {
      clearTimeout(lockCheckTimeoutRef.current);
    }
    
    // Skip check for invalid-looking emails
    if (!newEmail.includes('@') || newEmail.length < 5) {
      return;
    }
    
    // Debounce database check
    lockCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const status = await checkLoginAllowed(newEmail);
        if (!status.allowed && status.isLocked) {
          setIsLocked(true);
          setRemainingAttempts(0);
        } else {
          setIsLocked(false);
          setRemainingAttempts(status.remainingAttempts);
        }
      } catch (error) {
        // Fail open - don't block login on check errors
        console.error('Lockout check failed:', error);
      }
    }, 500);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Don't submit if locked
    if (isLocked) {
      navigate('/auth/forgot-password', { state: { email } });
      return;
    }
    
    const validation = validateLoginCredentials({ email, password });
    if (!validation.valid) {
      toast({
        title: "Données invalides",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginWithEmail({ email, password });
      
      // Handle lockout / password reset required
      if (result.requiresPasswordReset) {
        setIsLocked(true);
        setRemainingAttempts(0);
        toast({
          title: "Compte bloqué",
          description: result.resetEmailSent 
            ? "Un email de réinitialisation a été envoyé à votre adresse."
            : "Veuillez réinitialiser votre mot de passe.",
          variant: "destructive",
        });
        return;
      }
      
      // Update remaining attempts for UI warning
      if (result.remainingAttempts !== undefined) {
        setRemainingAttempts(result.remainingAttempts);
      }
      
      if (result.requiresVerification) {
        toast({
          title: "Email non vérifié",
          description: "Un nouveau code de vérification a été envoyé à votre adresse email.",
          variant: "destructive",
        });
        navigate('/auth/verify-email');
        return;
      }

      if (result.requiresDeviceVerification) {
        toast({
          title: "Vérification requise",
          description: "Un code de vérification a été envoyé pour confirmer cet appareil.",
        });
        navigate('/auth/verify-device');
        return;
      }
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Successful login - reset lockout state
      setIsLocked(false);
      setRemainingAttempts(null);

      // Handle device tracking with trust preference (non-blocking)
      if (result.userId) {
        handleDeviceTracking(
          result.userId,
          email, 
          result.profile?.full_name || 'Utilisateur',
          rememberDevice
        );
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      // Clear sessionStorage and navigate
      sessionStorage.removeItem('quiz_battle_return_url');
      navigate(returnTo || "/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Conditional wrapper tags — motion on desktop, plain on mobile/tablet
  const FormContainer = shouldAnimate ? motion.div : "div";
  const FieldGroup = shouldAnimate ? motion.div : "div";

  return (
    <>
      {/* Visitor Mode Button */}
      <div className="px-5 pt-5 pb-2">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 py-5 border-2 border-dashed border-primary/40 text-primary font-medium
                     hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg
                     transition-all duration-300 group"
          onClick={() => setShowVisitorSelector(true)}
        >
          <Telescope className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Découvrir la plateforme sans inscription</span>
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-2">
          Explorez en mode visiteur, inscrivez-vous plus tard
        </p>
      </div>

      {/* Free trial banner — communicates 7-day offer before tabs */}
      <div className="mx-5 mb-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
        <p className="text-sm font-semibold text-primary">
          🎉 Essai gratuit de 7 jours
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Accès complet à tous les cours, examens et à Jude — sans carte bancaire
        </p>
      </div>

      {/* Tabs */}
      <div className="auth-tabs p-3 flex justify-center">
        <div className="relative flex bg-muted/50 rounded-xl p-1 w-fit">
          <button
            className="relative z-10 flex-1 text-center py-2.5 px-5 rounded-lg font-semibold text-sm bg-primary text-primary-foreground shadow-md transition-all duration-300 ease-out"
          >
            Se connecter
          </button>
          <button
            className="relative z-10 flex-1 text-center py-2.5 px-5 rounded-lg font-semibold text-sm text-muted-foreground hover:text-foreground/80 hover:bg-muted transition-all duration-300 ease-out"
            onClick={() => navigate('/auth/signup/step-1')}
          >
            Créer un compte
            <span className="ml-1.5 text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
              7j gratuits
            </span>
          </button>
        </div>
      </div>

      {/* Login Form — Effect 6: staggered field entrance */}
      <FormContainer
        className="auth-content p-5"
        {...(shouldAnimate ? {
          variants: formVariants,
          initial: "hidden",
          animate: "visible",
        } : {})}
      >
        {/* Locked Account Warning - Enhanced with direct action */}
        {isLocked && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 font-medium text-destructive">
              <Lock className="h-4 w-4" />
              Compte temporairement bloqué
            </div>
            <p className="mt-1 text-sm text-destructive/80">
              Vérifiez votre email pour réinitialiser votre mot de passe.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => navigate('/auth/forgot-password', { state: { email } })}
            >
              Réinitialiser mon mot de passe
            </Button>
          </div>
        )}
        
        {/* Low Attempts Warning */}
        {!isLocked && remainingAttempts !== null && remainingAttempts <= 3 && remainingAttempts > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4 text-sm text-warning-foreground">
            ⚠️ Attention: {remainingAttempts} tentative{remainingAttempts > 1 ? 's' : ''} restante{remainingAttempts > 1 ? 's' : ''}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4" name="login-form" autoComplete="on">
          {/* Email field */}
          <FieldGroup
            className="space-y-2"
            {...(shouldAnimate ? { variants: fieldVariants } : {})}
          >
            <Label htmlFor="login-email" className="text-sm text-muted-foreground">
              Adresse e-mail
            </Label>
            <Input
              id="login-email"
              type="email"
              required
              placeholder="ex: nom@domaine.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              enterKeyHint="next"
              inputMode="email"
              className="auth-input"
              disabled={isLocked}
            />
          </FieldGroup>

          {/* Password field */}
          <FieldGroup
            className="space-y-2"
            {...(shouldAnimate ? { variants: fieldVariants } : {})}
          >
            <Label htmlFor="login-password" className="text-sm text-muted-foreground">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                enterKeyHint="done"
                className="auth-input pr-10"
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </FieldGroup>
          
          {/* Remember Device Checkbox */}
          <FieldGroup
            className="flex items-start gap-3 pt-2"
            {...(shouldAnimate ? { variants: fieldVariants } : {})}
          >
            <Checkbox
              id="remember-device"
              checked={rememberDevice}
              onCheckedChange={(checked) => setRememberDevice(checked === true)}
              className="mt-0.5"
              disabled={isLocked}
            />
            <div className="flex-1">
              <Label 
                htmlFor="remember-device" 
                className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5 text-primary" />
                Se souvenir de cet appareil
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Les connexions futures depuis cet appareil seront plus rapides
              </p>
            </div>
          </FieldGroup>
          
          {/* Submit button */}
          <FieldGroup
            {...(shouldAnimate ? { variants: fieldVariants } : {})}
          >
            <Button 
              type="submit" 
              disabled={isLoading || isLocked} 
              className="auth-btn-submit w-full mt-4 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : isLocked ? (
                "Compte bloqué"
              ) : (
                "Se connecter"
              )}
            </Button>
          </FieldGroup>
          
          {/* Forgot password link */}
          <FieldGroup
            {...(shouldAnimate ? { variants: fieldVariants } : {})}
          >
            <button
              type="button"
              onClick={() => navigate('/auth/forgot-password', { state: { email } })}
              className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mt-4 w-full"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Mot de passe oublié ?
            </button>
          </FieldGroup>
        </form>
      </FormContainer>

      {/* Visitor Type Selector Modal */}
      <VisitorTypeSelector 
        open={showVisitorSelector} 
        onOpenChange={setShowVisitorSelector} 
      />
    </>
  );
}
