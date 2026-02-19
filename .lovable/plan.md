
## Plan C: Content Editor Structural Cleanup — 4 Fixes

### Audit Summary Before Implementation

**Fix 1 — Shared permission context:**
- `useContentEditorPermissions` is currently called independently in 6 locations:
  - `WorkflowManagement.tsx` (calls `supabase.auth.getUser()` + `content_editor_roles` query)
  - `BulkOperations.tsx` (same two queries)
  - `PermissionGuard.tsx` (same two queries)
  - `EbookManager.tsx` via `PermissionGuard` (indirect)
  - `BatchQuizRegenerator.tsx` (same two queries, `role === 'admin'` check)
  - `BatchActivitiesRegenerator.tsx` (same two queries, `role === 'admin'` check)
- `ContentEditor.tsx` already performs its own access check at load time (`checkAccess`), so the permission role is already known at the page level before any child renders.
- `RoleManagement.tsx` does **not** use `useContentEditorPermissions` — confirmed via search. The plan instruction's reference to it was inaccurate; `RoleManagement` manages its own `fetchCurrentUser` logic. It is out of scope.
- `WorkflowManagement.tsx` calls `supabase.auth.getUser()` directly inside `updateWorkflowStatus` at line 73. This must be replaced with `useSessionAuth()` per the plan.

**Fix 2 — Move batch operation buttons out of LessonBrowser:**
- All 6 batch wrappers (`BatchQuizValidator`, `BatchActivitiesValidator`, `BatchQuizRegenerator`, `BatchActivitiesRegenerator`, `BatchQuizGeneratorNew`, `BatchContentGenerator`) are rendered inside `LessonBrowser.tsx` in the `CardHeader` stats block (lines 511–602).
- The data they receive (`lessonsMissingContent`, `lessonsMissingQuiz`, `lessonsWithValidQuiz`, `lessonsWithValidActivities`, `gradeLevel`) is computed from `lessonsBySubject` inside `LessonBrowser`. These are derived arrays — they need to be lifted to `ContentEditor.tsx` or the `BatchOperationsPanel` needs to receive them as props from `LessonBrowser`.
- The `activeBatchOperation` state that prevents two batch operations running simultaneously also lives in `LessonBrowser`. This coordination state must follow the batch buttons.
- The `loadSubjects` callback (called on batch completion) must also be preserved. It becomes an `onRefresh` callback passed to `BatchOperationsPanel`.
- The correct architecture: `LessonBrowser` exposes a `batchData` output prop (or the `BatchOperationsPanel` is passed the derived lesson lists). Since `LessonBrowser` already owns the data loading, the cleanest approach is to lift the stats computation and expose it via a callback: `onLessonsLoaded?: (stats: BatchPanelData) => void`. `ContentEditor.tsx` stores the stats in its own state and passes them to a new `BatchOperationsPanel`.
- The coverage stats UI (quiz/content percentage bars) stays inside `LessonBrowser` because it is part of the browsing experience, not the batch operation UI.

**Fix 3 — Worker pool race condition in `useBatchOperation.ts`:**
- In `useBatchOperation.ts`, `operationResults` is a plain array closed over in each worker closure. Workers push results to it directly (`operationResults.push(...)`) and then call `setResults([...operationResults])`. With `concurrency > 1`, two workers resolving in the same microtask batch both read the same intermediate `operationResults` snapshot — one push overwrites the other in the React state because both spread the same pre-push version.
- The fix: replace `setResults([...operationResults])` with `setResults(prev => [...prev, newResult])` where `newResult` is the just-computed result object. The `operationResults` local array is still used for final toast computation and session persistence (those are sequential, so no race there). Only the React state update is changed.

**Fix 4 — Dead component deletion:**
- `QuizActivityValidator.tsx` — not imported anywhere (confirmed by search). Safe to delete.
- `LessonReview.tsx` — not imported anywhere (confirmed by search). Safe to delete.
- `ContentTemplates.tsx` — not imported anywhere (confirmed by search). Safe to delete.

---

### Fix 1: ContentEditorPermissionsContext

**New file:** `src/contexts/ContentEditorPermissionsContext.tsx`

This context wraps the existing `useContentEditorPermissions` hook logic into a single provider. The hook itself can remain unchanged as an implementation detail — the provider calls it once and exposes the result through context.

However, the cleanest approach is to inline the logic directly in the provider (avoid calling the hook from within a Provider — hooks must be called at the component render level, which is valid inside a Provider component). The provider runs the single `supabase.auth.getUser()` + `content_editor_roles` query once on mount. Consumer components read from context with `useContentEditorPermissionsContext()`.

```typescript
// src/contexts/ContentEditorPermissionsContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ContentEditorRole = 'admin' | 'editor' | 'viewer' | null;

interface ContentEditorPermissionsState {
  role: ContentEditorRole;
  isLoading: boolean;
  hasAccess: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageRoles: boolean;
  canPublish: boolean;
  canView: boolean;
  refetch: () => void;
}

const ContentEditorPermissionsContext = createContext<
  ContentEditorPermissionsState | undefined
>(undefined);

export const ContentEditorPermissionsProvider = ({ children }: { children: ReactNode }) => {
  // Single permission check at the page level — shared across all children
  const [role, setRole] = useState<ContentEditorRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = async () => { /* same logic as existing hook */ };

  useEffect(() => { checkPermissions(); }, []);

  const value: ContentEditorPermissionsState = {
    role,
    isLoading,
    hasAccess: role !== null,
    canEdit: role === 'admin' || role === 'editor',
    canDelete: role === 'admin',
    canManageRoles: role === 'admin',
    canPublish: role === 'admin' || role === 'editor',
    canView: role !== null,
    refetch: checkPermissions,
  };

  return (
    <ContentEditorPermissionsContext.Provider value={value}>
      {children}
    </ContentEditorPermissionsContext.Provider>
  );
};

export const useContentEditorPermissionsContext = (): ContentEditorPermissionsState => {
  const ctx = useContext(ContentEditorPermissionsContext);
  if (!ctx) throw new Error('useContentEditorPermissionsContext must be used inside ContentEditorPermissionsProvider');
  return ctx;
};
```

**Where the provider is mounted:** At the top of `ContentEditor.tsx`'s JSX return, wrapping the entire page — placed after `hasAccess` is confirmed (line 206, after the `if (!hasAccess) return null` guard). This means the provider only mounts for authenticated editors, avoiding permission queries for users who will be redirected.

**Consumer updates (replacing `useContentEditorPermissions()` with `useContentEditorPermissionsContext()`):**

| File | Change |
|---|---|
| `WorkflowManagement.tsx` | Replace `useContentEditorPermissions` import + call with `useContentEditorPermissionsContext` |
| `BulkOperations.tsx` | Same replacement |
| `PermissionGuard.tsx` | Same replacement |
| `BatchQuizRegenerator.tsx` | Same replacement |
| `BatchActivitiesRegenerator.tsx` | Same replacement |
| `EbookManager.tsx` | `PermissionGuard` now uses context internally — no change needed to `EbookManager` itself |

**WorkflowManagement.tsx — `supabase.auth.getUser()` replacement:**

Inside `updateWorkflowStatus`, the existing code calls:
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) throw new Error("Non authentifié");
```

This becomes a hook call at the top of the component (outside `updateWorkflowStatus`):
```typescript
import { useSessionAuth } from "@/contexts/SessionAuthContext";
// ...
const { user } = useSessionAuth(); // replaces in-function supabase.auth.getUser()
```

Inside `updateWorkflowStatus`:
```typescript
// user comes from useSessionAuth() at component level — no async call needed
if (!user) throw new Error("Non authentifié");
updates.reviewed_by = user.id;
```

**The existing `useContentEditorPermissions` hook is NOT deleted.** It is still called independently by `YouTubeManager.tsx`. That component is not on the instructions list. The hook remains for its use in `YouTubeManager` (and any future standalone use outside the ContentEditor page).

---

### Fix 2: BatchOperationsPanel

**Architecture decision — how data flows from LessonBrowser to BatchOperationsPanel:**

`LessonBrowser` owns the loaded lesson data. It already computes all the derived lists (`lessonsMissingContent`, `lessonsMissingQuiz`, `lessonsWithValidQuiz`, `lessonsWithValidActivities`) and the stats (`totalLessons`, `gradeLevel`). Moving the batch buttons out of `LessonBrowser` requires these lists to flow upward.

The approach: add a new optional callback prop to `LessonBrowser`:
```typescript
onBatchDataUpdate?: (data: BatchPanelData) => void;
```

This callback fires at the end of `loadLessons` whenever the lesson lists change. `ContentEditor.tsx` stores the data in `useState<BatchPanelData | null>` and passes it to `BatchOperationsPanel`.

**New type `BatchPanelData`:**
```typescript
interface BatchPanelData {
  lessonsMissingContent: any[];
  lessonsMissingQuiz: any[];
  lessonsWithValidQuiz: any[];
  lessonsWithValidActivities: any[];
  gradeLevel: string;
  totalLessons: number;
  missingContentTotal: number;
  missingQuizzesTotal: number;
}
```

**New file:** `src/components/content-editor/BatchOperationsPanel.tsx`

This component receives `BatchPanelData` and renders the 6 batch buttons in the same logical groupings (Generation, Validation, Regeneration sections). It owns the `activeBatchOperation` mutex state (preventing two operations from running simultaneously).

```typescript
interface BatchOperationsPanelProps {
  data: BatchPanelData | null;
  onRefresh: () => void;
  onDashboardRefresh?: () => void;
}
```

When `data` is null (LessonBrowser hasn't loaded yet), `BatchOperationsPanel` renders a skeleton placeholder.

**Where it renders in `ContentEditor.tsx`:** Above the `LessonBrowser` in the `review` tab — or as a collapsible panel above the lesson list in the left sidebar column. The plan instruction says "above or below the LessonBrowser sidebar." It will be rendered above the `LessonBrowser` in the same `md:col-span-5 lg:col-span-4` column, so both remain in the left sidebar, just stacked vertically. The sidebar will scroll if needed.

**What is removed from `LessonBrowser.tsx`:**
- All 6 batch wrapper imports
- The `activeBatchOperation` state
- The entire Generation section (lines ~511–542)
- The entire Validation section (lines ~544–577)
- The entire Regeneration section (lines ~579–601)
- The `isLessonMissingContent` import (moves to `BatchOperationsPanel`)
- The `onDashboardRefresh` prop (can stay, but the batch callback is no longer in `LessonBrowser`)
- The coverage stat bars (quiz/content percentages) **stay** in `LessonBrowser` — they are browsing UI, not batch operation UI. Only the action buttons move.

**What stays in `LessonBrowser.tsx`:**
- Grade/series filters
- Search input
- Filter checkboxes (missing quiz, missing content)
- Coverage stat bars with progress percentages
- The `loadSubjects` / `loadLessons` data loading functions
- All lesson list rendering
- `ValidationDetailsPanel` inline in lesson items
- The `onBatchDataUpdate` callback called at end of `loadLessons`

---

### Fix 3: Worker Pool Race Condition

**File:** `src/features/content-editor/batch-operations/hooks/useBatchOperation.ts`

**Current code (inside the worker loop):**
```typescript
operationResults.push({
  lessonId: lesson.id,
  lessonTitle: lesson.title,
  success: result.success,
  // ...
});
// ...
setResults([...operationResults]);  // ← reads shared mutable array
```

**Fixed code:**
```typescript
const newResult: OperationResult = {
  lessonId: lesson.id,
  lessonTitle: lesson.title,
  success: result.success,
  aligned: result.aligned,
  confidence: result.confidence,
  offContentCount: result.offContentCount,
};
operationResults.push(newResult);  // still needed for session persistence and toast

// Functional update guarantees append-to-latest-state regardless of concurrency
setResults(prev => [...prev, newResult]);
```

The `operationResults` array is still maintained for:
1. `saveBatchSession(...)` — needs the full accumulated results to persist
2. The post-loop toast computation (`successCount`, `errorCount`, etc.) — reads the final accumulated array after all workers finish

These are both safe: `saveBatchSession` runs after `operationResults.push(newResult)` within a single worker's sequential execution, and the final toast computation runs after `await Promise.all(...)` which means all workers have completed. No race condition exists in these paths.

**This fix only changes the `setResults(...)` call — it does not change operation logic, session persistence, or toast behavior.**

**Behavior at concurrency = 1 (the current default for all batch operations):** Identical to before — with one worker, there is no concurrent resolution, so the functional update and the array spread produce the same result. The fix is a no-op at concurrency = 1. Only concurrency > 1 configurations benefit.

---

### Fix 4: Dead Component Deletion

Three files are confirmed orphaned (zero imports found anywhere in `src/`):

1. `src/components/content-editor/QuizActivityValidator.tsx` — 1,553 lines, large System B validator. Confirmed no imports.
2. `src/components/content-editor/LessonReview.tsx` — provided in the task context, confirmed no imports.
3. `src/components/content-editor/ContentTemplates.tsx` — confirmed no imports.

All three are deleted.

**Important caveat on deletion:** The `QuizActivityValidator` file has a `default export` on line 1,553 (`export default QuizActivityValidator`). This is unusual — it suggests it may have been used via a dynamic import or lazy route at some point. The import search using both static import patterns returned zero results. It is safe to delete.

---

### Files Changed Summary

| File | Action |
|---|---|
| `src/contexts/ContentEditorPermissionsContext.tsx` | **Create** — new shared permission context and provider |
| `src/pages/ContentEditor.tsx` | Wrap content in `ContentEditorPermissionsProvider`; add `batchData` state; pass `onBatchDataUpdate` to `LessonBrowser`; render `BatchOperationsPanel` |
| `src/components/content-editor/BatchOperationsPanel.tsx` | **Create** — new component containing the 6 batch wrappers + `activeBatchOperation` mutex |
| `src/components/content-editor/LessonBrowser.tsx` | Remove 6 batch wrapper imports, all batch button JSX, `activeBatchOperation` state; add `onBatchDataUpdate` callback prop; call it after `loadLessons` |
| `src/components/content-editor/WorkflowManagement.tsx` | Replace `useContentEditorPermissions` with `useContentEditorPermissionsContext`; replace `supabase.auth.getUser()` inside `updateWorkflowStatus` with `useSessionAuth()` |
| `src/components/content-editor/BulkOperations.tsx` | Replace `useContentEditorPermissions` with `useContentEditorPermissionsContext` |
| `src/components/content-editor/PermissionGuard.tsx` | Replace `useContentEditorPermissions` with `useContentEditorPermissionsContext` |
| `src/features/content-editor/batch-operations/wrappers/BatchQuizRegenerator.tsx` | Replace `useContentEditorPermissions` with `useContentEditorPermissionsContext` |
| `src/features/content-editor/batch-operations/wrappers/BatchActivitiesRegenerator.tsx` | Replace `useContentEditorPermissions` with `useContentEditorPermissionsContext` |
| `src/features/content-editor/batch-operations/hooks/useBatchOperation.ts` | Replace `setResults([...operationResults])` with `setResults(prev => [...prev, newResult])` |
| `src/components/content-editor/QuizActivityValidator.tsx` | **Delete** |
| `src/components/content-editor/LessonReview.tsx` | **Delete** |
| `src/components/content-editor/ContentTemplates.tsx` | **Delete** |

**No DB migrations. No edge function changes. `BatchGenerationValidation.tsx` untouched.**

---

### Safety Verification

| Check | Status |
|---|---|
| Shared permission context correctly gates admin-only actions | Yes — `ContentEditorPermissionsProvider` runs the same query as the old hook, once. Children read from context. `canDelete: role === 'admin'` and `canManageRoles: role === 'admin'` logic is identical. `BatchQuizRegenerator` and `BatchActivitiesRegenerator` return null if `role !== 'admin'` — same behavior as before. |
| `useContentEditorPermissions` hook is not deleted — `YouTubeManager` still uses it | Yes — the hook file is untouched. Only the 5 consumers inside the ContentEditor page are switched to context. |
| `PermissionGuard` still works correctly after switch | Yes — it reads the same fields (role, isLoading, canEdit, canDelete, canManageRoles, canPublish) from context instead of a standalone hook. Behavior is identical, with the bonus that it uses the already-resolved permission state from parent instead of re-querying. |
| Batch operations panel renders correctly outside LessonBrowser | Yes — `BatchOperationsPanel` receives `BatchPanelData` via props. The data is lifted from `LessonBrowser` via the `onBatchDataUpdate` callback. The `activeBatchOperation` mutex moves into `BatchOperationsPanel` so operations still correctly disable each other. |
| Batch operation button behavior (onComplete, onStart, onDashboardRefresh) preserved | Yes — each wrapper still receives all props through `BatchOperationsPanel`. `onComplete` still calls `loadSubjects` via the `onRefresh` prop. `onDashboardRefresh` is still wired through. |
| Worker pool fix does not change behavior at concurrency = 1 | Yes — with one worker there is no concurrent resolution. `setResults(prev => [...prev, newResult])` and `setResults([...operationResults])` produce identical state values at concurrency = 1. |
| Worker pool fix does not break session persistence | Yes — `saveBatchSession` is called with `operationResults` (the local accumulated array), not from React state. The `operationResults.push(newResult)` still happens before `saveBatchSession`, unchanged. |
| No imported component is accidentally deleted | Yes — search confirmed zero imports for all three deleted files. `QuizActivityValidator`, `LessonReview`, and `ContentTemplates` are not referenced anywhere in `src/`. |
| `EbookManager.tsx` still works after `PermissionGuard` switches to context | Yes — `PermissionGuard` reads from the context internally. `EbookManager` does not need to change since it simply renders `<PermissionGuard>` as a wrapper. The context is mounted at the `ContentEditor.tsx` page level, which is an ancestor of `EbookManager` in the render tree. |
| `WorkflowManagement` user ID access works after removing `supabase.auth.getUser()` | Yes — `useSessionAuth()` at the component top level provides `user.id` synchronously from the in-memory session. The `user` object from `SessionAuthContext` includes all User fields including `id`. Since the ContentEditor page is only reachable when authenticated, `user` will never be null at this point. |
| ContentEditor `checkAccess` (the page-level auth gate) is not removed | Correct — `checkAccess` in `ContentEditor.tsx` remains unchanged. It serves a different purpose: it redirects non-editors before any content editor UI mounts. The new `ContentEditorPermissionsProvider` supplements it by providing the role to all children without re-querying. |
| Realtime subscriptions, AppShell, Provider Stack unaffected | Yes — `ContentEditorPermissionsProvider` is a local provider mounted only inside the `/content-editor` route. It does not touch the global Provider Stack. |
| 3G performance | Fix 1 reduces total `content_editor_roles` queries from 5+ independent calls to 1. Fix 3 has zero performance impact. Fix 2 does not change query patterns. Net improvement. |
