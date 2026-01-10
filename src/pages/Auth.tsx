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
import { Loader2, Eye, EyeOff, KeyRound, Telescope } from "lucide-react";
import { loginSchema, signupSchema, forgotPasswordSchema, verificationCodeSchema, GRADE_OPTIONS } from "@/lib/authValidation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFullDeviceIdentifier, generateDeviceFingerprint } from "@/utils/deviceFingerprint";

import TypewriterText from "@/components/TypewriterText";
import { VisitorTypeSelector } from "@/components/visitor/VisitorTypeSelector";
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
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Server-side promo code validation
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoGrantsFreeAccess, setPromoGrantsFreeAccess] = useState(false);
  
  const validatePromoCode = async (code: string): Promise<{ valid: boolean; goldReward?: number; grantsFreeAccess?: boolean }> => {
    if (!code.trim()) return { valid: false };
    
    setIsValidatingPromo(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-promo-code', {
        body: { code: code.trim() }
      });
      
      if (error) {
        console.error('Promo code validation error:', error);
        return { valid: false };
      }
      
      return { valid: data.valid, goldReward: data.goldReward, grantsFreeAccess: data.grantsFreeAccess };
    } catch (error) {
      console.error('Promo code validation failed:', error);
      return { valid: false };
    } finally {
      setIsValidatingPromo(false);
    }
  };

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

      // Redirect to login
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

      // Smart login notification - only send email for truly new devices
      try {
        const deviceInfo = getFullDeviceIdentifier();
        
        // Check if this exact fingerprint is already trusted
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
          // Known device with exact fingerprint - just update last_login_at, NO EMAIL
          await supabase
            .from('user_trusted_devices')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', existingDevice.id);
          
          console.log('Known device login - no notification email sent');
        } else {
          // Check if this is the SAME physical device but different browser
          // using browser-agnostic hardware fingerprint (screen size, CPU cores, etc.)
          const { data: sameHardwareDevices } = await supabase
            .from('user_trusted_devices')
            .select('id, browser, hardware_fingerprint')
            .eq('user_id', authData.user.id)
            .eq('hardware_fingerprint', deviceInfo.hardwareFingerprint)
            .limit(5);
          
          // If user already has a device with same hardware fingerprint,
          // it's the same physical device with a different browser
          const isSamePhysicalDevice = (sameHardwareDevices && sameHardwareDevices.length > 0) || false;
          
          // Register this browser session with hardware fingerprint
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
            // Truly new device - send notification email
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
          } else {
            console.log('Same physical device (hardware fingerprint match), different browser - no notification email sent');
          }
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
        // Don't reveal if email exists - show generic success message
        toast({
          title: "Vérifiez votre boîte mail",
          description: "Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.",
        });
        setForgotPasswordEmail("");
        setActiveTab("login");
        return;
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
      // Show generic message for security (don't reveal if email exists)
      toast({
        title: "Vérifiez votre boîte mail",
        description: "Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation.",
      });
      setForgotPasswordEmail("");
      setActiveTab("login");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Debounce timer refs
  const nicknameCheckTimer = useRef<NodeJS.Timeout>();
  const promoCodeCheckTimer = useRef<NodeJS.Timeout>();

  // Helper function to validate nickname format (letters, numbers, underscores only)
  const isValidNicknameFormat = (nickname: string): boolean => {
    return /^[a-zA-Z0-9_]*$/.test(nickname);
  };

  const checkNicknameAvailability = async (nickname: string) => {
    // Clear previous timer
    if (nicknameCheckTimer.current) {
      clearTimeout(nicknameCheckTimer.current);
    }

    // Validate format first - don't check DB if format is invalid
    if (!isValidNicknameFormat(nickname)) {
      setNicknameAvailable(null);
      setCheckingNickname(false);
      return;
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

  // Debounced promo code validation
  const debouncedValidatePromoCode = (code: string) => {
    // Clear previous timer
    if (promoCodeCheckTimer.current) {
      clearTimeout(promoCodeCheckTimer.current);
    }

    if (!code.trim() || code.trim().length < 3) {
      setPromoCodeValid(false);
      setPromoGrantsFreeAccess(false);
      if (signupData.payment === 'promo_code') {
        setSignupData({ ...signupData, payment: '' });
      }
      return;
    }

    setIsValidatingPromo(true);

    // Debounce the API call - wait 600ms after user stops typing
    promoCodeCheckTimer.current = setTimeout(async () => {
      const result = await validatePromoCode(code);
      setPromoCodeValid(result.valid);
      setPromoGrantsFreeAccess(result.grantsFreeAccess || false);
      if (result.valid) {
        setSignupData(prev => ({ ...prev, payment: 'promo_code' }));
      } else if (signupData.payment === 'promo_code') {
        setSignupData(prev => ({ ...prev, payment: '' }));
      }
    }, 600);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // CRITICAL: Require valid promo code since payment methods are not ready yet
    if (!promoCodeValid) {
      toast({
        title: "Code promotionnel requis",
        description: "Veuillez entrer un code promotionnel valide pour créer votre compte. Les méthodes de paiement seront bientôt disponibles.",
        variant: "destructive",
      });
      return;
    }
    
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
          promo_code_used: promoCodeValid ? promoCode.toUpperCase().trim() : null,
          promo_code_used_at: promoCodeValid ? new Date().toISOString() : null,
          has_free_access: promoGrantsFreeAccess,
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
          <div className="auth-grid grid md:grid-cols-[1fr_1.2fr] gap-6 md:gap-8 w-full">
            {/* Encouraging Text Panel */}
            <aside className="auth-panel auth-info flex flex-col items-center justify-center text-center p-6 md:p-8 gap-4 md:gap-5">
              {/* Eric Image - smaller, integrated */}
              <img 
                src={authImage} 
                alt="Eric - Assistant EDUPRENEURS" 
                className="w-28 md:w-36 h-auto drop-shadow-lg" 
                loading="eager"
                decoding="async"
              />
              
              {/* Animated Encouraging Text */}
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground min-h-[2.5rem] md:min-h-[3rem]">
                  <TypewriterText 
                    phrases={[
                      "Prêt à apprendre? 🚀",
                      "Ton aventure commence ici! ✨",
                      "Apprends à ton rythme 📚",
                      "Réussis avec nous! 🎯",
                      "L'éducation sans limites 🌟"
                    ]}
                    typingSpeed={80}
                    deletingSpeed={40}
                    pauseDuration={2500}
                  />
                </h1>
                
                <p className="text-sm md:text-base text-muted-foreground animate-fade-in font-medium" 
                   style={{ animationDelay: '0.2s' }}>
                  Connectez-vous ou créez un compte pour commencer votre aventure éducative.
                </p>
                
                {/* Simple Badges */}
                <div className="flex flex-wrap justify-center gap-2 animate-fade-in" 
                     style={{ animationDelay: '0.4s' }}>
                  <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium">
                    ✨ 7 jours gratuits
                  </span>
                  <span className="px-3 py-1.5 bg-accent/20 text-foreground rounded-full text-xs md:text-sm font-medium">
                    🤖 IA personnalisée
                  </span>
                </div>
              </div>
            </aside>

            {/* Auth Card */}
            <section className="auth-panel auth-card bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              {/* Visitor Mode Button - Prominent Position */}
              {(activeTab === "login" || activeTab === "signup") && (
                <div className="px-5 pt-5 pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 py-5 border-2 border-dashed border-primary/40 text-primary font-medium
                               shadow-lg shadow-primary/25 animate-bounce-subtle
                               hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-xl
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
              )}
              
              {/* Tabs */}
              <div className="auth-tabs p-3 flex justify-center">
                {activeTab !== "verify" && activeTab !== "forgot-password" && (
                  <div className="relative flex bg-muted/50 rounded-xl p-1 w-fit">
                    {/* Sliding Background Indicator */}
                    <div 
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm transition-all duration-300 ease-out ${
                        activeTab === "login" ? "left-1" : "left-[calc(50%+2px)]"
                      }`}
                    />
                    
                    {/* Tab Buttons */}
                    <button
                      className={`relative z-10 flex-1 text-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                        activeTab === "login" 
                          ? "text-foreground" 
                          : "text-muted-foreground hover:text-foreground/80"
                      }`}
                      onClick={() => setActiveTab("login")}
                    >
                      Se connecter
                    </button>
                    <button
                      className={`relative z-10 flex-1 text-center py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors duration-200 ${
                        activeTab === "signup" 
                          ? "text-foreground" 
                          : "text-muted-foreground hover:text-foreground/80"
                      }`}
                      onClick={() => setActiveTab("signup")}
                    >
                      Créer un compte
                    </button>
                  </div>
                )}
                {activeTab === "forgot-password" && (
                  <div className="text-center py-3 font-bold text-primary">
                    Réinitialiser le mot de passe
                  </div>
                )}
                {activeTab === "verify" && (
                  <div className="text-center py-3 font-bold text-primary">
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
                            {signupData.nickname && !isValidNicknameFormat(signupData.nickname) && (
                              <p className="text-xs text-destructive">
                                Le pseudo ne peut contenir que des lettres, chiffres et underscores (pas d'emojis)
                              </p>
                            )}
                            {checkingNickname && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" /> Vérification...
                              </p>
                            )}
                            {nicknameAvailable === false && isValidNicknameFormat(signupData.nickname) && (
                              <p className="text-xs text-destructive">Ce pseudo est déjà utilisé</p>
                            )}
                            {nicknameAvailable === true && isValidNicknameFormat(signupData.nickname) && (
                              <p className="text-xs text-success">Ce pseudo est disponible ✓</p>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="signup-grade" className="text-sm text-muted-foreground">
                              Niveau académique *
                            </Label>
                            <Select
                              value={signupData.academicGrade}
                              onValueChange={(value) => setSignupData({ ...signupData, academicGrade: value })}
                            >
                              <SelectTrigger className="w-full bg-muted/50">
                                <SelectValue placeholder="Sélectionnez votre niveau..." />
                              </SelectTrigger>
                              <SelectContent className="bg-background border border-border z-50">
                                {GRADE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                              Numéro de téléphone (optionnel)
                            </Label>
                            <Input
                              id="signup-phone"
                              type="tel"
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
                              if (!signupData.nickname || !signupData.academicGrade || !signupData.gender || !signupData.school) {
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
                          <p className="text-sm text-muted-foreground">Entrez votre code promotionnel pour continuer</p>
                        </div>

                        {/* Promo Code Section - Now Primary and Required */}
                        <div className="space-y-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎁</span>
                            <strong className="text-sm">Code promotionnel *</strong>
                            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Requis</span>
                          </div>
                          <Input
                            type="text"
                            placeholder="Entrez votre code promotionnel"
                            value={promoCode}
                            onChange={(e) => {
                              const code = e.target.value;
                              setPromoCode(code);
                              debouncedValidatePromoCode(code);
                            }}
                            className="auth-input"
                          />
                          {promoCode && promoCode.trim().length >= 3 && !isValidatingPromo && (
                            <p className={`text-xs ${promoCodeValid ? 'text-success' : 'text-destructive'}`}>
                              {promoCodeValid ? '✓ Code valide ! Vous pouvez créer votre compte.' : '✗ Code invalide'}
                            </p>
                          )}
                          {isValidatingPromo && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Vérification...
                            </p>
                          )}
                          {!promoCode && (
                            <p className="text-xs text-muted-foreground">
                              Contactez-nous pour obtenir un code d'accès.
                            </p>
                          )}
                        </div>

                        {/* Payment Methods - Disabled for now */}
                        <div className="space-y-3 opacity-50">
                          <div className="flex items-center gap-2">
                            <strong className="block text-sm">Méthodes de paiement</strong>
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Bientôt disponible</span>
                          </div>
                          <div className="grid gap-2 pointer-events-none">
                            {[
                              { value: 'moncash', label: 'MonCash', icon: '📱' },
                              { value: 'natcash', label: 'NatCash', icon: '💳' },
                              { value: 'carte', label: 'Carte bancaire', icon: '💳' },
                            ].map((method) => (
                              <div 
                                key={method.value}
                                className="flex items-center gap-3 p-4 border rounded-lg border-input bg-muted/30"
                              >
                                <span className="text-xl grayscale">{method.icon}</span>
                                <span className="font-medium text-muted-foreground">{method.label}</span>
                                <span className="ml-auto text-xs text-muted-foreground">Bientôt</span>
                              </div>
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

    {/* Visitor Type Selector Modal */}
    <VisitorTypeSelector 
      open={showVisitorSelector} 
      onOpenChange={setShowVisitorSelector} 
    />
    </>
  );
}
