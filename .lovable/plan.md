
# Fix KaTeX Rendering Inside Question Quotes and Hint Display

## Root Cause

Two bugs found:

### Bug 1: QuestionQuoteBox doesn't render KaTeX (main issue)

The `QuestionQuoteBox` component in `MathContent.tsx` renders its content as plain text. When the AI wraps a question in `《...》` delimiters (as instructed by the system prompt), any `$...$` math inside those quotes is swallowed and displayed as raw text like `$\widehat{AB}$`.

**Flow:**
```text
AI response: 'Pour la premiere partie, 《Calcule la mesure de l'arc $\widehat{AB}$》, rappelle-toi...'
                                         ^---- QuestionQuoteBox captures everything inside, including $...$
                                               and renders as plain text. KaTeX never runs.
```

### Bug 2: "0" displayed next to hint header

In `FeedbackCard.tsx` line 128, the condition `feedback.grading?.pointsAwarded && ...` evaluates to `0` (falsy number) for hints, and React renders `0` as visible text.

## Fix Plan (2 files)

### File 1: `src/components/MathContent.tsx`

Update `QuestionQuoteBox` to recursively render its content through `renderWithLatexDelimiters` so that any `$...$` or `$$...$$` inside question quotes gets proper KaTeX rendering:

```tsx
// Before (line 216-220)
const QuestionQuoteBox = ({ content }: { content: string }) => (
  <span className="inline-block my-2 px-3 py-2 bg-primary/10 border-l-4 border-primary rounded-r-lg italic text-foreground">
    "{content}"
  </span>
);

// After
const QuestionQuoteBox = ({ content }: { content: string }) => (
  <span className="inline-block my-2 px-3 py-2 bg-primary/10 border-l-4 border-primary rounded-r-lg italic text-foreground">
    "{hasLatexDelimiters(content) ? renderWithLatexDelimiters(content) : content}"
  </span>
);
```

This is safe because `renderWithLatexDelimiters` only processes `$...$`, `$$...$$`, `\(...\)`, and `\[...\]` -- it won't recurse on `《...》` since we already consumed that outer delimiter.

### File 2: `src/features/exams/practice/components/FeedbackCard.tsx`

Fix the "0" display bug on line 128 by using explicit null check:

```tsx
// Before
{feedback.grading?.pointsAwarded && feedback.grading.pointsAwarded > 0 && (

// After
{feedback.grading?.pointsAwarded != null && feedback.grading.pointsAwarded > 0 && (
```

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- QuestionQuoteBox only adds rendering, fallback to plain text unchanged |
| Backward compatible? | Yes -- only enhances existing component |
| 3G optimized? | Yes -- no extra network calls, KaTeX already loaded |
| Edge case: no math in quote? | Handled -- `hasLatexDelimiters` check skips KaTeX processing when not needed |
| Edge case: recursive 《...》? | Safe -- renderWithLatexDelimiters doesn't re-process 《...》 |
