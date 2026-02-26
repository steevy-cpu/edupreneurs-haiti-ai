

# Fix Onboarding Voice Ordering Bug

## Problem
All 4 onboarding components mount simultaneously via FloatingLayer. Voice useEffects in AvatarGenerationStep and OnboardingQuiz fire immediately on mount with no phase guards, causing "Maintenant creons ton avatar" and "Bonjour! Comment tu t'appelles?" to race against the welcome greeting.

## Diagnosis
- **FirstTimeUserWelcome.tsx** -- Already guarded. The pre-fetch useEffect (L54) checks `firstTimeUser.showWelcome` and the speak calls use `onStart` callbacks tied to typewriter phases. No changes needed.
- **AvatarGenerationStep.tsx** -- Avatar prompt useEffect (L50, deps `[]`) has NO guard. Celebration useEffect (L66) has no `showAvatarGeneration` guard.
- **OnboardingQuiz.tsx** -- All 3 voice useEffects (L377, L399, L407) lack `showOnboardingQuiz` guards.

## Changes

### File 1: AvatarGenerationStep.tsx (2 edits)

**Edit A -- Avatar prompt useEffect (L50-63):**
Add `if (!firstTimeUser.showAvatarGeneration) return;` as first line inside the effect. Change deps from `[]` to `[firstTimeUser.showAvatarGeneration]`.

**Edit B -- Celebration useEffect (L66-79):**
Add `if (!firstTimeUser.showAvatarGeneration) return;` before `if (!celebrating) return;`. Add `firstTimeUser.showAvatarGeneration` to deps.

### File 2: OnboardingQuiz.tsx (3 edits)

**Edit C -- currentStep useEffect (L377-396):**
Add `if (!firstTimeUser.showOnboardingQuiz) return;` as first line. Add `firstTimeUser.showOnboardingQuiz` to deps array.

**Edit D -- showReaction useEffect (L399-404):**
Add `if (!firstTimeUser.showOnboardingQuiz) return;` as first line. Add `firstTimeUser.showOnboardingQuiz` to deps array.

**Edit E -- isOutro useEffect (L407-413):**
Add `if (!firstTimeUser.showOnboardingQuiz) return;` as first line. Add `firstTimeUser.showOnboardingQuiz` to deps array.

### File 3: FirstTimeUserWelcome.tsx -- No changes needed
Already has `showWelcome` guard on the pre-fetch effect (L55) and speak calls are triggered via `onStart` callbacks only when the typewriter phase activates.

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- only adds early-return guards |
| Provider stack affected? | No |
| New dependencies? | No |
| Bundle size impact? | None |
| 3G compatible? | Yes |
| Backward compatible? | Yes |
| Files modified | AvatarGenerationStep.tsx, OnboardingQuiz.tsx only |

## Result
Voice effects only fire when their respective phase becomes active, eliminating the race condition. Welcome greeting plays first, then quiz voices, then avatar prompt -- in correct sequence.
