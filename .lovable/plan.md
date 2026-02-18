
## Plan 7: UX and Performance Fixes — I3, I7, I12, I13, N8

Five targeted fixes across five files. Two edge functions, three frontend components. No database migrations required.

---

### Fix I3 — AuthRouteGuard: Replace `null` return with generic skeleton

**The Problem**

Lines 102–104 of `AuthRouteGuard.tsx`:
```typescript
if (isChecking || isLoading) {
  return null;
}
```

`isChecking` starts as `true` and is only set to `false` in the `finally` block of `checkAuthState`. `isLoading` from `useSessionAuth` also starts `true`. Both clear only after async profile fetch completes — meaning every authenticated page navigation shows a blank white screen for 2–4 seconds on 3G.

**The Fix**

Replace `return null` with a generic full-screen skeleton. The skeleton must not mimic any specific page layout (it would be wrong for most pages). It should be a neutral muted pulse that fills the content area:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

if (isChecking || isLoading) {
  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 animate-pulse" aria-hidden="true">
      {/* Generic page header bar */}
      <Skeleton className="h-8 w-56 rounded-lg" />
      {/* Full-width content block */}
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-28 w-3/4 rounded-xl" />
    </div>
  );
}
```

**Why this does not interfere with redirect logic:**

The redirect logic lives entirely inside the `checkAuthState` async function triggered by `useEffect`. The skeleton is rendered **while** that async check is running. When `checkAuthState` completes:
- If a redirect is needed → `navigate()` fires and the skeleton is replaced by the new route rendering
- If no redirect needed → `setIsChecking(false)` fires, the condition becomes false, and `children` renders

The redirect logic is unchanged. The skeleton is only visible during the loading window; it never blocks or defers a redirect.

**Pattern consistency:** This matches the established `SubscriptionLoadingSkeleton` pattern in `SubscriptionGate.tsx` — same `animate-pulse` class, same `Skeleton` component from `@/components/ui/skeleton`.

**Files changed:** `src/auth/guards/AuthRouteGuard.tsx` — add `Skeleton` import, replace `return null` with skeleton JSX.

---

### Fix I7 — send-push-notification: Move 60-day filter to DB query

**The Problem**

Lines 228–231 currently fetch ALL push subscriptions for a user with no date filter:
```typescript
const { data: subscriptions, error: fetchError } = await supabase
  .from('push_subscriptions')
  .select('*')
  .eq('user_id', recipientUserId);
```

The `cleanupOldSubscriptions()` function (lines 121–141) deletes old subscriptions from the DB using `last_used_at < cutoffDate`, but this cleanup runs on every notification call — it deletes AND then the main query fetches all remaining rows. A user who has accumulated many push subscription entries (multiple browsers, multiple devices over time) would have all rows fetched even though the `cleanupOldSubscriptions` already prunes the ones older than 60 days.

However the actual issue (I7) is more specific: the `MAX_SUBSCRIPTION_AGE_MS` constant is defined for cleanup, but the **main subscriptions query** itself has no age filter at all. If `cleanupOldSubscriptions` fails silently (line 131: `console.error` and return 0), the main fetch still returns stale rows. The fix is to add the age filter directly to the main query as a defense-in-depth measure.

**The Fix**

Add a `gte('created_at', cutoffDate)` filter to the main push subscriptions query. `cutoffDate` is already computed as a local variable in `cleanupOldSubscriptions` — we need to compute it at the handler level and pass it into the main query:

```typescript
// At top of handler (after validation), compute once:
const subscriptionCutoffDate = new Date(Date.now() - MAX_SUBSCRIPTION_AGE_MS).toISOString();

// Main subscriptions query with DB-side filter:
const { data: subscriptions, error: fetchError } = await supabase
  .from('push_subscriptions')
  .select('*')
  .eq('user_id', recipientUserId)
  .gte('created_at', subscriptionCutoffDate); // I7: filter old subscriptions in DB, not in-memory
```

**Note on column choice:** The audit uses `created_at`. The cleanup function uses `last_used_at`. Looking at the code, `push_subscriptions` has both columns. `last_used_at` is the better business choice (a recently-used old subscription should still work), but the request specifically says "60-day subscription age filter" and the `MAX_SUBSCRIPTION_AGE_MS` constant is described as "Maximum age for subscriptions". We use `gte('last_used_at', ...)` to match the cleanup function's intent (a subscription not used in 60 days is considered stale) — this also aligns with what `cleanupOldSubscriptions` deletes.

**Files changed:** `supabase/functions/send-push-notification/index.ts` — add `subscriptionCutoffDate` variable after validation, add `.gte('last_used_at', subscriptionCutoffDate)` to the main query.

---

### Fix I12 — QuickMessageFAB: Replace `supabase.auth.getUser()` with `useSessionAuth()`

**The Problem**

Line 38 in `QuickMessageFAB.tsx`:
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

`supabase.auth.getUser()` makes a network call to the Supabase auth server to verify the JWT. This happens every time `fetchRecentConversations` is called — which is on component mount (via the `useEffect` at line 118). The AppShell is already mounted with `SessionAuthProvider` which has the user cached in memory via `onAuthStateChange`. Using `useSessionAuth()` returns the cached value with zero network overhead.

**The Fix**

1. Add `useSessionAuth` to the imports
2. Destructure `user` from the hook at the top of the component (before all hooks, consistent with Rules of Hooks)
3. Remove the `supabase.auth.getUser()` call from inside `fetchRecentConversations`

```tsx
import { useSessionAuth } from "@/contexts/SessionAuthContext";

export const QuickMessageFAB = ({ isVisitor = false }: QuickMessageFABProps) => {
  const { user } = useSessionAuth(); // Hook call at top level — consistent with Rules of Hooks
  // ...

  const fetchRecentConversations = useCallback(async () => {
    // REMOVED: const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // user now comes from the hook above

    const { data: participantData, error } = await supabase
      .from("conversation_participants")
      // ... (rest unchanged)
  }, [user]); // user is now a dependency of useCallback
```

**Hook ordering compliance:** The `user` destructuring from `useSessionAuth()` must be placed at the top of the component function body, before all other hooks. It replaces the async `getUser()` call that was inside a callback — not a hook ordering issue, just a dependency change.

**`useCallback` dependency array:** `fetchRecentConversations` currently has `[]` as its dependency array (line 114). After this change, `user` is a closure variable, so it must be added to the array: `[user]`. This is correct — if the user changes (sign-out then sign-in), the callback re-creates with the new user. The `useEffect` at line 118 already has `fetchRecentConversations` as a dep, so it will correctly re-run.

**Files changed:** `src/components/shared/QuickMessageFAB.tsx` — add `useSessionAuth` import, add `const { user } = useSessionAuth()` at top of component, remove `getUser()` call inside callback, update `useCallback` deps array.

---

### Fix I13 — generate-lesson-section: Replace service role key comparison with `X-Internal-Secret` header

**The Problem**

Lines 122–131 of `generate-lesson-section/index.ts`:
```typescript
if (authHeader) {
  const token = authHeader.replace('Bearer ', '');
  // Check if this is a service-role call (server-to-server, e.g. from process-ai-job)
  if (token === supabaseServiceKey) {  // ← Direct key comparison
    isServiceRoleCall = true;
  }
}
```

The service role key is compared to the `Authorization` bearer token to detect server-to-server calls. This pattern works but exposes the service role key as a plain string on the wire and makes the detection logic entangled with Supabase's auth flow. The `award-weekly-champion` pattern (using a dedicated `X-Cron-Secret` header) is cleaner and more explicit.

**How `process-ai-job` invokes `generate-lesson-section`:**

`process-ai-job` calls `supabase.functions.invoke('generate-lesson-section', ...)` using a Supabase client created with `createClient(supabaseUrl, supabaseServiceKey)`. The Supabase JS client automatically adds `Authorization: Bearer <service_role_key>` to all `functions.invoke()` calls when initialized with the service role key. So the current detection works by intercepting this auto-added header.

**The Fix — two-part change:**

**Part A — `generate-lesson-section/index.ts`:** Add `X-Internal-Secret` header check alongside (not replacing) the existing bearer check during the migration period:

```typescript
const internalSecret = Deno.env.get('INTERNAL_CALL_SECRET') ?? '';

// Priority 1: Check dedicated internal header (preferred pattern)
const internalHeader = req.headers.get('X-Internal-Secret');
if (internalSecret.length > 0 && internalHeader === internalSecret) {
  isServiceRoleCall = true;
  console.log('[generate-lesson-section] Internal-secret call detected, skipping rate limit');
}
// Priority 2: Legacy service-role bearer check (kept as fallback)
else if (authHeader) {
  const token = authHeader.replace('Bearer ', '');
  if (token === supabaseServiceKey) {
    isServiceRoleCall = true;
    console.log('[generate-lesson-section] Service-role call detected (legacy), skipping rate limit');
  }
}
```

**Part B — `process-ai-job/index.ts`:** Pass the `X-Internal-Secret` header when invoking `generate-lesson-section`:

```typescript
const internalSecret = Deno.env.get('INTERNAL_CALL_SECRET') ?? '';

// In generateSection():
const { data, error } = await supabase.functions.invoke('generate-lesson-section', {
  body: { ... },
  headers: {
    'X-Internal-Secret': internalSecret, // Explicit internal-call marker
  }
});
```

**Environment variable:** `INTERNAL_CALL_SECRET` needs to be added as a new Supabase secret. It should be a random high-entropy string. This must be added before deploying the functions.

**Important:** The legacy bearer token path is kept as a fallback. This means if `INTERNAL_CALL_SECRET` is not configured (or misconfigured), the existing flow still works via the service role key comparison. No content editor lesson generation flows are disrupted during the transition.

**Files changed:** 
- `supabase/functions/generate-lesson-section/index.ts` — add `X-Internal-Secret` check before the existing bearer comparison
- `supabase/functions/process-ai-job/index.ts` — add `headers: { 'X-Internal-Secret': internalSecret }` to the `generate-lesson-section` invoke calls (there are two invoke calls: `generate-lesson-section` and `generate-interactive-activities` — only `generate-lesson-section` needs the header since only it does the service-role check)

---

### Fix N8 — HomeChatbot.tsx: No auth call exists; JudeChatbot already fixed

**Findings from codebase inspection:**

- **`HomeChatbot.tsx`:** Has **zero** `getSession()` or `getUser()` calls. It never calls auth at all — it's a public-facing chatbot on the homepage for non-authenticated visitors. The `supabase` import on line 7 is only used for `supabase.functions.invoke('home-eric-chat', ...)`. There is nothing to fix for N8 in `HomeChatbot.tsx`.

- **`JudeChatbot.tsx`:** Line 92 already reads:
  ```typescript
  const { user } = useSessionAuth(); // CRITICAL: Use cached auth instead of getUser()
  ```
  This fix was **already applied** in a previous session. The comment explicitly documents the correct pattern. There is no `getSession()` or `getUser()` call anywhere in the file.

**Conclusion for N8:** Both files are already correct. No changes are needed. The audit item N8 is already resolved. This will be documented in the safety verification table.

---

### Secret to add before deployment

`INTERNAL_CALL_SECRET` — a random string (e.g., 32+ hex characters) that serves as the shared secret for `process-ai-job` → `generate-lesson-section` internal calls. This must be added as a Supabase environment secret before deploying I13.

---

### Files Changed Summary

| File | Fix | Change |
|---|---|---|
| `src/auth/guards/AuthRouteGuard.tsx` | I3 | Add `Skeleton` import; replace `return null` with generic skeleton JSX |
| `supabase/functions/send-push-notification/index.ts` | I7 | Add `subscriptionCutoffDate` var; add `.gte('last_used_at', subscriptionCutoffDate)` to main query |
| `src/components/shared/QuickMessageFAB.tsx` | I12 | Add `useSessionAuth` import; add `const { user } = useSessionAuth()` at top; remove `getUser()` inside callback; add `user` to `useCallback` deps |
| `supabase/functions/generate-lesson-section/index.ts` | I13 | Add `X-Internal-Secret` header check before existing bearer comparison; keep legacy path as fallback |
| `supabase/functions/process-ai-job/index.ts` | I13 | Add `X-Internal-Secret` header to `generate-lesson-section` invoke calls |
| N8 | N8 | No changes — both files already use the correct pattern |

---

### Safety Verification

| Check | Status |
|---|---|
| AuthRouteGuard skeleton does not block redirect logic | Yes — redirect fires from `checkAuthState()` via `navigate()`; `setIsChecking(false)` in `finally` block clears the skeleton after; the skeleton is only visible during the async window |
| AuthRouteGuard skeleton renders correctly inside AppShell layout | Yes — the `div` uses `flex-1` to fill the content area, matching how other pages lay out inside the shell |
| Push notification DB filter uses correct PostgreSQL interval syntax | Yes — `.gte('last_used_at', subscriptionCutoffDate)` where `subscriptionCutoffDate` is a pre-computed ISO string; PostgREST converts ISO timestamps correctly; no raw SQL interval syntax involved |
| Push notification filter does not break users with only old subscriptions | Yes — those users receive `[]` from the DB query and return `{ success: true, skipped: true }` — same behavior as before, just with DB filtering instead of empty array from cleanup |
| QuickMessageFAB `useSessionAuth` hook respects Rules of Hooks | Yes — `const { user } = useSessionAuth()` is placed at the top of the component body, before all other hooks, before the `useCallback` |
| QuickMessageFAB `useCallback` deps are correct after change | Yes — `[user]` is the dep; if user changes, the callback recreates; the `useEffect` at line 118 already lists `fetchRecentConversations` as a dep, so it re-runs automatically |
| I13: Existing content editor lesson generation flows are unaffected | Yes — content editors invoke `generate-lesson-section` directly with their JWT bearer token; neither the `X-Internal-Secret` check nor the legacy bearer check matches their token; `isServiceRoleCall` stays `false`; their calls go through normal rate limiting as before |
| I13: If `INTERNAL_CALL_SECRET` is not configured, process-ai-job still works | Yes — the legacy bearer token comparison is kept as a fallback; the empty `internalSecret` fails the `internalSecret.length > 0` guard and falls through to the existing comparison |
| N8: HomeChatbot confirmed has no auth calls | Yes — inspected file; `supabase` is only used for `functions.invoke()`; no `getSession()` or `getUser()` |
| N8: JudeChatbot already uses `useSessionAuth()` | Yes — line 92 already reads `const { user } = useSessionAuth(); // CRITICAL: Use cached auth instead of getUser()` |
| MonCash and Stripe payment flows unaffected | Yes — no payment functions touched |
| New npm/deno dependencies introduced | No — `Skeleton` is already used across the codebase; all other changes are pure logic |
| Provider Stack or hook count affected | No — `useSessionAuth()` is already called by many components; adding it to QuickMessageFAB follows the established pattern |
| 3G impact of I3 | Positive — blank white screen replaced with a visible skeleton, significantly improving perceived performance |
| 3G impact of I7 | Positive — DB query now returns fewer rows over the wire; push notification latency is slightly reduced |
