import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authImage from "@/assets/auth00.png";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateConfirmationCode } from "@/utils/emailService";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { loginSchema, signupSchema, forgotPasswordSchema, verificationCodeSchema } from "@/lib/authValidation";
import { getFullDeviceIdentifier } from "@/utils/deviceFingerprint";
import { PhoneVerificationSection } from "@/components/PhoneVerificationSection";
export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "verify" | "phone-verify" | "forgot-password">("login");
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string>("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [signupData, setSignupData] = useState({
    email: "",
    emailConfirm: "",
    fullName: "",
    nickname: "",
    academicGrade: "",
    phoneNumber: "",
    password: "",
    school: "",
    gender: "",
    dateOfBirth: "",
    privacy: false,
    payment: "",
  });
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [checkingNickname, setCheckingNickname] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const totalSignupSteps = 3;

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeTab === "verify" && resendCooldown > 0 && !canResend) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTab, resendCooldown, canResend]);

  useEffect(() => {
    // Check if user is logged in but not verified
    const checkVerificationStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_confirmed, user_id, full_name, nickname, academic_grade')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile && !profile.email_confirmed) {
          // User exists but not verified - generate and send verification code
          
          // Use secure database function to generate new code
          try {
            const { data, error } = await supabase.rpc('resend_verification_code', {
              p_user_id: session.user.id
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

            if (result.success && result.confirmation_code) {
              // Send verification email using Resend edge function
              await supabase.functions.invoke('send-confirmation-email', {
                body: {
                  email: session.user.email || '',
                  fullName: result.full_name || result.nickname || 'Utilisateur',
                  nickname: result.nickname || '',
                  academicGrade: result.academic_grade || '',
                  confirmationCode: result.confirmation_code,
                }
              });
            }
          } catch (error) {
            // Silent fail - user will see the verify tab anyway
          }
          
          // Sign them out and show verify tab
          await supabase.auth.signOut();
          setPendingUserId(profile.user_id);
          setLoginData({ email: session.user.email || '', password: '' });
          setActiveTab("verify");
          setResendCooldown(60);
          setCanResend(false);
          toast({
            title: "Email non vérifié",
            description: "Un code de vérification a été envoyé à votre email",
            variant: "default",
          });
        }
      }
    };
    
    checkVerificationStatus();
    
    // Check for referral code in URL
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
      setActiveTab("signup"); // Switch to signup tab if coming from referral link
      toast({
        title: "Code de parrainage détecté! 🎉",
        description: "Inscrivez-vous pour bénéficier du parrainage",
      });
    }
  }, [searchParams]);

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

    // Validate verification code with Zod
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
      // Use secure database function to verify code
      const { data, error } = await supabase.rpc('verify_email_code', {
        p_user_id: pendingUserId,
        p_code: verificationCode.trim() // Ensure no whitespace
      });

      if (error) throw error;

      // Type assertion for the response
      const result = data as { success: boolean; error?: string; full_name?: string; nickname?: string };

      // Check the result
      if (!result.success) {
        toast({
          title: "Code incorrect",
          description: result.error || "Le code de vérification est incorrect",
          variant: "destructive",
        });
        return;
      }

      // Send welcome email using Resend edge function
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: signupData.email || loginData.email,
            fullName: result.full_name || result.nickname || 'Utilisateur',
          }
        });
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }

      toast({
        title: "Email vérifié ! ✅",
        description: "Vous pouvez maintenant vérifier votre téléphone (optionnel).",
      });

      // Transition to phone verification step (optional)
      setPendingPhoneNumber(signupData.phoneNumber);
      setActiveTab("phone-verify");
      // Keep pendingUserId for phone verification
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
      // Use secure database function to generate and update code
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

      // Get email
      const userEmail = signupData.email || loginData.email;
      if (!userEmail) {
        throw new Error("Email not found");
      }

      // Send new verification email using Resend edge function
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: userEmail,
          fullName: result.full_name || result.nickname || 'Utilisateur',
          nickname: result.nickname || '',
          academicGrade: result.academic_grade || '',
          confirmationCode: result.confirmation_code!,
        }
      });

      // Reset countdown
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
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

      // Check if email is verified
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email_confirmed, full_name, nickname, academic_grade')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        // Profile fetch failed, but don't block login
      }

      if (profile && !profile.email_confirmed) {
        // User not verified - generate new code, UPDATE BEFORE SIGNOUT
        const newCode = generateConfirmationCode();
        
        // Update profile with new code WHILE STILL AUTHENTICATED
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
        
        // NOW sign out after successful update
        await supabase.auth.signOut();
        
        // Send verification email using Resend edge function
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
        
        // Set pending user and show verify tab
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

      // Smart login notification - only send email for new devices
      try {
        const deviceInfo = getFullDeviceIdentifier();
        
        // Check if this device is already trusted
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
          // Known device - just update last_login_at, NO EMAIL
          await supabase
            .from('user_trusted_devices')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', existingDevice.id);
          
          console.log('Known device login - no notification email sent');
        } else {
          // New device - register it and send notification email
          const { error: insertError } = await supabase
            .from('user_trusted_devices')
            .insert({
              user_id: authData.user.id,
              device_fingerprint: deviceInfo.fingerprint,
              device_name: deviceInfo.deviceName,
              browser: deviceInfo.browser,
              os: deviceInfo.os,
            });
          
          if (insertError) {
            console.error('Error registering device:', insertError);
          }
          
          // Send login notification for new device
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
              os: deviceInfo.os,
            }
          });
          
          console.log('New device detected - notification email sent');
        }
      } catch (deviceError) {
        // Don't block login if device tracking fails
        console.error('Device tracking error:', deviceError);
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });

      navigate("/dashboard");
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsResettingPassword(true);
    try {
      // Generate custom reset token using database function
      const { data, error } = await supabase.rpc('generate_password_reset_token', {
        user_email: forgotPasswordEmail
      });

      if (error) throw error;

      const tokenData = data as unknown as Array<{ token: string; user_id: string; full_name: string }>;
      
      if (!tokenData || tokenData.length === 0) {
        throw new Error("Utilisateur non trouvé");
      }

      const { token, full_name } = tokenData[0];
      const resetUrl = `${window.location.origin}/reset-password?token=${token}`;
      
      // Send password reset email via Resend edge function
      await supabase.functions.invoke('send-password-reset-email', {
        body: {
          email: forgotPasswordEmail,
          resetUrl: resetUrl,
          fullName: full_name,
        }
      });
      
      toast({
        title: "Email envoyé ✅",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
      });

      setForgotPasswordEmail("");
      setActiveTab("login");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Debounce timer ref
  const nicknameCheckTimer = useRef<NodeJS.Timeout>();

  const checkNicknameAvailability = async (nickname: string) => {
    // Clear previous timer
    if (nicknameCheckTimer.current) {
      clearTimeout(nicknameCheckTimer.current);
    }

    if (!nickname || nickname.length < 3) {
      setNicknameAvailable(null);
      setCheckingNickname(false);
      return;
    }

    setCheckingNickname(true);

    // Debounce the API call
    nicknameCheckTimer.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc('check_nickname_available', {
          nickname_input: nickname
        });

        if (error) throw error;
        
        const isAvailable = data === true;
        setNicknameAvailable(isAvailable);
      } catch (error) {
        setNicknameAvailable(null);
      } finally {
        setCheckingNickname(false);
      }
    }, 500); // Wait 500ms after user stops typing
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const validation = signupSchema.safeParse(signupData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Données invalides",
        description: firstError?.message || "Veuillez vérifier vos informations",
        variant: "destructive",
      });
      return;
    }

    if (nicknameAvailable === false) {
      toast({
        title: "Pseudo non disponible",
        description: "Ce pseudo est déjà utilisé, veuillez en choisir un autre",
        variant: "destructive",
      });
      return;
    }

    setIsSigningUp(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Échec de la création du compte");

      // Generate verification code
      const confirmationCode = generateConfirmationCode();

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: signupData.fullName || signupData.nickname,
          nickname: signupData.nickname,
          academic_grade: signupData.academicGrade,
          phone_number: signupData.phoneNumber,
          school: signupData.school,
          gender: signupData.gender,
          date_of_birth: signupData.dateOfBirth || null,
          email_confirmed: false,
          phone_confirmed: false,
          confirmation_code: confirmationCode.trim(),
        });

      if (profileError) throw profileError;

      // Handle referral BEFORE sign out (while user is still authenticated for RLS)
      if (referralCode) {
        try {
          // Find the referrer's profile
          const { data: referrerProfile, error: referrerError } = await supabase
            .from("profiles")
            .select("id")
            .eq("referral_code", referralCode)
            .single();

          if (!referrerError && referrerProfile) {
            // Get the new user's profile
            const { data: newUserProfile, error: newProfileError } = await supabase
              .from("profiles")
              .select("id")
              .eq("user_id", authData.user.id)
              .single();

            if (!newProfileError && newUserProfile) {
              // Create referral entry
              await supabase.from("referrals").insert({
                referrer_id: referrerProfile.id,
                referred_id: newUserProfile.id,
                status: "pending",
              });

              // Update the new user's referred_by field
              await supabase
                .from("profiles")
                .update({ referred_by: referrerProfile.id })
                .eq("id", newUserProfile.id);

              toast({
                title: "Parrainage enregistré! 🎉",
                description: "Vous avez été parrainé avec succès",
              });
            }
          }
        } catch (refError) {
          // Don't block signup if referral fails
        }
      }

      // Sign out the user AFTER referral handling
      await supabase.auth.signOut();

      // Send verification email with code using Resend edge function
      try {
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            email: signupData.email,
            fullName: signupData.fullName || signupData.nickname,
            nickname: signupData.nickname,
            academicGrade: signupData.academicGrade,
            confirmationCode: confirmationCode,
          }
        });
      } catch (emailError) {
        toast({
          title: "Erreur d'envoi",
          description: "Impossible d'envoyer l'email de vérification",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Inscription réussie ! 🎉",
        description: "Un code de vérification a été envoyé à votre email",
      });

      // Set pending user and switch to verification tab
      setPendingUserId(authData.user.id);
      setActiveTab("verify");
      setResendCooldown(60);
      setCanResend(false);
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Connexion & Inscription - EDUPRENEURS | Plateforme éducative haïtienne</title>
        <meta name="description" content="Connectez-vous ou créez un compte sur EDUPRENEURS. Plateforme d'apprentissage personnalisé alignée au programme MENFP avec assistance IA." />
        <meta name="keywords" content="connexion, inscription, EDUPRENEURS, éducation Haïti, MENFP, apprentissage en ligne" />
        <meta property="og:title" content="Connexion & Inscription - EDUPRENEURS" />
        <meta property="og:description" content="Rejoignez la plateforme éducative haïtienne avec assistance IA personnalisée." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}/auth`} />
      </Helmet>
    <div className="auth-page min-h-screen bg-background">
      {/* Header */}
      <header className="auth-header sticky top-0 z-10 flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-4 bg-card border-b border-border">
        <Link to="/" className="auth-brand flex items-center gap-1.5 sm:gap-2.5">
          <img src={edupreneursLogo} alt="EDUPRENEURS" className="h-8 sm:h-10 w-auto object-contain" loading="eager" decoding="async" />
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-3">
          <Link to="/" className="auth-btn-outline text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
            Accueil
          </Link>
          <Button 
            onClick={() => setActiveTab("login")}
            className="auth-btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
          >
            Se connecter
          </Button>
          <ThemeToggle />
        </nav>
      </header>

      {/* Main Content */}
      <div className="auth-wrap min-h-[calc(100vh-65px)] grid place-items-center p-4 md:p-8">
        <div className="auth-container flex flex-col items-center gap-8 w-full max-w-[1000px]">
          {/* Desktop Image */}
          <div className="auth-image-container hidden md:flex justify-center items-center">
            <img 
              src={authImage} 
              alt="Authentification EDUPRENEURS" 
              className="auth-image w-full max-w-[280px] h-auto animate-gentle-float" 
              loading="lazy"
              decoding="async"
            />
          </div>
          
          <div className="auth-grid grid md:grid-cols-[1.1fr_0.9fr] gap-8 w-full">
            {/* Info Panel */}
            <aside className="auth-panel auth-info bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-border rounded-2xl shadow-xl p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Bienvenue sur EDUPRENEURS
                  </h1>
                  <p className="text-foreground/80 text-base leading-relaxed font-medium">
                    Plateforme d'apprentissage personnalisé alignée au programme du MENFP, avec assistance IA et suivi de progression.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    ✨ Essai gratuit 7 jours
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 text-foreground rounded-full text-sm font-bold">
                    🇭🇹 Français & Créole
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/20 text-foreground rounded-full text-sm font-bold">
                    🤖 IA personnalisée
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">📚</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Contenu riche et interactif</h3>
                      <p className="text-sm text-foreground/70 font-medium">Leçons détaillées, schémas explicatifs et exercices pratiques</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Quiz et récompenses</h3>
                      <p className="text-sm text-foreground/70 font-medium">Testez vos connaissances et gagnez des golds à chaque réussite</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="text-lg">💳</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Paiement flexible</h3>
                      <p className="text-sm text-foreground/70 font-medium">MonCash, NatCash - Environ 200 HTG/mois après l'essai</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile Image */}
            <div className="auth-image-mobile flex md:hidden justify-center items-center my-5">
              <img 
                src={authImage} 
                alt="Authentification EDUPRENEURS" 
                className="auth-image max-w-[250px] h-auto animate-gentle-float" 
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Auth Card */}
            <section className="auth-panel auth-card bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              {/* Tabs */}
              <div className="auth-tabs flex border-b border-border">
                {activeTab !== "verify" && activeTab !== "forgot-password" && (
                  <>
                    <button
                      className={`auth-tab flex-1 text-center py-3.5 px-2.5 cursor-pointer font-bold ${
                        activeTab === "login" 
                          ? "text-primary border-b-[3px] border-primary" 
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("login")}
                    >
                      Se connecter
                    </button>
                    <button
                      className={`auth-tab flex-1 text-center py-3.5 px-2.5 cursor-pointer font-bold ${
                        activeTab === "signup" 
                          ? "text-primary border-b-[3px] border-primary" 
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("signup")}
                    >
                      Créer un compte
                    </button>
                  </>
                )}
                {activeTab === "forgot-password" && (
                  <div className="auth-tab flex-1 text-center py-3.5 px-2.5 font-bold text-primary border-b-[3px] border-primary">
                    Réinitialiser le mot de passe
                  </div>
                )}
                {activeTab === "verify" && (
                  <div className="auth-tab flex-1 text-center py-3.5 px-2.5 font-bold text-primary border-b-[3px] border-primary">
                    Vérification de l'email
                  </div>
                )}
                {activeTab === "phone-verify" && (
                  <div className="auth-tab flex-1 text-center py-3.5 px-2.5 font-bold text-primary border-b-[3px] border-primary">
                    Vérification du téléphone
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="auth-content p-5">
                {/* Login Form */}
                {activeTab === "login" && (
                  <form onSubmit={handleLogin} className="space-y-4">
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
                    <Button type="submit" disabled={isLoggingIn} className="auth-btn-submit w-full mt-6">
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
                      className="text-sm text-primary hover:underline mt-4 text-center w-full"
                    >
                      Mot de passe oublié ?
                    </button>
                  </form>
                )}

                {/* Forgot Password Form */}
                {activeTab === "forgot-password" && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold mb-2">Mot de passe oublié ?</h2>
                      <p className="text-sm text-muted-foreground">
                        Entrez votre adresse email pour recevoir un lien de réinitialisation
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email" className="text-sm text-muted-foreground">
                        Adresse e-mail
                      </Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        required
                        placeholder="ex: nom@domaine.com"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="auth-input"
                      />
                    </div>
                    <Button type="submit" disabled={isResettingPassword} className="auth-btn-submit w-full mt-6">
                      {isResettingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer le lien"
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-sm text-muted-foreground hover:text-primary mt-4 text-center w-full"
                    >
                      Retour à la connexion
                    </button>
                  </form>
                )}

                {/* Verification Code Form */}
                {activeTab === "verify" && (
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
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={verificationCode[index] || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 1) {
                                const newCode = verificationCode.split('');
                                newCode[index] = value;
                                const updatedCode = newCode.join('').slice(0, 6);
                                setVerificationCode(updatedCode);
                                // Auto-focus next input
                                if (value && index < 5) {
                                  document.getElementById(`otp-${index + 1}`)?.focus();
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              // Handle backspace to go to previous input
                              if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                                document.getElementById(`otp-${index - 1}`)?.focus();
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                              setVerificationCode(pastedData);
                              // Focus last filled input or last input
                              const focusIndex = Math.min(pastedData.length, 5);
                              document.getElementById(`otp-${focusIndex}`)?.focus();
                            }}
                            className="w-12 h-14 text-center text-2xl font-bold border border-input rounded-lg bg-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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
                    
                    {/* Resend verification code */}
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
                )}

                {/* Phone Verification (Optional) */}
                {activeTab === "phone-verify" && pendingUserId && (
                  <PhoneVerificationSection
                    userId={pendingUserId}
                    phoneNumber={pendingPhoneNumber || signupData.phoneNumber}
                    onVerified={() => {
                      toast({
                        title: "Tout est prêt! 🎉",
                        description: "Email et téléphone vérifiés. Vous pouvez maintenant vous connecter.",
                      });
                      setPendingUserId(null);
                      setVerificationCode("");
                      setPendingPhoneNumber("");
                      setActiveTab("login");
                    }}
                    onSkip={() => {
                      toast({
                        title: "Inscription terminée!",
                        description: "Vous pouvez vérifier votre téléphone plus tard dans les paramètres.",
                      });
                      setPendingUserId(null);
                      setVerificationCode("");
                      setPendingPhoneNumber("");
                      setActiveTab("login");
                    }}
                  />
                )}

                {/* Signup Form - Multi-step Wizard */}
                {activeTab === "signup" && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Progress Indicator */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Étape {signupStep} sur {totalSignupSteps}</span>
                        <span className="text-xs text-muted-foreground">
                          {signupStep === 1 && "Compte"}
                          {signupStep === 2 && "Profil"}
                          {signupStep === 3 && "Finalisation"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${(signupStep / totalSignupSteps) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        {[1, 2, 3].map((step) => (
                          <div 
                            key={step}
                            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                              step < signupStep 
                                ? 'bg-primary text-primary-foreground' 
                                : step === signupStep 
                                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' 
                                  : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {step < signupStep ? '✓' : step}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step 1: Account Info */}
                    {signupStep === 1 && (
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
                            value={signupData.email}
                            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
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
                            value={signupData.emailConfirm}
                            onChange={(e) => setSignupData({ ...signupData, emailConfirm: e.target.value })}
                            className="auth-input"
                          />
                          {signupData.email && signupData.emailConfirm && signupData.email !== signupData.emailConfirm && (
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
                              type={showSignupPassword ? "text" : "password"}
                              required
                              minLength={6}
                              placeholder="Créez un mot de passe sécurisé"
                              value={signupData.password}
                              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                              className="auth-input pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          <div className="space-y-1 text-xs mt-2">
                            <p className={`flex items-center gap-1 ${signupData.password.length >= 6 ? 'text-success' : 'text-muted-foreground'}`}>
                              {signupData.password.length >= 6 ? '✓' : '○'} Au moins 6 caractères
                            </p>
                            <p className={`flex items-center gap-1 ${/[0-9]/.test(signupData.password) ? 'text-success' : 'text-muted-foreground'}`}>
                              {/[0-9]/.test(signupData.password) ? '✓' : '○'} Au moins un chiffre
                            </p>
                            <p className={`flex items-center gap-1 ${/[A-Z]/.test(signupData.password) ? 'text-success' : 'text-muted-foreground'}`}>
                              {/[A-Z]/.test(signupData.password) ? '✓' : '○'} Au moins une majuscule
                            </p>
                            <p className={`flex items-center gap-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(signupData.password) ? 'text-success' : 'text-muted-foreground'}`}>
                              {/[!@#$%^&*(),.?":{}|<>]/.test(signupData.password) ? '✓' : '○'} Au moins un caractère spécial
                            </p>
                          </div>
                        </div>

                        <Button 
                          type="button" 
                          className="w-full mt-4"
                          onClick={() => {
                            if (!signupData.email || !signupData.emailConfirm || !signupData.password) {
                              toast({ title: "Champs requis", description: "Veuillez remplir tous les champs", variant: "destructive" });
                              return;
                            }
                            if (signupData.email !== signupData.emailConfirm) {
                              toast({ title: "Emails différents", description: "Les emails ne correspondent pas", variant: "destructive" });
                              return;
                            }
                            if (signupData.password.length < 6) {
                              toast({ title: "Mot de passe trop court", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
                              return;
                            }
                            setSignupStep(2);
                          }}
                        >
                          Continuer →
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Profile Info */}
                    {signupStep === 2 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold">Votre profil</h3>
                          <p className="text-sm text-muted-foreground">Parlez-nous un peu de vous</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="signup-fullname" className="text-sm text-muted-foreground">
                              Nom complet
                            </Label>
                            <Input
                              id="signup-fullname"
                              type="text"
                              placeholder="Votre nom complet"
                              value={signupData.fullName}
                              onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                              className="auth-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-nickname" className="text-sm text-muted-foreground">
                              Pseudo *
                            </Label>
                            <Input
                              id="signup-nickname"
                              type="text"
                              required
                              placeholder="Choisissez un pseudo unique"
                              value={signupData.nickname}
                              onChange={(e) => {
                                setSignupData({ ...signupData, nickname: e.target.value });
                                checkNicknameAvailability(e.target.value);
                              }}
                              className="auth-input"
                            />
                            {checkingNickname && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" /> Vérification...
                              </p>
                            )}
                            {nicknameAvailable === false && (
                              <p className="text-xs text-destructive">Ce pseudo est déjà utilisé</p>
                            )}
                            {nicknameAvailable === true && (
                              <p className="text-xs text-success">Ce pseudo est disponible ✓</p>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="signup-grade" className="text-sm text-muted-foreground">
                              Niveau académique *
                            </Label>
                            <select
                              id="signup-grade"
                              required
                              value={signupData.academicGrade}
                              onChange={(e) => setSignupData({ ...signupData, academicGrade: e.target.value })}
                              className="auth-input flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm"
                            >
                              <option value="">Sélectionnez…</option>
                              <option>7e</option>
                              <option>8e</option>
                              <option>9e</option>
                              <option>S1</option>
                              <option>S2</option>
                              <option>Philo</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-gender" className="text-sm text-muted-foreground">
                              Genre *
                            </Label>
                            <select
                              id="signup-gender"
                              required
                              value={signupData.gender}
                              onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                              className="auth-input flex h-10 w-full rounded-lg border border-input bg-muted/50 px-3 py-2 text-sm"
                            >
                              <option value="">Sélectionnez…</option>
                              <option value="Masculin">Masculin</option>
                              <option value="Féminin">Féminin</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="signup-phone" className="text-sm text-muted-foreground">
                              Numéro de téléphone *
                            </Label>
                            <Input
                              id="signup-phone"
                              type="tel"
                              required
                              placeholder="ex: +509 3x xx xx xx"
                              value={signupData.phoneNumber}
                              onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })}
                              className="auth-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-school" className="text-sm text-muted-foreground">
                              Nom de l'école *
                            </Label>
                            <Input
                              id="signup-school"
                              type="text"
                              required
                              placeholder="ex: Collège Sacré-coeur"
                              value={signupData.school}
                              onChange={(e) => setSignupData({ ...signupData, school: e.target.value })}
                              className="auth-input"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-dob" className="text-sm text-muted-foreground">
                            Date de naissance 🎂
                          </Label>
                          <Input
                            id="signup-dob"
                            type="date"
                            placeholder="JJ/MM/AAAA"
                            value={signupData.dateOfBirth}
                            max={new Date().toISOString().split('T')[0]}
                            min="1950-01-01"
                            onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
                            className="auth-input"
                          />
                          <p className="text-xs text-muted-foreground">
                            Pour recevoir un email spécial le jour de votre anniversaire! 🎉
                          </p>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSignupStep(1)}
                          >
                            ← Retour
                          </Button>
                          <Button 
                            type="button" 
                            className="flex-1"
                            onClick={() => {
                              if (!signupData.nickname || !signupData.academicGrade || !signupData.gender || !signupData.phoneNumber || !signupData.school) {
                                toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
                                return;
                              }
                              if (nicknameAvailable === false) {
                                toast({ title: "Pseudo non disponible", description: "Veuillez choisir un autre pseudo", variant: "destructive" });
                                return;
                              }
                              setSignupStep(3);
                            }}
                          >
                            Continuer →
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Payment & Privacy */}
                    {signupStep === 3 && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold">Dernière étape !</h3>
                          <p className="text-sm text-muted-foreground">Choisissez votre méthode de paiement</p>
                        </div>

                        <div className="space-y-3">
                          <strong className="block text-sm">Méthode de paiement *</strong>
                          <div className="grid gap-2">
                            {[
                              { value: 'moncash', label: 'MonCash', icon: '📱' },
                              { value: 'natcash', label: 'NatCash', icon: '💳' },
                              { value: 'carte', label: 'Carte bancaire', icon: '💳' },
                            ].map((method) => (
                              <label 
                                key={method.value}
                                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                                  signupData.payment === method.value 
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                                    : 'border-input bg-muted/50 hover:border-primary/50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="payment"
                                  value={method.value}
                                  required
                                  checked={signupData.payment === method.value}
                                  onChange={(e) => setSignupData({ ...signupData, payment: e.target.value })}
                                  className="sr-only"
                                />
                                <span className="text-xl">{method.icon}</span>
                                <span className="font-medium">{method.label}</span>
                                {signupData.payment === method.value && (
                                  <span className="ml-auto text-primary">✓</span>
                                )}
                              </label>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            ✨ Essai gratuit 7 jours, puis ~200 HTG / mois.
                          </p>
                        </div>

                        <div className="flex items-start gap-3 p-4 border border-input rounded-lg bg-muted/30">
                          <input
                            type="checkbox"
                            id="privacy"
                            required
                            checked={signupData.privacy}
                            onChange={(e) => setSignupData({ ...signupData, privacy: e.target.checked })}
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
                          <Button 
                            type="button" 
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSignupStep(2)}
                          >
                            ← Retour
                          </Button>
                          <Button type="submit" disabled={isSigningUp} className="flex-1">
                            {isSigningUp ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Création...
                              </>
                            ) : (
                              "Créer mon compte 🎉"
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
