/**
 * VerifyEmailPage - Email verification with OTP
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyEmailCode, resendVerificationCode, sendWelcomeEmail } from "../services/verify.service";
import { getAuthFlow, clearAuthFlow } from "../store/authFlow.store";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Get auth flow state
  const authFlow = getAuthFlow();
  const pendingUserId = authFlow?.pendingUserId;
  const email = authFlow?.email;

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0 && !canResend) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown, canResend]);

  // Self-healing: No valid flow = expired
  if (!authFlow || authFlow.flow !== 'verify' || !pendingUserId) {
    return (
      <div className="p-5 text-center space-y-4">
        <h2 className="text-xl font-bold">Session expirée</h2>
        <p className="text-sm text-muted-foreground">
          Veuillez vous reconnecter pour continuer la vérification.
        </p>
        <Button onClick={() => navigate('/auth/login')}>Retour à la connexion</Button>
      </div>
    );
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      toast({ title: "Code invalide", description: "Veuillez entrer un code à 6 chiffres", variant: "destructive" });
      return;
    }

    setIsVerifying(true);
    const result = await verifyEmailCode(pendingUserId, verificationCode);
    
    if (!result.success) {
      toast({ title: "Code incorrect", description: result.error, variant: "destructive" });
      setIsVerifying(false);
      return;
    }

    // Send welcome email
    if (email) {
      await sendWelcomeEmail(email, result.fullName || '', result.nickname || '');
    }

    toast({ title: "Email vérifié ! ✅", description: "Vous pouvez maintenant vous connecter." });
    clearAuthFlow();
    navigate('/auth/login');
  };

  const handleResendCode = async () => {
    if (!canResend || isResending || !email) return;
    
    setIsResending(true);
    const result = await resendVerificationCode(pendingUserId, email);
    
    if (!result.success) {
      toast({ title: "Erreur", description: result.error, variant: "destructive" });
    } else {
      setResendCooldown(60);
      setCanResend(false);
      toast({ title: "Code renvoyé ✅", description: "Un nouveau code a été envoyé à votre email" });
    }
    setIsResending(false);
  };

  return (
    <>
      <div className="auth-tabs p-3 flex justify-center">
        <div className="text-center py-3 font-bold text-primary">Vérification de l'email</div>
      </div>
      <div className="auth-content p-5">
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold mb-2">Vérification de l'email 📧</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              💡 N'oubliez pas de vérifier votre dossier <strong>spam/courrier indésirable</strong>
            </p>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground text-center block">Code de vérification</Label>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => { otpInputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={verificationCode[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 1) {
                      const newCode = verificationCode.split('');
                      newCode[index] = value;
                      setVerificationCode(newCode.join('').slice(0, 6));
                      if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                      otpInputRefs.current[index - 1]?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(pastedData);
                  }}
                  className="w-12 h-14 text-center text-2xl font-bold border border-input rounded-lg bg-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/15 outline-none transition-all"
                />
              ))}
            </div>
          </div>
          
          <Button type="submit" disabled={isVerifying} className="auth-btn-submit w-full mt-6">
            {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Vérification...</> : "Vérifier le code"}
          </Button>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={!canResend || isResending}
              className={`text-sm font-medium ${canResend && !isResending ? 'text-primary hover:underline cursor-pointer' : 'text-muted-foreground cursor-not-allowed'}`}
            >
              {isResending ? "Envoi en cours..." : canResend ? "Renvoyer le code" : `Renvoyer le code (${resendCooldown}s)`}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { clearAuthFlow(); navigate('/auth/signup/step-1'); }}
            className="text-sm text-muted-foreground hover:text-primary mt-4 text-center w-full"
          >
            Retour à l'inscription
          </button>
        </form>
      </div>
    </>
  );
}
