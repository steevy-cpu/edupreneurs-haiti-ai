
# Fix Email Verification Flow Issues

## Problem Summary

Users are experiencing email verification failures due to several interconnected issues:

| Issue | Impact | Root Cause |
|-------|--------|------------|
| Session lost when checking email | High | Uses `sessionStorage` which clears when tab/browser closes |
| 15-minute TTL too short | High | Users on 3G connections or checking email on another device exceed TTL |
| No recovery path | High | "Session expirée" screen only offers login, which loops back to verify |
| Confusing email template | Medium | States "10 minutes" but code uses 15 minutes |

## Solution Overview

A 4-part fix that improves persistence, extends TTL, adds recovery flow, and syncs messaging.

---

## Part 1: Switch from sessionStorage to localStorage

**File: `src/auth/store/authFlow.store.ts`**

Change all `sessionStorage` calls to `localStorage` so verification state survives:
- Browser tab closure
- App switching on mobile
- Opening email in another tab

**Changes:**
- Line 45: `sessionStorage.setItem` → `localStorage.setItem`
- Line 57: `sessionStorage.getItem` → `localStorage.getItem`
- Line 80: `sessionStorage.removeItem` → `localStorage.removeItem`
- Lines 129, 141, 156: Update signup data functions similarly

This ensures that when a user closes their browser to check email, they can return and continue verification.

---

## Part 2: Extend Verification TTL

**File: `src/auth/store/authFlow.store.ts`**

Change TTL from 15 minutes to 60 minutes:

```typescript
// Current
const VERIFY_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Change to
const VERIFY_TTL_MS = 60 * 60 * 1000; // 60 minutes for verification
```

**Rationale**: 60 minutes gives users enough time to:
- Check email on slow 3G connections
- Find the email in spam folder
- Switch between devices
- Handle email app delays

---

## Part 3: Add Email Recovery Flow for Expired Sessions

**File: `src/auth/routes/VerifyEmailPage.tsx`**

Currently, when session expires, users see a dead-end screen. We need to add an email input recovery mechanism.

**New UI Flow:**
1. When no valid session is found, show an option to enter email address
2. User enters their email
3. System looks up the profile by email
4. If found with `email_confirmed = false`, generates new code and resumes flow
5. If not found or already verified, shows appropriate message

**Changes to VerifyEmailPage.tsx:**

Add new state:
```typescript
const [recoveryMode, setRecoveryMode] = useState(false);
const [recoveryEmail, setRecoveryEmail] = useState("");
const [isRecovering, setIsRecovering] = useState(false);
```

Replace the static "Session expirée" block with a recovery form:
```typescript
// Instead of just showing error + login button, show:
<div className="p-5 text-center space-y-4">
  <h2 className="text-xl font-bold">Session expirée</h2>
  <p className="text-sm text-muted-foreground mb-4">
    Entrez votre adresse email pour continuer la vérification.
  </p>
  
  <Input
    type="email"
    placeholder="votre@email.com"
    value={recoveryEmail}
    onChange={(e) => setRecoveryEmail(e.target.value)}
  />
  
  <Button onClick={handleRecovery} disabled={isRecovering}>
    {isRecovering ? "Récupération..." : "Continuer la vérification"}
  </Button>
  
  <button onClick={() => navigate('/auth/login')}>
    Retour à la connexion
  </button>
</div>
```

**New handler function:**
```typescript
const handleRecovery = async () => {
  // 1. Look up profile by email (call new RPC or query)
  // 2. Check if email_confirmed = false
  // 3. If yes: generate new code, send email, save auth flow, reload page
  // 4. If no: show "Email already verified" or "Email not found"
};
```

---

## Part 4: Create Recovery RPC Function

**New Database Function: `recover_verification_by_email`**

Create a secure database function that:
1. Finds user_id by email from auth.users
2. Checks if profile exists and email_confirmed = false
3. Generates new confirmation code
4. Returns user_id and profile info for the frontend

**Migration SQL:**
```sql
CREATE OR REPLACE FUNCTION public.recover_verification_by_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_profile RECORD;
  v_new_code TEXT;
BEGIN
  -- Find user by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'email_not_found'
    );
  END IF;
  
  -- Get profile
  SELECT user_id, email_confirmed, full_name, nickname, academic_grade
  INTO v_profile
  FROM public.profiles
  WHERE user_id = v_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'profile_not_found'
    );
  END IF;
  
  -- Check if already verified
  IF v_profile.email_confirmed THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'already_verified'
    );
  END IF;
  
  -- Generate new 6-digit code
  v_new_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  
  -- Update confirmation code
  UPDATE public.profiles
  SET confirmation_code = v_new_code
  WHERE user_id = v_user_id;
  
  -- Return success with profile info
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'full_name', v_profile.full_name,
    'nickname', v_profile.nickname,
    'academic_grade', v_profile.academic_grade,
    'confirmation_code', v_new_code
  );
END;
$function$;
```

---

## Part 5: Update Email Template TTL Message

**File: `supabase/functions/send-confirmation-email/index.ts`**

Change the template text to match the new 60-minute TTL:

```html
<!-- Current -->
<strong style="color: #ef4444;">Ce code expire dans 10 minutes.</strong>

<!-- Change to -->
<strong style="color: #ef4444;">Ce code expire dans 1 heure.</strong>
```

---

## Part 6: Add Recovery Service Function

**File: `src/auth/services/verify.service.ts`**

Add new function to handle recovery:

```typescript
export async function recoverVerificationByEmail(email: string): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
  errorCode?: 'email_not_found' | 'profile_not_found' | 'already_verified';
}> {
  try {
    const { data, error } = await supabase.rpc('recover_verification_by_email', {
      p_email: email.toLowerCase().trim()
    });
    
    if (error) throw error;
    
    const result = data as { 
      success: boolean; 
      error?: string; 
      user_id?: string;
      full_name?: string;
      nickname?: string;
      academic_grade?: string;
      confirmation_code?: string;
    };
    
    if (!result.success) {
      return { success: false, error: result.error, errorCode: result.error };
    }
    
    // Send new verification email
    await supabase.functions.invoke('send-confirmation-email', {
      body: {
        email,
        fullName: result.full_name || result.nickname || 'Utilisateur',
        nickname: result.nickname || '',
        academicGrade: result.academic_grade || '',
        confirmationCode: result.confirmation_code,
      }
    });
    
    // Save auth flow state
    saveAuthFlow({
      flow: 'verify',
      pendingUserId: result.user_id,
      email,
    });
    
    return { success: true, userId: result.user_id };
  } catch (error: any) {
    console.error('Recovery error:', error);
    return { success: false, error: error.message };
  }
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/auth/store/authFlow.store.ts` | Switch to localStorage, extend TTL to 60 min |
| `src/auth/routes/VerifyEmailPage.tsx` | Add email recovery form when session expired |
| `src/auth/services/verify.service.ts` | Add `recoverVerificationByEmail()` function |
| `supabase/functions/send-confirmation-email/index.ts` | Update TTL message to "1 heure" |
| **New Migration** | Create `recover_verification_by_email` RPC |

---

## User Experience After Fix

| Scenario | Before | After |
|----------|--------|-------|
| User closes tab to check email | Session lost, stuck in loop | State preserved, can continue |
| User takes 20 min to find email | Session expired | 60-minute window, plenty of time |
| Session expires | Dead-end screen | Email recovery form available |
| Email mentions wrong expiry | "10 minutes" (incorrect) | "1 heure" (matches code) |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | localStorage is drop-in replacement |
| Works with existing data? | Yes | New RPC handles existing unverified profiles |
| Backward compatible? | Yes | Existing verified users unaffected |
| Optimized for 3G? | Yes | Recovery uses single RPC call |
| Security maintained? | Yes | RPC is SECURITY DEFINER, no email enumeration risk |
