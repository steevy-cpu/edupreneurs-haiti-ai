
# KaTeX Rendering Across All Chat Surfaces

## Executive Summary

This plan implements centralized KaTeX (math formula) rendering across all Jude-powered chat surfaces to enable proper display of mathematical expressions. The architecture follows the principle that **math rendering is a content concern, not a UI concern**.

## Current State Analysis

### Chat Surfaces Audit

| Surface | Component | Edge Function | KaTeX Status |
|---------|-----------|---------------|--------------|
| Home Chatbox | `HomeChatbot.tsx` | `home-eric-chat` | ❌ Missing |
| Jude Floating Chatbot | `JudeChatbot.tsx` | `jude-ai-tutor` | ❌ Missing |
| Community (Jude DM) | `MessageBubble.tsx` | `eric-chat` | ❌ Missing |
| Exam Tutor (9AF) | `ExamTutorChat.tsx` | `exam-tutor` | ✅ Has `<MathText>` |
| Bac Philosophy | `BacDissertationChat.tsx` | `bac-philosophy-tutor` | ✅ Has inline renderer |

### Existing Infrastructure

The project already has a comprehensive `MathContent.tsx` component that:
- Handles all LaTeX delimiter formats: `$...$`, `$$...$$`, `\(...\)`, `\[...\]`
- Converts HTML math patterns to LaTeX
- Uses `react-katex` for rendering
- Exports both `MathContent` and `MathText` components

---

## Architecture Design

### Principle: One Renderer, All Surfaces

```text
LLM Output
    ↓
Edge Function (returns plain text with LaTeX delimiters)
    ↓
Client receives: "La formule est $x^2 + y^2 = z^2$"
    ↓
ChatMessageRenderer (shared component)
    ├── Detects math delimiters
    ├── Renders text + KaTeX
    └── Same component for ALL chat surfaces
```

### Why Client-Side Rendering?

- Edge functions should remain fast and lightweight
- KaTeX rendering on server would increase payload size
- Client already has `react-katex` installed
- Lazy-loading KaTeX only when math is detected

---

## Implementation Plan

### Phase 1: Create Unified Chat Message Renderer

**New File:** `src/components/ChatMessageRenderer.tsx`

A single component that wraps the existing `MathContent` logic specifically for chat messages:

```tsx
import { MathText } from '@/components/MathContent';

interface ChatMessageRendererProps {
  content: string;
  className?: string;
}

export function ChatMessageRenderer({ content, className }: ChatMessageRendererProps) {
  return (
    <div className={className}>
      <MathText text={content} />
    </div>
  );
}
```

This provides:
- Semantic naming for chat contexts
- Single point of control for chat-specific rendering tweaks
- Consistent error boundaries

---

### Phase 2: Update HomeChatbot.tsx

**File:** `src/components/HomeChatbot.tsx`

**Current (line 189):**
```tsx
message.content
```

**After:**
```tsx
import { ChatMessageRenderer } from './ChatMessageRenderer';
// ...
<ChatMessageRenderer content={message.content} />
```

---

### Phase 3: Update JudeChatbot.tsx

**File:** `src/components/JudeChatbot.tsx`

**Current (line 429):**
```tsx
message.content
```

**After:**
```tsx
import { ChatMessageRenderer } from './ChatMessageRenderer';
// ...
<ChatMessageRenderer content={message.content} />
```

Note: The `TypewriterText` component will need special handling - we'll render plain text during typing, then switch to `ChatMessageRenderer` once complete.

---

### Phase 4: Update MessageBubble.tsx (Community Chat)

**File:** `src/components/community/MessageBubble.tsx`

**Current (line 236):**
```tsx
<p className="text-xs sm:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere flex-1">
  {message.content}
</p>
```

**After:**
```tsx
import { ChatMessageRenderer } from '@/components/ChatMessageRenderer';
// ...
<div className="text-xs sm:text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere flex-1">
  <ChatMessageRenderer content={message.content} />
</div>
```

---

### Phase 5: Update Edge Functions (Prompt Enhancement)

Add LaTeX formatting instructions to each edge function's system prompt:

**Files to update:**
- `supabase/functions/home-eric-chat/index.ts`
- `supabase/functions/eric-chat/index.ts`
- `supabase/functions/jude-ai-tutor/index.ts`

**Add to system prompts:**
```
**MATHEMATICAL FORMATTING:**
- Pour les formules mathématiques, utilise la notation LaTeX
- Formules en ligne: $x^2 + y^2 = z^2$
- Équations en bloc: $$\frac{a}{b} = c$$
- Exemples: fractions avec \frac{}{}, racines avec \sqrt{}, puissances avec ^{}
```

Note: `exam-tutor` already has this instruction (line 89).

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/ChatMessageRenderer.tsx` | Create | Unified chat message renderer |
| `src/components/HomeChatbot.tsx` | Modify | Import and use ChatMessageRenderer |
| `src/components/JudeChatbot.tsx` | Modify | Import and use ChatMessageRenderer |
| `src/components/community/MessageBubble.tsx` | Modify | Import and use ChatMessageRenderer |
| `supabase/functions/home-eric-chat/index.ts` | Modify | Add LaTeX prompt instruction |
| `supabase/functions/eric-chat/index.ts` | Modify | Add LaTeX prompt instruction |
| `supabase/functions/jude-ai-tutor/index.ts` | Modify | Add LaTeX prompt instruction |

---

## Special Considerations

### Typewriter Effect Compatibility

The `TypewriterText` component in `HomeChatbot.tsx` and `JudeChatbot.tsx` displays characters one-by-one. Math rendering during typewriter would cause issues (incomplete LaTeX would crash KaTeX).

**Solution:** 
- During typewriter animation: render plain text
- Once typewriter completes: switch to `ChatMessageRenderer`

This is already partially implemented - the current code sets `typingMessageIndex` to track which message is being typed.

### 3G Performance

- KaTeX CSS is already loaded globally (`import 'katex/dist/katex.min.css'`)
- No additional network requests for math rendering
- `react-katex` is already bundled
- Zero performance regression expected

### Security

- KaTeX does not execute JavaScript
- LaTeX input is sanitized by the library
- No `dangerouslySetInnerHTML` for raw HTML
- XSS risk is mitigated

---

## Safety Verification

| Check | Status |
|-------|--------|
| Backward compatible? | ✅ Yes - plain text still renders normally |
| Breaks existing functionality? | ✅ No - only adds math rendering |
| 3G optimized? | ✅ Yes - no new network requests |
| Existing data preserved? | ✅ Yes - no database changes |
| All chat surfaces covered? | ✅ Yes - 3 needing updates identified |

---

## Implementation Order

1. Create `ChatMessageRenderer.tsx` (shared component)
2. Update `HomeChatbot.tsx` (simplest case)
3. Update `JudeChatbot.tsx` (with typewriter handling)
4. Update `MessageBubble.tsx` (community chat)
5. Update edge function prompts (optional but recommended)
6. Test with math expressions

---

## Expected Outcome

After implementation:
- `$x^2 + y^2 = z^2$` renders as inline math: x² + y² = z²
- `$$\frac{a}{b}$$` renders as block equation
- All chat surfaces have consistent math rendering
- Existing text-only messages render unchanged
