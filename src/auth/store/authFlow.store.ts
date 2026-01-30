/**
 * AuthFlow Store - Persistent authentication flow state
 * 
 * CRITICAL: This store enables auth flows to survive:
 * - Page refreshes
 * - Browser tab switches
 * - Returning from email app
 * - Browser close/reopen (within TTL)
 * 
 * Fixes the OTP bypass issue by persisting verification state.
 */

export type AuthFlowType = 'idle' | 'signup' | 'login' | 'verify' | 'forgot-password';

export interface AuthFlowState {
  flow: AuthFlowType;
  pendingUserId?: string;
  email?: string;
  step?: number; // For multi-step signup (1, 2, 3)
  expiresAt?: number; // Unix timestamp in milliseconds
  referralCode?: string;
}

const AUTH_FLOW_KEY = 'edupreneurs_auth_flow';
const SIGNUP_DATA_KEY = 'edupreneurs_signup_data';

// TTL configurations
const VERIFY_TTL_MS = 60 * 60 * 1000; // 60 minutes for verification (extended for 3G users)
const SIGNUP_TTL_MS = 30 * 60 * 1000; // 30 minutes for signup flow

/**
 * Save auth flow state to sessionStorage
 */
export function saveAuthFlow(state: Partial<AuthFlowState>): void {
  try {
    const current = getAuthFlow();
    const merged: AuthFlowState = {
      ...current,
      ...state,
      // Set expiration based on flow type
      expiresAt: state.flow === 'verify' 
        ? Date.now() + VERIFY_TTL_MS 
        : Date.now() + SIGNUP_TTL_MS,
    };
    localStorage.setItem(AUTH_FLOW_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Failed to save auth flow:', error);
  }
}

/**
 * Get auth flow state from sessionStorage
 * Returns null if expired or not found
 */
export function getAuthFlow(): AuthFlowState | null {
  try {
    const stored = localStorage.getItem(AUTH_FLOW_KEY);
    if (!stored) return null;
    
    const state: AuthFlowState = JSON.parse(stored);
    
    // Check expiration
    if (state.expiresAt && Date.now() > state.expiresAt) {
      clearAuthFlow();
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Failed to get auth flow:', error);
    return null;
  }
}

/**
 * Clear auth flow state
 */
export function clearAuthFlow(): void {
  try {
    localStorage.removeItem(AUTH_FLOW_KEY);
  } catch (error) {
    console.error('Failed to clear auth flow:', error);
  }
}

/**
 * Check if current flow is valid (not expired)
 */
export function isFlowValid(): boolean {
  const flow = getAuthFlow();
  return flow !== null && flow.flow !== 'idle';
}

/**
 * Check if there's a pending verification
 */
export function hasPendingVerification(): boolean {
  const flow = getAuthFlow();
  return flow !== null && flow.flow === 'verify' && !!flow.pendingUserId;
}

// ============= Signup Data Persistence =============
// Separate from auth flow - holds form data during multi-step signup

export interface SignupFormData {
  email?: string;
  emailConfirm?: string;
  fullName?: string;
  nickname?: string;
  academicGrade?: string;
  phoneNumber?: string;
  password?: string;
  school?: string;
  gender?: string;
  dateOfBirth?: string;
  privacy?: boolean;
  promoCode?: string;
  promoCodeValid?: boolean;
  promoGrantsFreeAccess?: boolean;
}

/**
 * Save signup progress to sessionStorage
 */
export function saveSignupProgress(data: Partial<SignupFormData>): void {
  try {
    const existing = getSignupProgress();
    const merged = { ...existing, ...data };
    localStorage.setItem(SIGNUP_DATA_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Failed to save signup progress:', error);
  }
}

/**
 * Get signup progress from sessionStorage
 */
export function getSignupProgress(): SignupFormData {
  try {
    const stored = localStorage.getItem(SIGNUP_DATA_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to get signup progress:', error);
    return {};
  }
}

/**
 * Clear signup progress
 */
export function clearSignupProgress(): void {
  try {
    localStorage.removeItem(SIGNUP_DATA_KEY);
  } catch (error) {
    console.error('Failed to clear signup progress:', error);
  }
}

/**
 * Clear all auth-related storage (flow + signup data)
 */
export function clearAllAuthStorage(): void {
  clearAuthFlow();
  clearSignupProgress();
}
