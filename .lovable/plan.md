

# Improve Avatar Generator Error Handling in Settings Page

## What This Fixes
Currently, when avatar generation fails from the Settings page, users see a raw technical error message like "AI Gateway error: 500". Additionally, founder users (Steevy and Djood) are subject to the 3-day avatar regeneration cooldown on the Settings page because `isSuperUser` is not passed through.

## Changes

### 1. AvatarSelector.tsx -- Accept and forward `isSuperUser`
- Add `isSuperUser?: boolean` to the `AvatarSelectorProps` interface
- Pass it through to `AIAvatarGenerator`

### 2. Settings.tsx -- Detect founders and pass `isSuperUser`
- Import `isFounder` from `src/lib/founderConstants.ts`
- Compute `isSuperUser` from the current `userId`
- Pass `isSuperUser` to `AvatarSelector`

### 3. AIAvatarGenerator.tsx -- Friendly error for non-onboarding too
- In the `handleGenerate` catch block, replace the raw `toast.error` with a cleaner French message: "La generation d'avatar est temporairement indisponible. Reessaie plus tard."
- This applies when `isOnboarding` is false (the onboarding path already has the inline fallback UI)

## Files Modified
| File | Change |
|---|---|
| `src/components/AvatarSelector.tsx` | Add `isSuperUser` prop, forward to AIAvatarGenerator |
| `src/pages/Settings.tsx` | Import `isFounder`, compute and pass `isSuperUser` |
| `src/components/AIAvatarGenerator.tsx` | Replace raw error toast with user-friendly French message |

## Safety
- No signup/onboarding code touched
- No database or edge function changes
- Existing onboarding error handling (generationFailed state + "Continuer sans avatar") unchanged
- Only improves Settings page experience and founder cooldown bypass
