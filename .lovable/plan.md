

# Fix Three Bugs in InteractiveQuiz.tsx

## Overview
Three bugs cause lesson completion to silently fail in `InteractiveQuiz.tsx`. All changes are confined to this single file.

---

## Bug 1: topicId Silent Exit (Line 310)

**Problem:** `markLessonComplete` exits immediately if `topicId` (from `useParams()`) is undefined, which happens for non-math lessons. The same issue exists in the completion check `useEffect` at line 105.

**Fix:**
- Add optional `lessonSlug` and `subject` props to `InteractiveQuizProps`
- Create a `completionId` fallback chain: `topicId || lessonSlug || 'unknown'`
- Use `completionId` in both `markLessonComplete` (line 310) and the completion-check `useEffect` (line 105)
- Update guard: `if (!completionId || isLessonCompleted) return;`

## Bug 2: Hardcoded Subject (Lines 115, 329)

**Problem:** `subject` is hardcoded to `'mathematiques'` in both the completion check query (line 115) and the upsert (line 329). Non-math lessons are never recorded or detected.

**Fix:**
- Add optional `subject?: string` prop with fallback `'general'`
- Replace both hardcoded `'mathematiques'` strings with `subject` prop value

## Bug 3: Stale Score Closure (Line 382)

**Problem:** `handleNext` calls `markLessonComplete(score, ...)` but if the last answer was correct, `score` hasn't been updated yet by React's async `setScore`. The completion function receives a score that's 1 too low.

**Fix:**
- Add `useRef` import
- Create `const scoreRef = useRef(score)` and sync it: `useEffect(() => { scoreRef.current = score; }, [score])`
- Line 382: Change `markLessonComplete(score, questions.length)` to `markLessonComplete(scoreRef.current, questions.length)`

---

## Technical Details

### Modified Interface
```typescript
interface InteractiveQuizProps {
  content: string;
  isLoading: boolean;
  onRegenerate?: () => void;
  lessonGoldReward?: number;
  onGoldUpdate?: () => void;
  lessonSlug?: string;   // NEW — fallback identifier for non-math lessons
  subject?: string;      // NEW — actual subject name, defaults to 'general'
}
```

### Lines Changed
| Line(s) | Change |
|---------|--------|
| 1 | Add `useRef` to React import |
| 32-38 | Add `lessonSlug` and `subject` props |
| 90 | Destructure new props with defaults |
| 91-92 | Compute `completionId` from fallback chain |
| ~96 | Add `scoreRef` + sync effect |
| 105 | Use `completionId` instead of `topicId` in completion check |
| 115 | Use `subject` prop instead of hardcoded `'mathematiques'` |
| 310 | Use `completionId` in guard |
| 328-329 | Use `completionId` for `lesson_slug`, `subject` prop for `subject` |
| 382 | Use `scoreRef.current` instead of `score` |

### Safety

| Check | Status |
|-------|--------|
| No new dependencies | OK |
| No DB schema changes | OK |
| Backward compatible (new props optional) | OK |
| No Provider/AppShell changes | OK |
| Single file change | OK |

