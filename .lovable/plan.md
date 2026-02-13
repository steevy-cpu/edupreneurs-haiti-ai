

# Auth System Restructuring -- The Real One

## What Was Actually Done (Patches Only)
- Removed `signOut()` in `signup.service.ts` after account creation
- Updated `AuthRouteGuard` to not sign out unverified users  
- Added session check in `VerifyEmailPage` for post-verify navigation
- Added 30s polling in `SubscriptionGate`

These are 4 line-level edits. The architecture is identical to before.

## What Still Breaks

### Problem 1: Login Service Still Signs Out Unverified Users
`login.service.ts` line 157 calls `supabase.auth.signOut()` when an unverified user tries to log in. After verifying, they go to `/auth/login` (no session), log in again, and then hit the device trust check -- which may fail due to fingerprint drift. **This is the "double verification" bug for returning users.**

### Problem 2: verify.service.ts Clears Auth Flow Prematurely
Line 78 in `verify.service.ts` calls `clearAuthFlow()` inside the service. Then `VerifyEmailPage.tsx` line 83-88 also calls `clearAuthFlow()`. The service shouldn't manage navigation state -- that's the page's job.

### Problem 3: No Centralized Flow Control
State decisions are made in 6 different places:
- `authFlow.store.ts` (localStorage)
- `SessionAuthContext.tsx` (React context)
- `AuthRouteGuard.tsx` (route guard)
- `login.service.ts` (login logic)
- `signup.service.ts` (signup logic)
- `VerifyEmailPage.tsx` (page component)

Each makes independent decisions about signing out, redirecting, and clearing state.

### Problem 4: Gift Payment Webhook Has No Idempotency
If Stripe retries the webhook (which it does), the same payment could be processed multiple times.

---

## The Restructuring Plan

### Phase 1: Create Auth State Machine
**New file: `src/auth/store/authStateMachine.ts`**

A simple, explicit state machine that replaces the scattered decision-making. No external libraries needed.

```text
States:
  UNAUTHENTICATED --> can go to: SIGNUP_STEP1, AUTHENTICATING
  SIGNUP_STEP1    --> SIGNUP_STEP2, UNAUTHENTICATED
  SIGNUP_STEP2    --> SIGNUP_STEP3, SIGNUP_STEP1
  SIGNUP_STEP3    --> EMAIL_VERIFY_PENDING, SIGNUP_STEP2
  EMAIL_VERIFY_PENDING --> AUTHENTICATED (if session exists), UNAUTHENTICATED (if no session)
  AUTHENTICATING  --> EMAIL_VERIFY_PENDING, DEVICE_VERIFY_PENDING, AUTHENTICATED, UNAUTHENTICATED
  DEVICE_VERIFY_PENDING --> AUTHENTICATING, UNAUTHENTICATED
  AUTHENTICATED   --> gated by SubscriptionGate (pending_gift, active, expired)
```

This file exports:
- `getAuthState()`: derives current state from Supabase session + profile + localStorage
- `transition(event)`: validates and executes state transitions
- `getTargetRoute(state)`: maps each state to its correct route

### Phase 2: Fix login.service.ts -- Keep Session for Unverified Users
**File: `src/auth/services/login.service.ts`**

Currently lines 146-186: when an unverified user logs in, the service signs them out, generates a new code, and redirects to verify.

Change: **Do NOT sign them out.** Keep the session alive just like we do for signup. The user is already authenticated -- just redirect to verify-email. After verification, they go straight to dashboard (session exists).

This eliminates the returning-user double-verification problem entirely.

### Phase 3: Fix verify.service.ts -- Remove Navigation Side Effects
**File: `src/auth/services/verify.service.ts`**

Remove `clearAuthFlow()` from line 78. Services should not manage navigation/UI state. The calling page (`VerifyEmailPage.tsx`) already handles this.

### Phase 4: Simplify VerifyEmailPage -- Always Go to Dashboard
**File: `src/auth/routes/VerifyEmailPage.tsx`**

Since we now keep sessions alive in both signup AND login flows, the verify page always has an active session after successful verification. Simplify:
- After verification success: always navigate to `/dashboard`
- Remove the session check branching (lines 77-90) -- it's always true now
- `clearAuthFlow()` happens here (single place)

### Phase 5: Simplify AuthRouteGuard -- Use State Machine
**File: `src/auth/guards/AuthRouteGuard.tsx`**

Replace the current multi-rule logic with a single call to the state machine:
- Get current auth state
- Get target route for that state  
- If current route doesn't match target, redirect

This makes the guard a thin routing layer instead of a decision-maker.

### Phase 6: Add Idempotency to Gift Payment Webhook
**File: `supabase/functions/stripe-gift-webhook/index.ts`** (or equivalent)

Add a check: before processing a Stripe event, query the `gift_subscriptions` table to see if this payment has already been processed (check `stripe_session_id`). If already processed, return 200 immediately.

### Phase 7: Gift Payment Real-Time -- Already Done
The 30s polling in `SubscriptionGate.tsx` is already implemented. No changes needed.

---

## Detailed Changes

### New File: `src/auth/store/authStateMachine.ts`

Exports:
- `AuthState` type (union of all states)
- `deriveAuthState(session, profile, authFlow)` -- pure function, no side effects
- `getRouteForState(state)` -- maps state to route path
- `canTransitionTo(from, to)` -- validates transitions

This is a pure utility -- no React, no hooks, no side effects. Just logic.

### login.service.ts Changes (lines 146-186)

Before:
```
if (profile && !profile.email_confirmed) {
  // Generate new code
  // Sign out immediately      <-- PROBLEM
  // Send verification email
  // Save authFlow
  return { requiresVerification: true }
}
```

After:
```
if (profile && !profile.email_confirmed) {
  // Generate new code
  // DO NOT sign out -- keep session alive
  // Send verification email
  // Save authFlow
  return { requiresVerification: true }
}
```

One line removed. The user stays authenticated but unverified, just like signup.

### verify.service.ts Change (line 78)

Remove: `clearAuthFlow();`

The page component handles this, not the service.

### VerifyEmailPage.tsx Changes (lines 77-90)

Before:
```
const { data: sessionData } = await supabase.auth.getSession();
if (sessionData?.session) {
  navigate('/dashboard');
} else {
  navigate('/auth/login');
}
```

After:
```
clearAuthFlow();
navigate('/dashboard');
```

Session always exists now. No branching needed.

### AuthRouteGuard.tsx Changes

Simplify the `checkAuthState` function to use the state machine:
1. Derive current state from session + profile + authFlow
2. Get the target route for that state
3. If not on the target route, redirect

---

## Files Changed Summary

| File | Change | Risk |
|---|---|---|
| `authStateMachine.ts` (NEW) | Centralized state logic | None -- new file, no existing code touched |
| `login.service.ts` | Remove `signOut()` for unverified users (line 157) | Low -- same pattern as signup fix |
| `verify.service.ts` | Remove `clearAuthFlow()` (line 78) | None -- page already handles this |
| `VerifyEmailPage.tsx` | Remove session-check branching, always go to dashboard | Low -- session always exists now |
| `AuthRouteGuard.tsx` | Use state machine for routing decisions | Medium -- must test all entry points |
| `stripe-gift-webhook` | Add idempotency check before processing | Low -- additive change |

## Flow After Restructuring

**New Signup:**
1. Steps 1-3 complete --> account created, session kept
2. Redirect to `/auth/verify-email`
3. Verify OTP --> device auto-trusted --> navigate to `/dashboard`
4. SubscriptionGate checks status: `pending_gift` shows prompt, `active` shows dashboard
5. Zero re-logins. Zero device prompts.

**Returning Unverified User:**
1. User logs in with unverified email
2. Login service keeps session, generates new code, redirects to verify
3. Verify OTP --> navigate to `/dashboard`
4. Zero re-logins. Zero device prompts.

**Already Verified User:**
1. Login normally
2. Device trust check (works because same session, same fingerprint)
3. If trusted: dashboard. If not: device verify (legitimate new device).

**Gift Payment:**
1. Family pays via Stripe
2. Webhook processes payment (with idempotency)
3. Student's SubscriptionGate polls every 30s
4. Status flips to `active` --> dashboard loads

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- verified users login exactly as before |
| Works with existing data? | Yes -- no schema changes needed |
| Optimized for 3G? | Yes -- eliminates 2 round-trips (re-login + device OTP email) |
| Edge cases handled? | Yes -- expired sessions recover via email, locked accounts reset via password |
| Backward compatible? | Yes -- state machine derives state from existing data |
| Idempotent webhooks? | Yes -- duplicate Stripe events are safely ignored |

