
# Email Plan A — Security and Correctness Fixes

## Scope
5 targeted fixes across 3 files. No database changes. No new edge functions.

---

## File Change Summary

| File | Change | Fix |
|---|---|---|
| `supabase/functions/send-login-notification/index.ts` | Remove reset token generation, update template, upgrade Resend | Fix 1, Fix 4 |
| `supabase/functions/_shared/emails.ts` | Fix SITE_URL fallback, add email lookup fallback from profiles | Fix 2, Fix 3 |
| `supabase/functions/send-welcome-email/index.ts` | Remove dead verificationUrl conditional block | Fix 5 |

---

## Fix 1 — Remove Password Reset Token from Login Notification

**File:** `supabase/functions/send-login-notification/index.ts`

### Part A — Remove the reset token generation block (lines 241-259)

Delete the entire block that calls `generate_password_reset_token` RPC. The `resetUrl` variable is replaced with a direct link to the Settings page.

```ts
// Before (lines 241-259):
let resetUrl = 'https://mon-edupreneur.com/auth/login';
try {
  const { data: tokenData, error: tokenError } = await supabase.rpc(
    'generate_password_reset_token',
    { user_email: email }
  );
  // ... token handling ...
} catch (tokenGenError) { ... }

// After:
// Direct link to settings — requires authentication, no token needed
const settingsUrl = 'https://mon-edupreneur.com/settings';
```

### Part B — Update the template signature and "Warning Box" button

The `getEmailTemplate` function signature changes:
- Remove the `resetUrl` parameter
- Add a `settingsUrl` parameter (or inline the constant)

In the Warning Box (lines 148-163), change:
- Button text from `"🔐 Changer mon mot de passe"` to `"🔐 Sécuriser mon compte"`
- Button href from `${resetUrl}` to `https://mon-edupreneur.com/settings`
- Warning text updated to direct user to their settings instead of changing password directly

```html
<!-- Before -->
<a href="${resetUrl}" style="...">🔐 Changer mon mot de passe</a>

<!-- After -->
<a href="https://mon-edupreneur.com/settings" style="...">🔐 Sécuriser mon compte</a>
```

The warning paragraph text changes from:
> "Si vous ne reconnaissez pas cette connexion, securisez immediatement votre compte en changeant votre mot de passe."

To:
> "Si vous ne reconnaissez pas cette connexion, securisez immediatement votre compte."

### Part C — Remove Supabase client (no longer needed)

Since the only reason `createClient` was used was for rate limiting AND the reset token RPC, and rate limiting still needs it, the Supabase client import stays. However, the `generate_password_reset_token` RPC call is fully removed.

### Part D — Update the template call site

```ts
// Before (line 265):
html: getEmailTemplate(fullName, email, timestamp, resetUrl, device, location),

// After:
html: getEmailTemplate(fullName, email, timestamp, device, location),
```

---

## Fix 2 — Fix SITE_URL Fallback in `_shared/emails.ts`

**File:** `supabase/functions/_shared/emails.ts`, line 9

```ts
// Before:
const SITE_URL = Deno.env.get("SITE_URL") || "https://edupreneurs-haiti-ai.lovable.app";

// After:
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";
```

**SITE_URL secret status:** Confirmed present in the project secrets list. The fallback is purely defensive for the case where the secret is accidentally deleted.

**Impact:** This constant is used in CTA buttons across 6 email templates (subscription confirmation, gift student, gift payer thank you, renewal student, renewal payer, payer invoice). All will correctly point to the production domain even if the secret is removed.

---

## Fix 3 — Add Email Lookup Fallback in `sendSubscriptionEmails`

**File:** `supabase/functions/_shared/emails.ts`, lines 296-308

Currently, if `payment_transactions.metadata.email` is missing, the function logs a message and returns without sending any email. This is a silent failure.

The fix adds a fallback: query `auth.users` via `supabaseAdmin` (available in `sendSubscriptionEmailsWithAuth`) or query the caller for the email. However, `sendSubscriptionEmails` receives a generic `supabase` client typed as `{ from: (table: string) => any }` which cannot call `auth.admin.getUserById`.

**Solution:** Since `sendSubscriptionEmailsWithAuth` (line 336) already has the full admin client and correctly fetches email from `auth.users`, the fix targets only `sendSubscriptionEmails` (line 275). The fallback will query the `profiles` table for an `email` column. However, checking the profiles table schema, there is no `email` column — the email lives in `auth.users`.

**Revised approach:** The `sendSubscriptionEmails` function receives a Supabase client. We can't access `auth.users` from it. Instead, the fallback will use the Resend API key already available in the module to query the profiles table for a `contact_email` or similar. But since no email column exists on profiles, the most practical fix is:

1. In `sendSubscriptionEmails`, if `metadata.email` is missing, log a **warning** (not just a log) with the `orderId` and `userId` so the issue is clearly visible.
2. The callers that use `sendSubscriptionEmailsWithAuth` already have the correct fallback via `auth.admin.getUserById`.
3. For the callers using `sendSubscriptionEmails`, add a note that they should migrate to `sendSubscriptionEmailsWithAuth`.

```ts
// Before (lines 302-308):
const userEmail = txn?.metadata?.email || txn?.metadata?.userEmail;
const userName = userAuth?.full_name || "Étudiant";

if (!userEmail) {
  console.log(`[Email] No email found for user ${userId}, skipping emails`);
  return;
}

// After:
const metadataEmail = txn?.metadata?.email || txn?.metadata?.userEmail;
const userName = userAuth?.full_name || "Étudiant";

// Fallback: if metadata has no email, try to find it from profiles or auth
let userEmail = metadataEmail;
if (!userEmail) {
  console.warn(`[Email] WARNING: No email in transaction metadata for order ${orderId}, user ${userId}. Attempting profiles fallback.`);
  // Query auth.users email via the admin client if available
  // The supabase param here is a service-role client, try auth.admin
  try {
    const adminClient = supabase as any;
    if (adminClient?.auth?.admin?.getUserById) {
      const { data: authData } = await adminClient.auth.admin.getUserById(userId);
      userEmail = authData?.user?.email;
      if (userEmail) {
        console.warn(`[Email] Fallback succeeded: found email from auth for user ${userId}`);
      }
    }
  } catch (fallbackErr) {
    console.warn(`[Email] Auth fallback failed:`, fallbackErr);
  }
}

if (!userEmail) {
  console.error(`[Email] CRITICAL: No email found for user ${userId}, order ${orderId}. Subscription emails NOT sent.`);
  return;
}
```

This approach:
- Tries the `auth.admin.getUserById` method if the client supports it (service-role clients do)
- Logs a clear WARNING when the fallback is used
- Logs a CRITICAL error when both paths fail
- Does not change the function signature or break any callers

---

## Fix 4 — Upgrade Resend Import in `send-login-notification`

**File:** `supabase/functions/send-login-notification/index.ts`, line 10

```ts
// Before:
import { Resend } from "https://esm.sh/resend@2.0.0";

// After:
import { Resend } from "https://esm.sh/resend@4.0.0";
```

---

## Fix 5 — Remove Dead `verificationUrl` Code from Welcome Email

**File:** `supabase/functions/send-welcome-email/index.ts`

### Part A — Remove the conditional block from the template (lines 63-73)

```html
<!-- Delete this entire block -->
${verificationUrl ? `
<table role="presentation" ...>
  <tr>
    <td style="text-align: center;">
      <a href="${verificationUrl}" ...>✓ Vérifier mon email</a>
    </td>
  </tr>
</table>
` : ''}
```

### Part B — Remove `verificationUrl` from template signature and caller

```ts
// Before (line 18):
const getEmailTemplate = (fullName: string, verificationUrl?: string) => `

// After:
const getEmailTemplate = (fullName: string) => `
```

```ts
// Before (line 172):
const verificationUrl = rawBody.verificationUrl; // Optional field

// After:
// (delete this line entirely)
```

```ts
// Before (line 180):
html: getEmailTemplate(fullName, verificationUrl),

// After:
html: getEmailTemplate(fullName),
```

---

## Safety Verification Table

| Risk | Analysis | Status |
|---|---|---|
| Login notification email stops sending after removing reset token block | Only the RPC call and `resetUrl` variable are removed. The `resend.emails.send()` call at line 261 is unchanged. The template still renders with all connection details. | Safe |
| "Securiser mon compte" button links to wrong URL | Hardcoded to `https://mon-edupreneur.com/settings`. This is the production domain confirmed in the codebase. The Settings page requires authentication — if the user is not logged in, the app's auth guard redirects to login first. | Safe |
| SITE_URL fallback change affects other email functions | The `SITE_URL` constant is used only in `_shared/emails.ts` templates. Changing the fallback from the preview domain to the production domain is strictly an improvement. If `SITE_URL` secret is set (confirmed: it is), the fallback is never used anyway. | Safe |
| Subscription email fallback causes runtime errors | The fallback uses a `try/catch` with `as any` cast. If the client doesn't support `auth.admin`, the catch block logs a warning and continues to the existing "no email found" path. No new error paths introduced. | Safe |
| Resend v4 breaks send-login-notification | All other email functions already use resend@4.0.0. The `emails.send()` API is identical between v2 and v4. | Safe |
| Removing verificationUrl breaks welcome email | The caller at line 172 reads `rawBody.verificationUrl` but no frontend code ever sends this field. The template conditional always evaluates to the empty string `''`. Removing it produces identical HTML output. | Safe |
| Removing Supabase client import from login notification | The Supabase client is still needed for rate limiting (line 213-216). Only the RPC call is removed. Import stays. | Safe |
