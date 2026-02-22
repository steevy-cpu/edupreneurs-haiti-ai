

# Fix Lesson Completion Recording in LessonQuizTab.tsx

## Problem
`QuizRenderer` calls `onComplete(score, total)` when a student finishes the quiz, but the current handler in `LessonQuizTab` only logs to console. No `lesson_completions` record is created, no gold is awarded, and no confetti fires. The dashboard therefore never shows the lesson as completed.

## Solution
Add full completion logic to `LessonQuizTab.tsx` -- the single file being changed. All required data (`lessonSlug`, `subjectName`, `onGoldUpdate`) is already available as props.

## Changes (single file: `LessonQuizTab.tsx`)

### 1. New imports (top of file)
- `useState`, `useEffect`, `useCallback` from React
- `supabase` from `@/integrations/supabase/client`
- `useSessionAuth` from `@/contexts/SessionAuthContext` (follows project standard -- no direct `supabase.auth.getUser()`)
- `confetti` from `canvas-confetti` (already installed)
- `toast` from `sonner` or `useToast` from `@/hooks/use-toast` (match existing pattern in the file's neighbors)

### 2. Add `isLessonCompleted` state + mount check
- `const [isLessonCompleted, setIsLessonCompleted] = useState(false)`
- `useEffect` on mount: query `lesson_completions` where `user_id = user.id`, `lesson_slug = lessonSlug`, `subject = subjectName.toLowerCase()`. If a row exists, set `isLessonCompleted = true`.
- Dependencies: `[user?.id, lessonSlug, subjectName]`
- Guard: skip query if no user (unauthenticated visitors)

### 3. Create `handleQuizComplete(score, total)` callback
Step-by-step logic:

```
1. Calculate percentage = Math.round((score / total) * 100)
2. If percentage < 80:
   - Show toast: "Tu as besoin de 80% pour valider la lecon. Reessaie!"
   - Return early (no completion recorded)
3. If isLessonCompleted already true:
   - Show toast: "Lecon deja completee!"
   - Return early (prevent duplicate gold)
4. Upsert into lesson_completions:
   { user_id, lesson_slug: lessonSlug, subject: subjectName.toLowerCase(),
     score: percentage, completed_at: new Date().toISOString() }
   conflict on (user_id, lesson_slug, subject)
5. If upsert error: log and show error toast, return
6. Call increment_gold RPC: amount = Math.min(score + 50, 100)
   - RPC validates 1-100 range server-side
7. Call onGoldUpdate?.() to refresh GoldBadge
8. Set isLessonCompleted = true
9. First-completion confetti:
   if (!localStorage.getItem('first-lesson-celebrated')):
     localStorage.setItem('first-lesson-celebrated', 'true')
     confetti({ particleCount: 120, spread: 80, colors: ['#8b5cf6', '#f59e0b', '#10b981'] })
10. Show success toast: "Lecon completee! Tu as gagne X Gold!"
```

### 4. Wire `handleQuizComplete` to `QuizRenderer`
Replace lines 134-138:
```typescript
onComplete={(score, total) => {
  console.log(`Quiz completed: ${score}/${total}`);
  onGoldUpdate?.();
}}
```
With:
```typescript
onComplete={handleQuizComplete}
```

## Safety Verification

| Check | Status |
|-------|--------|
| No new dependencies added | OK -- canvas-confetti and supabase client already installed |
| No DB schema changes | OK -- lesson_completions table and increment_gold RPC already exist |
| Uses useSessionAuth (not supabase.auth.getUser) | OK -- follows project standard |
| RLS respected | OK -- upsert goes through authenticated client, increment_gold checks auth.uid() |
| Gold capped at 100 | OK -- Math.min(score + 50, 100) stays within RPC's 1-100 validation |
| Backward compatible | OK -- no prop changes, no interface changes |
| Single file changed | OK -- only LessonQuizTab.tsx |
| 3G safe | OK -- single upsert + single RPC, no waterfall |
| Duplicate completion prevented | OK -- isLessonCompleted guard + upsert conflict resolution |

