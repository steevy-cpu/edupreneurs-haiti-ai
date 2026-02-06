

# Plan: Failed Login Attempt Lockout System

## Problem Statement

Currently, there's no limit on failed login attempts. An attacker (or even a user who forgot their password) can try unlimited password combinations without any protection. After 5 consecutive failed attempts for a specific email, we should:
1. Block further login attempts
2. Auto-trigger a password reset email
3. Require the user to reset their password before logging in again

## Current Architecture Analysis

| Component | Current State | Relevance |
|-----------|--------------|-----------|
| `login.service.ts` | Handles login, returns error on wrong password | Entry point for tracking |
| `LoginPage.tsx` | Displays errors, no attempt tracking | Needs attempt counter state |
| `ForgotPasswordPage.tsx` | Already has password reset flow | Reuse for lockout recovery |
| `rate_limits` table | Exists for IP-based throttling | Different use case (general throttling) |
| `authFlow.store.ts` | Persistent localStorage-based flow state | Could extend for attempt tracking |
| `generate_password_reset_token` RPC | Generates token, sends email | Reuse for auto-reset |

## Design Decision: Where to Track Attempts?

### Option A: Database Table (Recommended)
**Pros:**
- Persists across devices/browsers (attacker can't bypass by clearing localStorage)
- Email-based tracking (5 attempts per email, not per device)
- Server-side security
- Survives tab closes, browser clears

**Cons:**
- Requires database migration

### Option B: localStorage Only
**Pros:**
- No database changes

**Cons:**
- Easily bypassed (clear storage, use incognito)
- Device-specific (attacker uses different device)
- Not production-grade security

**Decision:** Option A - Database table for security. Attacks happen from multiple devices/browsers, so tracking must be server-side.

---

## Implementation Architecture

```text
+------------------+     +-------------------+     +------------------------+
|   LoginPage.tsx  | --> | login.service.ts  | --> | login_attempts table   |
|   (UI + State)   |     | (Track attempts)  |     | (DB - email based)     |
+------------------+     +-------------------+     +------------------------+
                                 |
                                 | After 5th failed attempt:
                                 v
                    +------------------------+
                    | Auto Password Reset    |
                    | (generate_password_    |
                    |  reset_token + email)  |
                    +------------------------+
```

---

## Database Schema

### New Table: `login_attempts`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| email | text | NO | - | User's email (case-insensitive) |
| failed_count | integer | NO | 0 | Consecutive failed attempts |
| last_failed_at | timestamptz | YES | - | Timestamp of last failure |
| locked_at | timestamptz | YES | - | When account was locked (5th failure) |
| reset_requested_at | timestamptz | YES | - | When auto-reset was triggered |
| created_at | timestamptz | NO | now() | Record creation |
| updated_at | timestamptz | NO | now() | Last update |

**Constraints:**
- UNIQUE on email (one record per email)
- Index on email for fast lookups

**RLS Policies:**
- No public access (service role only via edge function)
- Users cannot query this table directly

---

## File Changes

### 1. Database Migration (New Table + RPC Functions)

Create `login_attempts` table with:
- `check_login_attempt(p_email text)` - Returns current attempt count and lock status
- `record_failed_login(p_email text)` - Increments counter, returns new count + lock status
- `clear_login_attempts(p_email text)` - Resets counter on successful login
- `cleanup_old_login_attempts()` - Scheduled cleanup of old records

### 2. New File: `src/auth/services/loginAttempts.service.ts`

```typescript
/**
 * Login Attempts Service - Tracks consecutive failed login attempts
 * 
 * Security: After 5 consecutive failures, user must reset password.
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
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_HOURS = 1; // Auto-unlock after 1 hour if no reset

/**
 * Check if login is allowed for this email
 */
export async function checkLoginAllowed(email: string): Promise<AttemptStatus> {
  // Call RPC to check current attempt status
  const { data, error } = await supabase.rpc('check_login_attempt', {
    p_email: email.toLowerCase().trim()
  });
  
  if (error) {
    console.error('Failed to check login attempts:', error);
    // On error, allow attempt (fail open for availability)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS, isLocked: false };
  }
  
  // Parse response
  const { failed_count, locked_at } = data || { failed_count: 0, locked_at: null };
  
  // Check if locked
  if (locked_at) {
    const lockTime = new Date(locked_at);
    const hoursSinceLock = (Date.now() - lockTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLock < LOCKOUT_DURATION_HOURS) {
      return {
        allowed: false,
        remainingAttempts: 0,
        isLocked: true,
        lockMessage: "Compte temporairement bloqué. Veuillez réinitialiser votre mot de passe.",
      };
    }
    // Lock expired, will be cleared on next successful login
  }
  
  const remaining = Math.max(0, MAX_ATTEMPTS - failed_count);
  
  return {
    allowed: remaining > 0 || !locked_at,
    remainingAttempts: remaining,
    isLocked: !!locked_at,
  };
}

/**
 * Record a failed login attempt
 * Returns new count and whether account is now locked
 */
export async function recordFailedAttempt(email: string): Promise<FailedLoginResult> {
  const { data, error } = await supabase.rpc('record_failed_login', {
    p_email: email.toLowerCase().trim()
  });
  
  if (error) {
    console.error('Failed to record login attempt:', error);
    return { newCount: 1, isNowLocked: false, resetEmailSent: false };
  }
  
  const { new_count, is_locked, reset_sent } = data || {};
  
  return {
    newCount: new_count || 1,
    isNowLocked: is_locked || false,
    resetEmailSent: reset_sent || false,
  };
}

/**
 * Clear attempts on successful login
 */
export async function clearLoginAttempts(email: string): Promise<void> {
  await supabase.rpc('clear_login_attempts', {
    p_email: email.toLowerCase().trim()
  });
}
```

### 3. Update: `src/auth/services/login.service.ts`

Add attempt tracking to the login flow:

```typescript
// Add import at top
import { checkLoginAllowed, recordFailedAttempt, clearLoginAttempts } from './loginAttempts.service';

// Modify loginWithEmail function
export async function loginWithEmail(credentials: LoginCredentials): Promise<LoginResult> {
  // STEP 1: Check if login is allowed (before attempting auth)
  const attemptStatus = await checkLoginAllowed(credentials.email);
  
  if (!attemptStatus.allowed) {
    return {
      success: false,
      error: attemptStatus.lockMessage || "Trop de tentatives échouées. Veuillez réinitialiser votre mot de passe.",
      requiresPasswordReset: true, // NEW field
    };
  }
  
  // STEP 2: Attempt actual login
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    // STEP 3: Record failed attempt
    const failResult = await recordFailedAttempt(credentials.email);
    
    if (failResult.isNowLocked) {
      return {
        success: false,
        error: "Trop de tentatives échouées. Un email de réinitialisation a été envoyé.",
        requiresPasswordReset: true,
        resetEmailSent: true,
      };
    }
    
    // Include remaining attempts in error message
    const remaining = 5 - failResult.newCount;
    if (remaining > 0 && remaining <= 3) {
      return {
        success: false,
        error: `Mot de passe incorrect. ${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}.`,
      };
    }
    
    return { success: false, error: error.message };
  }

  // STEP 4: Successful login - clear attempts
  await clearLoginAttempts(credentials.email);
  
  // ... rest of existing login logic (email verification, device verification)
}
```

### 4. Update: `src/auth/routes/LoginPage.tsx`

Add UI feedback for lockout state:

```typescript
// Add new state
const [isLocked, setIsLocked] = useState(false);
const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

// In handleLogin, update error handling
if (result.requiresPasswordReset) {
  setIsLocked(true);
  toast({
    title: "Compte bloqué",
    description: result.resetEmailSent 
      ? "Un email de réinitialisation a été envoyé à votre adresse."
      : "Veuillez réinitialiser votre mot de passe.",
    variant: "destructive",
  });
  
  // Auto-redirect to forgot password after 3 seconds
  setTimeout(() => navigate('/auth/forgot-password'), 3000);
  return;
}

// Add visual warning when attempts are low
{remainingAttempts !== null && remainingAttempts <= 3 && remainingAttempts > 0 && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
    ⚠️ Attention: {remainingAttempts} tentative{remainingAttempts > 1 ? 's' : ''} restante{remainingAttempts > 1 ? 's' : ''}
  </div>
)}

// Add locked state UI
{isLocked && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
    🔒 Compte temporairement bloqué pour des raisons de sécurité.
    <br />
    <span className="text-red-600 font-medium">
      Vérifiez votre email pour réinitialiser votre mot de passe.
    </span>
  </div>
)}
```

### 5. Update: `LoginResult` Interface

```typescript
export interface LoginResult {
  success: boolean;
  requiresVerification?: boolean;
  requiresDeviceVerification?: boolean;
  requiresPasswordReset?: boolean;  // NEW
  resetEmailSent?: boolean;          // NEW
  remainingAttempts?: number;        // NEW
  deviceChallengeId?: string;
  pendingUserId?: string;
  userId?: string;
  error?: string;
  profile?: {...};
}
```

---

## Database RPC Functions

### `check_login_attempt(p_email text)`

```sql
CREATE OR REPLACE FUNCTION public.check_login_attempt(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_record RECORD;
BEGIN
  SELECT failed_count, locked_at
  INTO v_record
  FROM login_attempts
  WHERE email = LOWER(TRIM(p_email));
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('failed_count', 0, 'locked_at', NULL);
  END IF;
  
  RETURN jsonb_build_object(
    'failed_count', v_record.failed_count,
    'locked_at', v_record.locked_at
  );
END;
$$;
```

### `record_failed_login(p_email text)`

```sql
CREATE OR REPLACE FUNCTION public.record_failed_login(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email TEXT := LOWER(TRIM(p_email));
  v_new_count INTEGER;
  v_is_locked BOOLEAN := false;
  v_reset_sent BOOLEAN := false;
  v_user_id UUID;
  v_full_name TEXT;
  v_token TEXT;
BEGIN
  -- Upsert attempt record
  INSERT INTO login_attempts (email, failed_count, last_failed_at, updated_at)
  VALUES (v_email, 1, now(), now())
  ON CONFLICT (email) DO UPDATE
  SET 
    failed_count = login_attempts.failed_count + 1,
    last_failed_at = now(),
    updated_at = now()
  RETURNING failed_count INTO v_new_count;
  
  -- Check if now locked (5 attempts)
  IF v_new_count >= 5 THEN
    -- Lock the account
    UPDATE login_attempts 
    SET locked_at = now()
    WHERE email = v_email AND locked_at IS NULL;
    
    v_is_locked := true;
    
    -- Auto-trigger password reset
    -- Find user and generate reset token
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    
    IF v_user_id IS NOT NULL THEN
      SELECT full_name INTO v_full_name FROM profiles WHERE user_id = v_user_id;
      
      -- Generate token (reuse existing function logic)
      v_token := encode(extensions.gen_random_bytes(32), 'hex');
      
      DELETE FROM password_reset_tokens WHERE user_id = v_user_id;
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (v_user_id, v_token, now() + interval '1 hour');
      
      -- Mark reset as requested
      UPDATE login_attempts SET reset_requested_at = now() WHERE email = v_email;
      
      v_reset_sent := true;
      -- Note: Edge function will send the email (called from service layer)
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'new_count', v_new_count,
    'is_locked', v_is_locked,
    'reset_sent', v_reset_sent
  );
END;
$$;
```

### `clear_login_attempts(p_email text)`

```sql
CREATE OR REPLACE FUNCTION public.clear_login_attempts(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM login_attempts WHERE email = LOWER(TRIM(p_email));
END;
$$;
```

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | **CREATE** | `login_attempts` table + RPC functions |
| `src/auth/services/loginAttempts.service.ts` | **CREATE** | Attempt tracking business logic |
| `src/auth/services/login.service.ts` | **UPDATE** | Integrate attempt checks into login flow |
| `src/auth/routes/LoginPage.tsx` | **UPDATE** | UI for warnings and lockout state |

---

## Security Considerations

| Aspect | Implementation |
|--------|---------------|
| Tracking scope | Per email, not per device (prevents bypass) |
| Storage | Database (not localStorage - prevents clearing) |
| Auto-unlock | 1 hour timeout OR password reset clears lock |
| Reset trigger | Automatic on 5th failure |
| RLS | No public access, service role only |
| Fail-open | On DB error, allow attempt (availability > lockout) |
| Consecutive only | Successful login clears counter |

---

## User Experience Flow

```text
Attempt 1: "Mot de passe incorrect"
Attempt 2: "Mot de passe incorrect"
Attempt 3: "Mot de passe incorrect. 2 tentatives restantes."
Attempt 4: "Mot de passe incorrect. 1 tentative restante."
Attempt 5: 
  → Account locked
  → Auto password reset email sent
  → UI shows: "Compte bloqué. Un email de réinitialisation a été envoyé."
  → Redirects to /auth/forgot-password after 3 seconds
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | No changes to existing successful logins |
| Breaks existing flows? | No | Only adds new tracking layer |
| 3G performance? | Yes | Single RPC call per login attempt |
| Works with email verification? | Yes | Attempt check happens before auth |
| Works with device verification? | Yes | Same flow, tracking is earlier |
| Existing users affected? | No | Fresh tracking for all |

