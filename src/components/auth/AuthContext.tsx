import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback, ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateConfirmationCode } from "@/utils/emailService";

export type AuthTab = "login" | "signup" | "verify" | "forgot-password";

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  emailConfirm: string;
  fullName: string;
  nickname: string;
  academicGrade: string;
  phoneNumber: string;
  password: string;
  school: string;
  gender: string;
  dateOfBirth: string;
  privacy: boolean;
  payment: string;
}

export interface AuthContextType {
  // Tab state
  activeTab: AuthTab;
  setActiveTab: (tab: AuthTab) => void;
  
  // Login state
  loginData: LoginData;
  setLoginData: (data: LoginData) => void;
  isLoggingIn: boolean;
  setIsLoggingIn: (loading: boolean) => void;
  showLoginPassword: boolean;
  setShowLoginPassword: (show: boolean) => void;
  
  // Signup state
  signupData: SignupData;
  setSignupData: (data: SignupData | ((prev: SignupData) => SignupData)) => void;
  isSigningUp: boolean;
  setIsSigningUp: (loading: boolean) => void;
  showSignupPassword: boolean;
  setShowSignupPassword: (show: boolean) => void;
  signupStep: number;
  setSignupStep: (step: number) => void;
  totalSignupSteps: number;
  nicknameAvailable: boolean | null;
  setNicknameAvailable: (available: boolean | null) => void;
  checkingNickname: boolean;
  setCheckingNickname: (checking: boolean) => void;
  
  // Promo code state
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoCodeValid: boolean;
  setPromoCodeValid: (valid: boolean) => void;
  showPromoInput: boolean;
  setShowPromoInput: (show: boolean) => void;
  isValidatingPromo: boolean;
  setIsValidatingPromo: (validating: boolean) => void;
  promoGrantsFreeAccess: boolean;
  promoNetworkError: boolean;
  setPromoNetworkError: (error: boolean) => void;
  setPromoGrantsFreeAccess: (grants: boolean) => void;
  
  // Verification state
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  pendingUserId: string | null;
  setPendingUserId: (id: string | null) => void;
  resendCooldown: number;
  setResendCooldown: (cooldown: number) => void;
  canResend: boolean;
  setCanResend: (can: boolean) => void;
  isResending: boolean;
  setIsResending: (resending: boolean) => void;
  isVerifying: boolean;
  setIsVerifying: (verifying: boolean) => void;
  
  // Forgot password state
  forgotPasswordEmail: string;
  setForgotPasswordEmail: (email: string) => void;
  isResettingPassword: boolean;
  setIsResettingPassword: (resetting: boolean) => void;
  
  // Referral
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  
  // Visitor
  showVisitorSelector: boolean;
  setShowVisitorSelector: (show: boolean) => void;
  
  // Helper refs
  nicknameCheckTimer: React.MutableRefObject<NodeJS.Timeout | undefined>;
  promoCodeCheckTimer: React.MutableRefObject<NodeJS.Timeout | undefined>;
  otpInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  
  // Utility functions
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  isValidNicknameFormat: (nickname: string) => boolean;
  passwordValidation: {
    hasMinLength: boolean;
    hasNumber: boolean;
    hasUppercase: boolean;
    hasSpecial: boolean;
  };
  validatePromoCode: (code: string) => Promise<{ valid: boolean; goldReward?: number; grantsFreeAccess?: boolean; networkError?: boolean }>;
  checkNicknameAvailability: (nickname: string) => void;
  debouncedValidatePromoCode: (code: string) => void;
  retryPromoValidation: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  
  // Login state
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Signup state
  const [signupData, setSignupData] = useState<SignupData>({
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
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const totalSignupSteps = 3;
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [checkingNickname, setCheckingNickname] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoGrantsFreeAccess, setPromoGrantsFreeAccess] = useState(false);
  const [promoNetworkError, setPromoNetworkError] = useState(false);
  
  // Verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Forgot password state
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Referral
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  // Visitor
  const [showVisitorSelector, setShowVisitorSelector] = useState(false);
  
  // Refs
  const nicknameCheckTimer = useRef<NodeJS.Timeout>();
  const promoCodeCheckTimer = useRef<NodeJS.Timeout>();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Helper function to validate nickname format
  const isValidNicknameFormat = (nickname: string): boolean => {
    return /^[a-zA-Z0-9_]*$/.test(nickname);
  };
  
  // Memoized password validation
  const passwordValidation = useMemo(() => ({
    hasMinLength: signupData.password.length >= 6,
    hasNumber: /[0-9]/.test(signupData.password),
    hasUppercase: /[A-Z]/.test(signupData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(signupData.password),
  }), [signupData.password]);
  
  // Smooth scroll to input on focus for mobile keyboards
  const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    requestAnimationFrame(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, []);
  
  // Validate promo code with server (with retry logic for network errors)
  const validatePromoCode = async (code: string, retries = 2): Promise<{ valid: boolean; goldReward?: number; grantsFreeAccess?: boolean; networkError?: boolean }> => {
    if (!code.trim()) return { valid: false, networkError: false };
    
    setIsValidatingPromo(true);
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase.functions.invoke('validate-promo-code', {
          body: { code: code.trim() }
        });
        
        if (error) {
          console.error(`Promo code validation error (attempt ${attempt + 1}):`, error);
          // Check if it's a network error
          if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed')) {
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, 500));
              continue;
            }
            return { valid: false, networkError: true };
          }
          return { valid: false, networkError: false };
        }
        
        return { 
          valid: data.valid, 
          goldReward: data.goldReward, 
          grantsFreeAccess: data.grantsFreeAccess,
          networkError: false 
        };
      } catch (error: any) {
        console.error(`Promo code validation failed (attempt ${attempt + 1}):`, error);
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        return { valid: false, networkError: true };
      }
    }
    
    setIsValidatingPromo(false);
    return { valid: false, networkError: true };
  };
  
  // Check nickname availability
  const checkNicknameAvailability = (nickname: string) => {
    if (nicknameCheckTimer.current) {
      clearTimeout(nicknameCheckTimer.current);
    }

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
    }, 500);
  };
  
  // Debounced promo code validation
  const debouncedValidatePromoCode = useCallback((code: string) => {
    if (promoCodeCheckTimer.current) {
      clearTimeout(promoCodeCheckTimer.current);
    }

    // Reset network error on new input
    setPromoNetworkError(false);

    if (!code.trim() || code.trim().length < 3) {
      setPromoCodeValid(false);
      setPromoGrantsFreeAccess(false);
      setSignupData(prev => prev.payment === 'promo_code' ? { ...prev, payment: '' } : prev);
      return;
    }

    setIsValidatingPromo(true);

    promoCodeCheckTimer.current = setTimeout(async () => {
      const result = await validatePromoCode(code);
      setPromoCodeValid(result.valid);
      setPromoGrantsFreeAccess(result.grantsFreeAccess || false);
      setPromoNetworkError(result.networkError || false);
      
      if (result.valid) {
        setSignupData(prev => ({ ...prev, payment: 'promo_code' }));
      } else {
        setSignupData(prev => prev.payment === 'promo_code' ? { ...prev, payment: '' } : prev);
      }
      setIsValidatingPromo(false);
    }, 400); // Reduced from 600ms to 400ms for faster feedback
  }, []);

  // Retry promo validation (for manual retry button)
  const retryPromoValidation = useCallback(() => {
    if (promoCode.trim().length >= 3) {
      setPromoNetworkError(false);
      debouncedValidatePromoCode(promoCode);
    }
  }, [promoCode, debouncedValidatePromoCode]);
  
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
  
  // Check verification status on mount and handle URL params
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email_confirmed, user_id, full_name, nickname, academic_grade')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile && !profile.email_confirmed) {
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
            // Silent fail
          }
          
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
    
    const tabParam = searchParams.get("tab");
    if (tabParam === "signup") {
      setActiveTab("signup");
    } else if (tabParam === "login") {
      setActiveTab("login");
    }
    
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
      setActiveTab("signup");
      toast({
        title: "Code de parrainage détecté! 🎉",
        description: "Inscrivez-vous pour bénéficier du parrainage",
      });
    }
  }, [searchParams, toast]);
  
  const value: AuthContextType = {
    activeTab,
    setActiveTab,
    loginData,
    setLoginData,
    isLoggingIn,
    setIsLoggingIn,
    showLoginPassword,
    setShowLoginPassword,
    signupData,
    setSignupData,
    isSigningUp,
    setIsSigningUp,
    showSignupPassword,
    setShowSignupPassword,
    signupStep,
    setSignupStep,
    totalSignupSteps,
    nicknameAvailable,
    setNicknameAvailable,
    checkingNickname,
    setCheckingNickname,
    promoCode,
    setPromoCode,
    promoCodeValid,
    setPromoCodeValid,
    showPromoInput,
    setShowPromoInput,
    isValidatingPromo,
    setIsValidatingPromo,
    promoGrantsFreeAccess,
    setPromoGrantsFreeAccess,
    promoNetworkError,
    setPromoNetworkError,
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
    forgotPasswordEmail,
    setForgotPasswordEmail,
    isResettingPassword,
    setIsResettingPassword,
    referralCode,
    setReferralCode,
    showVisitorSelector,
    setShowVisitorSelector,
    nicknameCheckTimer,
    promoCodeCheckTimer,
    otpInputRefs,
    handleInputFocus,
    isValidNicknameFormat,
    passwordValidation,
    validatePromoCode,
    checkNicknameAvailability,
    debouncedValidatePromoCode,
    retryPromoValidation,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
