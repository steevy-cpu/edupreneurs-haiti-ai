import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authImage from "@/assets/auth00.png";
import edupreneursLogo from "@/assets/edupreneurs-logo.jpeg";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail, generateConfirmationCode } from "@/utils/emailService";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "verify" | "forgot-password">("login");
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
          console.log('🔍 Detected unverified user on page load');
          
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
              console.log('✅ Generated verification code for existing user');
              
              // Send verification email using EmailJS
              await sendVerificationEmail({
                to_email: session.user.email || '',
                to_name: result.full_name || result.nickname || 'Utilisateur',
                confirmation_code: result.confirmation_code,
                nickname: result.nickname,
                academic_grade: result.academic_grade,
              });
              
              console.log('📧 Verification email sent to existing user');
            }
          } catch (error) {
            console.error('Error generating verification code:', error);
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

    setIsVerifying(true);
    try {
      console.log('🔍 Verifying code:', verificationCode.trim(), 'for user:', pendingUserId);
      
      // Use secure database function to verify code
      const { data, error } = await supabase.rpc('verify_email_code', {
        p_user_id: pendingUserId,
        p_code: verificationCode.trim() // Ensure no whitespace
      });

      if (error) throw error;

      // Type assertion for the response
      const result = data as { success: boolean; error?: string; full_name?: string; nickname?: string };
      
      console.log('✅ Verification result:', result);

      // Check the result
      if (!result.success) {
        toast({
          title: "Code incorrect",
          description: result.error || "Le code de vérification est incorrect",
          variant: "destructive",
        });
        return;
      }

      // Send welcome email
      try {
        await sendWelcomeEmail({
          to_email: signupData.email || loginData.email,
          to_name: result.full_name || result.nickname || 'Utilisateur',
          nickname: result.nickname,
        });
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
      }

      toast({
        title: "Email vérifié ! ✅",
        description: "Votre compte est maintenant actif. Vous pouvez vous connecter.",
      });

      // Reset form and go to login
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
      console.log('🔄 Resending verification code for user:', pendingUserId);

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

      console.log('✅ New verification code generated:', result.confirmation_code);

      // Get email
      const userEmail = signupData.email || loginData.email;
      if (!userEmail) {
        throw new Error("Email not found");
      }

      // Send new verification email using EmailJS
      await sendVerificationEmail({
        to_email: userEmail,
        to_name: result.full_name || result.nickname || 'Utilisateur',
        confirmation_code: result.confirmation_code!,
        nickname: result.nickname,
        academic_grade: result.academic_grade,
      });

      console.log('📧 Verification email sent successfully');

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
        console.error("Profile error:", profileError);
      }

      if (profile && !profile.email_confirmed) {
        // User not verified - generate new code, UPDATE BEFORE SIGNOUT
        const newCode = generateConfirmationCode();
        console.log('🔑 Generated new verification code for login:', newCode);
        
        // Update profile with new code WHILE STILL AUTHENTICATED
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ confirmation_code: newCode.trim() })
          .eq('user_id', authData.user.id);
        
        if (updateError) {
          console.error("Error updating verification code:", updateError);
          toast({
            title: "Erreur",
            description: "Impossible de générer un nouveau code de vérification",
            variant: "destructive",
          });
          return;
        }
        
        // NOW sign out after successful update
        await supabase.auth.signOut();
        
        // Send verification email using EmailJS
        try {
          await sendVerificationEmail({
            to_email: loginData.email,
            to_name: profile.full_name || profile.nickname,
            confirmation_code: newCode,
            nickname: profile.nickname,
            academic_grade: profile.academic_grade,
          });
          console.log('✅ Verification email sent with code:', newCode);
        } catch (emailError) {
          console.error("Error sending verification email:", emailError);
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

      // Send login notification (optional)
      try {
        const timestamp = new Date().toLocaleString('fr-FR', {
          dateStyle: 'full',
          timeStyle: 'short',
        });
        
        await supabase.functions.invoke('send-login-notification', {
          body: {
            email: loginData.email,
            fullName: profile?.full_name || 'Utilisateur',
            timestamp,
            device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
          }
        });
      } catch (emailError) {
        console.error("Error sending login notification:", emailError);
        // Don't block login if email fails
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
      // Request password reset from Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      // Send password reset email via EmailJS
      try {
        await sendPasswordResetEmail({
          to_email: forgotPasswordEmail,
          reset_url: `${window.location.origin}/reset-password`,
        });
        
        toast({
          title: "Email envoyé ✅",
          description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
        });

        setForgotPasswordEmail("");
        setActiveTab("login");
      } catch (emailError) {
        console.error("Error sending password reset email:", emailError);
        toast({
          title: "Erreur d'envoi",
          description: "Impossible d'envoyer l'email. Veuillez réessayer.",
          variant: "destructive",
        });
      }
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
        console.log('🔍 Checking nickname availability for:', nickname);
        const { data, error } = await supabase.rpc('check_nickname_available', {
          nickname_input: nickname
        });

        if (error) throw error;
        
        const isAvailable = data === true;
        console.log('✅ Nickname check result:', { nickname, isAvailable });
        setNicknameAvailable(isAvailable);
      } catch (error) {
        console.error("❌ Error checking nickname:", error);
        setNicknameAvailable(null);
      } finally {
        setCheckingNickname(false);
      }
    }, 500); // Wait 500ms after user stops typing
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.email || !signupData.emailConfirm || !signupData.password || 
        !signupData.nickname || !signupData.academicGrade || !signupData.phoneNumber ||
        !signupData.school || !signupData.gender) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSigningUp(true);

    if (signupData.email !== signupData.emailConfirm) {
      toast({
        title: "Emails ne correspondent pas",
        description: "Veuillez vérifier que les deux emails sont identiques",
        variant: "destructive",
      });
      return;
    }

    // Validate password requirements
    if (signupData.password.length < 6) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    if (!/[0-9]/.test(signupData.password)) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins un chiffre",
        variant: "destructive",
      });
      return;
    }

    if (!/[A-Z]/.test(signupData.password)) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins une majuscule",
        variant: "destructive",
      });
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(signupData.password)) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins un caractère spécial",
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
      console.log('🔑 Generated verification code for signup:', confirmationCode);

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
          email_confirmed: false,
          phone_confirmed: false,
          confirmation_code: confirmationCode.trim(), // Ensure no whitespace
        });

      if (profileError) throw profileError;

      // Sign out the user immediately after signup to prevent access
      await supabase.auth.signOut();

      // Handle referral if present
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
          console.error("Referral error:", refError);
          // Don't block signup if referral fails
        }
      }

      // Send verification email with code
      try {
        await sendVerificationEmail({
          to_email: signupData.email,
          to_name: signupData.fullName || signupData.nickname,
          confirmation_code: confirmationCode,
          nickname: signupData.nickname,
          academic_grade: signupData.academicGrade,
        });
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
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
      console.error("Signup error:", error);
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
    <div className="auth-page min-h-screen bg-background">
      {/* Header */}
      <header className="auth-header sticky top-0 z-10 flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-4 bg-card border-b border-border">
        <Link to="/" className="auth-brand flex items-center gap-1.5 sm:gap-2.5">
          <img src={edupreneursLogo} alt="EDUPRENEURS" className="h-8 sm:h-10 w-auto object-contain" />
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
            />
          </div>
          
          <div className="auth-grid grid md:grid-cols-[1.1fr_0.9fr] gap-8 w-full">
            {/* Info Panel */}
            <aside className="auth-panel auth-info bg-card border border-border rounded-2xl shadow-lg p-7">
              <h1 className="text-3xl font-bold mb-2">Bienvenue</h1>
              <p className="text-muted-foreground mb-5">
                Créez votre compte ou connectez-vous pour accéder à votre apprentissage personnalisé aligné au MENFP.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="auth-badge">Essai 7 jours</span>
                <span className="auth-badge">FR / HT</span>
                <span className="auth-badge">IA personnalisée</span>
              </div>
              <ul className="auth-bullets list-none m-0 p-0 text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">• Leçons et schémas simples</li>
                <li className="flex items-center gap-2">• Quiz amusants et golds</li>
                <li className="flex items-center gap-2">• Paiement MonCash / NatCash</li>
                <li className="flex items-center gap-2">• Prix cible ~200 HTG / mois</li>
              </ul>
            </aside>

            {/* Mobile Image */}
            <div className="auth-image-mobile flex md:hidden justify-center items-center my-5">
              <img 
                src={authImage} 
                alt="Authentification EDUPRENEURS" 
                className="auth-image max-w-[250px] h-auto animate-gentle-float" 
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
                      <Input
                        id="login-password"
                        type="password"
                        required
                        placeholder="Votre mot de passe"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="auth-input"
                      />
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

                    <div className="flex flex-col gap-2 mt-4">
                      <Button 
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          try {
                            // Clear onboarding flag to show tour again
                            localStorage.removeItem("onboarding_completed");
                            
                            const { error } = await supabase.auth.signInWithPassword({
                              email: "celestinsteeve738@gmail.com",
                              password: "test123",
                            });
                            if (error) throw error;
                            toast({
                              title: "Connexion test réussie",
                              description: "Mode test activé",
                            });
                            navigate("/dashboard");
                          } catch (error: any) {
                            toast({
                              title: "Erreur",
                              description: error.message,
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        🧪 Connexion Test Rapide
                      </Button>
                      <p className="auth-note text-xs text-muted-foreground text-center">
                        ou utilisez: <code className="bg-muted px-1 py-0.5 rounded text-xs">celestinsteeve738@gmail.com / test123</code>
                      </p>
                    </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="verification-code" className="text-sm text-muted-foreground">
                        Code de vérification
                      </Label>
                      <Input
                        id="verification-code"
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        className="auth-input text-center text-2xl tracking-widest font-bold"
                      />
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

                {/* Signup Form */}
                {activeTab === "signup" && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm text-muted-foreground">
                          Adresse e-mail *
                        </Label>
                        <Input
                          id="signup-email"
                          type="email"
                          required
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
                          value={signupData.emailConfirm}
                          onChange={(e) => setSignupData({ ...signupData, emailConfirm: e.target.value })}
                          className="auth-input"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm text-muted-foreground">
                        Mot de passe *
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        required
                        minLength={6}
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="auth-input"
                      />
                      {signupData.password && (
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
                            {/[!@#$%^&*(),.?":{}|<>]/.test(signupData.password) ? '✓' : '○'} Au moins un caractère spécial (!@#$%...)
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-fullname" className="text-sm text-muted-foreground">
                          Nom complet
                        </Label>
                        <Input
                          id="signup-fullname"
                          type="text"
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
                          value={signupData.nickname}
                          onChange={(e) => {
                            setSignupData({ ...signupData, nickname: e.target.value });
                            checkNicknameAvailability(e.target.value);
                          }}
                          className="auth-input"
                        />
                        {checkingNickname && (
                          <p className="text-xs text-muted-foreground">Vérification...</p>
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
                        <Label htmlFor="signup-phone" className="text-sm text-muted-foreground">
                          Numéro *
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
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="signup-school" className="text-sm text-muted-foreground">
                          Nom de l'école *
                        </Label>
                        <Input
                          id="signup-school"
                          type="text"
                          required
                          placeholder="ex: Collège Sacré-coeur de Papaye"
                          value={signupData.school}
                          onChange={(e) => setSignupData({ ...signupData, school: e.target.value })}
                          className="auth-input"
                        />
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

                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="privacy"
                        required
                        checked={signupData.privacy}
                        onChange={(e) => setSignupData({ ...signupData, privacy: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="privacy" className="text-sm text-muted-foreground">
                        J'accepte les{" "}
                        <Link to="/privacy-policy" className="text-primary underline" target="_blank">
                          politiques de confidentialité
                        </Link>
                        .
                      </Label>
                    </div>

                    <div className="auth-pay mt-6">
                      <strong className="block mb-2 text-sm">Méthode de paiement</strong>
                      <div className="flex flex-col gap-2">
                        <label className="auth-radio flex items-center gap-2 p-3 border border-input rounded-lg bg-muted/50 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value="moncash"
                            required
                            checked={signupData.payment === "moncash"}
                            onChange={(e) => setSignupData({ ...signupData, payment: e.target.value })}
                          />
                          MonCash
                        </label>
                        <label className="auth-radio flex items-center gap-2 p-3 border border-input rounded-lg bg-muted/50 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value="natcash"
                            checked={signupData.payment === "natcash"}
                            onChange={(e) => setSignupData({ ...signupData, payment: e.target.value })}
                          />
                          NatCash
                        </label>
                        <label className="auth-radio flex items-center gap-2 p-3 border border-input rounded-lg bg-muted/50 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value="carte"
                            checked={signupData.payment === "carte"}
                            onChange={(e) => setSignupData({ ...signupData, payment: e.target.value })}
                          />
                          Carte bancaire
                        </label>
                      </div>
                      <p className="auth-note text-xs text-muted-foreground mt-2">
                        Essai gratuit 7 jours, puis ~200 HTG / mois.
                      </p>
                    </div>

                    <Button type="submit" disabled={isSigningUp} className="auth-btn-submit w-full mt-6">
                      {isSigningUp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        "Créer mon compte"
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
