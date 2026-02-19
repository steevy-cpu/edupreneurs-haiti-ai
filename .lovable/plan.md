
# Signup Streamlining + Jude-Guided Onboarding Quiz

## Overview
Remove Step 2 from the signup wizard (profile info moves to post-login onboarding). Create a new OnboardingQuiz component where Jude guides the user through 7 questions one at a time. Wire it into the FirstTimeUserContext between Welcome and AvatarGeneration.

---

## Part 0 — Database Migration

Apply the approved migration to relax NOT NULL constraints and add the referral_source column:

```sql
ALTER TABLE profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN nickname DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN academic_grade DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN phone_number DROP NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source VARCHAR(50);
```

No RLS changes needed -- existing UPDATE policy `USING (auth.uid() = user_id)` already allows users to update their own profile rows for all fields.

---

## Part 1 — Streamline Signup to 2 Steps

### 1a. SignupLayout.tsx
- Change `totalSteps` from 3 to 2
- Update `getStepFromPath()`: `step-1` returns 1, `step-3` returns 2, `step-2` returns 1 (redirect case)
- Progress bar renders 2 steps instead of 3
- Labels change to "Compte" and "Finalisation"

### 1b. Step1.tsx
- Change navigation from `/auth/signup/step-2` to `/auth/signup/step-3`
- Change `saveAuthFlow({ flow: 'signup', step: 2 })` to `step: 3`

### 1c. Step3.tsx
- Change the "Retour" button navigation from `/auth/signup/step-2` to `/auth/signup/step-1`

### 1d. App.tsx
- Add a redirect route for `/auth/signup/step-2` that navigates to `/auth/signup/step-3`
- Keep the Step2 import for now (it will be used by the redirect, or remove it entirely and use a Navigate component)

### 1e. signup.service.ts
- Remove `full_name`, `nickname`, `academic_grade`, `phone_number`, `school`, `gender`, `date_of_birth` from the profile insert
- Remove the `signupSchema` validation call (it validates fields we no longer collect at signup)
- Keep only: `user_id`, `email_confirmed`, `phone_confirmed`, `confirmation_code`, `promo_code_used`, `promo_code_used_at`, `has_free_access`, `subscription_status`, `subscription_end_date`, `payment_order_id`
- Update the `send-confirmation-email` call: use email as `fullName` fallback since we no longer have nickname

### 1f. authValidation.ts
- Make `nickname`, `academicGrade`, and `gender` optional in `signupSchema` since they are no longer required at signup
- Or better: create a reduced signup schema that only validates email + password + privacy

---

## Part 2 — OnboardingQuiz Component

### New file: `src/components/firsttime/OnboardingQuiz.tsx`

A full-screen overlay component (same z-index pattern as FirstTimeUserWelcome and AvatarGenerationStep) that renders one question at a time with Jude as guide.

**Structure:**
- Progress dots at top (7 dots, filled based on current question)
- "Passer" skip button (top-right, hidden for Q1 and Q2)
- Main content area: Jude image + speech bubble + input/options
- Desktop: Jude on left, content on right (side by side)
- Mobile (below md): Jude on top (h-32), content below

**State management:**
- `currentStep` (0-6 for Q1-Q7)
- `answers` object holding all collected values
- `firstName` derived from full_name for speech bubble personalization
- `showReaction` boolean for thumb-up transitions
- `isStable` guard (same pattern as FirstTimeUserWelcome)

**Resume logic on mount:**
- Query profile for: `full_name`, `nickname`, `academic_grade`, `gender`, `school`, `date_of_birth`, `referral_source`
- For each field that is already non-null, mark that question as completed
- Skip to the first unanswered question
- If all fields are populated, call `completeOnboardingQuiz()` immediately

**Progressive save:**
- After each question is confirmed, call `supabase.from("profiles").update({field: value}).eq("user_id", userId)`
- On failure: show a subtle retry toast via `sonner` but do NOT block progression
- On success: advance to next question

**Questions (detailed):**

| # | Jude Image | Speech Bubble | Field | Input Type | Required | Auto-advance |
|---|---|---|---|---|---|---|
| 1 | eric-waving.png | "Bonjour! Comment tu t'appelles? :grinning:" | full_name | Text input (max 100, profanity check) | Yes | No (Continuer button) |
| - | eric-thumb-up.png | "Enchante(e), {firstName}! :tada:" | (reaction) | 1.5s display | - | Yes |
| 2 | eric-student-desk.png | "Et maintenant, {firstName}, tu es en quelle classe?" | academic_grade | Visual card grid (9 options) | Yes | Yes (on card tap, after reaction) |
| 3 | eric-thinking-pose.png | "Tu preferes qu'on te parle comment? :grinning:" | gender | Two large buttons | No (skippable) | Yes (on tap, after reaction) |
| 4 | eric-student-desk.png | "Quel est ton pseudo?..." | nickname | Text input with suggestion | No (skippable) | No (Continuer button) |
| 5 | eric-student-desk.png | "Dans quelle ecole tu etudies? :school:" | school | Text input + "Je ne suis plus a l'ecole" button | Conditional | No (Continuer or skip button) |
| 6 | eric-pointing-up.png | "C'est quand ton anniversaire?..." | date_of_birth | Date input | No (skippable) | No (Continuer button) |
| 7 | eric-teaching.png | "Derniere question!..." | referral_source | 6 option cards | No (skippable) | Yes (on card tap) |
| - | eric-celebrating.png | "Parfait! On se connait mieux maintenant..." | (outro) | 2s display | - | Yes (to avatar step) |

**Nickname suggestion algorithm (Q4):**
1. Take `full_name` from Q1 answers
2. Split on spaces, take first word, lowercase
3. NFD normalize, remove combining characters (diacritics)
4. Replace remaining non-alphanumeric with underscores
5. Truncate to 20 chars
6. Call `check_nickname_available` RPC
7. If unavailable, append `Math.floor(Math.random() * 90 + 10)`, check again
8. Pre-fill in input

**Thumb-up reaction pattern:**
After each answer, briefly show eric-thumb-up.png with a short Jude message (e.g., "Super!" or "Parfait!") for ~1.5s, then auto-slide to next question using framer-motion `AnimatePresence`.

---

## Part 3 — Wire OnboardingQuiz into FirstTimeUserContext

### Changes to `src/contexts/FirstTimeUserContext.tsx`:

**New state:**
- `showOnboardingQuiz: boolean`
- `onboardingQuizComplete: boolean`

**New actions:**
- `completeOnboardingQuiz: () => void`
- `skipOnboardingQuiz: () => void`

**Phase sequence update:**
- `completeWelcome()`: now sets `showOnboardingQuiz = true` (instead of `showAvatarGeneration = true`)
- New `completeOnboardingQuiz()`: sets `showOnboardingQuiz = false`, `showAvatarGeneration = true`
- New `skipOnboardingQuiz()`: same as completeOnboardingQuiz (advances to avatar)
- `restartTour()`: also resets onboarding quiz state

**Context type update:**
Add `showOnboardingQuiz`, `onboardingQuizComplete`, `completeOnboardingQuiz`, `skipOnboardingQuiz` to the interface and SAFE_DEFAULTS.

### Changes to `src/shell/FloatingLayer.tsx`:

**OnboardingOverlays function:**
- Add lazy import for OnboardingQuiz
- Render `<OnboardingQuiz />` between `<FirstTimeUserWelcome />` and `<AvatarGenerationStep />` inside the same Suspense boundary

---

## Part 4 — Null Fallback Audit

Files requiring null safety fixes for `profile.nickname`:

| File | Line | Current | Fix |
|---|---|---|---|
| `src/pages/Profile.tsx` | 323 | `profile.nickname[0].toUpperCase()` | `(profile.nickname ?? 'E')[0].toUpperCase()` |
| `src/pages/Profile.tsx` | 311 | `title={profile.nickname}` | `title={profile.nickname ?? 'Etudiant'}` |
| `src/pages/Notifications.tsx` | 358 | `notification.actorProfile.nickname` | Add `?? 'Etudiant'` fallback |
| `src/pages/Notifications.tsx` | 673-674 | `.nickname.substring(0, 2)` | `.nickname?.substring(0, 2) ?? '??'` |
| `src/pages/ChessGame.tsx` | 105 | `setUserNickname(profile.nickname)` | `profile.nickname ?? 'Etudiant'` |
| `src/components/content-editor/LessonComments.tsx` | 163 | `nickname?.charAt(0).toUpperCase()` | Already safe (optional chaining) |
| `src/components/EnglishPracticeChat.tsx` | 205 | `setDisplayName(profile.nickname)` | Already guarded by `if (profile?.nickname)` |
| `src/components/SpanishPracticeChat.tsx` | 197 | `setDisplayName(profile.nickname)` | Already guarded |

Files requiring null safety for `academic_grade` content filtering:

| File | Current behavior | Fix |
|---|---|---|
| `src/hooks/useMatieresData.ts` | `userGrade = data?.profile?.academic_grade \|\| null` | Already handles null -- shows all content when grade is null |
| `src/pages/Leaderboard.tsx` | Displays `user.academic_grade` directly | Add fallback: `user.academic_grade ?? '-'` |
| `src/contexts/FirstTimeUserContext.tsx` | `profile?.academic_grade \|\| null` | Already safe |

---

## Part 5 — authValidation.ts Schema Update

The `signupSchema` is used in `createAccount()` for final validation. Since we no longer collect profile fields at signup, we need to make the profile fields optional:

- `nickname`: change from required to `.optional()`
- `academicGrade`: change from required to `.optional()`
- `gender`: change from required to `.optional()`
- Remove the `.refine()` for school requirement (no longer relevant at signup)

Alternatively, create a `signupSchemaLite` that only validates email, password, and privacy. The full schema can remain for use in the Settings page validation.

---

## File Change Summary

| File | Action | Fixes |
|---|---|---|
| Database migration | Apply 5 ALTER statements | Part 0 |
| `src/auth/routes/signup/SignupLayout.tsx` | Edit: 2-step progress bar | Part 1a |
| `src/auth/routes/signup/Step1.tsx` | Edit: navigate to step-3 | Part 1b |
| `src/auth/routes/signup/Step3.tsx` | Edit: back button to step-1 | Part 1c |
| `src/App.tsx` | Edit: redirect step-2 to step-3 | Part 1d |
| `src/auth/services/signup.service.ts` | Edit: remove profile fields from insert | Part 1e |
| `src/lib/authValidation.ts` | Edit: make profile fields optional | Part 5 |
| `src/components/firsttime/OnboardingQuiz.tsx` | **New file** | Part 2 |
| `src/contexts/FirstTimeUserContext.tsx` | Edit: add onboarding_quiz phase | Part 3 |
| `src/shell/FloatingLayer.tsx` | Edit: add OnboardingQuiz to overlays | Part 3 |
| `src/pages/Profile.tsx` | Edit: null fallbacks | Part 4 |
| `src/pages/Notifications.tsx` | Edit: null fallbacks | Part 4 |
| `src/pages/ChessGame.tsx` | Edit: null fallback | Part 4 |
| `src/pages/Leaderboard.tsx` | Edit: null fallback | Part 4 |

---

## Safety Verification Table

| Risk | Analysis | Status |
|---|---|---|
| New user signup fails with NOT NULL constraint | Migration drops NOT NULL on full_name, nickname, academic_grade, phone_number. Profile insert only includes nullable fields + fields with defaults. | Safe after migration |
| Onboarding quiz resumes correctly | On mount, queries profile for all 7 fields. Skips questions with non-null values. If all populated, advances to avatar_generation. | Safe |
| Nickname uniqueness check fires before Q4 advances | Continuer button is disabled until check_nickname_available RPC returns true. Debounced check fires on input change. | Safe |
| FirstTimeUserContext phase sequence is correct | welcome -> onboarding_quiz -> avatar_generation -> tour -> completed. Each phase transition is explicit via callbacks. | Safe |
| profile.nickname null crash in Profile.tsx | Line 323 `profile.nickname[0]` crashes if null. Fixed with `(profile.nickname ?? 'E')[0]`. | Fixed |
| profile.nickname null in Notifications.tsx | Line 358 and 673 access nickname without guard. Fixed with optional chaining + fallback. | Fixed |
| academic_grade null in Leaderboard.tsx | Displays grade text directly. Fixed with `?? '-'` fallback. | Fixed |
| Existing users with populated profiles | OnboardingQuiz checks all fields on mount and skips entirely if all are filled. No disruption to existing users. | Safe |
| Step 2 bookmark/deep link | Route `/auth/signup/step-2` redirects to `/auth/signup/step-3` via Navigate component. | Safe |
| send-confirmation-email missing fullName | Updated to use email as fallback when nickname/fullName are not available. | Safe |
| signupSchema validation fails without profile fields | Schema updated to make nickname, academicGrade, gender optional. | Safe |
