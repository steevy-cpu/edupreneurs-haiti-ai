

# Complete Plan: Failed Login Attempt Lockout System

This plan addresses two critical requirements:
1. **Missing Database Components** - Create the `login_attempts` table and all required RPC functions
2. **Persistent Lockout State** - Ensure lockout persists across page refreshes and session restarts

---

## Current State Analysis

| Component | Status | Impact |
|-----------|--------|--------|
| `login_attempts` table | MISSING | No data storage for tracking |
| `check_login_attempt` RPC | MISSING | 404 error on login check |
| `record_failed_login` RPC | MISSING | 404 error on failed login |
| `clear_login_attempts` RPC | MISSING | Would fail on successful login |
| `cleanup_old_login_attempts` | EXISTS | Works, but nothing to clean |
| `loginAttempts.service.ts` | EXISTS | Correctly implemented, just needs DB |
| `login.service.ts` | EXISTS | Integration already done |
| `LoginPage.tsx` | PARTIAL | Has lockout UI but no persistence |

---

## Part 1: Database Migration (Required First)

### 1.1 Create `login_attempts` Table

```sql
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  failed_count integer NOT NULL DEFAULT 0,
  last_failed_at timestamptz,
  locked_at timestamptz,
  reset_requested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT login_attempts_email_key UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email 
  ON public.login_attempts(email);

ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
-- No public RLS policies = no direct access (security by design)
```

### 1.2 Create `check_login_attempt` RPC

Returns current attempt status for an email.

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

### 1.3 Create `record_failed_login` RPC

Increments counter, locks after 5 attempts, generates reset token.

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
    UPDATE login_attempts 
    SET locked_at = now()
    WHERE email = v_email AND locked_at IS NULL;
    
    v_is_locked := true;
    
    -- Find user and generate reset token
    SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = v_email;
    
    IF v_user_id IS NOT NULL THEN
      SELECT full_name INTO v_full_name FROM profiles WHERE user_id = v_user_id;
      
      -- Generate token
      v_token := encode(extensions.gen_random_bytes(32), 'hex');
      
      DELETE FROM password_reset_tokens WHERE user_id = v_user_id;
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (v_user_id, v_token, now() + interval '1 hour');
      
      UPDATE login_attempts SET reset_requested_at = now() WHERE email = v_email;
      
      RETURN jsonb_build_object(
        'new_count', v_new_count,
        'is_locked', v_is_locked,
        'reset_token', v_token,
        'full_name', v_full_name
      );
    END IF;
  END IF;
  
  RETURN jsonb_build_object(
    'new_count', v_new_count,
    'is_locked', v_is_locked,
    'reset_token', NULL,
    'full_name', NULL
  );
END;
$$;
```

### 1.4 Create `clear_login_attempts` RPC

Removes tracking record on successful login.

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

## Part 2: Persistent Lockout State (UI Enhancements)

### Problem

Currently, lockout state is stored in React state only:
- User fails 5 times, sees lockout UI
- User refreshes page, lockout UI disappears
- User has to fail again to see lockout (bad UX)

### Solution: Two-Layer Persistence

#### Layer 1: Extend AuthFlow Store

Add `password-reset-required` flow type to survive page refreshes.

**File: `src/auth/store/authFlow.store.ts`**

Changes:
1. Add `'password-reset-required'` to `AuthFlowType`
2. Add `lockedEmail?: string` to `AuthFlowState`
3. Add `LOCKOUT_TTL_MS` constant (60 minutes)
4. Update `saveAuthFlow` to handle lockout TTL
5. Add `hasPendingPasswordReset()` helper function

```typescript
// Add to AuthFlowType
export type AuthFlowType = 'idle' | 'signup' | 'login' | 'verify' | 
  'verify-device' | 'forgot-password' | 'password-reset-required';

// Add to AuthFlowState interface
lockedEmail?: string;

// Add constant
const LOCKOUT_TTL_MS = 60 * 60 * 1000; // 60 minutes

// Add helper function
export function hasPendingPasswordReset(): { pending: boolean; email?: string } {
  const flow = getAuthFlow();
  if (flow?.flow === 'password-reset-required' && flow.lockedEmail) {
    return { pending: true, email: flow.lockedEmail };
  }
  return { pending: false };
}
```

#### Layer 2: Save Lockout to AuthFlow Store

**File: `src/auth/services/login.service.ts`**

When lockout is detected (pre-check or 5th failure), persist to authFlow store:

```typescript
// When lockout detected pre-auth (line ~60-67):
if (!attemptStatus.allowed) {
  saveAuthFlow({
    flow: 'password-reset-required',
    email: credentials.email,
    lockedEmail: credentials.email,
  });
  return { /* existing code */ };
}

// When 5th attempt fails (line ~79-96):
if (failResult.isNowLocked) {
  saveAuthFlow({
    flow: 'password-reset-required',
    email: credentials.email,
    lockedEmail: credentials.email,
  });
  // ... rest of existing code
}
```

#### Layer 3: Check Lockout on Page Load + Email Change

**File: `src/auth/routes/LoginPage.tsx`**

Add three enhancements:

**A. Check lockout on component mount:**
```typescript
import { useEffect, useRef, useCallback } from "react";
import { hasPendingPasswordReset } from "../store/authFlow.store";
import { checkLoginAllowed } from "../services/loginAttempts.service";

// Inside component
useEffect(() => {
  const resetState = hasPendingPasswordReset();
  if (resetState.pending && resetState.email) {
    setEmail(resetState.email);
    setIsLocked(true);
    setRemainingAttempts(0);
  }
}, []);
```

**B. Debounced email lockout check (3G optimized):**
```typescript
const lockCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

const handleEmailChange = useCallback((newEmail: string) => {
  setEmail(newEmail);
  
  if (lockCheckTimeoutRef.current) {
    clearTimeout(lockCheckTimeoutRef.current);
  }
  
  // Skip check for invalid emails
  if (!newEmail.includes('@') || newEmail.length < 5) return;
  
  // Debounce 500ms
  lockCheckTimeoutRef.current = setTimeout(async () => {
    const status = await checkLoginAllowed(newEmail);
    if (!status.allowed && status.isLocked) {
      setIsLocked(true);
      setRemainingAttempts(0);
    } else {
      setIsLocked(false);
      setRemainingAttempts(status.remainingAttempts);
    }
  }, 500);
}, []);

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (lockCheckTimeoutRef.current) {
      clearTimeout(lockCheckTimeoutRef.current);
    }
  };
}, []);
```

**C. Enhanced lockout UI with direct action:**
```typescript
{isLocked && (
  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-4">
    <div className="flex items-center gap-2 font-medium text-destructive">
      <Lock className="h-4 w-4" />
      Compte temporairement bloque
    </div>
    <p className="mt-1 text-sm text-destructive/80">
      Verifiez votre email pour reinitialiser votre mot de passe.
    </p>
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="mt-3 text-destructive border-destructive/30 hover:bg-destructive/10"
      onClick={() => navigate('/auth/forgot-password', { state: { email } })}
    >
      Reinitialiser mon mot de passe
    </Button>
  </div>
)}
```

**D. Disable form when locked:**
```typescript
<Input
  value={email}
  onChange={(e) => handleEmailChange(e.target.value)}
  disabled={isLocked}
/>

<Button type="submit" disabled={isLoading || isLocked}>
```

#### Layer 4: Accept Pre-filled Email in ForgotPasswordPage

**File: `src/auth/routes/ForgotPasswordPage.tsx`**

```typescript
import { useLocation } from "react-router-dom";

// Inside component
const location = useLocation();
const prefilledEmail = (location.state as { email?: string })?.email;

const [email, setEmail] = useState(prefilledEmail || "");
```

#### Layer 5: Clear Lockout After Successful Password Reset

**File: `src/pages/ResetPassword.tsx`**

```typescript
import { clearAuthFlow } from "@/auth/store/authFlow.store";

// After successful password reset (line ~159):
toast({ title: "Mot de passe reinitialise" });

// Clear lockout state
clearAuthFlow();

setTimeout(() => navigate("/auth/login"), 2000);
```

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | **CREATE** | `login_attempts` table + 3 RPCs |
| `src/auth/store/authFlow.store.ts` | **UPDATE** | Add `password-reset-required` flow |
| `src/auth/services/login.service.ts` | **UPDATE** | Save lockout to authFlow store |
| `src/auth/routes/LoginPage.tsx` | **UPDATE** | Mount check + debounced email check |
| `src/auth/routes/ForgotPasswordPage.tsx` | **UPDATE** | Accept pre-filled email |
| `src/pages/ResetPassword.tsx` | **UPDATE** | Clear authFlow on success |

---

## User Experience Flow (After Implementation)

```text
Scenario A: User fails 5 times
  1. Attempt 1-2: "Mot de passe incorrect"
  2. Attempt 3: "Mot de passe incorrect. 2 tentatives restantes."
  3. Attempt 4: "Mot de passe incorrect. 1 tentative restante."
  4. Attempt 5: Account locked, email sent, lockout UI shown
  5. User refreshes page: Lockout UI STILL shows (from authFlow store)
  6. User closes browser, reopens: Lockout UI STILL shows

Scenario B: User types locked email (fresh session)
  1. Opens login page (fresh)
  2. Types "locked@example.com"
  3. (500ms debounce) → Database check
  4. Lockout UI appears immediately (no need to submit)

Scenario C: User resets password
  1. Clicks "Reinitialiser mon mot de passe"
  2. ForgotPasswordPage shows with email pre-filled
  3. Receives reset email
  4. Completes reset on ResetPasswordPage
  5. authFlow cleared → login_attempts cleared
  6. User can login normally
```

---

## Security Considerations

| Aspect | Implementation |
|--------|---------------|
| Tracking scope | Per email (not per device) |
| Storage | Database = source of truth |
| localStorage | UX only, not security |
| RLS | No public access to table |
| SECURITY DEFINER | RPCs bypass RLS safely |
| Fail-open | On DB error, allow attempt |
| Auto-unlock | 1 hour OR password reset |

---

## 3G Performance Optimization

| Operation | Strategy |
|-----------|----------|
| Email check | 500ms debounce (prevents spam) |
| Mount check | Single localStorage read (instant) |
| DB calls | Minimal (1 RPC per login attempt) |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | Adds new flow type |
| Breaks existing flows? | No | verify, verify-device unchanged |
| Works with email verification? | Yes | Lockout check is earlier |
| Works with device verification? | Yes | Lockout check is earlier |
| Existing users affected? | No | Fresh tracking for all |
| Clear on password reset? | Yes | Both DB and authFlow cleared |

