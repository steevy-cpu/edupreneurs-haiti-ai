

# Fix Duplicate Jude Chatbot on Course & Lesson Pages

## Root Cause

`JudeChatbot` is rendered from **three separate locations**:

1. `src/shell/FloatingLayer.tsx` -- the global, centralized instance (correct)
2. `src/pages/DynamicCoursePage.tsx` line 294 -- duplicate inline instance
3. `src/components/LessonPageTemplate.tsx` line 511 -- duplicate inline instance

The FloatingLayer was introduced as the **single source of truth** for all floating UI components, but the old inline `<JudeChatbot />` calls in these two files were never removed. This causes two "Cliquez sur moi" bubbles to appear simultaneously.

## Fix

Remove the inline `<JudeChatbot />` from both files, along with their unused imports.

### File 1: `src/pages/DynamicCoursePage.tsx`
- Remove `import { JudeChatbot } from "@/components/JudeChatbot";` (line 17)
- Remove `<JudeChatbot />` (line 294)

### File 2: `src/components/LessonPageTemplate.tsx`
- Remove `import { JudeChatbot } from "@/components/JudeChatbot";` (line 12)
- Remove `<JudeChatbot />` and its comment (lines 510-511)

No other changes needed -- the FloatingLayer already handles Jude's visibility on these routes.

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- FloatingLayer already renders Jude globally |
| Visibility rules still apply? | Yes -- `visibility.ts` controls when Jude shows/hides |
| 3G performance impact? | Positive -- one fewer component instance to render |
| Backward compatible? | Yes |

