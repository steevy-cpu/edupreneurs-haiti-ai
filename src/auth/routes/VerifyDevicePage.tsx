/**
 * VerifyDevicePage - Device verification with OTP
 * 
 * Shown when a user logs in from an unknown/untrusted device
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Monitor, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { verifyDeviceCode, resendDeviceCode } from "../services/device-verify.service";
import { getAuthFlow, clearAuthFlow, saveAuthFlow } from "../store/authFlow.store";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyDevicePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Get auth flow state
  const authFlow = getAuthFlow();
  const challengeId = authFlow?.deviceChallengeId;
  const email = authFlow?.email;
  const fullName = authFlow?.fullName;
  
  // Check if session is valid
  const hasValidSession = authFlow && authFlow.flow === 'verify-device' && challengeId;

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

  // Redirect if no valid session
  useEffect(() => {
    if (!hasValidSession) {
      navigate('/auth/login', { replace: true });
    }
  }, [hasValidSession, navigate]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({ 
        title: "Code invalide", 
        description: "Veuillez entrer un code à 6 chiffres", 
        variant: "destructive" 
      });
      return;
    }

    if (!challengeId) {
      toast({ 
        title: "Session expirée", 
        description: "Veuillez vous reconnecter", 
        variant: "destructive" 
      });
      navigate('/auth/login', { replace: true });
      return;
    }

    setIsVerifying(true);
    
    const result = await verifyDeviceCode(challengeId, verificationCode, trustDevice);
    
    if (!result.success) {
      toast({ 
        title: "Vérification échouée", 
        description: result.error, 
        variant: "destructive" 
      });
      setIsVerifying(false);
      return;
    }

    // Device verified - now sign in the user
    // The user was already authenticated but signed out for device verification
    // We need to re-authenticate them
    toast({ 
      title: "Appareil vérifié ✅", 
      description: trustDevice 
        ? "Cet appareil est maintenant mémorisé" 
        : "Vous êtes maintenant connecté" 
    });
    
    clearAuthFlow();
    
    // Redirect to dashboard or return URL
    const returnTo = sessionStorage.getItem('quiz_battle_return_url');
    if (returnTo) {
      sessionStorage.removeItem('quiz_battle_return_url');
      navigate(returnTo, { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending || !email || !challengeId) return;
    
    setIsResending(true);
    const result = await resendDeviceCode(challengeId, email);
    
    if (!result.success) {
      toast({ 
        title: "Erreur", 
        description: result.error, 
        variant: "destructive" 
      });
    } else {
      setResendCooldown(60);
      setCanResend(false);
      toast({ 
        title: "Code renvoyé ✅", 
        description: "Un nouveau code a été envoyé à votre email" 
      });
    }
    setIsResending(false);
  };

  const handleCancel = () => {
    clearAuthFlow();
    supabase.auth.signOut();
    navigate('/auth/login', { replace: true });
  };

  if (!hasValidSession) {
    return null;
  }

  return (
    <>
      <div className="auth-tabs p-3 flex justify-center">
        <div className="text-center py-3 font-bold text-primary">
          Vérification de l'appareil
        </div>
      </div>
      
      <div className="auth-content p-5">
        <form onSubmit={handleVerifyCode} className="space-y-4">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Monitor className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nouvel appareil détecté 🔐</h2>
            <p className="text-sm text-muted-foreground">
              Un code de vérification a été envoyé à <strong>{email}</strong>
            </p>
          </div>
          
          {/* User info */}
          {fullName && (
            <div className="text-center text-sm text-muted-foreground mb-4">
              Bonjour <span className="font-medium text-foreground">{fullName}</span> !
            </div>
          )}
          
          {/* OTP Input */}
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
                  value={verificationCode[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 1) {
                      const newCode = verificationCode.split('');
                      newCode[index] = value;
                      setVerificationCode(newCode.join('').slice(0, 6));
                      if (value && index < 5) {
                        otpInputRefs.current[index + 1]?.focus();
                      }
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
          
          {/* Trust Device Checkbox */}
          <div className="flex items-start gap-3 pt-4 bg-muted/30 rounded-lg p-4">
            <Checkbox
              id="trust-device"
              checked={trustDevice}
              onCheckedChange={(checked) => setTrustDevice(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1">
              <Label 
                htmlFor="trust-device" 
                className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
              >
                <Shield className="h-3.5 w-3.5 text-primary" />
                Mémoriser cet appareil
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Les connexions futures depuis cet appareil ne nécessiteront pas de vérification
              </p>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isVerifying} 
            className="auth-btn-submit w-full mt-6"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier et continuer"
            )}
          </Button>
          
          {/* Resend Code */}
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
                  ? "Renvoyer le code" 
                  : `Renvoyer le code (${resendCooldown}s)`
              }
            </button>
          </div>

          {/* Cancel */}
          <button
            type="button"
            onClick={handleCancel}
            className="text-sm text-muted-foreground hover:text-destructive mt-4 text-center w-full transition-colors"
          >
            Annuler et revenir à la connexion
          </button>
          
          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground mt-4">
            💡 N'oubliez pas de vérifier votre dossier <strong>spam/courrier indésirable</strong>
          </p>
        </form>
      </div>
    </>
  );
}
