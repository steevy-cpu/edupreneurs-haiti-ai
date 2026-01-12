import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { verificationCodeSchema } from "@/lib/authValidation";
import { useAuth } from "./AuthContext";

export default function VerifyForm() {
  const { toast } = useToast();
  const {
    verificationCode,
    setVerificationCode,
    pendingUserId,
    setPendingUserId,
    resendCooldown,
    setResendCooldown,
    canResend,
    setCanResend,
    isResending,
    setIsResending,
    isVerifying,
    setIsVerifying,
    otpInputRefs,
    signupData,
    loginData,
    setActiveTab,
  } = useAuth();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Veuillez entrer un code à 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    const codeValidation = verificationCodeSchema.safeParse({ code: verificationCode });
    if (!codeValidation.success) {
      toast({
        title: "Code invalide",
        description: codeValidation.error.errors[0]?.message || "Format de code invalide",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.rpc('verify_email_code', {
        p_user_id: pendingUserId,
        p_code: verificationCode.trim()
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; full_name?: string; nickname?: string };

      if (!result.success) {
        toast({
          title: "Code incorrect",
          description: result.error || "Le code de vérification est incorrect",
          variant: "destructive",
        });
        return;
      }

      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: signupData.email || loginData.email,
            fullName: result.full_name || result.nickname || 'Utilisateur',
            nickname: result.nickname || result.full_name || 'Utilisateur',
          }
        });
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }

      toast({
        title: "Email vérifié ! ✅",
        description: "Vous pouvez maintenant vous connecter.",
      });

      setPendingUserId(null);
      setVerificationCode("");
      setActiveTab("login");
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        title: "Erreur de vérification",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingUserId || !canResend || isResending) return;

    setIsResending(true);
    try {
      const { data, error } = await supabase.rpc('resend_verification_code', {
        p_user_id: pendingUserId
      });

      if (error) throw error;

      const result = data as { 
        success: boolean; 
        error?: string; 
        full_name?: string; 
        nickname?: string; 
        academic_grade?: string;
        confirmation_code?: string;
      };

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate new code');
      }

      const userEmail = signupData.email || loginData.email;
      if (!userEmail) {
        throw new Error("Email not found");
      }

      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: userEmail,
          fullName: result.full_name || result.nickname || 'Utilisateur',
          nickname: result.nickname || '',
          academicGrade: result.academic_grade || '',
          confirmationCode: result.confirmation_code!,
        }
      });

      setResendCooldown(60);
      setCanResend(false);

      toast({
        title: "Code renvoyé ✅",
        description: "Un nouveau code de vérification a été envoyé à votre email",
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de renvoyer le code. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerifyCode} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Vérification de l'email 📧</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Un code à 6 chiffres a été envoyé à <strong>{signupData.email || loginData.email}</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          💡 N'oubliez pas de vérifier votre dossier <strong>spam/courrier indésirable</strong> si vous ne voyez pas l'email.
        </p>
      </div>
      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground text-center block">
          Code de vérification
        </Label>
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={(el) => { otpInputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoComplete="one-time-code"
              value={verificationCode[index] || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 1) {
                  const newCode = verificationCode.split('');
                  newCode[index] = value;
                  const updatedCode = newCode.join('').slice(0, 6);
                  setVerificationCode(updatedCode);
                  if (value && index < 5) {
                    requestAnimationFrame(() => {
                      otpInputRefs.current[index + 1]?.focus();
                    });
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                  requestAnimationFrame(() => {
                    otpInputRefs.current[index - 1]?.focus();
                  });
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                setVerificationCode(pastedData);
                const focusIndex = Math.min(pastedData.length, 5);
                requestAnimationFrame(() => {
                  otpInputRefs.current[focusIndex]?.focus();
                });
              }}
              className="w-12 h-14 text-center text-2xl font-bold border border-input rounded-lg bg-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all auth-input"
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Veuillez entrer le code reçu par email
        </p>
      </div>
      <Button type="submit" disabled={isVerifying} className="auth-btn-submit w-full mt-6">
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Vérification...
          </>
        ) : (
          "Vérifier le code"
        )}
      </Button>
      
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={handleResendCode}
          disabled={!canResend || isResending}
          className={`text-sm font-medium ${
            canResend && !isResending
              ? 'text-primary hover:underline cursor-pointer' 
              : 'text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isResending
            ? "Envoi en cours..."
            : canResend 
              ? "Renvoyer le code de vérification" 
              : `Renvoyer le code (${resendCooldown}s)`
          }
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          setActiveTab("signup");
          setPendingUserId(null);
          setVerificationCode("");
          setResendCooldown(60);
          setCanResend(false);
        }}
        className="text-sm text-muted-foreground hover:text-primary mt-4 text-center w-full"
      >
        Retour à l'inscription
      </button>
    </form>
  );
}
