
# Plan: Highlight Questions in Jude's Chat with Styled Box

## Problem Analysis

From the screenshot, when Jude mentions a question in chat, it's wrapped with markdown bold syntax (`**...**`), which just makes the text bold. The user wants a more visually distinct presentation - like a bordered box or "circled" quote card.

**Current behavior:**
```
La question est : **"What do you like the most..."**
```

**Desired behavior:**
The question should appear in a styled card/box instead of just bold text.

---

## Solution Overview

We'll use a custom delimiter `《...》` (angle quotation marks) that the AI will use to wrap questions. The frontend will parse this and render a styled quote box.

---

## Technical Approach

### 1. Backend: Update Edge Function System Prompt

**File**: `supabase/functions/exam-tutor/index.ts`

Update the system prompt to instruct Jude to use the special delimiter for questions:

```typescript
// Add to system prompt (around line 206)
- **Pour citer la question de l'exercice**: Utilise les guillemets spéciaux 《...》 pour entourer le texte de la question (ex: 《What do you like the most?》)
- **NE PAS utiliser ** pour les questions**, utilise SEULEMENT 《...》
```

### 2. Frontend: Parse and Render Question Boxes

**File**: `src/components/MathContent.tsx`

Add detection and rendering for the `《...》` delimiter:

```typescript
// In renderWithLatexDelimiters function, add pattern for question quotes
const questionQuoteMatch = remaining.match(/^([\s\S]*?)《([\s\S]+?)》/);

// When matched, render as a styled box instead of plain text
if (questionQuoteMatch) {
  // Render as a quote card with border and background
  result.push(
    <span 
      key={keyCounter++} 
      className="inline-block my-2 px-3 py-2 bg-primary/10 border-l-4 border-primary rounded-r-lg italic text-foreground"
    >
      {prefix}
    </span>
  );
}
```

---

## File Changes Summary

| Operation | File | Description |
|-----------|------|-------------|
| Modify | `supabase/functions/exam-tutor/index.ts` | Add instruction to use 《...》 for questions |
| Modify | `src/components/MathContent.tsx` | Parse 《...》 and render as styled quote box |

---

## Visual Result

**Before** (markdown bold):
```
La question est : **"What do you like..."**
```

**After** (styled quote box):
```
La question est :
┌──────────────────────────────────┐
│ "What do you like the most..."   │
└──────────────────────────────────┘
```

The quote will have:
- Light primary background (`bg-primary/10`)
- Left border accent (`border-l-4 border-primary`)
- Rounded right corners
- Italic text for visual distinction

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | New delimiter doesn't conflict with existing patterns |
| Works with existing messages? | Yes | Old messages still render normally (bold text) |
| 3G optimized? | Yes | No additional network requests, pure CSS |
| Math content affected? | No | 《》 won't interfere with LaTeX $...$ |
| Backward compatible? | Yes | Falls back gracefully if delimiter not found |

---

## Implementation Time

~15 minutes - Update edge function prompt and add frontend parsing logic
