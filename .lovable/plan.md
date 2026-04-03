

## Fix Build Errors — Corrupted Code in Two Files

The preview is broken because two files were corrupted during a previous automated edit (the "remove 196 console.log statements" commit). The removal accidentally deleted surrounding code blocks, leaving broken syntax.

### File 1: `src/features/content-editor/hooks/useBatchGeneration.ts`

**Problem:** Lines 331 onward are corrupted. After image filtering code (line 330), the file jumps directly to the `exportGenerationResults` CSV logic, missing ~40 lines of code: image processing, audio URL fetching, lesson completion marking, error handling, and proper closing braces.

**Fix:** Replace lines 331–353 with the correct code from the previous working version. This restores:
- Image insertion into lesson content
- Audio URL fetching after generation
- Lesson completion status update with timing
- Try/catch error handling
- The `exportGenerationResults` callback
- Proper closing of the hook

### File 2: `src/components/quiz-battle/MultiplayerBattleGameplay.tsx`

**Problem:** The `finishGame` function (line 236) is truncated at line 262. It computes round scores but never calls `onComplete()` or calculates XP — the function body was cut short when `console.log` statements were removed.

**Fix:** Replace lines 262–263 with the missing code that was deleted: XP calculation logic, the `onComplete()` call with all game results, and the proper closing of the `useCallback`.

### File 3: `supabase/functions/create-stripe-renewal/index.ts`

**Problem:** Edge function uses `npm:@supabase/supabase-js@2.57.2` which isn't resolved in the Deno environment. This is a non-blocking error (edge functions deploy separately) but should be fixed.

**Fix:** Change the import to use `https://esm.sh/@supabase/supabase-js@2` (ESM pattern consistent with other edge functions).

### Safety

| Check | Status |
|-------|--------|
| Restores previous working code? | Yes — from git history |
| Adds new functionality? | No |
| Affects other files? | No |
| Risk | Very low — restoring proven code |

