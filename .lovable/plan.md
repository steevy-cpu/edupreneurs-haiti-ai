

# Fix 4 High-Severity Security and Stability Bugs

## Fix 1 -- Realtime Subscription Channel Churn (AppShell.tsx)

**File:** `src/shell/AppShell.tsx`

**Problem:** `location.pathname` in the dependency array (line 195) tears down and recreates both WebSocket channels on every navigation. On 3G, this causes 2-5 second reconnection windows where events are missed.

**Change:**
- Add a `pathnameRef` using `useRef(location.pathname)` and keep it updated via a separate `useEffect`
- Inside the realtime callbacks (lines 124 and 146), replace `location.pathname` reads with `pathnameRef.current`
- Remove `location.pathname` from the subscription `useEffect` dependency array (line 195)

This follows the existing project pattern documented in the realtime subscription stability memory.

---

## Fix 2 -- Rate Limit create-stripe-renewal (Edge Function)

**File:** `supabase/functions/create-stripe-renewal/index.ts`

**Problem:** No rate limiting -- authenticated users can spam unlimited Stripe Checkout sessions.

**Change:**
- Import `checkRateLimit`, `getClientIp`, `rateLimitResponse`, `RATE_LIMITS` from `../_shared/rateLimiter.ts`
- Create a service-role Supabase client for the rate limit check (same pattern as other edge functions)
- Add rate limit check using `RATE_LIMITS.PAYMENT` config (30 req/min auth) right after auth validation
- This provides per-user limiting consistent with other payment endpoints

---

## Fix 3 -- Sanitize dangerouslySetInnerHTML in BatchLessonGenerator

**File:** `src/components/content-editor/BatchLessonGenerator.tsx`

**Problem:** Line 1625 renders AI-generated HTML via `dangerouslySetInnerHTML={{ __html: content }}` with no sanitization -- XSS vector.

**Change:**
- `createSanitizedMarkup` is already imported at line 18 but not used at the vulnerable line
- Replace `dangerouslySetInnerHTML={{ __html: content }}` with `dangerouslySetInnerHTML={createSanitizedMarkup(content)}`
- No new dependency needed -- the project's existing `sanitize.ts` utility handles this

---

## Fix 4 -- Rate Limiter Fail-Closed

**File:** `supabase/functions/_shared/rateLimiter.ts`

**Problem:** Lines 204-211: `catch` block returns `{ allowed: true }` when the DB query fails, bypassing all rate limiting under load.

**Change:**
- Replace `console.warn` with `console.error` and a distinct message: `"Rate limit service unavailable. Failing closed."`
- Return `{ allowed: false, remaining: 0, retryAfter: 30 }` instead of `{ allowed: true, remaining: maxRequests }`
- This ensures requests are rejected (not silently allowed) when the limiter itself is degraded

---

## Safety Verification

| Check | Status |
|-------|--------|
| Existing realtime behavior preserved | Yes -- only the re-subscription frequency changes, not the logic |
| Desktop/mobile layout unaffected | No UI changes |
| Other edge functions unaffected | rateLimiter.ts catch change applies globally -- intended, all endpoints should fail closed |
| No new dependencies added | Correct -- uses existing `createSanitizedMarkup` utility |
| No DB schema changes | Correct |
| No provider stack changes | Correct |
| 3G impact | Positive -- fewer WebSocket reconnections |

