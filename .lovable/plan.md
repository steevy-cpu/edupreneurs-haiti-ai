
# Fix Plan: Highlight Questions with Styled Quote Box

## Problem Analysis

There are **two issues** preventing the question from being highlighted:

### Issue 1: Frontend - MathText component doesn't detect `《...》`

The `MathText` component (used in `AskJudeDrawer.tsx`) only processes special delimiters if:
- `containsMath()` returns true, OR
- `hasLatexDelimiters()` returns true

Neither of these functions check for `《...》`, so text containing this pattern is returned as plain text without processing.

**Current flow:**
```
User message → MathText → containsMath? NO → Return plain text (skips 《...》 processing)
```

### Issue 2: Backend - AI instruction needs reinforcement

The current instruction is:
> "Pour citer la question de l'exercice": Utilise les guillemets spéciaux 《...》

This is passive. The AI may describe/paraphrase the question instead of quoting it.

---

## Solution

### Part 1: Update Frontend Detection Functions

**File**: `src/components/MathContent.tsx`

1. **Add pattern to `hasLatexDelimiters()`** to detect `《...》`:

```typescript
// Line 207-211 - hasLatexDelimiters function
const hasLatexDelimiters = (text: string): boolean => {
  return /\$\$[\s\S]+?\$\$/.test(text) ||    // $$...$$
         /\$[^$\n]+?\$/.test(text) ||         // $...$
         /\\\([\s\S]+?\\\)/.test(text) ||     // \(...\)
         /\\\[[\s\S]+?\\\]/.test(text) ||     // \[...\]
         /《[\s\S]+?》/.test(text);            // 《...》 question quotes ← ADD THIS
};
```

This ensures `MathText` will call `renderWithLatexDelimiters()` when it encounters the quote pattern.

### Part 2: Reinforce Backend Instruction

**File**: `supabase/functions/exam-tutor/index.ts`

Update the system prompt to be more directive (line 207):

```typescript
// Before:
- **Pour citer la question de l'exercice**: Utilise les guillemets spéciaux 《...》 pour entourer le texte de la question...

// After:
- **IMPORTANT - Citation de question**: Quand tu mentionnes ou cites la question de l'exercice, tu DOIS TOUJOURS l'entourer avec 《...》 (ex: 《Quelle est ta préférence?》). N'utilise JAMAIS ** ou "" pour les questions.
```

---

## File Changes Summary

| File | Line | Change |
|------|------|--------|
| `src/components/MathContent.tsx` | 207-211 | Add `/《[\s\S]+?》/` pattern to `hasLatexDelimiters()` |
| `supabase/functions/exam-tutor/index.ts` | 207 | Reinforce instruction to use `《...》` |

---

## Visual Result

**Before** (current screenshot):
```
La question te demande d'écrire un petit texte...
```
(Plain text, not highlighted)

**After** (with fix):
```
La question te demande:
┌────────────────────────────────────────┐
│ "Écrire un petit texte de 10 lignes..." │
└────────────────────────────────────────┘
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Only adds new pattern detection |
| Affects LaTeX rendering? | No | `《》` characters don't conflict with math |
| 3G optimized? | Yes | No additional network requests |
| Backward compatible? | Yes | Old messages render normally |

---

## Implementation Time

~10 minutes - Two small changes to detection and prompt
