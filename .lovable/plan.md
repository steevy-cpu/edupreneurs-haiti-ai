

# Three Targeted Fixes — Jude Image, Skip Logic, Haitian Cultural Prompt

## Fix 1 — Jude Image in AIAvatarGenerator

**File:** `src/components/AIAvatarGenerator.tsx`

- **Line 1 area:** Add `import judeProfile from '@/assets/eric-new-profile.png';` after existing imports
- **Line 617:** Change `src="/eric-new-profile.png"` to `src={judeProfile}`

This ensures Vite hashes the asset and serves it correctly in all environments.

---

## Fix 2 — Skip Button on Gender Question

**File:** `src/components/firsttime/OnboardingQuiz.tsx`

- **Line 303:** Change `const isSkippable = currentStep >= 2;` to `const isSkippable = currentStep >= 3;`

Result: Steps 0 (full_name), 1 (academic_grade), and 2 (gender) are all required. Steps 3-6 remain skippable.

---

## Fix 3 — Haitian Cultural Context in Prompt

**File:** `supabase/functions/generate-custom-avatar/index.ts`

- **Lines 122-123:** Insert the mandatory cultural block at the very start of the prompt, before the existing "CRITICAL INSTRUCTIONS" line:

```
MANDATORY CULTURAL CONTEXT: This avatar represents a Haitian student. The character must have features consistent with Caribbean/Haitian heritage — warm skin undertones, facial features reflecting Afro-Caribbean or mixed Caribbean ancestry. The overall aesthetic should feel warm, vibrant, and Caribbean in spirit regardless of the art style chosen. This is non-negotiable and must be reflected in every generated avatar.
```

The prompt string becomes: cultural context block, then blank line, then the existing "CRITICAL INSTRUCTIONS" text. No other prompt lines change.

---

## Safety Verification

| Check | Status |
|---|---|
| Jude image renders in character creator | Yes -- proper Vite asset import resolves in all envs |
| Gender question has no skip button | Yes -- `isSkippable = currentStep >= 3` excludes step 2 |
| Haitian cultural block in every prompt | Yes -- prepended before all user selections |
| Save flow affected? | No |
| Database changes? | None |
| New dependencies? | None |
| Existing avatars affected? | No -- only future generations include the new context |
| Edge function response shape? | Unchanged |

