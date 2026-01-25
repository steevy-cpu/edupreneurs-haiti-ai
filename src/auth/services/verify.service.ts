/**
 * Verification Service - Email verification business logic
 */

import { supabase } from "@/integrations/supabase/client";
import { verificationCodeSchema } from "@/lib/authValidation";
import { clearAuthFlow } from "../store/authFlow.store";

export interface VerifyResult {
  success: boolean;
  error?: string;
  fullName?: string;
  nickname?: string;
}

export interface ResendResult {
  success: boolean;
  error?: string;
  confirmationCode?: string;
  fullName?: string;
  nickname?: string;
  academicGrade?: string;
}

/**
 * Validate verification code format
 */
export function validateVerificationCode(code: string): { valid: boolean; error?: string } {
  if (!code || code.length !== 6) {
    return { valid: false, error: "Veuillez entrer un code à 6 chiffres" };
  }
  
  const result = verificationCodeSchema.safeParse({ code });
  if (!result.success) {
    return { valid: false, error: result.error.errors[0]?.message || "Format de code invalide" };
  }
  
  return { valid: true };
}

/**
 * Verify email with code
 */
export async function verifyEmailCode(userId: string, code: string): Promise<VerifyResult> {
  const validation = validateVerificationCode(code);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const { data, error } = await supabase.rpc('verify_email_code', {
      p_user_id: userId,
      p_code: code.trim()
    });

    if (error) throw error;

    const result = data as { success: boolean; error?: string; full_name?: string; nickname?: string };

    if (!result.success) {
      return { 
        success: false, 
        error: result.error || "Le code de vérification est incorrect" 
      };
    }

    // Clear auth flow state after successful verification
    clearAuthFlow();

    return {
      success: true,
      fullName: result.full_name,
      nickname: result.nickname,
    };
  } catch (error: any) {
    console.error("Verification error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(email: string, fullName: string, nickname: string): Promise<void> {
  try {
    await supabase.functions.invoke('send-welcome-email', {
      body: {
        email,
        fullName: fullName || nickname || 'Utilisateur',
        nickname: nickname || fullName || 'Utilisateur',
      }
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(userId: string, email: string): Promise<ResendResult> {
  try {
    const { data, error } = await supabase.rpc('resend_verification_code', {
      p_user_id: userId
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

    // Send the email
    await supabase.functions.invoke('send-confirmation-email', {
      body: {
        email,
        fullName: result.full_name || result.nickname || 'Utilisateur',
        nickname: result.nickname || '',
        academicGrade: result.academic_grade || '',
        confirmationCode: result.confirmation_code!,
      }
    });

    return {
      success: true,
      confirmationCode: result.confirmation_code,
      fullName: result.full_name,
      nickname: result.nickname,
      academicGrade: result.academic_grade,
    };
  } catch (error: any) {
    console.error("Resend error:", error);
    return { success: false, error: error.message };
  }
}
