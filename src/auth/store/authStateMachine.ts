/**
 * Auth State Machine - Centralized auth state derivation and routing
 * 
 * SINGLE SOURCE OF TRUTH for determining:
 * 1. What state the user is in (derived from session + profile + localStorage)
 * 2. What route they should be on
 * 3. Whether a transition is valid
 * 
 * This is a PURE utility — no React, no hooks, no side effects.
 */

import type { Session } from "@supabase/supabase-js";
import type { AuthFlowState } from "./authFlow.store";

// ============= State Types =============

export type AuthState =
  | 'unauthenticated'
  | 'signup_step1'
  | 'signup_step2'
  | 'signup_step3'
  | 'email_verification_pending'
  | 'device_verification_pending'
  | 'password_reset_required'
  | 'authenticated';

export interface DeriveInput {
  session: Session | null;
  emailConfirmed: boolean | null; // null = unknown/loading
  authFlow: AuthFlowState | null;
}

// ============= State Derivation =============

/**
 * Derive the current auth state from all available inputs.
 * Pure function — no side effects, no API calls.
 */
export function deriveAuthState(input: DeriveInput): AuthState {
  const { session, emailConfirmed, authFlow } = input;

  // Priority 1: Password reset lockout (persisted in localStorage)
  if (authFlow?.flow === 'password-reset-required' && authFlow.lockedEmail) {
    return 'password_reset_required';
  }

  // Priority 2: Pending device verification (persisted in localStorage)
  if (authFlow?.flow === 'verify-device' && authFlow.deviceChallengeId) {
    return 'device_verification_pending';
  }

  // Priority 3: Pending email verification
  // Can happen with OR without a session (signup keeps session, login may not)
  if (authFlow?.flow === 'verify' && authFlow.pendingUserId) {
    return 'email_verification_pending';
  }

  // Priority 4: Authenticated user with unverified email
  // (caught by AuthRouteGuard when no authFlow exists but session does)
  if (session && emailConfirmed === false) {
    return 'email_verification_pending';
  }

  // Priority 5: Fully authenticated — require explicit true (null = unknown, not verified)
  if (session && emailConfirmed === true) {
    return 'authenticated';
  }

  // Priority 6: Signup flow steps (no session yet, or navigating signup)
  if (authFlow?.flow === 'signup') {
    const step = authFlow.step || 1;
    if (step === 1) return 'signup_step1';
    if (step === 2) return 'signup_step2';
    if (step === 3) return 'signup_step3';
  }

  return 'unauthenticated';
}

// ============= Route Mapping =============

/**
 * Get the target route for a given auth state.
 * Returns null if the user can be on any auth page (e.g., unauthenticated browsing).
 */
export function getRouteForState(state: AuthState): string | null {
  switch (state) {
    case 'unauthenticated':
      return null; // Let them stay on whatever auth page they're on
    case 'signup_step1':
      return '/auth/signup/step-1';
    case 'signup_step2':
      return '/auth/signup/step-2';
    case 'signup_step3':
      return '/auth/signup/step-3';
    case 'email_verification_pending':
      return '/auth/verify-email';
    case 'device_verification_pending':
      return '/auth/verify-device';
    case 'password_reset_required':
      return '/auth/forgot-password';
    case 'authenticated':
      return '/dashboard';
    default:
      return null;
  }
}

// ============= Route Helpers =============

/**
 * Check if a route is an auth route (login, signup, verify, etc.)
 */
export function isAuthRoute(path: string): boolean {
  return path.startsWith('/auth');
}

/**
 * Check if the user should be redirected from their current route.
 * Returns the target route if redirect needed, null if current route is fine.
 */
export function getRedirectIfNeeded(
  state: AuthState,
  currentPath: string
): string | null {
  const targetRoute = getRouteForState(state);

  // No specific route required — user can stay where they are
  if (targetRoute === null) return null;

  // Already on the correct route
  if (currentPath === targetRoute) return null;

  // Authenticated users should leave auth pages
  if (state === 'authenticated' && isAuthRoute(currentPath)) {
    return targetRoute;
  }

  // Pending verification — must be on verify page
  if (state === 'email_verification_pending' && currentPath !== '/auth/verify-email') {
    return '/auth/verify-email';
  }

  // Pending device verification — must be on device verify page
  if (state === 'device_verification_pending' && currentPath !== '/auth/verify-device') {
    return '/auth/verify-device';
  }

  // Password reset required — redirect to forgot password
  if (state === 'password_reset_required' && currentPath !== '/auth/forgot-password') {
    return '/auth/forgot-password';
  }

  return null;
}
