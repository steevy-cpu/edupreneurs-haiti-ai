

# Fix: Dashboard Stale Profile + Onboarding 3G Reliability

## Overview
Three surgical fixes: (1) invalidate profile cache after onboarding saves data, (2) add retry logic to `saveField()` with localStorage backup, (3) confirm image loading attributes and add dimensions.

---

## Fix 1 -- Invalidate profile cache after onboarding completes

**Problem:** `useUserProfile` has `staleTime: 10min` and `refetchOnMount: false`. After onboarding saves nickname/grade/avatar, the dashboard shows stale placeholder data.

**Root cause:** Neither `completeOnboardingQuiz()` nor `completeAvatarGeneration()` in `FirstTimeUserContext.tsx` invalidates the `['user-profile']` query cache.

**Note on query keys:** The actual cache key is `['user-profile', userId]` (with hyphen). The user's request mentioned `['userProfile']` and `['criticalUserData']` -- neither exists as a TanStack query. The dashboard's `fetchCriticalUserData` is a raw function in a `useEffect`, not a cached query. Invalidating `['user-profile']` is the correct and sufficient fix.

### Changes

**File: `src/contexts/FirstTimeUserContext.tsx`**
- Import `useQueryClient` from `@tanstack/react-query`
- Get `queryClient` instance in the provider component
- In `completeOnboardingQuiz()`: add `queryClient.invalidateQueries({ queryKey: ['user-profile'] })` -- this forces fresh nickname/grade data
- In `completeAvatarGeneration()`: add the same invalidation -- this forces fresh avatar data
- In `skipOnboardingQuiz()`: add same invalidation (user may have partial saves)

**File: `src/hooks/useUserProfile.ts`**
- The user requested adding `refetchOnWindowFocus: true`. However, this contradicts the project's 3G optimization standard (custom knowledge explicitly states "no window-focus refetch"). Instead, the invalidation approach above is sufficient and 3G-safe. No change to `useUserProfile.ts`.

---

## Fix 2 -- Make saveField() reliable on 3G

**Problem:** `saveField()` is fire-and-forget. On 3G, a failed save shows a toast but the UI has already advanced. Data is lost silently.

### Changes

**File: `src/components/firsttime/OnboardingQuiz.tsx`**

**2a. Add retry logic to `saveField()`:**
- Retry up to 2 more times (3 total attempts) with 1-second delay between retries
- If all 3 attempts fail: save to localStorage as backup under key `onboarding_backup_{userId}` and show toast "Connexion lente detectee. Tes donnees sont sauvegardees localement."

**2b. Add localStorage backup utility:**
```typescript
// Save field to localStorage as backup for 3G resilience
const saveFieldBackup = (field: string, value: string) => {
  const key = `onboarding_backup_${firstTimeUser.userId}`;
  const existing = JSON.parse(localStorage.getItem(key) || '{}');
  existing[field] = value;
  localStorage.setItem(key, JSON.stringify(existing));
};
```

**2c. Add final verification before quiz completion:**
- In `completeOnboardingQuiz` calls (lines 180, 251, 263), before calling `firstTimeUser.completeOnboardingQuiz()`, attempt to flush any localStorage backup to the DB
- Add a `flushBackupToDb()` function that reads `onboarding_backup_{userId}` from localStorage, attempts a single batch update to profiles, and clears the backup on success
- Show a brief loading indicator during flush (reuse existing `isSaving` state)

**2d. Updated `saveField` with retry:**
```typescript
const saveField = useCallback(async (field: string, value: string) => {
  if (!firstTimeUser.userId) return;
  setIsSaving(true);
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value } as any)
        .eq('user_id', firstTimeUser.userId);
      if (error) throw error;
      setIsSaving(false);
      return; // Success
    } catch (err) {
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  
  // All attempts failed -- save to localStorage backup
  saveFieldBackup(field, value);
  toast.warning("Connexion lente détectée. Tes données sont sauvegardées localement.", { duration: 3000 });
  setIsSaving(false);
}, [firstTimeUser.userId]);
```

---

## Fix 3 -- Confirm onboarding image loading attributes

**File: `src/components/firsttime/OnboardingQuiz.tsx`**

**Current state (line 394):** Images already have conditional `loading` attribute:
```
loading={currentStep === 0 && !showReaction && !isOutro ? 'eager' : 'lazy'}
```
This is correct. Only the first step image loads eagerly.

**Change:** Add explicit `width` and `height` attributes to the `img` tag at line 389-395 to prevent layout shift:
```
width={256}
height={256}
```
These match the rendered size constraint (`h-32 md:h-64` = 128px/256px) and provide the browser with aspect ratio information for CLS prevention.

---

## Files touched (2 total)

| File | Change |
|------|--------|
| `src/contexts/FirstTimeUserContext.tsx` | Add queryClient invalidation in `completeOnboardingQuiz`, `skipOnboardingQuiz`, `completeAvatarGeneration` |
| `src/components/firsttime/OnboardingQuiz.tsx` | Retry logic in `saveField`, localStorage backup, flush on completion, image dimensions |

---

## Safety verification

| Check | Status |
|-------|--------|
| No DB changes | Correct |
| No new dependencies | Correct |
| RLS unaffected | Correct |
| Provider stack order unchanged | Correct -- QueryClientProvider wraps FirstTimeUserProvider, so useQueryClient is safe |
| 3G performance impact | Positive -- retry logic prevents data loss; no extra network calls on success path |
| Bundle size impact | Negligible -- ~40 lines of logic |
| refetchOnWindowFocus kept false | Correct -- respects 3G optimization standard |
| Backward compatible | Yes -- localStorage backup is additive; existing users unaffected |

