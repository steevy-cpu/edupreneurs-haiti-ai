/**
 * Signup Service - Business logic for user registration
 */

import { supabase } from "@/integrations/supabase/client";
import { signupSchema } from "@/lib/authValidation";
import { generateConfirmationCode } from "@/utils/emailService";
import { saveAuthFlow, clearSignupProgress, type SignupFormData } from "../store/authFlow.store";
import { validateUserText } from "@/lib/textModeration";

export interface SignupResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Validate step 1 data (account info)
 */
export function validateStep1(data: SignupFormData): { valid: boolean; error?: string } {
  if (!data.email || !data.emailConfirm || !data.password) {
    return { valid: false, error: "Veuillez remplir tous les champs" };
  }
  if (data.email !== data.emailConfirm) {
    return { valid: false, error: "Les emails ne correspondent pas" };
  }
  if (data.password.length < 8) {
    return { valid: false, error: "Le mot de passe doit contenir au moins 8 caractères" };
  }
  if (!/[0-9]/.test(data.password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins un chiffre" };
  }
  if (!/[A-Z]/.test(data.password)) {
    return { valid: false, error: "Le mot de passe doit contenir au moins une majuscule" };
  }
  return { valid: true };
}

/**
 * Validate step 2 data (profile info)
 */
export function validateStep2(data: SignupFormData): { valid: boolean; error?: string } {
  if (!data.nickname || data.nickname.length < 3) {
    return { valid: false, error: "Le pseudo doit contenir au moins 3 caractères" };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(data.nickname)) {
    return { valid: false, error: "Le pseudo ne peut contenir que des lettres, chiffres et underscores" };
  }
  
  // Content moderation for nickname
  const nicknameCheck = validateUserText(data.nickname, 'nickname');
  if (!nicknameCheck.valid) {
    return { valid: false, error: nicknameCheck.error };
  }
  
  // Content moderation for fullName (if provided)
  if (data.fullName && data.fullName.trim().length > 0) {
    const fullNameCheck = validateUserText(data.fullName, 'fullName');
    if (!fullNameCheck.valid) {
      return { valid: false, error: fullNameCheck.error };
    }
  }
  
  if (!data.academicGrade) {
    return { valid: false, error: "Veuillez sélectionner votre niveau académique" };
  }
  if (!data.gender) {
    return { valid: false, error: "Veuillez sélectionner votre genre" };
  }
  // School validation - skip for NONE grade
  if (data.academicGrade !== 'NONE' && (!data.school || data.school.trim().length === 0)) {
    const schoolLabel = data.academicGrade === 'UNIV' ? 'université' : 'école';
    return { valid: false, error: `Veuillez entrer le nom de votre ${schoolLabel}` };
  }
  return { valid: true };
}

/**
 * Validate step 3 data (finalization)
 */
export function validateStep3(data: SignupFormData): { valid: boolean; error?: string } {
  const accessMethod = data.accessMethod || 'promo';
  
  if (accessMethod === 'promo') {
    if (!data.promoCodeValid) {
      return { valid: false, error: "Veuillez entrer un code promotionnel valide" };
    }
  } else if (accessMethod === 'moncash') {
    if (!data.paymentCompleted) {
      return { valid: false, error: "Veuillez compléter le paiement MonCash" };
    }
  }
  
  if (!data.privacy) {
    return { valid: false, error: "Vous devez accepter les politiques de confidentialité" };
  }
  return { valid: true };
}

/**
 * Complete signup process
 */
export async function createAccount(data: SignupFormData, referralCode?: string): Promise<SignupResult> {
  // Final validation
  const fullData = {
    email: data.email!,
    emailConfirm: data.emailConfirm!,
    fullName: data.fullName || '',
    nickname: data.nickname!,
    academicGrade: data.academicGrade!,
    phoneNumber: data.phoneNumber || '',
    password: data.password!,
    school: data.school || '',
    gender: data.gender!,
    dateOfBirth: data.dateOfBirth || '',
    privacy: data.privacy!,
    payment: 'promo_code',
  };

  const validation = signupSchema.safeParse(fullData);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message };
  }

  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email!,
      password: data.password!,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Échec de la création du compte");

    const confirmationCode = generateConfirmationCode();

    // Determine subscription fields based on access method
    const accessMethod = data.accessMethod || 'promo';
    const isMonCash = accessMethod === 'moncash' && data.paymentCompleted;
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: data.fullName || data.nickname!,
        nickname: data.nickname,
        academic_grade: data.academicGrade!,
        phone_number: data.phoneNumber,
        school: data.school,
        gender: data.gender,
        date_of_birth: data.dateOfBirth || null,
        email_confirmed: false,
        phone_confirmed: false,
        confirmation_code: confirmationCode.trim(),
        promo_code_used: data.promoCode?.toUpperCase().trim() || null,
        promo_code_used_at: data.promoCode ? new Date().toISOString() : null,
        has_free_access: data.promoGrantsFreeAccess || false,
        // Subscription fields for MonCash users
        subscription_status: isMonCash ? 'active' : 'none',
        subscription_end_date: isMonCash ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        payment_order_id: isMonCash ? data.paymentOrderId : null,
      } as any);

    if (profileError) throw profileError;

    // Handle referral if provided
    if (referralCode) {
      await handleReferral(authData.user.id, referralCode);
    }

    // Send confirmation email
    await supabase.functions.invoke('send-confirmation-email', {
      body: {
        email: data.email,
        fullName: data.fullName || data.nickname,
        nickname: data.nickname,
        academicGrade: data.academicGrade,
        confirmationCode: confirmationCode,
      }
    });

    // Sign out - user must verify email first
    await supabase.auth.signOut();

    // Persist verification flow state - CRITICAL for OTP fix
    saveAuthFlow({
      flow: 'verify',
      pendingUserId: authData.user.id,
      email: data.email,
    });

    // Clear signup form data after successful creation
    clearSignupProgress();

    return { success: true, userId: authData.user.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Handle referral tracking
 */
async function handleReferral(newUserId: string, referralCode: string): Promise<void> {
  try {
    const { data: referrerProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", referralCode)
      .single();

    if (!referrerProfile) return;

    const { data: newUserProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", newUserId)
      .single();

    if (!newUserProfile) return;

    await supabase.from("referrals").insert({
      referrer_id: referrerProfile.id,
      referred_id: newUserProfile.id,
      status: "pending",
    });

    await supabase
      .from("profiles")
      .update({ referred_by: referrerProfile.id })
      .eq("id", newUserProfile.id);
  } catch (error) {
    console.error('Referral tracking error:', error);
  }
}

/**
 * Check nickname availability
 */
export async function checkNicknameAvailability(nickname: string): Promise<boolean | null> {
  if (!nickname || nickname.length < 3 || !/^[a-zA-Z0-9_]+$/.test(nickname)) {
    return null;
  }

  try {
    const { data, error } = await supabase.rpc('check_nickname_available', {
      nickname_input: nickname
    });

    if (error) throw error;
    return data === true;
  } catch (error) {
    console.error('Nickname check error:', error);
    return null;
  }
}
