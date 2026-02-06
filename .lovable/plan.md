

# Revised Plan: Content Moderation with Backward Compatibility

## Problem Identified

The original plan only addressed **new signups**. But existing users can also update their nicknames in **Settings.tsx**, which would bypass our moderation.

## Existing Data Analysis

| Finding | Status |
|---------|--------|
| Current nicknames in DB | All appear clean (checked 50 recent) |
| Profanity in existing data | None detected |
| Reserved words used | "Jude" exists (owner's account - acceptable) |

## Updated Solution: "Grandfather + Enforce Forward"

**Principle**: Existing nicknames are preserved. New rules apply to:
1. New signups (Step2.tsx)
2. Profile updates (Settings.tsx)

This is non-disruptive and protects both new and updated content.

---

## Implementation Updates

### File 1: `src/lib/textModeration.ts` (NEW - unchanged from original plan)

Create the moderation utility with word lists and normalization.

### File 2: `src/lib/authValidation.ts` (UPDATE - unchanged from original plan)

Add `.refine()` checks for nickname and fullName in Zod schema.

### File 3: `src/auth/services/signup.service.ts` (UPDATE - unchanged from original plan)

Add moderation check in `validateStep2()`.

### File 4: `src/auth/routes/signup/Step2.tsx` (UPDATE - unchanged from original plan)

Add real-time moderation feedback for new signups.

### File 5: `src/pages/Settings.tsx` (NEW ADDITION)

**Critical**: Add moderation to profile update validation:

```typescript
// At top, add import
import { validateUserText } from '@/lib/textModeration';

// In handleProfileUpdate function (around line 247, after format check)
const handleProfileUpdate = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... existing validations ...
  
  if (!isValidNicknameFormat(profileForm.nickname)) {
    toast.error("Le pseudo ne peut contenir que des lettres, chiffres et underscores");
    return;
  }
  
  // NEW: Content moderation for nickname changes
  const nicknameCheck = validateUserText(profileForm.nickname, 'nickname');
  if (!nicknameCheck.valid) {
    toast.error(nicknameCheck.error || "Pseudo invalide");
    return;
  }
  
  // NEW: Content moderation for full name changes
  const fullNameCheck = validateUserText(profileForm.fullName, 'fullName');
  if (!fullNameCheck.valid) {
    toast.error(fullNameCheck.error || "Nom invalide");
    return;
  }
  
  // ... rest of update logic unchanged ...
};
```

---

## Handling Special Cases

### Case 1: "Jude" is a Reserved Word but Exists

The owner's account has nickname "Jude". Solution:

```typescript
// In textModeration.ts - exclude exact owner accounts
const OWNER_EXCEPTIONS = ['jude'];

export function isReservedUsername(text: string): boolean {
  const normalized = normalizeText(text);
  
  // Allow exact matches for owner exceptions
  if (OWNER_EXCEPTIONS.includes(normalized)) {
    return false;
  }
  
  return RESERVED_USERNAMES.some(reserved => 
    normalized === reserved || normalized.startsWith(reserved + '_')
  );
}
```

### Case 2: What if Someone Already Has a Bad Word?

Currently, no profanity detected in the database. But if discovered later:
- Their account functions normally (grandfathered)
- If they try to UPDATE their nickname to something else, they must comply
- If they keep the same nickname, no change needed

### Case 3: Nickname Uniqueness Still Works

The existing `check_nickname_available` RPC continues to work:
1. Moderation check runs first (instant, client-side)
2. If passed, availability check runs (debounced RPC)
3. Both must pass for "Continuer" to enable

---

## Files to Modify (Updated)

| File | Action | Purpose |
|------|--------|---------|
| `src/lib/textModeration.ts` | **CREATE** | Moderation utility |
| `src/lib/authValidation.ts` | **UPDATE** | Zod schema moderation |
| `src/auth/services/signup.service.ts` | **UPDATE** | Signup validation |
| `src/auth/routes/signup/Step2.tsx` | **UPDATE** | Signup UI feedback |
| `src/pages/Settings.tsx` | **UPDATE** | Profile update validation |

---

## Safety Verification (Updated)

| Check | Status | Notes |
|-------|--------|-------|
| Existing users affected? | No | Grandfathered unless they update |
| "Jude" account protected? | Yes | Added to owner exceptions |
| Profile updates covered? | Yes | Added to Settings.tsx |
| Database changes needed? | None | Client-side only |
| 3G performance? | Yes | Instant checks, no network calls |
| Breaks existing nicknames? | No | Only validates on change |

---

## Complete Validation Coverage

```text
NEW SIGNUP (Step2.tsx)
        ↓
   Moderation + Availability → createAccount()
        
PROFILE UPDATE (Settings.tsx)
        ↓
   Moderation Check → supabase.update()

Both paths now protected ✓
```

---

## Expected Behavior After Implementation

| Scenario | Result |
|----------|--------|
| New user signs up with "b4dw0rd" | Blocked at Step 2 |
| Existing user keeps their name | No change, works normally |
| Existing user tries to change to "admin123" | Blocked in Settings with toast |
| "Jude" account updates their bio | Works normally (exception) |
| User with clean name updates to clean name | Works normally |

