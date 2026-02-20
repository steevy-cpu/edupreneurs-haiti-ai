
# Mot du Jour Plan A — Consolidate Management into Control Center

## Overview

Consolidate all word CRUD operations into `WordsModule.tsx` (Control Center), create a shared type, redirect the Content Editor tab, and add a DB function for auto-assigning `display_order`.

---

## Fix 1 — Add full CRUD to WordsModule.tsx

**File:** `src/pages/control-center/modules/WordsModule.tsx`

Add the CRUD capabilities currently only in `DailyWordsManager.tsx`:

- **New imports:** `Dialog, DialogContent, DialogHeader, DialogTitle`, `Input`, `Label`, `Textarea`, `Select/SelectContent/SelectItem/SelectTrigger/SelectValue`, `Switch`, `Table/TableBody/TableCell/TableHead/TableHeader/TableRow`, `Plus, Trash2, Pencil` from lucide
- **New state variables:**
  - `isDialogOpen`, `editingWord`, `isSaving`
  - Form fields: `formWord`, `formPhonetic`, `formPartOfSpeech`, `formDefinition`, `formExample`, `formCategory`
- **Constants:** `PART_OF_SPEECH_OPTIONS` and `CATEGORY_OPTIONS` (copied from DailyWordsManager)
- **Update `DailyWord` interface:** Add `example`, `category`, `created_at` fields to match full schema
- **Update `fetchWords`:** Remove `is_active` filter so inactive words are also visible. Select all columns. Keep `display_order ASC` ordering.
- **New functions:**
  - `resetForm()` — clears all form fields
  - `openEditDialog(word)` — populates form and opens dialog
  - `handleSave()` — INSERT (with RPC for display_order) or UPDATE
  - `handleDelete(wordId)` — confirmation via AlertDialog, then DELETE
  - `toggleActive(wordId, currentState)` — inline switch UPDATE
- **New UI sections:**
  - "Ajouter un mot" button at top of the word management section
  - Add/Edit dialog with all 6 fields (word, phonetic, part_of_speech, definition, example, category)
  - Replace the current `WordRow` list with a proper Table showing: `#` (display_order), Mot, Phonetique, Type, Categorie, Audio (play/generate), Actif (switch), Actions (edit/delete)
  - Delete confirmation reuses the existing `AlertDialog` pattern (add a new confirm type)
- **Keep existing sections unchanged:** Notification card, TTS provider selector, audio stats

## Fix 2 — Unify ordering

**File:** `src/pages/control-center/modules/WordsModule.tsx`

Already orders by `display_order ASC` (line 105). No change needed here. The `DailyWordsManager.tsx` used `created_at DESC` but will no longer be rendered.

## Fix 3 — Create shared DailyWord type

**New file:** `src/types/dailyWord.ts`

```typescript
/** Canonical DailyWord type — used by student hook, admin modules, and content editor */
export interface DailyWord {
  id: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  definition: string;
  example: string;
  audio_url: string | null;
  category: string | null;
  is_active: boolean;
  display_order: number | null;
  created_at: string;
}
```

**Update imports in 3 files:**
- `src/hooks/useWordOfTheDay.ts` (line 6-16): Remove local `DailyWord` interface, import from `@/types/dailyWord`
- `src/pages/control-center/modules/WordsModule.tsx` (line 32-41): Remove local interface, import from `@/types/dailyWord`
- `src/components/content-editor/DailyWordsManager.tsx` (line 16-27): Remove local interface, import from `@/types/dailyWord`

## Fix 4 — Redirect Content Editor DailyWordsManager tab

**File:** `src/pages/ContentEditor.tsx` (lines 476-478)

Replace the `<DailyWordsManager />` render with a redirect card:

```tsx
<TabsContent value="daily-words">
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Gestion deplacee</h3>
      <p className="text-muted-foreground mb-4">
        La gestion des mots du jour a ete deplacee vers le Centre de Controle.
      </p>
      <Button onClick={() => navigate('/control-center')}>
        Ouvrir le Centre de Controle
      </Button>
    </CardContent>
  </Card>
</TabsContent>
```

- Remove the `DailyWordsManager` import (line 22)
- Add `BookOpen` to existing lucide imports
- Ensure `useNavigate` is already imported (check existing code)
- Keep `DailyWordsManager.tsx` file intact for now

## Fix 5 — DB function for display_order auto-assignment

**Migration SQL:**

```sql
CREATE OR REPLACE FUNCTION public.get_next_display_order()
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(MAX(display_order), 0) + 1 FROM daily_words;
$$;
```

**Usage in WordsModule.tsx `handleSave` (INSERT path):**

```typescript
// Get next display_order via RPC before inserting
const { data: nextOrder } = await supabase.rpc('get_next_display_order');

const { error } = await supabase
  .from('daily_words')
  .insert({
    ...wordData,
    is_active: true,
    display_order: nextOrder ?? 1,
  });
```

---

## Technical Summary

| Change | File | Impact |
|--------|------|--------|
| Full CRUD in WordsModule | `WordsModule.tsx` | Add ~200 lines (dialog, table, handlers) |
| Shared type | `src/types/dailyWord.ts` (new) | 12 lines |
| Type imports | 3 files | Remove local interfaces, add import |
| Content Editor redirect | `ContentEditor.tsx` | Replace 1 line render with redirect card |
| DB function | Migration | 1 new function |

## Safety Verification

| Check | Status |
|-------|--------|
| CRUD works in Control Center | Add/Edit/Delete/Toggle all implemented |
| New words get display_order | RPC `get_next_display_order` called before INSERT |
| Content Editor shows redirect | DailyWordsManager replaced with message + button |
| Shared DailyWord type in all 3 files | Single source in `src/types/dailyWord.ts` |
| Student-facing components untouched | useWordOfTheDay.ts and WordOfTheDayCard.tsx only get import change |
| Existing word data unaffected | No schema changes to daily_words table |
| Deterministic algorithm unchanged | computeDisplayOrder logic not modified |
| No new dependencies | Uses existing UI components |
| RLS policies unchanged | Existing policies cover all CRUD operations |
