import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, CheckCircle2, ArrowRight } from "lucide-react";

interface PhoneVerificationSectionProps {
  userId: string;
  phoneNumber: string;
  onVerified: () => void;
  onSkip: () => void;
}

export function PhoneVerificationSection({ 
  userId, 
  phoneNumber, 
  onVerified, 
  onSkip 
}: PhoneVerificationSectionProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"initial" | "code" | "verified">("initial");
  const [otpCode, setOtpCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [testMode, setTestMode] = useState(false);
  const [testCode, setTestCode] = useState<string | null>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async () => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-phone-otp", {
        body: { phoneNumber, userId },
      });

      if (error) throw error;

      if (data.error) {
        if (data.remainingSeconds) {
          setResendCooldown(data.remainingSeconds);
        }
        throw new Error(data.error);
      }

      // Check if in test mode
      if (data.testMode) {
        setTestMode(true);
        setTestCode(data.testCode);
      }

      setStep("code");
      setResendCooldown(60);

      toast({
        title: "Code envoyé! 📲",
        description: data.testMode 
          ? `Mode test - Code: ${data.testCode}`
          : "Un code de vérification a été envoyé par SMS",
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le code SMS",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Veuillez entrer un code à 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-phone-otp", {
        body: { code: otpCode, userId },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setStep("verified");
      toast({
        title: "Téléphone vérifié! ✅",
        description: "Votre numéro a été vérifié avec succès",
      });

      // Wait a moment then proceed
      setTimeout(() => {
        onVerified();
      }, 1500);
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Code incorrect",
        description: error.message || "Le code entré est invalide",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle OTP input - only allow digits
  const handleOtpChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(digitsOnly);
  };

  if (step === "verified") {
    return (
      <div className="space-y-4 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 mx-auto bg-success/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Téléphone vérifié!</h3>
        <p className="text-sm text-muted-foreground">
          Votre numéro {phoneNumber} a été confirmé avec succès.
        </p>
      </div>
    );
  }

  if (step === "code") {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
            <Phone className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-bold">Vérification SMS</h3>
          <p className="text-sm text-muted-foreground">
            Entrez le code à 6 chiffres envoyé au {phoneNumber}
          </p>
          {testMode && testCode && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
              🧪 Mode test - Code: {testCode}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {[...Array(6)].map((_, i) => (
            <Input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otpCode[i] || ""}
              onChange={(e) => {
                const newCode = otpCode.split("");
                newCode[i] = e.target.value.replace(/\D/g, "");
                handleOtpChange(newCode.join(""));
                // Auto-focus next input
                if (e.target.value && i < 5) {
                  const next = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                  next?.focus();
                }
              }}
              onKeyDown={(e) => {
                // Handle backspace to go to previous input
                if (e.key === "Backspace" && !otpCode[i] && i > 0) {
                  const prev = (e.target as HTMLElement).parentElement?.children[i - 1] as HTMLInputElement;
                  prev?.focus();
                }
              }}
              className="w-12 h-14 text-center text-2xl font-bold border border-input rounded-lg bg-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          ))}
        </div>

        <Button
          onClick={handleVerifyOtp}
          disabled={isVerifying || otpCode.length !== 6}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Vérification...
            </>
          ) : (
            "Vérifier le code"
          )}
        </Button>

        <div className="flex justify-between items-center text-sm">
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={resendCooldown > 0 || isSending}
            className={`font-medium ${
              resendCooldown === 0 && !isSending
                ? "text-primary hover:underline cursor-pointer"
                : "text-muted-foreground cursor-not-allowed"
            }`}
          >
            {isSending
              ? "Envoi..."
              : resendCooldown > 0
              ? `Renvoyer (${resendCooldown}s)`
              : "Renvoyer le code"}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Passer cette étape
          </button>
        </div>
      </div>
    );
  }

  // Initial step
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="text-center mb-4">
        <div className="w-12 h-12 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-3">
          <Phone className="w-6 h-6 text-accent-foreground" />
        </div>
        <h3 className="text-lg font-bold">Vérification du téléphone</h3>
        <p className="text-sm text-muted-foreground">
          Vérifiez votre numéro {phoneNumber} pour plus de sécurité
        </p>
        <span className="inline-block mt-2 text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
          Optionnel
        </span>
      </div>

      <Button
        onClick={handleSendOtp}
        disabled={isSending}
        className="w-full"
        variant="default"
      >
        {isSending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi du code...
          </>
        ) : (
          <>
            <Phone className="mr-2 h-4 w-4" />
            Envoyer un code SMS
          </>
        )}
      </Button>

      <Button
        onClick={onSkip}
        variant="ghost"
        className="w-full text-muted-foreground"
      >
        Passer cette étape
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
