/**
 * Verification Service - Email verification business logic
 */

import { supabase } from "@/integrations/supabase/client";
import { verificationCodeSchema } from "@/lib/authValidation";
import { clearAuthFlow, saveAuthFlow } from "../store/authFlow.store";
import { getFullDeviceIdentifier } from "@/utils/deviceFingerprint";

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
    // Get device info to auto-trust this device after email verification
    const deviceInfo = getFullDeviceIdentifier();
    
    // Cast to unknown to handle the updated RPC signature with device params
    const { data, error } = await (supabase.rpc as any)('verify_email_code', {
      p_user_id: userId,
      p_code: code.trim(),
      p_device_fingerprint: deviceInfo.fingerprint,
      p_hardware_fingerprint: deviceInfo.hardwareFingerprint,
      p_device_name: deviceInfo.deviceName,
      p_browser: deviceInfo.browser,
      p_os: deviceInfo.os,
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

/**
 * Recovery result interface
 */
export interface RecoveryResult {
  success: boolean;
  userId?: string;
  error?: string;
  errorCode?: 'email_not_found' | 'profile_not_found' | 'already_verified';
}

/**
 * Recover verification by email for expired sessions
 */
export async function recoverVerificationByEmail(email: string): Promise<RecoveryResult> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    
    const { data, error } = await supabase.rpc('recover_verification_by_email', {
      p_email: normalizedEmail
    });
    
    if (error) throw error;
    
    const result = data as { 
      success: boolean; 
      error?: string; 
      user_id?: string;
      full_name?: string;
      nickname?: string;
      academic_grade?: string;
      confirmation_code?: string;
    };
    
    if (!result.success) {
      return { 
        success: false, 
        error: result.error, 
        errorCode: result.error as RecoveryResult['errorCode']
      };
    }
    
    // Send new verification email
    await supabase.functions.invoke('send-confirmation-email', {
      body: {
        email: normalizedEmail,
        fullName: result.full_name || result.nickname || 'Utilisateur',
        nickname: result.nickname || '',
        academicGrade: result.academic_grade || '',
        confirmationCode: result.confirmation_code,
      }
    });
    
    // Save auth flow state
    saveAuthFlow({
      flow: 'verify',
      pendingUserId: result.user_id,
      email: normalizedEmail,
    });
    
    return { success: true, userId: result.user_id };
  } catch (error: any) {
    console.error('Recovery error:', error);
    return { success: false, error: error.message };
  }
}
