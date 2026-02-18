
## Plan 1: Fix `process-ai-job` Edge Function + AppShell Message Subscriptions

This plan addresses two separate backend reliability issues that were identified in the architecture audit.

---

### Issue 1 — `process-ai-job`: "Body already consumed" Bug + No Auth Check

**Root cause (the double `req.json()` bug):**

The function calls `req.json()` at line 196 inside the main `try` block to get `jobId`. If that succeeds and the job later fails, the outer `catch` at line 488 runs and tries to call `req.json()` **a second time** at line 493 to get `jobId` again for the cleanup update. This always throws a `TypeError: Body already consumed` error because HTTP request bodies are single-read streams. The result: failed jobs are never marked as `'failed'` in the database — they stay stuck as `'running'` forever.

**Root cause (missing Authorization check):**

The function currently uses the `SUPABASE_SERVICE_ROLE_KEY` with no caller verification. Any unauthenticated request to the function URL can trigger a full AI generation job, consuming AI quota at no cost.

**The fixes:**

**Fix A — Capture `jobId` before the try block so it's always available in the catch:**

```typescript
// BEFORE (broken):
Deno.serve(async (req) => {
  // ...
  try {
    const { jobId } = await req.json(); // read #1 — body consumed here
    // ...
  } catch (error) {
    try {
      const { jobId } = await req.json(); // read #2 — ALWAYS THROWS "Body already consumed"
```

```typescript
// AFTER (fixed):
Deno.serve(async (req) => {
  // Parse body ONCE, at the top, outside all try/catch blocks
  let jobId: string | undefined;
  try {
    const body = await req.json();
    jobId = body?.jobId;
  } catch {
    return secureErrorResponse('Invalid request body', 400);
  }

  if (!jobId) {
    return secureErrorResponse('Missing jobId', 400);
  }

  try {
    // ... rest of job processing using already-parsed jobId
  } catch (error) {
    // jobId is already in scope — no second req.json() needed
    await supabase.from('ai_generation_jobs').update({ status: 'failed', ... }).eq('id', jobId);
  }
});
```

**Fix B — Add Authorization header check using `getClaims()`:**

```typescript
// After the OPTIONS check, before processing:
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return secureErrorResponse('Unauthorized', 401);
}

const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
  global: { headers: { Authorization: authHeader } },
});
const token = authHeader.replace('Bearer ', '');
const { data, error: authError } = await anonClient.auth.getClaims(token);
if (authError || !data?.claims) {
  return secureErrorResponse('Unauthorized', 401);
}
// userId is available as data.claims.sub if needed
```

The service-role client used for actual DB operations remains unchanged — it is only used after auth is verified.

---

### Issue 2 — AppShell: Messages Realtime Subscription Not Filtered by `user_id`

**Root cause:**

The `shell-message-notifications` channel in `AppShell.tsx` subscribes to ALL inserts on the `messages` table:

```typescript
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',   // ← NO filter — receives every message from every user
}, ...)
```

The current code then runs a secondary DB query (`conversation_participants`) to check if the current user is a participant. This works correctly as a guard, but it means **every client processes every global message insert**, makes a DB roundtrip per insert, and the Supabase realtime server sends all message payloads to all connected clients. On a busy platform, this is a significant load multiplier.

**The fix — add a Postgres `filter` to the subscription:**

```typescript
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',
  // No column on messages directly maps to recipient — messages don't have a user_id column.
  // The correct fix is to filter on conversation_participants instead, but since realtime
  // doesn't support joins, the best-practice fix is to keep the existing secondary check
  // but add a sender_id != userId filter to avoid self-processing:
}, ...)
```

**Important architectural note:** After reviewing the `messages` table structure, messages don't have a `recipient_user_id` column — they belong to conversations. A true server-side filter (e.g., `filter: 'user_id=eq.xxx'`) only works if there's a direct column on the table. The correct mitigation here is two-part:

1. Add `filter: \`sender_id=neq.${userId}\`` to skip messages the current user sent (already partially done in the callback but not at the subscription level — moving it to the subscription level reduces unnecessary callback invocations).
2. The secondary `conversation_participants` check remains as the correctness guard.

This reduces the number of callback invocations substantially since the user's own messages (which are the most frequent for active users) are dropped at the subscription filter level.

---

### Files to Change

1. **`supabase/functions/process-ai-job/index.ts`**
   - Move `req.json()` parse to the top of the handler, outside the `try` block
   - Add Authorization header check using `getClaims()` immediately after the OPTIONS handler
   - Remove the second `req.json()` call in the `catch` block (now unnecessary)

2. **`src/shell/AppShell.tsx`**
   - Add `filter: \`sender_id=neq.${userId}\`` to the `shell-message-notifications` channel subscription
   - Change `.single()` to `.maybeSingle()` on the actor profile lookup at line 147 in the notifications handler (bonus safety fix while in this file)

---

### Safety Verification

| Check | Status |
|---|---|
| Does this affect RLS or DB functions? | No — service-role key scope is unchanged |
| Does this affect the Provider Stack or AppShell render? | No — subscription logic only, no render changes |
| Does this break existing content editor flows? | No — auth check passes for any logged-in content editor |
| Cold start / 3G risk? | None — auth check adds ~5ms, not user-facing |
| Backward compatibility for existing jobs? | Full — stuck `running` jobs will remain, but new failures will be correctly marked `failed` |
| Does this affect unauthenticated visitors? | No — they don't trigger AI jobs |
| Hook count or React changes? | None — edge function and subscription config only |
