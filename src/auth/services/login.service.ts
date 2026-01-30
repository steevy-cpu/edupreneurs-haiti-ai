/**
 * Login Service - Business logic for authentication
 */

import { supabase } from "@/integrations/supabase/client";
import { getFullDeviceIdentifier } from "@/utils/deviceFingerprint";
import { generateConfirmationCode } from "@/utils/emailService";
import { loginSchema } from "@/lib/authValidation";
import { saveAuthFlow } from "../store/authFlow.store";
import { isDeviceTrusted, createDeviceChallenge } from "./device-verify.service";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  requiresVerification?: boolean;
  requiresDeviceVerification?: boolean;
  deviceChallengeId?: string;
  pendingUserId?: string;
  userId?: string;
  error?: string;
  profile?: {
    full_name?: string;
    nickname?: string;
    academic_grade?: string;
    email_confirmed?: boolean;
  };
}

/**
 * Validate login credentials
 */
export function validateLoginCredentials(credentials: LoginCredentials): { valid: boolean; error?: string } {
  const result = loginSchema.safeParse(credentials);
  if (!result.success) {
    return { valid: false, error: result.error.errors[0]?.message };
  }
  return { valid: true };
}

/**
 * Attempt login with Supabase
 */
export async function loginWithEmail(credentials: LoginCredentials): Promise<LoginResult> {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!authData.user) {
    return { success: false, error: "Échec de connexion" };
  }

  // Fetch profile to check email_confirmed
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email_confirmed, full_name, nickname, academic_grade')
    .eq('user_id', authData.user.id)
    .single();

  if (profileError) {
    // Don't block login if profile fetch fails
    console.error('Profile fetch error:', profileError);
  }

  // Check if email is verified
  if (profile && !profile.email_confirmed) {
    // Generate new verification code
    const newCode = generateConfirmationCode();
    
    await supabase
      .from('profiles')
      .update({ confirmation_code: newCode.trim() })
      .eq('user_id', authData.user.id);
    
    // Sign out immediately - can't proceed without verification
    await supabase.auth.signOut();
    
    // Send verification email
    try {
      await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: credentials.email,
          fullName: profile.full_name || profile.nickname,
          nickname: profile.nickname || '',
          academicGrade: profile.academic_grade || '',
          confirmationCode: newCode,
        }
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // Persist verification flow state - CRITICAL for OTP fix
    saveAuthFlow({
      flow: 'verify',
      pendingUserId: authData.user.id,
      email: credentials.email,
    });

    return {
      success: false,
      requiresVerification: true,
      pendingUserId: authData.user.id,
      profile,
    };
  }

  // Check if device is trusted (after email is verified)
  const deviceTrusted = await isDeviceTrusted(authData.user.id);
  
  if (!deviceTrusted) {
    // Unknown or untrusted device - require step-up verification
    // Sign out to prevent access before verification
    await supabase.auth.signOut();
    
    // Create device challenge
    const challengeResult = await createDeviceChallenge(
      authData.user.id,
      credentials.email,
      profile?.full_name || profile?.nickname || 'Utilisateur'
    );
    
    if (!challengeResult.success) {
      return { success: false, error: challengeResult.error };
    }
    
    // Persist device verification flow state
    saveAuthFlow({
      flow: 'verify-device',
      pendingUserId: authData.user.id,
      email: credentials.email,
      deviceChallengeId: challengeResult.challengeId,
      fullName: profile?.full_name,
    });
    
    return {
      success: false,
      requiresDeviceVerification: true,
      pendingUserId: authData.user.id,
      deviceChallengeId: challengeResult.challengeId,
      profile,
    };
  }

  return { success: true, userId: authData.user.id, profile: profile || undefined };
}

/**
 * Handle device tracking for login notifications
 * @param userId - The user's ID
 * @param email - The user's email
 * @param fullName - The user's full name
 * @param trustDevice - Whether the user wants to trust this device (skip future verification)
 */
export async function handleDeviceTracking(
  userId: string,
  email: string,
  fullName: string,
  trustDevice: boolean = false
): Promise<void> {
  try {
    const deviceInfo = getFullDeviceIdentifier();
    
    const { data: existingDevice } = await supabase
      .from('user_trusted_devices')
      .select('id, is_trusted')
      .eq('user_id', userId)
      .eq('device_fingerprint', deviceInfo.fingerprint)
      .maybeSingle();
    
    if (existingDevice) {
      // Known device - update last login and trust status if requested
      await supabase
        .from('user_trusted_devices')
        .update({ 
          last_login_at: new Date().toISOString(),
          // Only upgrade trust, never downgrade
          is_trusted: existingDevice.is_trusted || trustDevice,
        })
        .eq('id', existingDevice.id);
      return;
    }

    // Check for same physical device (different browser)
    const { data: sameHardwareDevices } = await supabase
      .from('user_trusted_devices')
      .select('id, browser, hardware_fingerprint')
      .eq('user_id', userId)
      .eq('hardware_fingerprint', deviceInfo.hardwareFingerprint)
      .limit(5);
    
    const isSamePhysicalDevice = (sameHardwareDevices && sameHardwareDevices.length > 0) || false;
    
    // Register new device with trust status
    await supabase
      .from('user_trusted_devices')
      .insert({
        user_id: userId,
        device_fingerprint: deviceInfo.fingerprint,
        hardware_fingerprint: deviceInfo.hardwareFingerprint,
        device_name: deviceInfo.deviceName,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        is_trusted: trustDevice,
      });
    
    // Send notification for new physical device only
    if (!isSamePhysicalDevice) {
      const timestamp = new Date().toLocaleString('fr-FR', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
      
      await supabase.functions.invoke('send-login-notification', {
        body: {
          email,
          fullName,
          timestamp,
          device: deviceInfo.deviceName,
          browser: deviceInfo.browser,
        }
      });
    }
  } catch (error) {
    console.error('Device tracking error:', error);
  }
}
