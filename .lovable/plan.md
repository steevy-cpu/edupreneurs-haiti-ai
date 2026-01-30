
# Phase 2: Step-Up Verification for Unknown Devices

## Overview

When a user logs in from an unknown or untrusted device, they must complete an additional OTP verification step before gaining access. This adds an extra layer of security to prevent unauthorized access even if credentials are compromised.

## Current System Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `user_trusted_devices` table | Exists | Has `is_trusted`, `device_fingerprint`, `hardware_fingerprint` columns |
| Device fingerprinting | Exists | `src/utils/deviceFingerprint.ts` - generates unique device IDs |
| Email OTP system | Exists | Used for email verification (`VerifyEmailPage.tsx`, `verify.service.ts`) |
| Login notification emails | Exists | `send-login-notification` edge function with Resend |
| Auth flow persistence | Exists | `authFlow.store.ts` with localStorage persistence |

---

## Architecture

### Flow Diagram

```text
User Login
    │
    ▼
┌─────────────────────────────────┐
│  Check credentials (existing)   │
└─────────────────┬───────────────┘
                  │
    ▼─────────────▼─────────────────▼
┌────────────────┐ ┌───────────────┐ ┌────────────────┐
│ Email not      │ │ Device is     │ │ Device is      │
│ verified       │ │ trusted       │ │ unknown/not    │
│                │ │               │ │ trusted        │
└───────┬────────┘ └───────┬───────┘ └───────┬────────┘
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌──────────────┐  ┌────────────────┐
│ Redirect to   │  │ Login        │  │ Generate OTP   │
│ /auth/verify- │  │ successful   │  │ Send email     │
│ email         │  │ → Dashboard  │  │ → Verify-      │
│               │  │              │  │   device page  │
└───────────────┘  └──────────────┘  └────────────────┘
```

---

## Database Schema

### New Table: `device_verification_challenges`

```sql
CREATE TABLE public.device_verification_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  hardware_fingerprint TEXT,
  verification_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 minutes'),
  verified_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  device_name TEXT,
  browser TEXT,
  os TEXT
);

-- RLS policies
ALTER TABLE device_verification_challenges ENABLE ROW LEVEL SECURITY;

-- Users can only read their own challenges
CREATE POLICY "Users can read own challenges"
  ON device_verification_challenges FOR SELECT
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_device_challenges_user_device 
  ON device_verification_challenges(user_id, device_fingerprint);
CREATE INDEX idx_device_challenges_expires 
  ON device_verification_challenges(expires_at);
```

---

## RPC Functions

### 1. Create Device Challenge

```sql
CREATE OR REPLACE FUNCTION create_device_challenge(
  p_user_id UUID,
  p_device_fingerprint TEXT,
  p_hardware_fingerprint TEXT,
  p_device_name TEXT,
  p_browser TEXT,
  p_os TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_code TEXT;
  v_challenge_id UUID;
BEGIN
  -- Delete expired challenges for this user
  DELETE FROM device_verification_challenges 
  WHERE user_id = p_user_id AND expires_at < now();
  
  -- Check if there's a recent unexpired challenge
  SELECT id INTO v_challenge_id
  FROM device_verification_challenges
  WHERE user_id = p_user_id 
    AND device_fingerprint = p_device_fingerprint
    AND expires_at > now()
    AND verified_at IS NULL
  LIMIT 1;
  
  -- If exists, regenerate code
  IF v_challenge_id IS NOT NULL THEN
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    UPDATE device_verification_challenges
    SET verification_code = v_code,
        created_at = now(),
        expires_at = now() + INTERVAL '15 minutes',
        attempts = 0
    WHERE id = v_challenge_id;
    
    RETURN jsonb_build_object('challenge_id', v_challenge_id, 'code', v_code);
  END IF;
  
  -- Create new challenge
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  INSERT INTO device_verification_challenges (
    user_id, device_fingerprint, hardware_fingerprint,
    verification_code, device_name, browser, os
  ) VALUES (
    p_user_id, p_device_fingerprint, p_hardware_fingerprint,
    v_code, p_device_name, p_browser, p_os
  ) RETURNING id INTO v_challenge_id;
  
  RETURN jsonb_build_object('challenge_id', v_challenge_id, 'code', v_code);
END;
$$;
```

### 2. Verify Device Challenge

```sql
CREATE OR REPLACE FUNCTION verify_device_challenge(
  p_challenge_id UUID,
  p_code TEXT,
  p_trust_device BOOLEAN DEFAULT false
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_challenge RECORD;
  v_user_id UUID;
BEGIN
  -- Get challenge
  SELECT * INTO v_challenge
  FROM device_verification_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'challenge_not_found');
  END IF;
  
  -- Check expiration
  IF v_challenge.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'challenge_expired');
  END IF;
  
  -- Check if already verified
  IF v_challenge.verified_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_verified');
  END IF;
  
  -- Check max attempts
  IF v_challenge.attempts >= v_challenge.max_attempts THEN
    RETURN jsonb_build_object('success', false, 'error', 'max_attempts_exceeded');
  END IF;
  
  -- Increment attempts
  UPDATE device_verification_challenges
  SET attempts = attempts + 1
  WHERE id = p_challenge_id;
  
  -- Verify code
  IF TRIM(v_challenge.verification_code) != TRIM(p_code) THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'invalid_code',
      'attempts_remaining', v_challenge.max_attempts - v_challenge.attempts - 1
    );
  END IF;
  
  -- Mark as verified
  UPDATE device_verification_challenges
  SET verified_at = now()
  WHERE id = p_challenge_id;
  
  -- Register/update trusted device
  INSERT INTO user_trusted_devices (
    user_id, device_fingerprint, hardware_fingerprint,
    device_name, browser, os, is_trusted, last_login_at
  ) VALUES (
    v_challenge.user_id, v_challenge.device_fingerprint,
    v_challenge.hardware_fingerprint, v_challenge.device_name,
    v_challenge.browser, v_challenge.os, p_trust_device, now()
  )
  ON CONFLICT (user_id, device_fingerprint) 
  DO UPDATE SET 
    is_trusted = p_trust_device,
    last_login_at = now();
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_challenge.user_id
  );
END;
$$;
```

---

## Edge Function: `send-device-verification-email`

New edge function to send device verification codes:

```typescript
// supabase/functions/send-device-verification-email/index.ts
// Similar to send-confirmation-email but with device-specific template
// Includes: device name, browser, timestamp, verification code
```

---

## Frontend Implementation

### 1. Update AuthFlow Store Types

**File: `src/auth/store/authFlow.store.ts`**

```typescript
export type AuthFlowType = 
  | 'idle' 
  | 'signup' 
  | 'login' 
  | 'verify' 
  | 'verify-device'  // NEW
  | 'forgot-password';

export interface AuthFlowState {
  flow: AuthFlowType;
  pendingUserId?: string;
  email?: string;
  step?: number;
  expiresAt?: number;
  referralCode?: string;
  // NEW fields for device verification
  deviceChallengeId?: string;
  deviceFingerprint?: string;
  rememberDevice?: boolean;
  fullName?: string;
}
```

### 2. New Service: `device-verify.service.ts`

**File: `src/auth/services/device-verify.service.ts`**

```typescript
export async function createDeviceChallenge(
  userId: string, 
  email: string,
  deviceInfo: DeviceInfo,
  fullName: string
): Promise<DeviceChallengeResult>

export async function verifyDeviceCode(
  challengeId: string,
  code: string,
  trustDevice: boolean
): Promise<VerifyDeviceResult>

export async function resendDeviceCode(
  challengeId: string,
  email: string
): Promise<ResendResult>
```

### 3. New Page: `VerifyDevicePage.tsx`

**File: `src/auth/routes/VerifyDevicePage.tsx`**

- Reuses OTP input pattern from `VerifyEmailPage.tsx`
- Shows device info (name, browser)
- "Trust this device" checkbox
- Resend code functionality
- Handles expired sessions with email recovery

### 4. Update Login Service

**File: `src/auth/services/login.service.ts`**

Add new return type and logic:

```typescript
export interface LoginResult {
  success: boolean;
  requiresVerification?: boolean;
  requiresDeviceVerification?: boolean;  // NEW
  deviceChallengeId?: string;            // NEW
  pendingUserId?: string;
  userId?: string;
  error?: string;
  profile?: { ... };
}
```

Update `loginWithEmail` to check device trust:
1. After credentials verified, check `user_trusted_devices`
2. If device not found OR `is_trusted = false`: trigger device verification
3. If device found AND `is_trusted = true`: proceed with login

### 5. Update LoginPage

**File: `src/auth/routes/LoginPage.tsx`**

Handle new `requiresDeviceVerification` response:

```typescript
if (result.requiresDeviceVerification) {
  saveAuthFlow({
    flow: 'verify-device',
    pendingUserId: result.pendingUserId,
    email: email,
    deviceChallengeId: result.deviceChallengeId,
    rememberDevice: rememberDevice,
    fullName: result.profile?.full_name,
  });
  navigate('/auth/verify-device');
  return;
}
```

### 6. Update AuthRouteGuard

**File: `src/auth/guards/AuthRouteGuard.tsx`**

Add handling for `verify-device` flow:

```typescript
// Rule: If there's a pending device verification, redirect
if (authFlow?.flow === 'verify-device' && currentPath !== '/auth/verify-device') {
  navigate('/auth/verify-device', { replace: true });
  return;
}
```

### 7. Update Route Registration

**File: Router config**

Add new route:

```typescript
<Route path="/auth/verify-device" element={<VerifyDevicePage />} />
```

---

## Implementation Order

| Step | Task | Files |
|------|------|-------|
| 1 | Create `device_verification_challenges` table | Migration |
| 2 | Create RPC functions | Migration |
| 3 | Create `send-device-verification-email` edge function | Edge function |
| 4 | Update `authFlow.store.ts` types | Frontend |
| 5 | Create `device-verify.service.ts` | Frontend |
| 6 | Create `VerifyDevicePage.tsx` | Frontend |
| 7 | Update `login.service.ts` for device check | Frontend |
| 8 | Update `LoginPage.tsx` for new flow | Frontend |
| 9 | Update `AuthRouteGuard.tsx` | Frontend |
| 10 | Add route to router | Frontend |
| 11 | Export from `src/auth/index.ts` | Frontend |

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Brute force OTP | Max 5 attempts per challenge |
| OTP replay | Challenge marked verified, single use |
| Challenge enumeration | UUIDs, not sequential IDs |
| Session hijacking | Device fingerprint + challenge binding |
| Expired challenges | 15-minute TTL, auto-cleanup |
| Rate limiting | Edge function rate limits (existing pattern) |

---

## Files Summary

### New Files
- `supabase/functions/send-device-verification-email/index.ts`
- `src/auth/routes/VerifyDevicePage.tsx`
- `src/auth/services/device-verify.service.ts`

### Modified Files
- `src/auth/store/authFlow.store.ts` (add types)
- `src/auth/services/login.service.ts` (device check logic)
- `src/auth/routes/LoginPage.tsx` (handle device verification)
- `src/auth/guards/AuthRouteGuard.tsx` (new flow handling)
- `src/auth/index.ts` (exports)
- Router configuration (new route)

### Database Changes
- New table: `device_verification_challenges`
- New RPC: `create_device_challenge`
- New RPC: `verify_device_challenge`
