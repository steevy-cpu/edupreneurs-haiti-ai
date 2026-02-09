
# Fix: Auto-Trust Device After Email Verification

## Problem Statement

When a new user creates an account and verifies their email, they are immediately prompted with "Nouvel appareil détecté" on their first login attempt. This creates a poor user experience with **two consecutive OTP verifications**.

### Current Flow (Problematic)

```text
1. User signs up on Device A
2. User enters email OTP to verify email
3. User is redirected to login
4. User logs in
5. System checks isDeviceTrusted(userId) → FALSE (no device saved!)
6. User gets SECOND OTP for device verification
```

### Why This Happens

- During signup, the device is **never registered** in `user_trusted_devices`
- After email verification, the user is redirected to `/auth/login`
- On first login, `isDeviceTrusted()` returns `false` → triggers device verification flow

## Solution

**Auto-trust the signup device immediately after email verification is confirmed.**

The device the user verified their email on is implicitly trusted because:
1. They just proved ownership of the email on that device
2. They were physically present on that device during signup
3. Requiring another verification is redundant and frustrating

### Implementation Approach

We have two options for where to implement this:

| Option | Location | Pros | Cons |
|--------|----------|------|------|
| **A** | Frontend: `verify.service.ts` after `verifyEmailCode()` succeeds | Simple, immediate | Requires authenticated session (we don't have one) |
| **B** | Backend: `verify_email_code` RPC | Atomic, single transaction | Requires passing device info |

**Chosen: Option B (Backend RPC)**

Why? After email verification, the user is not authenticated (we signed them out during signup). Inserting into `user_trusted_devices` requires the user_id, which the RPC already has access to.

## Technical Implementation

### Phase 1: Modify Frontend to Pass Device Info

**File:** `src/auth/services/verify.service.ts`

Update `verifyEmailCode()` to:
1. Get the current device fingerprint
2. Pass it to the RPC call

```typescript
// Before
const { data, error } = await supabase.rpc('verify_email_code', {
  p_user_id: userId,
  p_code: code.trim()
});

// After
const deviceInfo = getFullDeviceIdentifier();

const { data, error } = await supabase.rpc('verify_email_code', {
  p_user_id: userId,
  p_code: code.trim(),
  p_device_fingerprint: deviceInfo.fingerprint,
  p_hardware_fingerprint: deviceInfo.hardwareFingerprint,
  p_device_name: deviceInfo.deviceName,
  p_browser: deviceInfo.browser,
  p_os: deviceInfo.os,
});
```

### Phase 2: Update Database RPC

**File:** New migration

Update `public.verify_email_code` to:
1. Accept optional device parameters
2. After marking email as confirmed, upsert the device as trusted

```sql
-- Updated function signature
CREATE OR REPLACE FUNCTION public.verify_email_code(
  p_user_id uuid,
  p_code text,
  p_device_fingerprint text DEFAULT NULL,
  p_hardware_fingerprint text DEFAULT NULL,
  p_device_name text DEFAULT NULL,
  p_browser text DEFAULT NULL,
  p_os text DEFAULT NULL
)
...
  -- After email confirmation succeeds:
  IF p_device_fingerprint IS NOT NULL THEN
    INSERT INTO public.user_trusted_devices (
      user_id, device_fingerprint, hardware_fingerprint,
      device_name, browser, os, is_trusted, last_login_at
    ) VALUES (
      p_user_id, p_device_fingerprint, p_hardware_fingerprint,
      p_device_name, p_browser, p_os, true, now()
    )
    ON CONFLICT (user_id, device_fingerprint) 
    DO UPDATE SET
      is_trusted = true,
      last_login_at = now();
  END IF;
```

## Files to Modify

| File | Change |
|------|--------|
| `src/auth/services/verify.service.ts` | Pass device info to RPC |
| New migration | Update `verify_email_code` RPC to accept device params and auto-trust |

## Expected Result After Fix

```text
1. User signs up on Device A
2. User enters email OTP to verify email
3. Backend: Device A is saved as trusted (is_trusted = true)
4. User is redirected to login
5. User logs in
6. System checks isDeviceTrusted(userId) → TRUE
7. User goes directly to dashboard (no second OTP!)
```

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - device params are optional (DEFAULT NULL) |
| Works with existing data? | Yes - existing verified users unaffected |
| Backward compatible? | Yes - old clients without device params still work |
| 3G performance impact? | Minimal - one extra upsert during verification |
| Security maintained? | Yes - device is only trusted after email is proven |
| Edge cases handled? | Yes - ON CONFLICT handles repeat verifications |

## Test Plan

1. **New Signup Flow:**
   - Create new account
   - Verify email
   - Login → should NOT see "Nouvel appareil détecté"
   - Check database: `user_trusted_devices` should have device with `is_trusted = true`

2. **Login from Different Device:**
   - After signup + verification on Device A
   - Login from Device B → SHOULD see device verification (expected behavior)

3. **Existing Users (Regression):**
   - Already verified user with no device saved
   - First login triggers device verification (unchanged behavior)
