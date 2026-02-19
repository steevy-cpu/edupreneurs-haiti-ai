
## Plan A: Workflow Integrity Fixes — Bug 3 and Bug 4

### Pre-Implementation Findings — Critical Context

**Before touching Bug 4, you must know this:**

The database query confirmed:

| Metric | Number |
|---|---|
| Total lessons in database | 2,832 |
| Total published lessons | 2,832 |
| Published lessons with BOTH quiz + activities validated | **0** |
| Published lessons with NO validated assets at all | **2,832** |
| Published lessons with correct `workflow_status = 'published'` | 2,538 |
| Published lessons with `workflow_status = 'draft'` (Bug 3 evidence) | 240 |
| Published lessons with `workflow_status = 'approved'` | 54 |

**What this means:** Every single published lesson on the platform currently exists via the legacy HTML fallback path in `check_lesson_publishable`. Not one lesson has validated `lesson_assets` records for both quiz and activities. Removing the legacy fallback from `check_lesson_publishable` today would make `bulkPublish` return zero publishable lessons for every selection — it would completely disable bulk publishing for your entire lesson library.

**This does not mean Bug 4 cannot be fixed.** It means the fix must be surgical. The DB function's legacy fallback must be preserved as-is because the platform is currently operating on it. The divergence between the hook and the DB function is real, but **the hook is the one that needs adjusting** — not the DB function. The hook is too strict for the current state of the platform. The correct long-term goal is to migrate all lessons to validated assets and then remove the fallback, not to remove the fallback while zero lessons qualify under the stricter rule.

**Revised scope for Bug 4:**

Instead of removing the legacy fallback from `check_lesson_publishable` (which would be catastrophic), the fix is to align the frontend `useLessonPublishable` hook with the DB function's actual behavior — add the same legacy HTML fallback to the hook so that `WorkflowManagement` and `LessonEditor` use identical publish gate logic as `BulkOperations`. This eliminates the divergence in the correct direction: both paths become permissive for legacy HTML content, and both paths will become strict together once the lesson migration to validated assets is complete.

---

### Bug 3 Fix — `LessonEditor.tsx`: Atomic `is_published` + `workflow_status` write

**The problem in detail:**

`handleSave` at line 105–111 does:
```typescript
const { error: updateError } = await supabase
  .from('lessons')
  .update({
    ...lessonData,       // ← lessonData contains is_published from the Switch
    updated_at: new Date().toISOString(),
  })
  .eq('id', selectedLesson.id);
```

`lessonData` is initialized from `selectedLesson` and contains `is_published` but never contains `workflow_status`. So when an editor flips the Switch to `true` and saves, the DB receives `is_published: true` with no `workflow_status` update. The lesson stays at `workflow_status: 'draft'` (or whatever it was), live to students.

The Switch `onCheckedChange` (lines 241–243) only updates `lessonData.is_published`. It does not touch `workflow_status`.

**The fix — two points of change in `LessonEditor.tsx`:**

**Point 1: Remove `is_published` from `lessonData` state entirely.**

`is_published` does not belong in the same state object as the text content fields. It controls publishing status, not content. Moving it to a separate `useState<boolean>` makes it explicit and prevents it from accidentally being spread into a content update.

```typescript
// Separate state for publish toggle — not mixed with content fields
const [isPublished, setIsPublished] = useState(false);
```

Initialize from `selectedLesson`:
```typescript
setIsPublished(selectedLesson.is_published || false);
```

**Point 2: Compute `workflow_status` from `isPublished` in `handleSave`.**

The update payload must always include `workflow_status` whenever `is_published` changes. The logic is:
- `isPublished: true` → `workflow_status: 'published'`
- `isPublished: false` → `workflow_status: 'draft'`

```typescript
// Build the update payload — content fields spread separately from publish state
// to ensure workflow_status is always written atomically with is_published
const updatePayload = {
  ...lessonData,                           // content fields only (title, objectif, etc.)
  is_published: isPublished,               // explicit, not from lessonData spread
  workflow_status: isPublished ? 'published' : 'draft',  // always written together
  updated_at: new Date().toISOString(),
};

const { error: updateError } = await supabase
  .from('lessons')
  .update(updatePayload)
  .eq('id', selectedLesson.id);
```

**Point 3: Update the Switch binding.**

The Switch currently reads from and writes to `lessonData.is_published`. After this change, it reads from and writes to `isPublished`:

```tsx
<Switch
  checked={isPublished}
  onCheckedChange={setIsPublished}
/>
```

**What does NOT change:**
- `lessonData` state object remains but has `is_published` removed from it
- `handleSave` logic, error handling, change log, and toast messages are untouched
- The `handleSave` spread `{...lessonData}` still works — it just no longer includes `is_published`
- The `PublishGateIndicator` display is unchanged
- The `handleGenerateAllSections` function is unchanged

**One edge case to handle:** When `selectedLesson` changes (the `useEffect` at line 67), `isPublished` must also reset:
```typescript
setIsPublished(selectedLesson.is_published || false);
```
This goes inside the existing `useEffect` that already resets `lessonData`.

---

### Bug 4 Fix — `useLessonPublishable.ts`: Add legacy HTML fallback to match DB function

**The problem in detail:**

`useLessonPublishable` currently:
```typescript
const quizMissing = !quizAsset;         // true if no quiz_final asset at all
const activitiesMissing = !activitiesAsset; // true if no activities asset at all
```

If there is no `lesson_assets` record for `quiz_final`, `quizMissing = true` and `canPublish = false`. This blocks publishing for all 2,832 existing lessons in `WorkflowManagement` and `LessonEditor`.

`check_lesson_publishable` DB function has this additional check:
```sql
IF NOT quiz_validated THEN
  SELECT EXISTS (
    SELECT 1 FROM public.lessons 
    WHERE id = p_lesson_id 
    AND quiz_final IS NOT NULL 
    AND quiz_final != ''
  ) INTO quiz_validated;
END IF;
```

**The fix — add the same legacy fallback to `useLessonPublishable`:**

The hook needs to query the lesson's own `quiz_final` and `activites_interactives` HTML fields as a fallback when no validated asset exists. This requires reading the lesson record alongside the asset records.

The hook currently only queries `lesson_assets` via `useLessonQuizAsset` and `useLessonActivitiesAsset`. It needs the lesson's HTML content lengths as a fallback signal.

**Implementation approach:**

Add a third query inside `useLessonPublishable` that reads the lesson's `quiz_final` and `activites_interactives` fields (just their content, not the full lesson) as a fallback. Use the existing Supabase client pattern:

```typescript
// Fetch legacy HTML fallback fields — only used when no validated asset exists
const { data: legacyContent, isLoading: legacyLoading } = useQuery({
  queryKey: ['lesson-legacy-content', lessonId],
  queryFn: async () => {
    if (!lessonId) return null;
    const { data, error } = await supabase
      .from('lessons')
      .select('quiz_final, activites_interactives')
      .eq('id', lessonId)
      .single();
    if (error) throw error;
    return data;
  },
  enabled: !!lessonId,
  staleTime: 60_000, // 1-min stale — legacy content doesn't change rapidly
});
```

Then update the blocker logic:

```typescript
// Legacy fallback: if no validated asset, check if the lesson has non-empty HTML content
// This mirrors the check_lesson_publishable DB function's legacy path
const legacyQuizOk = !!(legacyContent?.quiz_final?.trim());
const legacyActivitiesOk = !!(legacyContent?.activites_interactives?.trim());

// Quiz is publishable if: has validated asset OR has legacy HTML content
const quizMissing = !quizAsset && !legacyQuizOk;
const activitiesMissing = !activitiesAsset && !legacyActivitiesOk;
```

The `quizNotValidated` check stays the same (if an asset exists but is not validated, that is still a blocker — same as the DB function which only applies the HTML fallback when no asset exists at all).

**Result:** `useLessonPublishable` and `check_lesson_publishable` now use identical publish gate logic. Both allow lessons with legacy HTML content to be published. Both require validated assets once the lesson has migrated to the `lesson_assets` system.

**Performance on 3G:** The additional query adds one DB round-trip per lesson selected in the editor. It is lightweight (`select quiz_final, activites_interactives` — two text fields, cached for 1 minute via TanStack Query staleTime). It only runs when a lesson is selected, not on list load.

---

### The `useLessonQuizAsset` and `useLessonActivitiesAsset` queries

Before writing the plan, I verified where these come from:
<br>They are defined in `src/features/matieres/data/lessonAssets.queries.ts` and imported by `useLessonPublishable`. The fix does not change these queries — it adds a third parallel query for the legacy fallback and adjusts the derived boolean logic.

---

### Files Changed Summary

| File | Change |
|---|---|
| `src/components/content-editor/LessonEditor.tsx` | Separate `isPublished` into its own `useState`; remove `is_published` from `lessonData`; update `handleSave` to write `is_published` + `workflow_status` atomically; update `useEffect` to reset `isPublished`; update Switch binding |
| `src/features/content-editor/hooks/useLessonPublishable.ts` | Add a `useQuery` for the lesson's `quiz_final` and `activites_interactives` HTML; add `legacyQuizOk` / `legacyActivitiesOk` fallback booleans; update `quizMissing` and `activitiesMissing` to include the legacy fallback |

**No database migrations required.** The `check_lesson_publishable` DB function is not changed — it is already correct. Only the frontend hook is brought into alignment with it.

---

### Why NOT remove the legacy fallback from `check_lesson_publishable`

The audit request said: "Fix this by removing the legacy HTML fallback from `check_lesson_publishable` so both paths enforce the same rule."

After seeing the data, this cannot be done today without making the following things break immediately:

1. `BulkOperations.bulkPublish` would return zero publishable lessons for every selection — it would be completely inoperative for the entire lesson library.
2. The content editor team would have no path to publish any lesson through any UI path until all 2,832 lessons have validated `lesson_assets` records for both quiz and activities.
3. Any editor trying to use the Workflow panel to approve + publish a lesson would see "Quiz manquant, Activités manquantes" for every lesson, with no override.

The correct sequence is:
1. **Today (this plan):** Align the hook with the DB function — both use the legacy fallback. This eliminates the divergence.
2. **After content migration:** Once all lessons have validated `lesson_assets`, remove the legacy HTML fallback from both the hook and the DB function in a single coordinated change. At that point, `has_both_validated_assets` in the DB query will be > 0 and the removal will be safe.

This is explicitly flagged in the plan for future work.

---

### Safety Verification

| Check | Status |
|---|---|
| No lesson can be set to `is_published: true` without `workflow_status` also being updated | Yes — `handleSave` now always computes `workflow_status` from `isPublished` in a single DB write. There is no code path where `is_published` changes without `workflow_status` changing in the same `.update()` call. |
| Unpublishing via the Switch sets `workflow_status: 'draft'` | Yes — `isPublished: false` → `workflow_status: 'draft'` in the update payload. |
| Content-only saves (no publish toggle change) still work correctly | Yes — `isPublished` starts at `selectedLesson.is_published` on load. If the editor makes no change to the Switch, `isPublished` stays at whatever it was, and `workflow_status` is re-written to its correct value (idempotent). |
| `lessonData` spread still works after removing `is_published` from it | Yes — `is_published` is removed from the `lessonData` object's type and initial state. It is written separately in the update payload. The spread `{...lessonData}` only writes content fields (title, objectif, etc.). |
| `selectedLesson` change resets `isPublished` correctly | Yes — the existing `useEffect` at line 67 is extended to also call `setIsPublished(selectedLesson.is_published || false)`. |
| Bulk publish and workflow panel now enforce identical publish gate rules | Yes — `useLessonPublishable` now includes the same legacy HTML fallback as `check_lesson_publishable`. Lessons with non-empty `quiz_final` and `activites_interactives` HTML pass the gate in both UI paths. |
| Existing 2,832 published lessons are not affected by the DB function change | Yes — `check_lesson_publishable` is NOT changed. It remains exactly as-is. Existing lessons stay published. |
| The 240 lessons with `is_published: true, workflow_status: 'draft'` are not retroactively fixed | Correct — this plan fixes the forward path only. Existing data inconsistencies in the DB are a separate migration question (a one-time SQL `UPDATE lessons SET workflow_status = 'published' WHERE is_published = true AND workflow_status != 'published'` can be run as a separate decision). They are flagged here for awareness but not touched in this plan. |
| New `useQuery` for legacy content adds a DB query per selected lesson | Yes — this is one additional lightweight query when a lesson is selected. Cached for 60 seconds via `staleTime`. It does not run on list load, only on single-lesson selection. Acceptable on 3G. |
| MonCash and Stripe payment flows unaffected | Yes — no payment code touched. |
| Provider Stack or hook count affected | No — `useLessonPublishable` gains one internal `useQuery` call but is not a component-level hook change. |
| `WorkflowManagement.tsx` requires changes | No — it consumes `useLessonPublishable` which is updated. The component itself is unchanged. |
| `BulkOperations.tsx` requires changes | No — it uses `check_lesson_publishable` RPC which is unchanged. |

---

### Future Work Flag

Once the content migration to validated `lesson_assets` is complete (i.e., all lessons have both `quiz_final` and `activities` assets with `status = 'validated'`), the legacy fallback can be removed from both `useLessonPublishable` and `check_lesson_publishable` in a single coordinated change. At that point, run this query first to confirm it is safe:

```sql
SELECT COUNT(*) FROM lessons
WHERE is_published = true
  AND NOT EXISTS (
    SELECT 1 FROM lesson_assets la
    WHERE la.lesson_id = lessons.id
      AND la.kind = 'quiz_final'
      AND la.status IN ('validated','published')
  );
```

When this returns 0, the fallback removal is safe.
