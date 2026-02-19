
# Fix: Email Verification Broken After Signup Redesign

## Problem
The `confirmationEmailSchema` in `supabase/functions/_shared/validation.ts` requires `nickname` (string, min 2) and `academicGrade` (string) as mandatory fields. After the signup redesign, `signup.service.ts` sends `null` for both, causing Zod validation to reject the request before Resend is ever called.

## Solution
Make `nickname` and `academicGrade` nullable/optional in the `confirmationEmailSchema`, and update the email template to handle null values gracefully.

---

## Changes

### 1. Update `confirmationEmailSchema` in `supabase/functions/_shared/validation.ts`

Change lines 190-206:

```typescript
export const confirmationEmailSchema = z.object({
  email: z.string()
    .email("Email invalide")
    .max(255, "Email trop long"),
  fullName: z.string()
    .min(2, "Nom trop court")
    .max(200, "Nom trop long")
    .transform(s => s.trim()),
  nickname: z.string()
    .max(50, "Pseudo trop long")
    .transform(s => s.trim())
    .nullable()
    .optional(),
  academicGrade: z.string()
    .max(50)
    .nullable()
    .optional(),
  confirmationCode: z.string()
    .length(6, "Code doit etre 6 chiffres")
    .regex(/^\d{6}$/, "Code invalide"),
}).strict();
```

Key changes:
- `nickname`: Remove `.min(2)`, add `.nullable().optional()`
- `academicGrade`: Add `.nullable().optional()`
- `fullName`: Keep as required (signup.service.ts already passes email as fallback)

### 2. Update email template in `supabase/functions/send-confirmation-email/index.ts`

Update the `getEmailTemplate` function signature to accept nullable values:

```typescript
const getEmailTemplate = (
  fullName: string,
  nickname: string | null,
  academicGrade: string | null,
  email: string,
  confirmationCode: string
) => ...
```

In the template body, conditionally render the Pseudo and Niveau rows only when values are present:
- Hide the "Pseudo" row if `nickname` is null
- Hide the "Niveau" row if `academicGrade` is null
- The "Nom complet" row will show the email address (already handled by the signup service fallback)

### 3. Redeploy the edge function

After updating the shared validation and the edge function, deploy `send-confirmation-email`.

---

## No other files need changes

- `signup.service.ts` is already correct -- it sends `nickname: null` and `academicGrade: null`
- The profile insert works fine -- confirmed by the auth logs showing successful signup
- The `createAccount()` flow completes and returns `success: true` regardless of the email result (the invoke call is fire-and-forget within the try block)

---

## Safety Verification

| Check | Status |
|---|---|
| Schema accepts null nickname and academicGrade | Fixed by `.nullable().optional()` |
| Schema still validates email and confirmationCode strictly | Unchanged -- still required |
| Email template does not crash on null nickname/grade | Template conditionally renders those rows |
| Existing users with nickname/grade still get full email | Yes -- template shows rows when values are present |
| Edge function redeploy needed | Yes -- validation.ts is a shared import |
| No other edge functions use confirmationEmailSchema | Correct -- only send-confirmation-email uses it |
