
## Plan 4: Fix C6 (authFlow.store.ts → sessionStorage) + C7 (generate-battle-questions auth + rate limiting)

Two focused security fixes. Nothing else changes.

---

### Fix C6 — Migrate authFlow.store.ts from localStorage to sessionStorage

**What the problem is:**

The JSDoc comments throughout the file say "sessionStorage" but every actual call uses `localStorage`. This means:
- `pendingUserId`, `email`, `deviceChallengeId`, and `lockedEmail` persist indefinitely across browser restarts
- Auth state is shared across all tabs in the same browser (localStorage is tab-shared; sessionStorage is tab-isolated)
- A user who walks away from a public computer leaves their pending auth challenge readable to the next person

There are exactly **6 localStorage calls** in the file — all in `authFlow.store.ts`. No other file touches localStorage directly for these keys; they all go through the exported functions.

**The migration:**

Every `localStorage.getItem`, `localStorage.setItem`, and `localStorage.removeItem` call becomes the equivalent `sessionStorage` call. The keys (`edupreneurs_auth_flow`, `edupreneurs_signup_data`) stay the same — only the storage backend changes.

**The stale-data cleanup requirement:**

Existing users who have auth data in localStorage will not see it after migration (sessionStorage won't find it). This is the correct and safe behavior — they'll just be redirected to login as if fresh. However, the request specifies we should clean up stale localStorage data on read so it doesn't accumulate silently. The fix: in `getAuthFlow()` and `getSignupProgress()`, after reading from sessionStorage, also call `localStorage.removeItem(AUTH_FLOW_KEY)` / `localStorage.removeItem(SIGNUP_DATA_KEY)` to evict any legacy value. This is a one-time cleanup per device, after which localStorage will be empty and the removeItem call is a no-op.

**Exact changes to `src/auth/store/authFlow.store.ts`:**

| Function | Line | Change |
|---|---|---|
| `saveAuthFlow` | 55 | `localStorage.setItem` → `sessionStorage.setItem` |
| `getAuthFlow` | 67 | `localStorage.getItem` → `sessionStorage.getItem`; add `localStorage.removeItem(AUTH_FLOW_KEY)` cleanup after read |
| `clearAuthFlow` | 90 | `localStorage.removeItem` → `sessionStorage.removeItem`; also call `localStorage.removeItem` for cleanup |
| `saveSignupProgress` | 162 | `localStorage.setItem` → `sessionStorage.setItem` |
| `getSignupProgress` | 173 | `localStorage.getItem` → `sessionStorage.getItem`; add `localStorage.removeItem(SIGNUP_DATA_KEY)` cleanup |
| `clearSignupProgress` | 187 | `localStorage.removeItem` → `sessionStorage.removeItem`; also call `localStorage.removeItem` |

No other files are touched. All 16 files that import from `authFlow.store.ts` call the exported functions — the migration is fully transparent to them.

**Impact on existing flows:**

- **3-step signup flow** — Steps 1 → 2 → 3 happen within the same tab. sessionStorage is tab-local and survives page navigations and refreshes within the same tab. The flow is unaffected.
- **Device verification flow** — User receives email, returns to the same browser tab. sessionStorage persists across navigations within the tab. The `deviceChallengeId` will still be present when they enter the code.
- **Email verification flow** — Same tab behavior. `pendingUserId` survives page refresh within the same tab session.
- **SignupPaymentCallback** — This is a redirect back from MonCash. The callback lands in the **same browser window/tab** that initiated payment (MonCash redirects via `window.location.href`). sessionStorage is preserved across same-tab redirects, so `edupreneurs_signup_data` will still be readable. This is the critical case to note — and it is safe.
- **Password reset lockout** — The `lockedEmail` / `password-reset-required` flow is also same-tab. Safe.

The one behavioral change users will notice: if they open the verification page in a **new tab**, the auth state won't be there. They'll be redirected to login. This is actually the more secure behavior — the old localStorage approach silently shared pending challenge IDs across tabs.

---

### Fix C7 — Add auth check and rate limiting to generate-battle-questions

**What the problem is:**

The `generate-battle-questions` edge function calls the Lovable AI Gateway (which costs credits) with zero authentication. Any unauthenticated HTTP request to the function URL triggers a full AI generation with no user validation. This is a direct quota drain vector.

**The fix — two additions to `supabase/functions/generate-battle-questions/index.ts`:**

**Addition 1 — Authorization check (identical pattern to process-ai-job):**

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// After OPTIONS handler, before try block:
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const token = authHeader.replace('Bearer ', '');
const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
  global: { headers: { Authorization: authHeader } },
});
const { data: claimsData, error: authError } = await anonClient.auth.getClaims(token);
if (authError || !claimsData?.claims) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
const userId = claimsData.claims.sub;
```

**Addition 2 — Rate limiting using `RATE_LIMITS.AI_TUTOR`:**

The `RATE_LIMITS.AI_TUTOR` config is: 60 req/min for authenticated users, 10 req/min for anonymous (which will now never be reached since anon requests are rejected first). This is the same config used by the 11 AI tutor functions.

```typescript
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";

// After auth check, before req.json():
const serviceClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const clientIp = getClientIp(req);
const rateLimit = await checkRateLimit(serviceClient, RATE_LIMITS.AI_TUTOR, userId, clientIp);
if (!rateLimit.allowed) {
  return rateLimitResponse(rateLimit.retryAfter!, rateLimit.remaining, corsHeaders);
}
```

Note: a `serviceClient` is created only for the rate limit DB write (the `rate_limits` table requires service role to write). The `anonClient` is used only for JWT verification. This matches the established pattern.

**Why `AI_TUTOR` config is the right choice:**

Quiz battle questions are AI tutor equivalents — they're generated per battle session. 60 req/min per authenticated user is generous for quiz battles (a 10-question set is 1 call). Using a separate `QUIZ_BATTLE` bucket would fragment the rate limit namespace without meaningful benefit at this stage.

---

### Files Changed

| File | Change |
|---|---|
| `src/auth/store/authFlow.store.ts` | Replace all 6 `localStorage` calls with `sessionStorage`; add legacy `localStorage.removeItem` cleanup in read functions |
| `supabase/functions/generate-battle-questions/index.ts` | Add `createClient` import; add auth header check with `getClaims()`; add rate limit check using `RATE_LIMITS.AI_TUTOR` before the main `try` block |

---

### Safety Verification

| Check | Status |
|---|---|
| Does sessionStorage persist across same-tab page refreshes? | Yes — sessionStorage survives `window.location` navigations and browser refreshes within the same tab session |
| Does the MonCash payment redirect (same-tab) preserve sessionStorage? | Yes — `window.location.href` redirect within the same tab preserves sessionStorage |
| Does Step1 → Step2 → Step3 navigation work? | Yes — React Router navigation within the same tab preserves sessionStorage |
| Does this break opening the verification page in a new tab? | Intentionally yes — the new tab won't see the pending auth state. Users will be redirected to login. This is the more secure behavior |
| Do all 16 files that import authFlow.store.ts need changes? | No — they call exported functions. The migration is internal. Zero other files change |
| Does the generate-battle-questions auth check block existing authenticated quiz battle flows? | No — authenticated users already send the `Authorization` header via the Supabase client. The check passes transparently |
| Does rate limiting affect quiz battle performance? | No — 60 req/min per user; a quiz battle generates questions once per session. The limit will never be hit in normal use |
| Is the service-role client in generate-battle-questions only used for the rate limit write? | Yes — it does not query user data or bypass RLS |
| Does this affect the fallback question generator? | No — the fallback runs after auth and rate limit pass, same as before |
| Cold start / 3G impact? | Auth check adds ~5ms, rate limit adds ~10ms — both are invisible to users on any connection speed |
| Hook count or React changes? | None — authFlow.store.ts is not a React hook or component |
