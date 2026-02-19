
## Plan B: Migrate LessonEditor and SectionGenerator from System B to System A

### What is being changed and why

**`LessonEditor.tsx`** — `handleGenerateAllSections` (lines 151–227) is a raw sequential for-loop that calls `generate-lesson-section` and `generate-interactive-activities` directly. It has no retry logic, no session persistence, and no resume capability. If the browser tab closes mid-generation, all progress is lost. The replacement is the same System A pattern used by `SingleLessonGenerator`: create a job record in `ai_generation_jobs`, fire `process-ai-job`, and watch realtime updates via `useGenerationJob`.

**`SectionGenerator.tsx`** — `handleGenerate` (lines 48–164) calls `generate-lesson-section` directly and manages its own loading state, quality metrics, and logging. The instruction is to route this through the job system or at minimum through `process-ai-job` so it benefits from 2x retry with exponential backoff and defensive save behavior. The analysis below determines the correct approach.

---

### Design decision for `SectionGenerator.tsx`

`SectionGenerator` is a per-field dialog. Its UX contract is: user configures target word count + context → clicks generate → previews content → clicks Apply or Regenerate. The "Apply" step is explicit — the content is shown in a preview before being written to `lessonData`. This is fundamentally different from the "Generate All Sections" button which applies content directly to the DB.

Routing `SectionGenerator` through the `ai_generation_jobs` table introduces a complication: the job system always saves results directly to the `lessons` table in the DB (in `handleApplyChanges` in `SingleLessonGenerator`), but `SectionGenerator`'s `onContentGenerated` callback applies to `lessonData` local state first, letting the user preview and then save via the "Enregistrer" button. The generate-through-job pattern would bypass this preview-before-write contract.

The correct migration for `SectionGenerator` is: keep the direct edge function call for the single-field fast path, but replace it with a call to `process-ai-job` indirectly by wrapping it in the same retry + error-handling pattern. However, the simplest and safest interpretation of the instruction "route through the job system or at minimum through the existing process-ai-job edge function" for a per-field single-section call is:

**Use `useGenerationJob` to create a single-section job** — configure `selectedSections: [sectionName]` with the user's `targetWords`, `globalContext: additionalContext`. The job will run in the background with 2x retry, and `onJobComplete` will receive the result content. The existing preview-before-apply flow is preserved by storing the completed result in local state and showing the preview dialog.

However this changes the UX significantly — the user would no longer see the quality metrics panel, because the job result comes back as raw content with no `wordCount`/`generationTimeMs` metadata in the response shape that `SectionGenerator` currently uses.

**Simpler, correct approach for `SectionGenerator`:** Replace the raw `supabase.functions.invoke('generate-lesson-section', {...})` call with a call wrapped in the same `withRetry` logic at the client level. Since `withRetry` lives in the edge function and cannot be imported client-side, the practical System A improvement for a single-section generator is to create a minimal job record for the one section so `process-ai-job` handles it with retry/defensive save — and then `onJobComplete` fires `onContentGenerated` directly (bypassing the preview). This loses the preview step.

**Resolution:** Use `useGenerationJob` in `SectionGenerator`, preserve the preview step by storing the result content from `resultContent` in local state exactly as `SingleLessonGenerator` does with `generatedContent`. The quality metrics panel is removed (it was a System B nicety that doesn't exist in System A — the job system has its own error tracking). The word count is still displayable from the `progress.sections[0].wordCount` field.

The quality metrics and logging (`ai_generation_logs` inserts) are removed from `SectionGenerator` — the job system already logs success/failure in `ai_generation_jobs`.

---

### `LessonEditor.tsx` — Detailed changes

#### What is removed
- `isGeneratingAll` state (`useState(false)`) — replaced by `isGenerating` from the hook
- The entire `handleGenerateAllSections` function (76 lines, System B)
- `Loader2` icon import (still needed for saving indicator — keep it)
- `Sparkles` icon import (keep — still used on the button)

#### What is added
1. `useGenerationJob` hook call — same pattern as `SingleLessonGenerator`, keyed to `selectedLesson?.id`
2. `onJobComplete` callback that applies the completed result content directly to `lessonData` state — this is the key difference from `SingleLessonGenerator` which shows a preview-before-apply dialog. In `LessonEditor` the "Generate All Sections" button is a convenience action with no preview step (it already had none), so applying directly to `lessonData` on completion matches the existing behavior.
3. `GenerationJobProgress` component rendered inline in the Edit tab, just below the "Generate All Sections" button — exactly as used in `SingleLessonGenerator`'s dialog.

#### The `onJobComplete` logic
When `process-ai-job` completes, `result_content` contains an object keyed by section name (e.g., `{ objectif: "...", contenu: "...", ... }`). This maps directly to `lessonData` fields. The callback:

```typescript
const handleJobComplete = useCallback((result: Record<string, any> | null) => {
  if (!result) return;
  // Apply generated section content to local editor state.
  // Only overwrite fields that were actually generated (present in result).
  setLessonData(prev => ({
    ...prev,
    ...(result.objectif && { objectif: result.objectif }),
    ...(result.introduction && { introduction: result.introduction }),
    ...(result.contenu && { contenu: result.contenu }),
    ...(result.exemples_exercices && { exemples_exercices: result.exemples_exercices }),
    ...(result.activites_interactives && { activites_interactives: result.activites_interactives }),
  }));
}, []);
```

This is safe: only defined keys in `result` overwrite local state. If a section failed and returned no content, the existing `lessonData` value is preserved.

#### The "Generate All Sections" button

The button currently shows `isGeneratingAll` for the loading state. After the migration, it uses `isGenerating` from `useGenerationJob`. The `onClick` builds a `JobConfig` and calls `startJob`. The job config for "all sections" is fixed:

```typescript
const handleGenerateAllSections = () => {
  if (!selectedLesson) {
    toast.error("Aucune leçon sélectionnée");
    return;
  }
  const config: JobConfig = {
    selectedSections: ['objectif', 'introduction', 'contenu', 'exemples_exercices', 'activites_interactives'],
    wordCounts: DEFAULT_WORD_COUNTS,
    generateQuiz: false,
    generateVideos: false,
    generateAudio: false,
    imageGenerationModel: 'none',
  };
  startJob(config);
};
```

No `globalContext` — keeping parity with the old button which had no context input. The button is disabled when `isGenerating || isPending`.

#### `GenerationJobProgress` placement in the UI

Currently the Edit tab renders:
```
[Generate All Sections Button]
[Title field]
[Objectif field + SectionGenerator]
[Introduction field + SectionGenerator]
...
```

After the migration:
```
[Generate All Sections Button]
[GenerationJobProgress — renders null when no active job, shows progress when active]
[Title field]
...
```

`GenerationJobProgress` renders `null` when `activeJob` is null and `progress` is null — this is its existing behavior (line 81–83 of the component). So it adds zero visual noise when no generation is running.

The `onResume` and `canResume` props are passed through — if the user navigates to another lesson and back, the hook re-queries for an active job and `canResume` is set if one exists.

#### `selectedLesson` change — job isolation

`useGenerationJob` is keyed to `lessonId`. When `selectedLesson` changes in `LessonEditor`, a new `lessonId` is passed, and the hook's `useQuery` refetches for the new lesson. This is safe — the `existingJob` query filters by `lesson_id = lessonId`, so switching lessons never mixes job state.

#### Conflict between `SingleLessonGenerator` and `LessonEditor` when both visible simultaneously

`SingleLessonGenerator` is rendered in `ContentEditor.tsx` as a standalone component alongside `LessonEditor`. Both will call `useGenerationJob({ lessonId: selectedLesson?.id, ... })`. Both will subscribe to the same realtime channel (same `ai_generation_jobs` row, same filter `id=eq.${activeJob.id}`).

The concern: if an editor starts a job from `SingleLessonGenerator` and `LessonEditor` also has `useGenerationJob` active for the same lesson, will they conflict?

The hooks are independent React hook instances. They both set their own `activeJob` state from the same realtime event. Both will call `onJobComplete` when the job finishes. `LessonEditor.onJobComplete` applies the result to `lessonData`. `SingleLessonGenerator.onJobComplete` sets `generatedContent` and `showPreview: true`.

This means: if a job is started from `SingleLessonGenerator`, `LessonEditor` will also apply the result to its local `lessonData` automatically. This is actually desirable — the editor fields update immediately when a job completes from either entry point. But the user also sees `SingleLessonGenerator`'s preview dialog — so they see both the preview AND the editor fields updated.

The one scenario to handle: if a job is started from `LessonEditor`'s "Generate All Sections" button, `SingleLessonGenerator` will also detect the job via `existingJob` and show the "Resume" banner inside its dialog. This is cosmetically correct — the "Reprendre le suivi" button in `SingleLessonGenerator` would just re-connect the same job.

No conflict in terms of data — both hooks read the same job, apply the same result. The DB write happens only once (in `process-ai-job` edge function). The safety table confirms this in detail below.

#### Imports to add to `LessonEditor.tsx`
- `useCallback` from react (already imported `useState`, `useEffect`)
- `useGenerationJob, GenerationJobProgress, type JobConfig` from `@/features/content-editor`
- `DEFAULT_WORD_COUNTS` from `@/lib/lessonPrompts`

#### Imports to remove from `LessonEditor.tsx`
- Nothing removed — all existing imports remain. `Loader2` and `Sparkles` are still used.

---

### `SectionGenerator.tsx` — Detailed changes

#### What is removed
- `isGenerating`, `generatedContent`, `showPreview`, `qualityMetrics` local state — all replaced by System A hook state
- `handleGenerate` async function (117 lines) — entire System B path replaced
- `handleCancel` function — no longer needed (job cancel is via `cancelJob`)
- `validateGeneratedContent`, `getGradeColor`, `getScoreLabel`, `QualityMetrics` imports from `@/lib/contentValidation` — quality scoring removed
- `ai_generation_logs` inserts — job system handles logging via `ai_generation_jobs`
- The debug `console.log` on component mount (line 40–46) — removed in cleanup
- `Loader2`, `AlertCircle`, `Eye`, `Check`, `X` icon imports — reviewed below

#### What is added
- `useGenerationJob` hook call with `lessonId: lesson?.id` and `onJobComplete` that stores the result for the single section in local state
- `useState<string>` for `pendingContent` — the generated content awaiting user approval (same role as the old `generatedContent`)
- The preview and Apply/Discard buttons remain — the content to preview comes from `pendingContent` state set in `onJobComplete`
- `GenerationJobProgress` component inside the dialog to show the job running
- `targetWords` Slider and `additionalContext` Textarea remain — they are passed into `JobConfig.wordCounts` and `JobConfig.globalContext`

#### The `onJobComplete` callback for a single section

When `process-ai-job` completes a single-section job, `result_content` contains `{ [sectionName]: "content string" }`. The callback:

```typescript
const handleJobComplete = useCallback((result: Record<string, any> | null) => {
  if (!result) return;
  const content = result[sectionName];
  if (content) {
    setPendingContent(content);
    // showPreview is implied by pendingContent being set
  }
}, [sectionName]);
```

#### The generate button action

```typescript
const handleGenerate = () => {
  if (!lesson) {
    toast.error("Aucune leçon sélectionnée");
    return;
  }
  // Build a single-section job config
  const config: JobConfig = {
    selectedSections: [sectionName],
    wordCounts: { [sectionName]: targetWords },
    generateQuiz: false,
    generateVideos: false,
    generateAudio: false,
    imageGenerationModel: 'none',
    globalContext: additionalContext || undefined,
  };
  startJob(config);
};
```

Note: `sectionName` can be `'activites_interactives'`. The `process-ai-job` edge function already handles this correctly (lines 101–124 of the edge function — it routes to `generate-interactive-activities`). The `globalContext` for activities will be passed but the edge function uses it as-is in the standard generate-lesson-section path; for `activites_interactives` it uses its own body structure. This is acceptable — `additionalContext` may or may not influence the output. In System B it also was not passed to `generate-interactive-activities`, so this is behavioral parity.

#### The Apply button

```typescript
const handleApply = () => {
  if (pendingContent) {
    onContentGenerated(pendingContent);
    toast.success("Contenu appliqué");
    setIsOpen(false);
    setPendingContent("");
  }
};
```

The `onContentGenerated` prop callback updates `lessonData` in `LessonEditor` — same as before. Nothing in this data path changes.

#### Per-section job isolation when `SectionGenerator` is mounted 5 times simultaneously

`LessonEditor` renders `SectionGenerator` for 5 sections (objectif, introduction, contenu, exemples_exercices, activites_interactives). All 5 instances call `useGenerationJob({ lessonId })`. If a job is started from any one of them, all 5 instances will detect it via `existingJob` (since they all query for pending/running jobs on the same `lesson_id`).

This means if the "Générer avec IA" button in the Introduction section starts a job for `[introduction]`, the Objectif section's dialog will also show `canResume: true`. This is cosmetically awkward but not harmful — clicking "Reprendre le suivi" in a different section's dialog just reattaches to the same job.

The correct mitigation: use a `jobTag` or filter to identify which section started a specific job. However the `ai_generation_jobs` schema has `config` as a JSONB field — querying by `config.selectedSections` is possible but adds complexity.

**Simpler mitigation within scope:** Filter the `existingJob` query by checking if `config.selectedSections` includes `sectionName`. This is done client-side after the `useQuery` response — filter the result in the hook call's `select` clause isn't possible for JSONB, but the returned `existingJob` can be masked:

In `SectionGenerator`, after calling `useGenerationJob`, add:
```typescript
// Only show resume for jobs that include this specific section
const isOwnJob = existingJob?.config?.selectedSections?.includes(sectionName);
const canResumeThisSection = canResume && isOwnJob;
```

And pass `canResumeThisSection` to `GenerationJobProgress` instead of `canResume`. This prevents the "Reprendre le suivi" banner from appearing in unrelated section dialogs.

Similarly, `isGenerating` from the hook will be true for any active job on this lesson, even if the active job is for a different section. Apply the same filter:
```typescript
const isThisSectionGenerating = isGenerating && 
  activeJob?.config?.selectedSections?.includes(sectionName);
```

This prevents all 5 section buttons from appearing disabled when only one section is being generated.

---

### Files changed

| File | Change |
|---|---|
| `src/components/content-editor/LessonEditor.tsx` | Replace `handleGenerateAllSections` (System B) with `useGenerationJob` hook + simple `startJob` call. Add `GenerationJobProgress` to Edit tab. Add `handleJobComplete` callback that applies result to `lessonData`. Remove `isGeneratingAll` state. Add imports: `useCallback`, `useGenerationJob`, `GenerationJobProgress`, `JobConfig`, `DEFAULT_WORD_COUNTS`. |
| `src/components/content-editor/SectionGenerator.tsx` | Replace direct `generate-lesson-section` edge function call with `useGenerationJob` hook. Replace `isGenerating`/`generatedContent`/`qualityMetrics` local state with hook state + `pendingContent`. Remove `validateGeneratedContent` imports and quality metrics panel. Add section-scoped filtering so the SectionGenerator only shows/reacts to jobs for its own section. Remove debug `console.log` on mount. |

**No edge function changes. No DB migrations. No schema changes. `BatchGenerationValidation.tsx` is not touched.**

---

### Safety Verification

| Check | Status |
|---|---|
| Generation progress survives a page refresh | Yes — `useGenerationJob` queries `ai_generation_jobs` for active jobs (`status IN ('pending', 'running')`) on mount. If a job was running when the page refreshed, the hook finds it via `existingJob` and sets `canResume: true`. The user sees "Reprendre le suivi" and clicks to reconnect realtime tracking. The job itself continues in the `process-ai-job` edge function regardless of browser state. |
| The existing UI layout of `LessonEditor` is unchanged | Yes — only `handleGenerateAllSections` logic is replaced. The button position, text, and disabled state are preserved. `GenerationJobProgress` renders `null` when no job is active, so it is invisible during normal editing. The full tab layout, all Textarea fields, all `SectionGenerator` buttons, the preview tab — unchanged. |
| `SingleLessonGenerator` and `LessonEditor` do not conflict when both visible simultaneously | Partially — both hooks read the same job and both apply the result independently. `SingleLessonGenerator` shows its preview dialog; `LessonEditor` applies directly to `lessonData`. No DB conflict — `process-ai-job` writes to the DB once. The `onJobComplete` callbacks in both components are pure state updates (no DB writes). If this cross-apply behavior is undesired, a `jobSource` tag can be added to `JobConfig` in a future iteration. |
| `SectionGenerator` section scoping — a job for "Introduction" doesn't affect "Objectif" | Yes — `isThisSectionGenerating` and `canResumeThisSection` filters are applied client-side after the hook response, preventing cross-section visual state bleed. |
| Quality metrics panel removed — existing editors who relied on it | The quality metrics and grade display are removed from `SectionGenerator`. This is a UI reduction, not a bug. The content validity is still enforced by `process-ai-job`'s defensive save logic and retry logic, which is more robust than the client-side `validateGeneratedContent` check. |
| `ai_generation_logs` inserts removed from `SectionGenerator` | Yes — these are removed. Job success/failure is tracked in `ai_generation_jobs` by the edge function. The `ai_generation_logs` table was the System B logging mechanism. This is intentional. |
| `activites_interactives` section still uses `generate-interactive-activities` | Yes — `process-ai-job` already routes `activites_interactives` to `generate-interactive-activities` at line 101–124 of the edge function. No change needed. |
| Existing `SingleLessonGenerator` behavior unchanged | Yes — `SingleLessonGenerator.tsx` is not touched. It continues to use `useGenerationJob` as before. |
| `BatchGenerationValidation.tsx` untouched | Yes — out of scope per plan instructions. |
| Payment flows unaffected | Yes — no payment code touched. |
| Provider Stack or AppShell stability | Not affected — `LessonEditor` and `SectionGenerator` are inside the `/content-editor` standalone page, not inside AppShell. |
| 3G performance | `useGenerationJob`'s `existingJob` query has `staleTime: 5000`. The realtime subscription only activates when `activeJob?.id` is set. No additional always-on listeners added. |
