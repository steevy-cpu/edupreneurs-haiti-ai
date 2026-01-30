/**
 * Device Verification Service
 * 
 * Handles step-up verification for unknown/untrusted devices
 */

import { supabase } from "@/integrations/supabase/client";
import { getFullDeviceIdentifier } from "@/utils/deviceFingerprint";

export interface DeviceChallengeResult {
  success: boolean;
  challengeId?: string;
  error?: string;
}

export interface VerifyDeviceResult {
  success: boolean;
  userId?: string;
  error?: string;
  attemptsRemaining?: number;
}

export interface ResendDeviceCodeResult {
  success: boolean;
  error?: string;
}

/**
 * Check if the current device is trusted for a user
 */
export async function isDeviceTrusted(userId: string): Promise<boolean> {
  try {
    const deviceInfo = getFullDeviceIdentifier();
    
    const { data, error } = await supabase
      .from('user_trusted_devices')
      .select('is_trusted')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceInfo.fingerprint)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking device trust:', error);
      return false;
    }
    
    // Device is trusted only if explicitly marked as trusted
    return data?.is_trusted === true;
  } catch (error) {
    console.error('Error in isDeviceTrusted:', error);
    return false;
  }
}

/**
 * Check if the device exists (known device, may or may not be trusted)
 */
export async function isDeviceKnown(userId: string): Promise<boolean> {
  try {
    const deviceInfo = getFullDeviceIdentifier();
    
    const { data, error } = await supabase
      .from('user_trusted_devices')
      .select('id')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceInfo.fingerprint)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking device known:', error);
      return false;
    }
    
    return data !== null;
  } catch (error) {
    console.error('Error in isDeviceKnown:', error);
    return false;
  }
}

/**
 * Create a device verification challenge
 */
export async function createDeviceChallenge(
  userId: string,
  email: string,
  fullName: string
): Promise<DeviceChallengeResult> {
  try {
    const deviceInfo = getFullDeviceIdentifier();
    
    // Call RPC to create challenge
    const { data, error } = await supabase.rpc('create_device_challenge', {
      p_user_id: userId,
      p_device_fingerprint: deviceInfo.fingerprint,
      p_hardware_fingerprint: deviceInfo.hardwareFingerprint,
      p_device_name: deviceInfo.deviceName,
      p_browser: deviceInfo.browser,
      p_os: deviceInfo.os,
    });

    if (error) {
      console.error('Error creating device challenge:', error);
      return { success: false, error: 'Erreur lors de la création du défi' };
    }

    const result = data as { challenge_id: string; code: string };
    
    // Send verification email
    try {
      await supabase.functions.invoke('send-device-verification-email', {
        body: {
          email,
          fullName,
          verificationCode: result.code,
          deviceName: deviceInfo.deviceName,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
        },
      });
    } catch (emailError) {
      console.error('Failed to send device verification email:', emailError);
      // Don't fail the challenge creation if email fails
    }

    return {
      success: true,
      challengeId: result.challenge_id,
    };
  } catch (error) {
    console.error('Error in createDeviceChallenge:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Verify a device challenge code
 */
export async function verifyDeviceCode(
  challengeId: string,
  code: string,
  trustDevice: boolean
): Promise<VerifyDeviceResult> {
  try {
    const { data, error } = await supabase.rpc('verify_device_challenge', {
      p_challenge_id: challengeId,
      p_code: code,
      p_trust_device: trustDevice,
    });

    if (error) {
      console.error('Error verifying device code:', error);
      return { success: false, error: 'Erreur lors de la vérification' };
    }

    const result = data as {
      success: boolean;
      error?: string;
      user_id?: string;
      attempts_remaining?: number;
    };

    if (!result.success) {
      let errorMessage = 'Code incorrect';
      
      switch (result.error) {
        case 'challenge_not_found':
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 'challenge_expired':
          errorMessage = 'Le code a expiré. Demandez un nouveau code.';
          break;
        case 'already_verified':
          errorMessage = 'Ce code a déjà été utilisé.';
          break;
        case 'max_attempts_exceeded':
          errorMessage = 'Trop de tentatives. Veuillez vous reconnecter.';
          break;
        case 'invalid_code':
          errorMessage = `Code incorrect. ${result.attempts_remaining} tentative(s) restante(s).`;
          break;
      }

      return {
        success: false,
        error: errorMessage,
        attemptsRemaining: result.attempts_remaining,
      };
    }

    return {
      success: true,
      userId: result.user_id,
    };
  } catch (error) {
    console.error('Error in verifyDeviceCode:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}

/**
 * Resend device verification code
 */
export async function resendDeviceCode(
  challengeId: string,
  email: string
): Promise<ResendDeviceCodeResult> {
  try {
    const { data, error } = await supabase.rpc('resend_device_challenge', {
      p_challenge_id: challengeId,
    });

    if (error) {
      console.error('Error resending device code:', error);
      return { success: false, error: 'Erreur lors du renvoi du code' };
    }

    const result = data as {
      success: boolean;
      error?: string;
      code?: string;
      user_id?: string;
      device_name?: string;
      browser?: string;
    };

    if (!result.success) {
      return { success: false, error: 'Impossible de renvoyer le code' };
    }

    // Get device info for email
    const deviceInfo = getFullDeviceIdentifier();

    // Send new verification email
    try {
      await supabase.functions.invoke('send-device-verification-email', {
        body: {
          email,
          fullName: 'Utilisateur', // We don't have the name in resend
          verificationCode: result.code,
          deviceName: result.device_name || deviceInfo.deviceName,
          browser: result.browser || deviceInfo.browser,
        },
      });
    } catch (emailError) {
      console.error('Failed to send device verification email:', emailError);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in resendDeviceCode:', error);
    return { success: false, error: 'Erreur inattendue' };
  }
}
