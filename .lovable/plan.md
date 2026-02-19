
# Exams Plan B — NS4 UX Fixes + Pipeline Improvements

## Scope
5 targeted fixes across 3 files + 1 edge function + 2 file deletions + 1 config entry removal. No database changes. No SQL.

---

## Pre-Delete Verification (Confirmed Safe)

Before any deletions:

| File | Import search result | Safe to delete? |
|---|---|---|
| `src/components/content-editor/ExamManager.tsx` | Zero imports found in all `.tsx`/`.ts` files | Yes |
| `src/components/content-editor/BaccExamManager.tsx` | Zero imports found in all `.tsx`/`.ts` files | Yes |
| `supabase/functions/parse-exam-text/index.ts` | Zero calls to `parse-exam-text` in all `src/` files | Yes |

The `parse-exam-text` entry also exists in `supabase/config.toml` at line 93–94 and must be removed alongside the function directory.

---

## Fix 1 — Default Series Pre-selection on Track Switch

**File:** `src/features/exams/admin/ExamAdminPage.tsx`  
**Current behavior:** `handleTrackChange` (line 92–104) always resets `selectedSeries` to `[]`. On NS4, the list shows all rows unfiltered.  
**Fix:** When `newTrack === 'NS4'`, pre-select all four series so the list is filtered from first render and shows all available NS4 exams organized. When switching back to `9AF`, reset to `[]` as before.

**Change in `handleTrackChange` (lines 92–104):**
```ts
// Before — always resets to empty
setSelectedSeries([]);

// After — pre-select all NS4 series on switch to NS4
setSelectedSeries(newTrack === 'NS4' ? ["SMP", "SES", "SVT", "LLA"] : []);
```

**Why all four?** After the database cleanup, there are 9 clean rows spread across LLA, SES, SMP, SVT. Pre-selecting all four means the admin immediately sees the full organized list in a filtered state. The user can then narrow by deselecting a series.

**Impact on `availableSubjects`:** The subject dropdown uses `selectedSeries[0]` (line 86). With all four pre-selected, `selectedSeries[0]` will be `"SMP"` — so the subject dropdown will show SMP subjects by default. This is acceptable: when the user picks a specific series for upload, they deselect the others first, which narrows the subject list correctly. The form validation already blocks submission if `selectedSeries.length === 0` (line 136–138), which cannot trigger since they start with all 4 selected.

---

## Fix 2 — Empty Subject Dropdown Guidance

**File:** `src/features/exams/admin/ExamAdminPage.tsx`  
**Current behavior:** Lines 459–465 render `SelectContent` with only `availableSubjects.map(...)`. When `availableSubjects = []`, the dropdown opens but shows nothing.  
**Fix:** Add a disabled placeholder `SelectItem` that renders when `availableSubjects.length === 0`.

**Change in the subject `SelectContent` block (lines 459–465):**
```tsx
<SelectContent>
  {availableSubjects.length === 0 ? (
    // Informative disabled placeholder — only shown when no series is selected
    <SelectItem value="__placeholder__" disabled>
      Sélectionnez d'abord une série
    </SelectItem>
  ) : (
    availableSubjects.map((subj) => (
      <SelectItem key={subj} value={subj}>
        {subj}
      </SelectItem>
    ))
  )}
</SelectContent>
```

**Note:** After Fix 1, this placeholder will only appear in the edge case where the user manually deselects all series via `SeriesMultiSelect`. It will not appear on initial NS4 render since Fix 1 pre-selects all series. The `value="__placeholder__"` cannot be selected by the user (it is `disabled`) and cannot equal any real subject name, so it will never pollute the form state.

---

## Fix 3 — Pass gradeLevel and series into parse-exam-vision System Prompt

**File:** `supabase/functions/parse-exam-vision/index.ts`  
**Current behavior:** Line 14 destructures only `{ subject, year, pageImages }`. `gradeLevel` and `series` are sent by the frontend (verified at lines 122–124 of `ExamAdminPage.tsx`) but silently ignored. The system prompt (line 38) is generic for both exam types.

**Two-part change:**

**Part A — Destructure gradeLevel and series from request body (line 14):**
```ts
// Before
const { subject, year, pageImages } = await req.json();

// After — read gradeLevel and series (optional, default to '9AF' for safety)
const { subject, year, pageImages, gradeLevel = '9AF', series } = await req.json();
```

**Part B — Build a context-aware system prompt instead of the generic one (lines 38–54):**

The new prompt diverges based on `gradeLevel`:

```ts
// Build exam-type-specific context for the AI
const examContext = gradeLevel === 'NS4'
  ? `Tu analyses un examen du BACCALAURÉAT haïtien (NS4)${series ? ` — Série ${series}` : ''}.

SPÉCIFICITÉS NS4 À RESPECTER ABSOLUMENT:
- Les examens NS4 sont composés principalement de questions ouvertes (open_ended) et de problèmes multi-parties
- Les QCM (multiple_choice) sont rares dans les examens NS4, sauf en Anglais/Espagnol/Créole
- Chaque exercice peut contenir plusieurs sous-questions numérotées (a, b, c, d) — traite chaque sous-question comme un exercice distinct
- Les formules mathématiques et physiques doivent être extraites en notation LaTeX
- Les points par question sont souvent indiqués en marge (ex: "4 pts", "/4") — extrait-les précisément
- La structure typique NS4: Texte du problème → sous-questions → données/formules en annexe
- Pour la série ${series || 'NS4'}: les matières scientifiques (Physique, Chimie, Maths, SVT) sont à dominante calcul et démonstration`
  : `Tu analyses un examen de la 9ÈME ANNÉE FONDAMENTALE haïtienne (9AF).

SPÉCIFICITÉS 9AF À RESPECTER ABSOLUMENT:
- Les examens 9AF contiennent un mélange de QCM (multiple_choice) et de questions ouvertes (open_ended)
- Les QCM ont toujours 4 options: A), B), C), D) — extrait les options précisément
- Les textes de référence (Reading, Texte de lecture) précèdent souvent plusieurs questions
- Structure typique 9AF: texte de référence → questions de compréhension → exercices de grammaire → rédaction`;

const systemPrompt = `Tu es un expert OCR spécialisé dans l'extraction d'examens officiels haïtiens.

${examContext}

INSTRUCTIONS GÉNÉRALES:
1. Analyse attentivement CHAQUE page de l'examen
2. Identifie et extrait TOUS les TEXTES DE RÉFÉRENCE (Reading, Texte, Lecture, passages) — EXTRAIT LE TEXTE COMPLET
3. Identifie TOUS les exercices/questions avec leurs numéros
4. Pour les QCM, extrait précisément les options A), B), C), D)
5. Préserve les accents français et créoles (é, è, à, ç, ô, etc.)
6. Identifie les points attribués à chaque question si visibles
7. Détermine le type: "multiple_choice" ou "open_ended" en respectant les spécificités ci-dessus
8. Pour les formules mathématiques, utilise la notation LaTeX

IMPORTANT:
- EXTRAIT TOUS les textes de référence COMPLETS dans referenceTexts
- Ne rate AUCUNE question
- Si les points ne sont pas visibles: 5 pts pour QCM, 8 pts pour questions ouvertes
- Utilise la fonction extract_exam_data pour retourner les résultats`;
```

**The user prompt also gains context (line 56):**
```ts
// Before
const userPrompt = `Analyse cet examen officiel de ${subject} ${year}. Extrait TOUTES les questions, options, textes de référence. Utilise la fonction extract_exam_data.`;

// After
const userPrompt = `Analyse cet examen officiel de ${subject} ${year}${gradeLevel === 'NS4' && series ? ` (${series})` : ''}. Extrait TOUTES les questions, options, textes de référence. Utilise la fonction extract_exam_data.`;
```

**The tool calling schema, `tool_choice`, and normalization logic are not touched.** Only the system prompt and user prompt strings change.

**The log line also gains context (line 23):**
```ts
console.log(`Processing ${pageImages.length} page images for ${subject} ${year} [${gradeLevel}${series ? `/${series}` : ''}]`);
```

---

## Fix 4 — Auto-Refresh ExistingExamsList After Save

**Files:**  
- `src/features/exams/admin/ExamAdminPage.tsx` — add `refreshTrigger` state, increment after save  
- `src/features/exams/admin/components/ExistingExamsList.tsx` — add `refreshTrigger` prop, add to `useEffect` deps

**Part A — ExamAdminPage (add state + increment after save):**

Add new state at line 53 (alongside existing state):
```ts
// Counter that increments after each successful save to trigger list refresh
const [refreshTrigger, setRefreshTrigger] = useState(0);
```

In `handleConfirmAndSave` (line 292, after `resetForm()`):
```ts
resetForm();
// Increment to signal ExistingExamsList to reload
setRefreshTrigger(prev => prev + 1);
```

Pass it to `ExistingExamsList` (line 574–580):
```tsx
<ExistingExamsList
  track={track}
  selectedSeries={selectedSeries}
  onReanalyze={handleReanalyze}
  reanalyzingExamId={reanalyzingExamId}
  onEditExam={handleEditExam}
  refreshTrigger={refreshTrigger}
/>
```

**Part B — ExistingExamsList (add prop + add to useEffect):**

Update `ExistingExamsListProps` interface (line 40–46):
```ts
interface ExistingExamsListProps {
  track: ExamTrack;
  selectedSeries?: string[];
  onReanalyze: (exam: ExistingExam) => void;
  reanalyzingExamId?: string | null;
  onEditExam?: (exam: ExistingExam) => void;
  refreshTrigger?: number; // increments after each successful save
}
```

Destructure it (line 48–54):
```ts
export function ExistingExamsList({ 
  track, 
  selectedSeries = [],
  onReanalyze,
  reanalyzingExamId,
  onEditExam,
  refreshTrigger = 0,
}: ExistingExamsListProps) {
```

Update `useEffect` (line 60–62):
```ts
// Re-fetch when track, series filter, or save counter changes
useEffect(() => {
  loadExams();
}, [track, selectedSeries, refreshTrigger]);
```

**No infinite re-fetch risk:** `refreshTrigger` is a number managed by `useState` in the parent. It only changes when `setRefreshTrigger(prev => prev + 1)` is called inside the `try` block of `handleConfirmAndSave`, which only runs on a successful save. `loadExams()` does not call `setRefreshTrigger`. The only way the value changes is explicit user action (confirming a save). The `selectedSeries` reference-equality concern from the audit is already present before this change and is not made worse.

---

## Fix 5 — Delete Dead Code

### Files to delete:
1. `src/components/content-editor/ExamManager.tsx` — 891 lines, zero imports
2. `src/components/content-editor/BaccExamManager.tsx` — 927 lines, zero imports
3. `supabase/functions/parse-exam-text/index.ts` (entire `parse-exam-text/` directory)
4. Remove the `[functions.parse-exam-text]` block from `supabase/config.toml` (lines 93–94)
5. Use `supabase--delete_edge_functions` to undeploy `parse-exam-text` from the live environment

---

## File Change Summary

| File | Change type | Scope |
|---|---|---|
| `src/features/exams/admin/ExamAdminPage.tsx` | Edit | Fix 1 (1 line), Fix 2 (8 lines), Fix 4 (3 lines + 1 prop) |
| `src/features/exams/admin/components/ExistingExamsList.tsx` | Edit | Fix 4 (interface + destructure + useEffect dep) |
| `supabase/functions/parse-exam-vision/index.ts` | Edit | Fix 3 (destructure line, system prompt, user prompt, log) |
| `src/components/content-editor/ExamManager.tsx` | **Delete** | Fix 5 |
| `src/components/content-editor/BaccExamManager.tsx` | **Delete** | Fix 5 |
| `supabase/functions/parse-exam-text/index.ts` | **Delete** | Fix 5 |
| `supabase/config.toml` | Edit (remove 2 lines) | Fix 5 (remove `[functions.parse-exam-text]` block) |

---

## Safety Verification Table

| Risk | Analysis | Status |
|---|---|---|
| Pre-selecting all 4 NS4 series breaks subject dropdown | `availableSubjects` uses `selectedSeries[0]` which will be `"SMP"` — SMP subjects show by default. Valid behavior. User narrows by deselecting series. | Safe |
| Placeholder `__placeholder__` value leaks into form state | It is `disabled` on the `SelectItem` — Radix UI `Select` ignores disabled items on selection. Cannot be chosen. | Safe |
| gradeLevel/series changes break parse-exam-vision tool calling schema | Only the `systemPrompt` and `userPrompt` strings change. The `tools` array, `tool_choice`, and normalization code are untouched. | Safe |
| Auto-refresh causes infinite loop | `refreshTrigger` only increments inside the `try` block of a successful save. `loadExams()` does not mutate `refreshTrigger`. Loop impossible. | Safe |
| ExamManager or BaccExamManager deletion breaks a UI | Codebase search confirmed zero imports in all `src/` files. | Safe |
| parse-exam-text deletion breaks a running feature | Codebase search confirmed zero calls to `parse-exam-text` in all `src/` files. | Safe |
| Removing config.toml entry breaks other functions | The entry only applies to `parse-exam-text`. Removing it has no effect on other functions. | Safe |
| Default `gradeLevel = '9AF'` if not sent breaks existing behavior | All existing callers already send `gradeLevel`. The default is purely defensive for edge cases. | Safe |
