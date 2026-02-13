

# Auth System Restructuring Plan

## Current Architecture Problems

### Problem 1: Forced Sign-Out After Signup Creates Friction
After completing Step 3, `signup.service.ts` calls `supabase.auth.signOut()` (line 142). The user is then redirected to `/auth/verify-email`. After verifying their email, `VerifyEmailPage.tsx` navigates to `/auth/login` (line 78), forcing the user to re-enter email and password manually. This is the root cause of the "re-enter credentials" complaint.

### Problem 2: Device Trust Not Working After Email Verification
The `verify_email_code` RPC correctly inserts a trusted device record. However, when the user then logs in on `LoginPage.tsx`, the `isDeviceTrusted()` call (line 190) queries `user_trusted_devices` using the **current browser's fingerprint**. If the fingerprint generated at verification time differs even slightly from the fingerprint generated at login time (which can happen due to timing, tab switches, or canvas rendering differences), the device won't be found. The user then sees "Nouvel appareil detecte" -- a second OTP prompt.

### Problem 3: Gift Payment Activation Works But Is Invisible to User
The `verify-gift-payment` edge function correctly activates subscriptions. However, if the student is already logged in, their cached `subscription-status` query (5-minute stale time) doesn't refresh. The `PendingGiftPrompt` continues showing until the cache expires.

### Problem 4: State Machine is Spread Across Multiple Systems
Auth state lives in: `localStorage` (authFlow.store), Supabase session, `SessionAuthContext`, `AuthRouteGuard`, and individual page components. This makes debugging impossible and creates race conditions.

## Proposed Solution: Eliminate Sign-Out During Signup

The core fix follows the user's guideline: **keep the user logged in through verification** and eliminate the re-login step entirely. This removes the device trust problem as a side effect (no login = no device check).

### Phase 1: Keep User Session After Signup (Critical Fix)

**File: `src/auth/services/signup.service.ts`**

Remove the `supabase.auth.signOut()` call after account creation. Instead, keep the Supabase session alive but gate access via `email_confirmed` check.

Changes:
- Remove line 142: `await supabase.auth.signOut()`
- Keep the `saveAuthFlow({ flow: 'verify' })` call so the guard still redirects to verify page
- The user stays authenticated but unverified

### Phase 2: Update Email Verification to Auto-Navigate to Dashboard

**File: `src/auth/routes/VerifyEmailPage.tsx`**

After successful verification, instead of navigating to `/auth/login`, directly navigate to `/dashboard`. The user is already logged in (session survived from signup).

Changes:
- Line 76-78: Change from toast + navigate to login --> toast + navigate to dashboard
- Remove the `clearAuthFlow()` before navigation (let the guard handle it)

### Phase 3: Update AuthRouteGuard for Unverified-But-Authenticated Users

**File: `src/auth/guards/AuthRouteGuard.tsx`**

Currently, Rule 2 (lines 53-72) signs out unverified users. Instead, redirect them to verify-email without signing out.

Changes:
- Remove the `await supabase.auth.signOut()` in Rule 2
- Keep the redirect to `/auth/verify-email`
- The verify page now works because the user has a valid session AND the authFlow state

### Phase 4: Update Login Service for Edge Cases

**File: `src/auth/services/login.service.ts`**

The login service signs out unverified users (lines 147-186). This is still needed for users who come back later without a session. But now the verification page can detect if the user has an active session.

Changes:
- Keep the existing behavior for login (sign out unverified users, send new code, redirect to verify)
- This only triggers when a user manually tries to log in with unverified email

### Phase 5: Update VerifyEmailPage to Handle Both Flows

**File: `src/auth/routes/VerifyEmailPage.tsx`**

The verify page needs to handle two scenarios:
1. **New signup** (user has active session) -- verify, then go to dashboard
2. **Returning user** (no session, only authFlow state) -- verify, then go to login

Changes:
- Check if user has an active Supabase session
- If session exists: after verification, navigate to `/dashboard`
- If no session (came from login redirect): after verification, navigate to `/auth/login`

### Phase 6: Gift Payment Real-Time Refresh

**File: `src/components/SubscriptionGate.tsx`**

Add a polling mechanism to detect when a gift payment is completed while the user is on the `PendingGiftPrompt`.

Changes:
- Add `refetchInterval: 30000` (30 seconds) to the subscription-status query when status is `pending_gift`
- This way, when the family member pays, the student's screen auto-refreshes within 30 seconds

---

## Technical Details

### Changes Summary

| File | Change | Risk |
|---|---|---|
| `signup.service.ts` | Remove `signOut()` after account creation | Low -- user stays authed but gated by email_confirmed |
| `VerifyEmailPage.tsx` | Navigate to dashboard if session exists, login if not | Low -- two clear paths |
| `AuthRouteGuard.tsx` | Don't sign out unverified users, just redirect to verify | Low -- verify page handles both states |
| `SubscriptionGate.tsx` | Add 30s polling for pending_gift status | None -- only adds a periodic refetch |
| `login.service.ts` | No changes needed -- existing flow handles returning unverified users | None |

### Flow After Changes

**New Signup (Happy Path):**
1. User completes Step 3 --> account created, session kept alive
2. Redirect to `/auth/verify-email` with authFlow state
3. User enters OTP code --> `verify_email_code` RPC runs (email_confirmed=true, device trusted)
4. Navigate directly to `/dashboard` -- NO re-login, NO device check
5. SubscriptionGate checks status: `pending_gift` shows prompt, `active` shows dashboard

**Returning Unverified User (Edge Case):**
1. User tries to log in with unverified email
2. Login service signs them out, sends new code, saves authFlow
3. Redirect to `/auth/verify-email` 
4. After verification, navigate to `/auth/login` (no active session)
5. User logs in normally, device already trusted from verification

**Gift Payment Activation:**
1. Family member pays via Stripe on `/gift/pay/:token`
2. `verify-gift-payment` edge function activates subscription
3. Student's SubscriptionGate polls every 30s, detects `active` status
4. PendingGiftPrompt disappears, dashboard loads

### Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- login flow for already-verified users unchanged |
| Works with existing data? | Yes -- no schema changes |
| Optimized for 3G? | Yes -- eliminates one round-trip (login) and one email (device OTP) |
| Edge cases handled? | Yes -- returning unverified users still work via login service |
| Backward compatible? | Yes -- existing verified users login normally |

