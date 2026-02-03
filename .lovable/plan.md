
# Fix Plan: AskJudeDrawer Display Issues

## Problems Identified

| Issue | Location | Root Cause |
|-------|----------|------------|
| Text not wrapping on mobile | `AskJudeDrawer.tsx` lines 144-158 | Missing `overflow-hidden` and `break-words` on Card |
| Long text running off screen | Card component | `max-w-[85%]` works but content overflows the Card |
| Desktop drawer partially visible | vaul Drawer behavior | This is expected - drawer slides up from bottom |

---

## Solution

### File: `src/features/exams/practice/components/AskJudeDrawer.tsx`

**Changes to the Card component (lines 144-158):**

```typescript
// BEFORE (line 144-150):
<Card
  className={`p-3 max-w-[85%] ${
    message.role === 'user'
      ? 'bg-primary text-primary-foreground'
      : 'bg-card border-primary/10'
  }`}
>
  <div className="text-sm whitespace-pre-wrap leading-relaxed">

// AFTER:
<Card
  className={`p-3 max-w-[85%] overflow-hidden ${
    message.role === 'user'
      ? 'bg-primary text-primary-foreground'
      : 'bg-card border-primary/10'
  }`}
>
  <div className="text-sm whitespace-pre-wrap break-words leading-relaxed overflow-hidden">
```

**Key CSS additions:**
1. `overflow-hidden` on Card - prevents content from overflowing the card boundaries
2. `break-words` on the content div - forces long words/sentences to wrap
3. `overflow-hidden` on content div - additional safety

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Only adds CSS classes |
| Works with existing data? | Yes | No data changes |
| 3G optimized? | Yes | No additional downloads |
| Backward compatible? | Yes | Pure CSS addition |
| Math content affected? | No | KaTeX handles its own overflow |

---

## File Changes Summary

| Operation | File | Lines | Description |
|-----------|------|-------|-------------|
| Modify | `src/features/exams/practice/components/AskJudeDrawer.tsx` | 144-151 | Add overflow-hidden and break-words classes |

---

## Implementation Time

~5 minutes - single CSS class additions to fix word wrapping
