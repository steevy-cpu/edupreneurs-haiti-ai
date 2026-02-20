

# Mot du Jour Plan C — UX Improvements

## Overview

Three UX enhancements for the Control Center words table: scheduled date display, audio source badges, and inline reordering. Requires a DB migration (new column), an edge function update, and changes to WordsModule.tsx and the shared type.

---

## Fix 1 — Scheduled Date Column

**File:** `src/pages/control-center/modules/WordsModule.tsx`

Add a helper function that reverse-calculates the next calendar date for a given `display_order`:

```typescript
/** Compute the next date (>= today) when this display_order will be the active word */
const getScheduledDate = (displayOrder: number, totalActive: number): Date | null => {
  if (!displayOrder || totalActive === 0) return null;
  const haitiDate = getHaitiDate();
  const today = new Date(haitiDate + 'T00:00:00');
  const daysSinceToday = Math.floor(
    (today.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  const target = displayOrder - 1;
  const currentMod = ((daysSinceToday % totalActive) + totalActive) % totalActive;
  const offset = ((target - currentMod) + totalActive) % totalActive;
  return new Date(today.getTime() + offset * 86400000);
};
```

Add a "Date prevue" column in the table header (after `#`). For each active word row, display the formatted date using `toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })`. If the date is today, show an amber "Aujourd'hui" badge instead.

Inactive words show "—" in this column (they're excluded from the rotation).

## Fix 2 — Audio Source Column (DB + Edge Function + UI)

### Migration

Add a nullable `audio_source` column to `daily_words`:

```sql
ALTER TABLE public.daily_words
ADD COLUMN IF NOT EXISTS audio_source text;

COMMENT ON COLUMN public.daily_words.audio_source
IS 'Tracks which method generated the audio: elevenlabs, openai, or recording';
```

### Shared Type Update

**File:** `src/types/dailyWord.ts`

Add `audio_source: string | null;` to the `DailyWord` interface.

### Edge Function Update

**File:** `supabase/functions/generate-word-audio/index.ts`

In the existing DB update (around line 133), add `audio_source` to the update payload:

```typescript
const { error: updateError } = await supabase
  .from('daily_words')
  .update({ audio_url: audioUrl, audio_source: ttsProvider })
  .eq('id', wordId);
```

### Upload Recording Update

**File:** `src/pages/control-center/modules/WordsModule.tsx` (uploadRecording function, ~line 416)

Add `audio_source: 'recording'` to the update payload:

```typescript
const { error: updateError } = await supabase
  .from('daily_words')
  .update({ audio_url: audioUrl, audio_source: 'recording' })
  .eq('id', recordingWord.id);
```

### TTS Generate Update

**File:** `src/pages/control-center/modules/WordsModule.tsx` (generateAudio function, ~line 500)

After successful generation, also update the local state with the provider info from `response.data.provider`.

### UI Badge

In the Audio column of the table, after the play button, show a small badge based on `word.audio_source`:
- `"elevenlabs"` -- purple badge showing "EL"
- `"openai"` -- blue badge showing "OAI"  
- `"recording"` -- amber badge showing mic emoji
- `null` (legacy audio with no source tracked) -- no badge

## Fix 3 — Display Order Reordering

**File:** `src/pages/control-center/modules/WordsModule.tsx`

Add `ArrowUp, ArrowDown` to lucide imports.

Add a `swapDisplayOrder` handler:

```typescript
const swapDisplayOrder = async (wordA: DailyWord, wordB: DailyWord) => {
  try {
    // Swap display_order values between two words
    const { error: errA } = await supabase
      .from('daily_words')
      .update({ display_order: wordB.display_order })
      .eq('id', wordA.id);
    if (errA) throw errA;

    const { error: errB } = await supabase
      .from('daily_words')
      .update({ display_order: wordA.display_order })
      .eq('id', wordB.id);
    if (errB) throw errB;

    toast.success('Ordre mis a jour');
    fetchWords();
  } catch (err) {
    console.error('Swap error:', err);
    toast.error("Erreur lors du reordonnancement");
  }
};
```

Add a new "Ordre" column (or append to the `#` column) with up/down arrow buttons:
- Up arrow: calls `swapDisplayOrder(currentWord, previousWord)` -- disabled on the first row
- Down arrow: calls `swapDisplayOrder(currentWord, nextWord)` -- disabled on the last row
- Both use small ghost icon buttons with `ArrowUp` / `ArrowDown` icons

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/control-center/modules/WordsModule.tsx` | Date column, audio source badge, reorder buttons, uploadRecording audio_source |
| `src/types/dailyWord.ts` | Add `audio_source` field |
| `supabase/functions/generate-word-audio/index.ts` | Write `audio_source` on generation |
| Migration SQL | Add `audio_source` column to `daily_words` |

## Safety Verification

| Check | Status |
|-------|--------|
| Plans A and B code paths unchanged | Only additive changes (new column, new UI elements) |
| Deterministic algorithm unchanged | `computeDisplayOrder` not modified; `getScheduledDate` is read-only reverse calc |
| Student-facing hook unchanged | `useWordOfTheDay.ts` not touched; new column is nullable so no breakage |
| Edge function backward compatible | Just adds one more field to existing UPDATE |
| Existing audio_url unaffected | `audio_source` is nullable; old words simply show no badge |
| Swap is atomic per word | Two sequential UPDATEs; display_order values are unique |
| No new dependencies | ArrowUp/ArrowDown already in lucide-react |

