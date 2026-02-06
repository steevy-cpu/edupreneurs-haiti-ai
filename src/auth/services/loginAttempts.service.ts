/**
 * Login Attempts Service - Tracks consecutive failed login attempts
 * 
 * Security: After 5 consecutive failures, user must reset password.
 * Email-based tracking prevents bypass via device switching.
 */

import { supabase } from "@/integrations/supabase/client";

export interface AttemptStatus {
  allowed: boolean;
  remainingAttempts: number;
  isLocked: boolean;
  lockMessage?: string;
}

export interface FailedLoginResult {
  newCount: number;
  isNowLocked: boolean;
  resetEmailSent: boolean;
  resetToken?: string;
  fullName?: string;
}

interface CheckLoginAttemptResponse {
  failed_count: number;
  locked_at: string | null;
}

interface RecordFailedLoginResponse {
  new_count: number;
  is_locked: boolean;
  reset_sent: boolean;
  token: string | null;
  full_name: string | null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_HOURS = 1;

/**
 * Check if login is allowed for this email
 */
export async function checkLoginAllowed(email: string): Promise<AttemptStatus> {
  try {
    // Use type assertion for new RPC until types are regenerated
    const { data, error } = await (supabase.rpc as any)('check_login_attempt', {
      p_email: email.toLowerCase().trim()
    });
    
    if (error) {
      console.error('Failed to check login attempts:', error);
      // On error, allow attempt (fail open for availability)
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS, isLocked: false };
    }
    
    const response = data as CheckLoginAttemptResponse | null;
    const failedCount = response?.failed_count ?? 0;
    const lockedAt = response?.locked_at;
    
    // Check if locked
    if (lockedAt) {
      const lockTime = new Date(lockedAt);
      const hoursSinceLock = (Date.now() - lockTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLock < LOCKOUT_DURATION_HOURS) {
        return {
          allowed: false,
          remainingAttempts: 0,
          isLocked: true,
          lockMessage: "Compte temporairement bloqué. Veuillez réinitialiser votre mot de passe.",
        };
      }
      // Lock expired, allow attempt but will be validated on successful login
    }
    
    const remaining = Math.max(0, MAX_ATTEMPTS - failedCount);
    
    return {
      allowed: remaining > 0 || !lockedAt,
      remainingAttempts: remaining,
      isLocked: !!lockedAt,
    };
  } catch (error) {
    console.error('Error checking login attempts:', error);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, isLocked: false };
  }
}

/**
 * Record a failed login attempt
 * Returns new count and whether account is now locked
 */
export async function recordFailedAttempt(email: string): Promise<FailedLoginResult> {
  try {
    // Use type assertion for new RPC until types are regenerated
    const { data, error } = await (supabase.rpc as any)('record_failed_login', {
      p_email: email.toLowerCase().trim()
    });
    
    if (error) {
      console.error('Failed to record login attempt:', error);
      return { newCount: 1, isNowLocked: false, resetEmailSent: false };
    }
    
    const response = data as RecordFailedLoginResponse | null;
    
    return {
      newCount: response?.new_count ?? 1,
      isNowLocked: response?.is_locked ?? false,
      resetEmailSent: response?.reset_sent ?? false,
      resetToken: response?.token ?? undefined,
      fullName: response?.full_name ?? undefined,
    };
  } catch (error) {
    console.error('Error recording failed attempt:', error);
    return { newCount: 1, isNowLocked: false, resetEmailSent: false };
  }
}

/**
 * Clear attempts on successful login
 */
export async function clearLoginAttempts(email: string): Promise<void> {
  try {
    // Use type assertion for new RPC until types are regenerated
    await (supabase.rpc as any)('clear_login_attempts', {
      p_email: email.toLowerCase().trim()
    });
  } catch (error) {
    console.error('Error clearing login attempts:', error);
    // Non-critical, don't block login
  }
}

/**
 * Send auto-reset email after lockout
 */
export async function sendLockoutResetEmail(
  email: string,
  fullName: string,
  token: string
): Promise<boolean> {
  try {
    const resetUrl = `${window.location.origin}/auth/reset-password?token=${token}`;
    
    const { error } = await supabase.functions.invoke('send-password-reset-email', {
      body: {
        email,
        fullName: fullName || 'Utilisateur',
        resetUrl,
        isLockout: true, // Flag for different email template text
      }
    });
    
    if (error) {
      console.error('Failed to send lockout reset email:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending lockout reset email:', error);
    return false;
  }
}
