
# Email Plan B — Email System Cleanup

## Scope
2 file deletions + 1 page deletion + copyright year fix across 11 files + response format standardization across 8 send- functions. No database changes.

---

## File Change Summary

| File | Change | Fix |
|---|---|---|
| `supabase/functions/send-birthday-email/` | **Delete directory** | Fix 1 |
| `supabase/functions/send-test-email/` | **Delete directory** | Fix 2 |
| `src/pages/EmailTest.tsx` | **Delete file** | Fix 2 (only caller of send-test-email) |
| `src/App.tsx` | Remove EmailTest import + route | Fix 2 |
| `supabase/config.toml` | Remove 2 function entries | Fix 1 + Fix 2 |
| `supabase/functions/check-birthdays/index.ts` | Dynamic copyright year | Fix 3 |
| `supabase/functions/send-login-notification/index.ts` | Dynamic year + standardized response | Fix 3 + Fix 4 |
| `supabase/functions/send-confirmation-email/index.ts` | Dynamic year + standardized response | Fix 3 + Fix 4 |
| `supabase/functions/send-welcome-email/index.ts` | Dynamic year + standardized response | Fix 3 + Fix 4 |
| `supabase/functions/send-password-reset-email/index.ts` | Dynamic year + standardized response | Fix 3 + Fix 4 |
| `supabase/functions/send-farewell-email/index.ts` | Dynamic year + standardized response | Fix 3 + Fix 4 |
| `supabase/functions/send-device-verification-email/index.ts` | Dynamic year + standardized response | Fix 3 + Fix 4 |
| `supabase/functions/send-report-confirmation/index.ts` | Dynamic year + standardized response | Fix 3 + Fix 4 |
| `supabase/functions/admin-delete-user-account/index.ts` | Dynamic year | Fix 3 |
| `supabase/functions/admin-delete-post/index.ts` | Dynamic year | Fix 3 |
| `supabase/functions/delete-user-account/index.ts` | Dynamic year | Fix 3 |

---

## Pre-Delete Verification

| File | Caller search | Result | Safe to delete? |
|---|---|---|---|
| `supabase/functions/send-birthday-email/` | Zero matches in all `src/` files. Zero matches in all `supabase/functions/` files except its own directory. `check-birthdays` has its own inline template. | No callers | Yes |
| `supabase/functions/send-test-email/` | Only caller is `src/pages/EmailTest.tsx` (dev test page). No other callers in `src/` or `supabase/functions/`. | 1 caller (dev page, also being deleted) | Yes |
| `src/pages/EmailTest.tsx` | Only referenced in `src/App.tsx` (import + route). No other file imports or links to it. The page is a developer utility at `/email-test` with no navigation link in the app shell. | 1 reference (App.tsx, being cleaned) | Yes |

---

## Fix 1 — Delete send-birthday-email

- Delete `supabase/functions/send-birthday-email/` directory
- Remove `[functions.send-birthday-email]` + `verify_jwt = false` from `supabase/config.toml`
- Use `supabase--delete_edge_functions` to undeploy from live environment

---

## Fix 2 — Delete send-test-email + EmailTest Page

- Delete `supabase/functions/send-test-email/` directory
- Delete `src/pages/EmailTest.tsx`
- Remove `[functions.send-test-email]` + `verify_jwt = false` from `supabase/config.toml`
- In `src/App.tsx`:
  - Remove the lazy import: `const EmailTest = lazy(() => import("./pages/EmailTest"));` (line 89)
  - Remove the route block: `<Route path="/email-test" element={...}` (lines 483-487)
- Use `supabase--delete_edge_functions` to undeploy from live environment

---

## Fix 3 — Dynamic Copyright Year

Replace every hardcoded `© 2025` with a dynamic year using `new Date().getFullYear()`.

**Pattern:** Each email function has a `getEmailTemplate` function that returns an HTML string. The copyright line is always in the footer.

For functions that use template literals directly (most of them), the fix is:

```html
<!-- Before -->
© 2025 Edupreneurs. Tous droits réservés.

<!-- After -->
© ${new Date().getFullYear()} Edupreneurs. Tous droits réservés.
```

**Files requiring this change (11 total):**

| File | Line | Current |
|---|---|---|
| `check-birthdays/index.ts` | 147 | `© 2025` |
| `send-login-notification/index.ts` | 190 | `© 2025` |
| `send-confirmation-email/index.ts` | 171 | `© 2025` |
| `send-welcome-email/index.ts` | 121 | `© 2025` |
| `send-password-reset-email/index.ts` | 102 | `© 2025` |
| `send-farewell-email/index.ts` | 123 | `© 2025` |
| `send-device-verification-email/index.ts` | 133 | `© 2025` |
| `send-report-confirmation/index.ts` | 66 | `© 2025` |
| `admin-delete-user-account/index.ts` | 73 | `© 2025` |
| `admin-delete-post/index.ts` | 64 | `© 2025` |
| `delete-user-account/index.ts` | 114 | `© 2025` |

**Note:** `send-birthday-email` and `send-test-email` also have hardcoded years but are being deleted in Fix 1 and Fix 2. The `_shared/emails.ts` templates are not in this list because they don't have a hardcoded `© 2025` footer (confirmed during audit).

---

## Fix 4 — Standardize Response Format

All `send-*` email edge functions should return:
- **Success:** `{ success: true, messageId: "<resend-id>" }`
- **Failure:** `{ success: false, error: "<message>" }`

### Current response formats by function:

| Function | Current success response | Current error response |
|---|---|---|
| `send-login-notification` | Raw Resend object `emailResponse` | `{ error: "..." }` |
| `send-confirmation-email` | Raw Resend object `emailResponse` | `{ error: "..." }` |
| `send-welcome-email` | Raw Resend object `emailResponse` | `{ error: "..." }` |
| `send-password-reset-email` | Raw Resend object `emailResponse` | `{ error: "..." }` |
| `send-farewell-email` | Raw Resend object via `secureJsonResponse(emailResponse)` | `secureErrorResponse("...")` |
| `send-device-verification-email` | `{ success: true, id: "..." }` | `{ error: "..." }` |
| `send-report-confirmation` | `{ success: true }` | `{ error: "..." }` |

### Standardization changes:

**For functions using raw `JSON.stringify(emailResponse)`** (login-notification, confirmation-email, welcome-email, password-reset-email):
```ts
// Before:
return new Response(JSON.stringify(emailResponse), { status: 200, headers: responseHeaders });

// After:
return new Response(
  JSON.stringify({ success: true, messageId: emailResponse?.data?.id || null }),
  { status: 200, headers: responseHeaders }
);
```

**For send-farewell-email** (uses `secureJsonResponse`):
```ts
// Before:
return secureJsonResponse(emailResponse, 200, true);

// After:
return secureJsonResponse({ success: true, messageId: emailResponse?.data?.id || null }, 200, true);
```

**For send-device-verification-email** (already close):
```ts
// Before:
return new Response(JSON.stringify({ success: true, id: emailResponse.data?.id }), ...);

// After:
return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id || null }), ...);
```

**For send-report-confirmation** (missing messageId):
```ts
// Before:
return new Response(JSON.stringify({ success: true }), ...);

// After — need to capture emailResponse first, then:
return new Response(JSON.stringify({ success: true, messageId: emailResponse?.data?.id || null }), ...);
```

**Error responses:** Most already return `{ error: "..." }`. Standardize to `{ success: false, error: "..." }`:
```ts
// Before:
JSON.stringify({ error: error.message })

// After:
JSON.stringify({ success: false, error: error.message })
```

### Caller compatibility analysis:

| Caller | File | What it reads | Compatible? |
|---|---|---|---|
| Device verification | `device-verify.service.ts` | `emailData?.error` (truthy check) | Yes - `{ success: false, error: "..." }` still has truthy `.error` |
| Login notification | `login.service.ts` | Fire-and-forget (`await` but no response check) | Yes |
| Welcome email | `verify.service.ts` | Fire-and-forget | Yes |
| Confirmation email | `verify.service.ts`, `login.service.ts`, `signup.service.ts` | Fire-and-forget | Yes |
| Password reset | `loginAttempts.service.ts`, `ForgotPasswordPage.tsx` | Checks `error` from invoke, not response body | Yes |
| Report confirmation | `ReportDialog.tsx` | Fire-and-forget (`.catch()`) | Yes |
| Farewell email | `delete-user-account/index.ts` (edge fn) | Fire-and-forget (inline call) | Yes |
| EmailTest.tsx | Being deleted | N/A | N/A |

No caller reads `.data.id` or any Resend-specific field from the response body. All callers either fire-and-forget or check the `error` field. The standardized format preserves `.error` on failure and adds `.success` which no existing caller conflicts with.

---

## Safety Verification Table

| Risk | Analysis | Status |
|---|---|---|
| send-birthday-email deletion breaks birthday flow | `check-birthdays` sends emails inline with its own template. Zero callers to `send-birthday-email` confirmed. | Safe |
| send-test-email deletion breaks a feature | Only caller is `EmailTest.tsx` (dev page at `/email-test`), which is also being deleted. No user-facing feature depends on it. | Safe |
| EmailTest.tsx deletion breaks navigation | No sidebar, shell, or component links to `/email-test`. It's only accessible by typing the URL directly. Removing the route + import is clean. | Safe |
| Dynamic copyright year renders incorrectly | `new Date().getFullYear()` inside a template literal evaluates at function execution time (email send time). Returns a 4-digit integer (e.g. 2026). Standard JavaScript behavior in Deno. | Safe |
| Standardized response breaks device-verify caller | `device-verify.service.ts` checks `emailData?.error` (lines 228, 361). The new error format `{ success: false, error: "..." }` still has a truthy `.error` field. The success format `{ success: true, messageId: "..." }` has no `.error` field (undefined = falsy). Behavior is identical. | Safe |
| Standardized response breaks other callers | All other callers fire-and-forget or only check the `error` return from `supabase.functions.invoke()` (transport error), not the response body. No caller reads Resend-specific fields. | Safe |
| secureErrorResponse already returns `{ error: "..." }` without `success: false` | The `secureErrorResponse` helper in `_shared/securityHeaders.ts` returns `{ error: message }`. For `send-farewell-email`, which uses this helper, we should NOT modify the shared helper (it's used by non-email functions too). Instead, for farewell's catch block, we replace the `secureErrorResponse` call with a manual response that includes `success: false`. | Safe |
| Removing config.toml entries affects other functions | Each entry only applies to its own function. Removing them has no effect on other functions. | Safe |
