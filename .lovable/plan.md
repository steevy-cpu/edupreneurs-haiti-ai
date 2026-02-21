
# Email Plan A: Fix Welcome Email, Add Time-Aware Greetings, Mark Dead Code

## Overview
Three targeted changes across edge functions: fix the broken welcome email template, create a shared time-aware greeting helper, apply it to all 7 email templates, and deprecate the unused farewell email function.

---

## Fix 1 -- Fix broken welcome email

**File:** `supabase/functions/send-welcome-email/index.ts`

**Changes:**
- Remove lines 64-74 (the `verificationUrl` conditional block that references an undefined variable)
- Replace with a CTA button linking to `https://edupreneurs.ht` with text "Acceder a la plateforme"
- Update template function signature to accept `nickname` parameter: `getEmailTemplate(fullName: string, nickname: string | null)`
- Use `nickname || fullName` for the personalized greeting line
- Pass `nickname` from the handler (line 180): `getEmailTemplate(fullName, nickname)`

---

## Fix 2 -- Create shared greeting helper + apply to all templates

### New file: `supabase/functions/_shared/emailGreeting.ts`

Creates a single exported function `getTimeAwareGreeting(name: string): string` that:
- Gets current time in Haiti timezone (America/Port-au-Prince, UTC-5)
- Returns time-appropriate French greeting with emoji:
  - 5:00-11:59 -> "Bonjour {name}! (sun emoji)"
  - 12:00-17:59 -> "Bon apres-midi {name}! (sun cloud emoji)"
  - 18:00-21:59 -> "Bonsoir {name}! (moon emoji)"
  - 22:00-4:59 -> "Bonne nuit {name}! (star emoji)"

### Apply greeting to 7 edge functions

Each file gets:
1. A new import: `import { getTimeAwareGreeting } from "../_shared/emailGreeting.ts";`
2. The hardcoded "Salut {name}" greeting replaced with `${getTimeAwareGreeting(displayName)}`

| File | Current greeting line | Display name source |
|------|----------------------|-------------------|
| `send-welcome-email/index.ts` (line 58) | `Salut fullName` | `nickname or fullName` |
| `send-confirmation-email/index.ts` (line 75) | `Salut fullName` | `fullName` (nickname may be null at signup) |
| `send-login-notification/index.ts` (line 74) | `Salut fullName` | `fullName` |
| `send-device-verification-email/index.ts` (line 74) | `Salut fullName` | `fullName` |
| `send-password-reset-email/index.ts` (line ~57) | `Salut fullName` | `fullName` |
| `delete-user-account/index.ts` (line 58) | `Salut fullName` | `fullName` |
| `admin-delete-user-account/index.ts` (line 54) | `Salut fullName` | `fullName` |

The greeting replaces only the text content inside the existing `<p>` tag. The `<strong>` styling and color remain unchanged -- only the text "Salut" becomes the dynamic greeting.

---

## Fix 3 -- Mark send-farewell-email as deprecated

**File:** `supabase/functions/send-farewell-email/index.ts`

Add a comment block at line 1:
```text
// DEPRECATED: This function is unused. Farewell emails are sent inline by
// delete-user-account and admin-delete-user-account.
// Do not delete the file in case it is needed for rollback.
```

No other changes to this file.

---

## Files touched (8 total)

| File | Change type |
|------|------------|
| `supabase/functions/_shared/emailGreeting.ts` | NEW -- shared greeting helper |
| `supabase/functions/send-welcome-email/index.ts` | FIX -- remove verificationUrl, add CTA, add greeting |
| `supabase/functions/send-confirmation-email/index.ts` | UPDATE -- add greeting import + replace Salut |
| `supabase/functions/send-login-notification/index.ts` | UPDATE -- add greeting import + replace Salut |
| `supabase/functions/send-device-verification-email/index.ts` | UPDATE -- add greeting import + replace Salut |
| `supabase/functions/send-password-reset-email/index.ts` | UPDATE -- add greeting import + replace Salut |
| `supabase/functions/delete-user-account/index.ts` | UPDATE -- add greeting import + replace Salut |
| `supabase/functions/admin-delete-user-account/index.ts` | UPDATE -- add greeting import + replace Salut |

No frontend files, no DB changes, no new dependencies.

---

## Safety verification

| Check | Status |
|-------|--------|
| No DB changes | Correct |
| No new dependencies | Correct |
| No frontend changes | Correct |
| RLS unaffected | Correct |
| Rate limiting preserved | Correct |
| All existing email validation schemas unchanged | Correct |
| send-farewell-email still deployable (not deleted) | Correct |
| Edge function cold start impact | None -- one tiny import added |
