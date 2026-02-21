

# Fix 5 Medium-Severity Stability and UX Bugs

## Fix 1 -- Cache Auth State in AuthRouteGuard

**File:** `src/auth/guards/AuthRouteGuard.tsx`

**Problem:** Lines 53-58 make a DB query to fetch `email_confirmed` on every `location.pathname` and `location.search` change, even for already-confirmed users.

**Change:**
- Add a `useRef<boolean | null>(null)` called `emailConfirmedRef` to cache the confirmed status
- Before the DB call (line 53), check: if `emailConfirmedRef.current === true`, skip the query and use the cached value
- After a successful DB fetch, update the ref: `emailConfirmedRef.current = profile?.email_confirmed ?? null`
- Reset the ref to `null` when `user?.id` changes (new user signs in) so fresh users always get a DB check

This eliminates redundant profile queries for confirmed users navigating between pages on 3G.

---

## Fix 2 -- Fix null emailConfirmed Bypass in authStateMachine

**File:** `src/auth/store/authStateMachine.ts`

**Problem:** Line 65: `emailConfirmed !== false` treats `null` (query failed / still loading) as authenticated. On flaky 3G where the profile query returns null, unverified users slip through.

**Change:**
- Line 65: Change `if (session && emailConfirmed !== false)` to `if (session && emailConfirmed === true)`
- This ensures only an explicit `true` value grants authenticated state
- When `emailConfirmed` is `null` (unknown), the state falls through to `unauthenticated` instead of `authenticated`, which is safe -- the AuthRouteGuard will re-check on the next navigation

---

## Fix 3 -- Rate Limit delete-user-account Edge Function

**File:** `supabase/functions/delete-user-account/index.ts`

**Problem:** No rate limiting. An authenticated user (or attacker with a stolen token) can spam account deletion attempts.

**Change:**
- Import `checkRateLimit`, `getClientIp`, `rateLimitResponse`, `RATE_LIMITS` from `../_shared/rateLimiter.ts`
- After the auth validation block (line 159), add rate limit check using `RATE_LIMITS.AUTH` config
- Create a service-role client for the rate limit check (same pattern as `create-stripe-renewal`)
- Return `rateLimitResponse()` if rate limit exceeded

---

## Fix 4 -- Add File Size Validation to Blog Editor Image Upload

**File:** `src/components/blog/BlogPostEditor.tsx`

**Problem:** The image file input (line 563) has no size validation. The video upload already calls `validateAndPrepareVideo()` which enforces a 50MB limit, but images have no equivalent guard. A user could select a 500MB file and start an upload that will fail or hang on 3G.

**Change:**
- In `handleImageFileUpload` (line 193), add a size check before compression: if `imageFile.size > 10 * 1024 * 1024` (10MB), show a toast error with the message "Image trop volumineuse. Taille maximale: 10MB" and return early
- This matches the Community page's 10MB image limit for consistency

Note: Video upload already validates via `validateAndPrepareVideo()` which throws on >50MB and shows an error toast in the catch block. No video change needed.

---

## Fix 5 -- Fix SubscriptionGate Infinite Loading on Query Failure

**File:** `src/components/SubscriptionGate.tsx`

**Problem:** Lines 29-47: if the subscription profile query fails on 3G (network timeout, DB error), `profile` stays `null` forever and the user sees `SubscriptionLoadingSkeleton` with no way to recover.

**Change:**
- Destructure `isError` and `refetch` from the `useQuery` call (line 29)
- Add a `useState` timeout tracker: after 10 seconds of `!profile && !isError`, set a `timedOut` flag
- When `isError || timedOut`, render a new `SubscriptionErrorState` component instead of the skeleton
- `SubscriptionErrorState` shows an alert icon, the message "Impossible de vérifier votre abonnement", and a "Reessayer" button that calls `refetch()` and resets the timeout
- The skeleton continues to show during the initial 10-second window (normal loading)

---

## Safety Verification

| Check | Status |
|-------|--------|
| Auth flow for new signups unaffected | Fix 2 is safe: new signups go through authFlow 'verify' path (Priority 3) before reaching Priority 5 |
| Confirmed users unaffected by Fix 2 | Yes: `emailConfirmed === true` is what they have |
| Fix 1 cache invalidated on user change | Yes: ref resets when `user?.id` changes |
| Blog editor video upload unchanged | Yes: already has validation via `validateAndPrepareVideo()` |
| SubscriptionGate normal flow unchanged | Yes: timeout only triggers after 10s of null data |
| No new dependencies | Correct |
| No DB schema changes | Correct |
| No provider stack changes | Correct |
| 3G impact | Positive across all 5 fixes |

## Files Changed

| File | Fix |
|------|-----|
| `src/auth/guards/AuthRouteGuard.tsx` | Fix 1: Cache emailConfirmed in useRef |
| `src/auth/store/authStateMachine.ts` | Fix 2: `!== false` to `=== true` |
| `supabase/functions/delete-user-account/index.ts` | Fix 3: Add rate limiting |
| `src/components/blog/BlogPostEditor.tsx` | Fix 4: Image size validation |
| `src/components/SubscriptionGate.tsx` | Fix 5: Timeout + error state with retry |
