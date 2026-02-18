
## Plan 6: `.single()` → `.maybeSingle()` Sweep — 7 Individual Fixes

Seven targeted changes across 6 files. Each fix is analysed individually for its null-handling context. No logic, no component structure, and no other code is altered.

---

### Fix 1 — `src/pages/Settings.tsx` line 150

**Context:** `fetchUserData` fetches the current user's own profile row. A genuine user always has a profile (created at signup), so `.single()` works in practice — but it would crash with a `PGRST116` error during the brief window after auth.uid() resolves but before the profile row is committed (race at signup), or for any orphaned auth user.

**Current code (line 150):**
```typescript
supabase.from("profiles").select("*").eq("user_id", userId).single(),
```

**Fix:**
```typescript
supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
```

**Null handling:** Lines 156–159 already guard `profileResult.error`. With `.maybeSingle()`, a zero-row result returns `{ data: null, error: null }` — so `profileResult.error` is falsy and execution falls through to line 162 where `profileData` would be `null`. We add a null guard there:

```typescript
const profileData = profileResult.data;
if (!profileData) {
  // Profile not yet ready (race at signup) — silently abort load
  setPageLoading(false);
  return;
}
```

This means in the impossible-but-handled case that the profile row doesn't exist, the page shows the loading skeleton and exits cleanly rather than crashing with a `.avatar_url` read on null.

---

### Fix 2 — `src/pages/QuizBattleSolo.tsx` line 124

**Context:** Inside `checkAuth`, this fetches `academic_grade` from the user's profile to pre-select the correct grade in the battle setup UI.

**Current code (lines 120–124):**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('academic_grade')
  .eq('user_id', user.id)
  .single();
```

**Fix:** Change `.single()` to `.maybeSingle()`.

**Null handling:** Line 126 already uses `profile?.academic_grade` — the optional chaining already guards the null case correctly. If the profile row is null, `setSelectedGrade` simply doesn't fire and the grade picker stays at its default. No further code changes needed — the null case is already handled.

```typescript
// Already correct — no change needed to line 126:
if (profile?.academic_grade) {
  setSelectedGrade(profile.academic_grade);
}
```

---

### Fix 3 — `supabase/functions/jude-ai-tutor/index.ts` line 426

**Context:** Cache lookup for pre-generated ElevenLabs audio. If the hash isn't found in `jude_audio_cache`, the code falls through to generate new audio. This is a pure cache hit/miss — null is the expected miss case.

**Current code (lines 422–426):**
```typescript
const { data: cachedAudio } = await supabase
  .from('jude_audio_cache')
  .select('audio_url, phoneme_data, duration_ms')
  .eq('text_hash', textHash)
  .single();
```

**Fix:** Change `.single()` to `.maybeSingle()`.

**Null handling:** Line 428 `if (cachedAudio)` already correctly handles both the hit case (truthy) and the miss case (null → falls through to `else` block that generates new audio). No other changes needed.

---

### Fix 4 — `supabase/functions/send-push-notification/index.ts` line 217

**Context:** Looks up the user's notification preference for a given category (e.g., `messages`, `likes`). If no row exists in `notification_preferences` for this user+category pair, the intent is to **default to enabled** (push the notification anyway). The `.single()` here would throw a `PGRST116` if the preference row doesn't exist yet (new users, or users who never explicitly saved that preference).

**Current code (lines 212–217):**
```typescript
const { data: prefData } = await supabase
  .from('notification_preferences')
  .select('enabled')
  .eq('user_id', recipientUserId)
  .eq('category', category)
  .single();
```

**Fix:** Change `.single()` to `.maybeSingle()`.

**Null handling:** Line 219 `if (prefData && !prefData.enabled)` already handles null correctly — if `prefData` is null (no preference row found), the condition is false, and the function proceeds to send the notification. This matches the "default to enabled" intent. No other changes needed.

---

### Fix 5 — `supabase/functions/process-ai-job/index.ts` line 245

**Context:** Fetches the `ai_generation_jobs` row by `jobId` at the start of processing. A job must exist for processing to proceed — if not found, the function returns 404 immediately.

**Current code (lines 241–245):**
```typescript
const { data: job, error: jobError } = await supabase
  .from('ai_generation_jobs')
  .select('*, lessons(*, subjects(name))')
  .eq('id', jobId)
  .single();
```

**Fix:** Change `.single()` to `.maybeSingle()`.

**Null handling:** Line 247 `if (jobError || !job)` already handles null correctly — `.maybeSingle()` returns `{ data: null, error: null }` when not found, so `!job` is true and the function returns 404. The error handling is already correct for both zero-row and genuine DB error cases.

---

### Fix 6 — `supabase/functions/process-ai-job/index.ts` line 307

**Context:** Inside the section generation loop (runs once per section), this re-fetches the job's current `status` on every iteration to check if the user cancelled it mid-generation. This is a polling check — if the job row somehow disappears (edge case), treating it as "not cancelled" and continuing is the safer degradation.

**Current code (lines 303–307):**
```typescript
const { data: currentJob } = await supabase
  .from('ai_generation_jobs')
  .select('status')
  .eq('id', jobId)
  .single();
```

**Fix:** Change `.single()` to `.maybeSingle()`.

**Null handling:** Line 309 `if (currentJob?.status === 'cancelled')` already uses optional chaining — if `currentJob` is null, the condition is false and generation continues. This is the correct degradation: if the job row mysteriously vanishes mid-loop, we continue generating (not cancel) and the final save will fail gracefully. No other changes needed.

---

### Fix 7 — `supabase/functions/_shared/rateLimiter.ts` line 139

**Context:** The shared rate limiter's core lookup. It fetches the existing rate limit record for a given key (user:id:prefix or ip:addr:prefix) from the `rate_limits` table. If no record exists (first request), it falls through to the `else` block at line 188 which does an INSERT. This is the highest-impact fix — `rateLimiter.ts` is called by every AI tutor, payment, and other rate-limited function.

**Current code (lines 135–139):**
```typescript
const { data: existing } = await supabase
  .from('rate_limits')
  .select('id, request_count, window_start, expires_at')
  .eq('key', key)
  .single();
```

**Fix:** Change `.single()` to `.maybeSingle()`.

**Null handling:** The `if (existing)` / `else` branching at lines 141 and 188 already handles both cases correctly:
- `existing` is non-null → increment or window-reset logic
- `existing` is null → INSERT new record (first request)

With `.single()`, a zero-row result produces a PGRST116 error which is **silently swallowed** by the `catch` block at line 204 (which allows all requests through). This means on every **first request** for a new key, `.single()` is throwing and being caught — rate limiting is being bypassed for first-timers without any of the code realising it. `.maybeSingle()` fixes this silently-broken path.

---

### Files Changed

| File | Line | Change |
|---|---|---|
| `src/pages/Settings.tsx` | 150 | `.single()` → `.maybeSingle()`; add `if (!profileData) return;` guard at line 162 |
| `src/pages/QuizBattleSolo.tsx` | 124 | `.single()` → `.maybeSingle()`; null already handled by `?.` on line 126 |
| `supabase/functions/jude-ai-tutor/index.ts` | 426 | `.single()` → `.maybeSingle()`; null already handled by `if (cachedAudio)` |
| `supabase/functions/send-push-notification/index.ts` | 217 | `.single()` → `.maybeSingle()`; null already handled by `if (prefData && !prefData.enabled)` |
| `supabase/functions/process-ai-job/index.ts` | 245 | `.single()` → `.maybeSingle()`; null handled by existing `if (jobError \|\| !job)` |
| `supabase/functions/process-ai-job/index.ts` | 307 | `.single()` → `.maybeSingle()`; null handled by existing `?.status` optional chain |
| `supabase/functions/content-ai-assistant/index.ts` | 218 | `.single()` → `.maybeSingle()`; add explicit `if (!editorRole)` null check before role array check |
| `supabase/functions/_shared/rateLimiter.ts` | 139 | `.single()` → `.maybeSingle()`; null handled by existing `if (existing)` / `else` branching |

---

### content-ai-assistant fix detail

The current check at line 220 is:
```typescript
if (!editorRole || !['admin', 'editor'].includes(editorRole.role)) {
```

With `.single()` → `.maybeSingle()`, `editorRole` can be `null` (user has no row in `content_editor_roles`). The existing `!editorRole` condition already handles this — if null, the condition is true and 403 is returned. The logic is already correct; only the query needs updating.

---

### Safety Verification

| Check | Status |
|---|---|
| Settings page loads correctly for all existing users | Yes — every real user has a profile row; `.maybeSingle()` returns it identically to `.single()`. The new null guard is only hit in the impossible orphan-user case |
| QuizBattleSolo grade pre-selection still works | Yes — profile row is fetched exactly as before; optional chaining on line 126 already handles null |
| Jude voice cache hits still work | Yes — cache hit path (`if (cachedAudio)`) is unchanged; cache misses no longer throw PGRST116 |
| Push notifications still fire for users with no saved preference | Yes — `prefData` being null → `if (prefData && !prefData.enabled)` is false → notification proceeds |
| AI job processing (System A) still runs correctly | Yes — job fetch at line 245: existing 404 guard handles null. Poll at line 307: existing `?.status` handles null |
| Content editor access still requires valid role | Yes — `!editorRole` condition already gates null; non-editor roles still blocked by `includes()` check |
| Rate limiter correctly counts first requests (previously broken) | Yes — previously `.single()` on a new key threw PGRST116 → caught silently → request allowed without insert. `.maybeSingle()` returns null cleanly → falls to INSERT branch → rate limit record created on first request |
| Rate limiter still allows requests through on DB failure | Yes — the `catch` block at line 204 is unchanged; genuine DB errors still allow requests through (fail-open for availability) |
| MonCash and Stripe payment flows unaffected | Yes — no payment edge functions are modified in this plan |
| NatCash files unaffected | Yes — they were deleted in the previous step; no references remain |
| New dependencies | No |
| React hook count or Provider Stack affected | No — only the profile null guard adds a return path, not a new hook |
