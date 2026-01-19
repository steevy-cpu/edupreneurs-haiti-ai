import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@/lib/authValidation";
import { getFullDeviceIdentifier } from "@/utils/deviceFingerprint";
import { generateConfirmationCode } from "@/utils/emailService";
import { useAuth } from "./AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get returnTo URL from location state OR sessionStorage (survives page refresh)
  const returnTo = (location.state as { returnTo?: string })?.returnTo 
    || sessionStorage.getItem('quiz_battle_return_url');
  const {
    loginData,
    setLoginData,
    isLoggingIn,
    setIsLoggingIn,
    showLoginPassword,
    setShowLoginPassword,
    handleInputFocus,
    setActiveTab,
    setPendingUserId,
    setResendCooldown,
    setCanResend,
  } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse(loginData);
    if (!validation.success) {
      toast({
        title: "Données invalides",
        description: validation.error.errors[0]?.message || "Veuillez vérifier vos informations",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      if (!authData.user) throw new Error("Échec de connexion");

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email_confirmed, full_name, nickname, academic_grade')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        // Profile fetch failed, but don't block login
      }

      if (profile && !profile.email_confirmed) {
        const newCode = generateConfirmationCode();
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ confirmation_code: newCode.trim() })
          .eq('user_id', authData.user.id);
        
        if (updateError) {
          toast({
            title: "Erreur",
            description: "Impossible de générer un nouveau code de vérification",
            variant: "destructive",
          });
          return;
        }
        
        await supabase.auth.signOut();
        
        try {
          await supabase.functions.invoke('send-confirmation-email', {
            body: {
              email: loginData.email,
              fullName: profile.full_name || profile.nickname,
              nickname: profile.nickname || '',
              academicGrade: profile.academic_grade || '',
              confirmationCode: newCode,
            }
          });
        } catch (emailError) {
          // Email send failed, but user can still resend
        }
        
        setPendingUserId(authData.user.id);
        setActiveTab("verify");
        setResendCooldown(60);
        setCanResend(false);
        
        toast({
          title: "Email non vérifié",
          description: "Un nouveau code de vérification a été envoyé à votre adresse email.",
          variant: "destructive",
        });
        return;
      }

      // Smart login notification
      try {
        const deviceInfo = getFullDeviceIdentifier();
        
        const { data: existingDevice, error: deviceCheckError } = await supabase
          .from('user_trusted_devices')
          .select('id')
          .eq('user_id', authData.user.id)
          .eq('device_fingerprint', deviceInfo.fingerprint)
          .maybeSingle();
        
        if (deviceCheckError) {
          console.error('Error checking device:', deviceCheckError);
        }
        
        if (existingDevice) {
          await supabase
            .from('user_trusted_devices')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', existingDevice.id);
          
          console.log('Known device login - no notification email sent');
        } else {
          const { data: sameHardwareDevices } = await supabase
            .from('user_trusted_devices')
            .select('id, browser, hardware_fingerprint')
            .eq('user_id', authData.user.id)
            .eq('hardware_fingerprint', deviceInfo.hardwareFingerprint)
            .limit(5);
          
          const isSamePhysicalDevice = (sameHardwareDevices && sameHardwareDevices.length > 0) || false;
          
          const { error: insertError } = await supabase
            .from('user_trusted_devices')
            .insert({
              user_id: authData.user.id,
              device_fingerprint: deviceInfo.fingerprint,
              hardware_fingerprint: deviceInfo.hardwareFingerprint,
              device_name: deviceInfo.deviceName,
              browser: deviceInfo.browser,
              os: deviceInfo.os,
            });
          
          if (insertError) {
            console.error('Error registering device:', insertError);
          }
          
          if (!isSamePhysicalDevice) {
            const timestamp = new Date().toLocaleString('fr-FR', {
              dateStyle: 'full',
              timeStyle: 'short',
            });
            
            await supabase.functions.invoke('send-login-notification', {
              body: {
                email: loginData.email,
                fullName: profile?.full_name || 'Utilisateur',
                timestamp,
                device: deviceInfo.deviceName,
                browser: deviceInfo.browser,
              }
            });
            
            console.log('New device detected - notification email sent');
          } else {
            console.log('Same physical device (hardware fingerprint match), different browser - no notification email sent');
          }
        }
      } catch (deviceError) {
        console.error('Device tracking error:', deviceError);
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      // Clear sessionStorage after successful login
      sessionStorage.removeItem('quiz_battle_return_url');
      
      // Navigate to returnTo URL if provided, otherwise dashboard
      navigate(returnTo || "/dashboard");
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4" name="login-form" autoComplete="on">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-sm text-muted-foreground">
          Adresse e-mail
        </Label>
        <Input
          id="login-email"
          type="email"
          required
          placeholder="ex: nom@domaine.com"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          onFocus={handleInputFocus}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="next"
          inputMode="email"
          className="auth-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-sm text-muted-foreground">
          Mot de passe
        </Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showLoginPassword ? "text" : "password"}
            required
            placeholder="Votre mot de passe"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            onFocus={handleInputFocus}
            autoComplete="current-password"
            autoCapitalize="none"
            enterKeyHint="done"
            className="auth-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button 
        type="submit" 
        disabled={isLoggingIn} 
        className="auth-btn-submit w-full mt-6 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          "Se connecter"
        )}
      </Button>
      
      <button
        type="button"
        onClick={() => setActiveTab("forgot-password")}
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mt-4 w-full"
      >
        <KeyRound className="h-3.5 w-3.5" />
        Mot de passe oublié ?
      </button>
    </form>
  );
}
