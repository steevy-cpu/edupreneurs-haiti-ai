
# Fix Device Tracking Bug - Wrong userId Parameter

## Problem Identified

Critical security bug in device tracking implementation:

| Expected | Actual | Impact |
|----------|--------|--------|
| `userId` (UUID) | `full_name` (string) | Device tracking fails silently - devices are never saved correctly |
| Valid UUID like `68f2f959-e14a-47f9-8277-07df3a6fcd79` | Empty string `''` or name like `"Jean"` | Database queries fail, trust preferences not saved |

**Current broken code (LoginPage.tsx lines 66-72):**
```typescript
handleDeviceTracking(
  result.profile.full_name || '',  // ❌ WRONG - this should be userId
  email, 
  result.profile.full_name || 'Utilisateur',
  rememberDevice
);
```

---

## Solution

### Step 1: Update LoginResult Interface

**File: `src/auth/services/login.service.ts`**

Add `userId` to the return type:

```typescript
export interface LoginResult {
  success: boolean;
  requiresVerification?: boolean;
  pendingUserId?: string;
  userId?: string;         // ← ADD THIS
  error?: string;
  profile?: {
    full_name?: string;
    nickname?: string;
    academic_grade?: string;
    email_confirmed?: boolean;
  };
}
```

---

### Step 2: Return userId from loginWithEmail

**File: `src/auth/services/login.service.ts`**

Update the success return (line 112):

```typescript
// Current
return { success: true, profile: profile || undefined };

// Change to
return { 
  success: true, 
  userId: authData.user.id,  // ← ADD THIS
  profile: profile || undefined 
};
```

---

### Step 3: Fix the handleDeviceTracking Call

**File: `src/auth/routes/LoginPage.tsx`**

Update the function call (lines 66-72):

```typescript
// Current (BROKEN)
if (result.profile) {
  handleDeviceTracking(
    result.profile.full_name || '', 
    email, 
    result.profile.full_name || 'Utilisateur',
    rememberDevice
  );
}

// Fixed
if (result.userId) {
  handleDeviceTracking(
    result.userId,                              // ← Correct: actual UUID
    email, 
    result.profile?.full_name || 'Utilisateur',
    rememberDevice
  );
}
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Adding new field, existing code works |
| Works with existing data? | Yes | Uses existing `authData.user.id` |
| Type safety? | Yes | userId is properly typed as string |
| Backward compatible? | Yes | Optional field addition |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/auth/services/login.service.ts` | Add `userId` to interface, return it on success |
| `src/auth/routes/LoginPage.tsx` | Fix `handleDeviceTracking` call to use `result.userId` |
