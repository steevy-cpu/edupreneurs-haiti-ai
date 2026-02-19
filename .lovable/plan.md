
## Révision Plan B — Data Layer Fixes

### What This Plan Touches

| File / Layer | Change |
|---|---|
| `src/components/content-editor/WorkflowManagement.tsx` | Add `content_change_log` writes for `publish` and `unpublish` events after the workflow DB update |
| `src/hooks/useVersionControl.ts` | Replace `supabase.auth.getUser()` with a `user` parameter passed into `restoreVersion` |
| `src/components/content-editor/VersionHistory.tsx` | Import `useSessionAuth`, destructure `user`, pass it to `restoreVersion` |
| DB migration | Add `FOR UPDATE` lock to `create_lesson_version()` trigger function to fix the concurrent-save race condition |

**No other files are touched.**

---

### Pre-implementation audit findings

#### Fix 3 — Lesson delete write path: no frontend deletion exists

A thorough search across all 11 relevant files confirms: **there is no frontend code that deletes a lesson**. The DB has an RLS policy `"Admins can delete lessons"` and the `lessons` table has `ON DELETE CASCADE` on child tables, but no UI button, no mutation, no `supabase.from('lessons').delete()` call exists anywhere in the React codebase. Lesson deletion cannot happen from the frontend today.

Additionally, `content_change_log.lesson_id` has `ON DELETE CASCADE` — if a lesson were deleted, any log entry with that `lesson_id` would be automatically deleted by Postgres. A `change_type: 'delete'` entry with `lesson_id = deleted_lesson_id` would vanish the moment the lesson row is removed, defeating the purpose of the audit trail.

**Decision for Fix 3:** Since there is no deletion UI and no code to add the write to, and since the cascade would destroy any such entry anyway, Fix 3 is not implementable as described without: (a) creating a lesson deletion UI or (b) changing the FK from `ON DELETE CASCADE` to `ON DELETE SET NULL` for the `content_change_log.lesson_id` column, and storing the lesson title in `new_content` instead. Both are out of scope for this plan per the instruction "Do not touch anything else in this plan."

**Fix 3 is deferred.** The plan covers Fixes 1, 2, and 4 only, with this finding documented in the safety verification table.

---

### Fix 1 — WorkflowManagement.tsx: write to content_change_log for publish and unpublish

**Where the write goes:** Inside `updateWorkflowStatus`, immediately after the successful `supabase.from('lessons').update(...)` call (after `if (error) throw error` at line 100), before `toast.success(...)`. The change log write is intentionally NOT in the same `supabase` call as the workflow update — Supabase JS does not support multi-table atomic writes from the client. The write is done in a `try/catch` that does NOT rethrow on failure, so a change log write failure does not roll back or block the workflow status update.

**What to write:**

For `publish` (when `newStatus === 'published'`):
```typescript
change_type: 'publish',
lesson_id: selectedLesson.id,
changed_by: user.id,
previous_content: { workflow_status: currentStatus },
new_content: { workflow_status: 'published', is_published: true },
```

For `unpublish` — the current WorkflowManagement has no "Dépublier" button. There is no `unpublish` transition in the current state machine (once `published`, no action buttons exist). The plan asks to write `change_type: 'unpublish'` — this should be written for future-proofing, guarded by `newStatus === 'draft' && selectedLesson.workflow_status === 'published'`. However the current state machine has no path from `published` back to `draft`. Including the guard now so the write fires correctly if that transition is added later is the correct approach.

**Exact addition to `updateWorkflowStatus` after line 100 (`if (error) throw error`):**

```typescript
// Write publish/unpublish events to change log — non-blocking: failure does not roll back the workflow update
if (newStatus === 'published' || (newStatus === 'draft' && currentStatus === 'published')) {
  const changeType = newStatus === 'published' ? 'publish' : 'unpublish';
  supabase
    .from('content_change_log')
    .insert({
      lesson_id: selectedLesson.id,
      changed_by: user.id,
      change_type: changeType,
      previous_content: { workflow_status: currentStatus },
      new_content: { workflow_status: newStatus },
    })
    .then(({ error: logError }) => {
      // Log silently — change log write failure must never block the workflow transition
      if (logError) console.error('Change log write failed (non-blocking):', logError);
    });
}
```

Note: `currentStatus` is already defined at line 123 (outside the function, at component body level). At the point `updateWorkflowStatus` is called, `selectedLesson.workflow_status` holds the current status before the update. We use `selectedLesson.workflow_status || 'draft'` as the `previous_content` value since `currentStatus` is derived from `selectedLesson` which hasn't been refreshed yet at the time of the write.

**Important:** `subject_id` is available on `selectedLesson` via `selectedLesson.subjects?.id` or a direct column — the existing `CreateLessonDialog` write includes `subject_id`. We'll include it from `selectedLesson.subject_id` if available:

```typescript
.insert({
  lesson_id: selectedLesson.id,
  subject_id: selectedLesson.subject_id ?? null,
  changed_by: user.id,
  change_type: changeType,
  previous_content: { workflow_status: selectedLesson.workflow_status || 'draft' },
  new_content: { workflow_status: newStatus },
})
```

The `.then()` pattern (fire-and-forget) ensures the change log write is non-blocking. The existing `setIsSubmitting(false)` in `finally` is not delayed.

---

### Fix 2 — DB migration: FOR UPDATE lock in create_lesson_version()

**The race condition:** Without a lock, two concurrent UPDATE triggers on the same lesson both execute:
```sql
UPDATE lesson_versions SET is_current = false WHERE lesson_id = NEW.id AND is_current = true;
INSERT INTO lesson_versions (...) VALUES (..., true);
```
Both reads see `is_current = true`. Both updates set it to false. Both inserts produce `is_current = true`. Result: two current versions for one lesson.

**The fix:** Add a `SELECT ... FOR UPDATE` on the lesson row at the start of `create_lesson_version()`. Since both trigger invocations are happening on the same lesson row (same `NEW.id`), locking the lesson row itself serializes the two trigger executions. Only one trigger can hold the lock at a time; the other queues behind it.

```sql
-- Lock the lesson row to serialize concurrent version triggers
PERFORM pg_advisory_xact_lock(hashtext(NEW.id::text));
```

Using `pg_advisory_xact_lock` is safer than `SELECT ... FOR UPDATE` on `lesson_versions` because:
- The advisory lock is on a hash of the lesson UUID — it serializes all concurrent version creation for the same lesson without touching the actual lesson row.
- It releases automatically at transaction end (hence `xact_lock` not `session_lock`).
- It cannot deadlock with a `FOR UPDATE` on the `lessons` table because it is a different lock namespace.

**The migration SQL:**

```sql
CREATE OR REPLACE FUNCTION public.create_lesson_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Serialize concurrent triggers for the same lesson using an advisory lock.
  -- Two simultaneous AI generation saves to the same lesson would otherwise both
  -- read is_current = true, both update it to false, and both insert is_current = true
  -- producing duplicate current-version rows. The lock queues them instead.
  PERFORM pg_advisory_xact_lock(hashtext(NEW.id::text));

  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM lesson_versions
  WHERE lesson_id = NEW.id;

  -- Mark only the current version as not current (much faster than updating all)
  UPDATE lesson_versions
  SET is_current = false
  WHERE lesson_id = NEW.id AND is_current = true;

  -- Create new version
  INSERT INTO lesson_versions (
    lesson_id, version_number, title, slug, objectif,
    introduction, contenu, exemples_exercices, grade_level,
    created_by, is_current
  ) VALUES (
    NEW.id, next_version, NEW.title, NEW.slug, NEW.objectif,
    NEW.introduction, NEW.contenu, NEW.exemples_exercices, NEW.grade_level,
    NEW.created_by, true
  );

  RETURN NEW;
END;
$$;
```

This is a `CREATE OR REPLACE FUNCTION` — it replaces the existing function in-place. The trigger itself (`lesson_version_trigger`) does not need to change.

**Deadlock risk analysis:**
- The advisory lock is `pg_advisory_xact_lock(hashtext(lesson_id))`. It is per-transaction and per-lock-ID.
- If two concurrent saves update the same lesson, trigger 1 acquires the lock; trigger 2 waits.
- When trigger 1 commits, trigger 2 acquires the lock and proceeds.
- Single-save operations: the advisory lock is acquired and immediately released at commit. No contention.
- Cross-lesson saves: different lock IDs. No contention.
- The only way a deadlock could occur is if the same transaction holds the lock for lesson A and tries to acquire the lock for lesson A again. Since the trigger fires per-row, a single UPDATE to one lesson fires one trigger instance — one advisory lock acquisition. No deadlock path exists.

---

### Fix 4 — useVersionControl.ts + VersionHistory.tsx: eliminate getUser() network call

**Current state:**
- `useVersionControl.ts` line 66: `const { data: { user } } = await supabase.auth.getUser()` — network call inside `restoreVersion`
- `VersionHistory.tsx` line 24: calls `restoreVersion(versionId)` with no user argument

**The fix:**

In `useVersionControl.ts`:
- Change `restoreVersion` signature from `async (versionId: string)` to `async (versionId: string, user: { id: string } | null)`
- Remove lines 66–67 (`await supabase.auth.getUser()` and the null check)
- Add a guard at the top: `if (!user) throw new Error('Not authenticated')`
- Use `user.id` directly in the update

In `VersionHistory.tsx`:
- Import `useSessionAuth` from `@/contexts/SessionAuthContext`
- Destructure `user` at the component level: `const { user } = useSessionAuth();`
- Pass `user` to `restoreVersion`: `restoreVersion(versionId, user)`

**Exact changes:**

`useVersionControl.ts` — replace lines 59–67:
```typescript
const restoreVersion = async (versionId: string, user: { id: string } | null) => {
  try {
    // Get the version to restore
    const version = versions.find(v => v.id === versionId);
    if (!version) throw new Error('Version not found');

    // Use caller-provided user from useSessionAuth — avoids redundant auth.getUser() call
    if (!user) throw new Error('Not authenticated');

    // Update the lesson with the version's content
    const { error: updateError } = await supabase
      // ... rest unchanged
```

`VersionHistory.tsx` — add at the top of the component:
```typescript
import { useSessionAuth } from "@/contexts/SessionAuthContext";

// Inside VersionHistory component:
const { user } = useSessionAuth();

// Update handleRestore:
const handleRestore = async (versionId: string) => {
  const success = await restoreVersion(versionId, user);
  if (success) {
    onRestore();
  }
};
```

The hook's return type is unchanged (`{ versions, isLoading, fetchVersions, restoreVersion, compareVersions }`). The only consumers of `restoreVersion` are `VersionHistory.tsx` (confirmed via codebase search — the hook is only used in that one component).

---

### Files changed summary

| File | Lines changed | Action |
|---|---|---|
| `src/components/content-editor/WorkflowManagement.tsx` | After line 100 | Add non-blocking change log write for `publish`/`unpublish` events |
| `src/hooks/useVersionControl.ts` | Lines 59, 66–67 | Remove `supabase.auth.getUser()`; add `user` parameter to `restoreVersion` |
| `src/components/content-editor/VersionHistory.tsx` | Lines 1, 17–28 | Import `useSessionAuth`; hoist `user`; pass to `restoreVersion` |
| DB migration (new `.sql` file) | New | `CREATE OR REPLACE FUNCTION create_lesson_version()` with `pg_advisory_xact_lock` |

**No other files touched. No new dependencies. No edge function changes.**

---

### Safety Verification

| Check | Status |
|---|---|
| FOR UPDATE lock does not cause deadlocks for normal single-save operations | Yes — `pg_advisory_xact_lock(hashtext(lesson_id))` is acquired once per trigger invocation. A single save fires one trigger, acquires the lock, does its work, and releases at commit. No other transaction holds a conflicting lock. Deadlock requires circular waiting — not possible with a single-trigger, single-lock-per-lesson pattern. |
| FOR UPDATE lock does not block cross-lesson saves | Yes — advisory lock IDs are `hashtext(NEW.id::text)`, which differ for different lesson UUIDs. Two concurrent saves to different lessons use different lock IDs and do not contend. |
| Change log write for publish events does not block the workflow status update if it fails | Yes — the write uses `.then(({ error: logError }) => { if (logError) console.error(...) })` fire-and-forget pattern. The `setIsSubmitting(false)` in `finally` is not gated on the log write. The `toast.success(...)` fires immediately after the workflow update succeeds regardless of whether the log write is in-flight. |
| Fix 3 (delete write path) — why it is not implemented | No lesson deletion UI exists in the frontend codebase. No `.delete()` call on the `lessons` table exists in any `.tsx` or `.ts` file. Additionally, `content_change_log.lesson_id` is `ON DELETE CASCADE` — any log entry for a deleted lesson would be automatically removed by Postgres. Implementing Fix 3 would require: (a) creating a lesson deletion UI, AND (b) migrating `content_change_log.lesson_id` FK from `ON DELETE CASCADE` to `ON DELETE SET NULL` with lesson title stored in `new_content`. Both are out of scope. Fix 3 is correctly deferred. |
| `useVersionControl.restoreVersion` user null guard preserved | Yes — the new signature accepts `user: { id: string } | null` and throws `'Not authenticated'` if null, which is caught by the outer `try/catch` and shows `toast.error('Erreur lors de la restauration')`. Same user-visible behavior as before. |
| VersionHistory.tsx uses in-memory user from useSessionAuth | Yes — `useSessionAuth()` returns the session user from `SessionAuthContext` without a network call. On 3G, this eliminates ~300–500ms latency on every restore action. |
| `restoreVersion` is only called from VersionHistory.tsx | Yes — confirmed by full codebase search. `useVersionControl` is only imported in `VersionHistory.tsx`. No other consumer exists. |
| publish/unpublish log entries correctly capture previous workflow_status | Yes — `previous_content: { workflow_status: selectedLesson.workflow_status \|\| 'draft' }` reads the status from the `selectedLesson` prop before the DB update is applied. `onUpdate()` (which calls `refreshLesson`) is called after the log write is fired, so the prop still reflects the old status at the time of write. |
| subject_id included in log entry | Yes — `selectedLesson.subject_id ?? null` is included. `selectedLesson` is the full row from the `lessons` table joined with subjects in ContentEditor's `onSelectLesson` handler. The `subject_id` column is a direct column on `lessons`. |
| AppShell, Provider Stack, other tabs unaffected | Yes — all changes are scoped to two component files, one hook file, and one DB migration. No global context, no routes, no other modules modified. |
