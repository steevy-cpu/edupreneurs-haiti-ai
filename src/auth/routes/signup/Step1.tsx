/**
 * Step1 - Account Info (Email, Password)
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateStep1 } from "../../services/signup.service";
import { saveSignupProgress, getSignupProgress, saveAuthFlow } from "../../store/authFlow.store";

export default function SignupStep1() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Local form state
  const [email, setEmail] = useState("");
  const [emailConfirm, setEmailConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const saved = getSignupProgress();
    if (saved.email) setEmail(saved.email);
    if (saved.emailConfirm) setEmailConfirm(saved.emailConfirm);
    // Don't restore password for security
  }, []);

  // Password validation (memoized)
  const passwordValidation = useMemo(() => ({
    hasMinLength: password.length >= 8,
    hasNumber: /[0-9]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  }), [password]);

  const handleContinue = () => {
    const validation = validateStep1({ email, emailConfirm, password });
    if (!validation.valid) {
      toast({ 
        title: "Données invalides", 
        description: validation.error, 
        variant: "destructive" 
      });
      return;
    }

    // Save progress and update flow state
    saveSignupProgress({ email, emailConfirm, password });
    saveAuthFlow({ flow: 'signup', step: 2 });
    
    navigate('/auth/signup/step-2');
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">Créez votre compte</h3>
        <p className="text-sm text-muted-foreground">Entrez vos informations de connexion</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm text-muted-foreground">
          Adresse e-mail *
        </Label>
        <Input
          id="signup-email"
          type="email"
          required
          placeholder="ex: nom@domaine.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="next"
          inputMode="email"
          className="auth-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email-confirm" className="text-sm text-muted-foreground">
          Confirmer l'e-mail *
        </Label>
        <Input
          id="signup-email-confirm"
          type="email"
          required
          placeholder="Confirmez votre email"
          value={emailConfirm}
          onChange={(e) => setEmailConfirm(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="next"
          inputMode="email"
          className="auth-input"
        />
        {email && emailConfirm && email !== emailConfirm && (
          <p className="text-xs text-destructive">Les emails ne correspondent pas</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-sm text-muted-foreground">
          Mot de passe *
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="Créez un mot de passe sécurisé"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            autoCapitalize="none"
            enterKeyHint="next"
            className="auth-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="space-y-1 text-xs mt-2">
          <p className={`flex items-center gap-1 ${passwordValidation.hasMinLength ? 'text-success' : 'text-muted-foreground'}`}>
            {passwordValidation.hasMinLength ? '✓' : '○'} Au moins 8 caractères
          </p>
          <p className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-success' : 'text-muted-foreground'}`}>
            {passwordValidation.hasNumber ? '✓' : '○'} Au moins un chiffre
          </p>
          <p className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? 'text-success' : 'text-muted-foreground'}`}>
            {passwordValidation.hasUppercase ? '✓' : '○'} Au moins une majuscule
          </p>
        </div>
      </div>

      <Button 
        type="button" 
        className="w-full mt-4"
        onClick={handleContinue}
      >
        Continuer →
      </Button>
    </div>
  );
}
