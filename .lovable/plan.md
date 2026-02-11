

# Lesson Page Structure Review -- Findings and Recommendations

## Current Architecture Overview

The lesson page flow follows this path:

```text
Route (/course/:slug/:lessonSlug)
  -> DynamicLessonPage.tsx (data fetcher + gate)
    -> LessonPageTemplate.tsx (558-line monolith -- layout + tabs + header)
      -> Tab Components (in src/features/matieres/components/tabs/)
        -> LessonIntroductionTab
        -> LessonContenuTab
        -> LessonActivitiesTab (AI-generated)
        -> LessonQuizTab (AI-generated)
        -> LessonNotesTab
      -> Supporting Components (in src/components/lesson/)
        -> LessonNavigation
        -> LessonQuickStats
        -> LessonFeedback
        -> LessonAIPracticeSection
        -> ProgressiveContent
```

## What's Working Well

- **Tab decomposition**: Each tab is its own component -- good separation of concerns
- **Lazy loading**: AI-generated tabs (Quiz, Activities) only fetch when accessed
- **Caching strategy**: localStorage with 7-day staleness in `useAIGeneratedContent.ts` -- solid for 3G
- **Abort controllers**: Proper cleanup on unmount in AI hooks
- **Defensive queries**: `.maybeSingle()` everywhere -- prevents crashes on missing data
- **Sanitization**: Centralized `lib/sanitize.ts` with comprehensive DOMPurify config

## Structural Issues Found

### Issue 1: LessonPageTemplate.tsx is a 558-line monolith

This file handles header rendering, tab navigation, objectif expand/collapse, stats calculation, subject gradients, motivational messages, completion checking, and tab content assembly. It's the most fragile file in the lesson flow -- any change risks breaking something else.

**Risk**: High. Every UI tweak to the lesson page touches this one file.

### Issue 2: Duplicate sanitization logic

`LessonPageTemplate.tsx` defines its own `PURIFY_CONFIG` and `sanitizeHtml` (lines 31-44) while `lib/sanitize.ts` already provides the same thing with a more comprehensive config. The template's version is a subset and could miss edge cases.

**Risk**: Medium. Inconsistent sanitization across the app.

### Issue 3: Duplicate mobile/desktop header rendering

The header section (lines 230-385) renders the **exact same content twice** -- once for mobile (`lg:hidden`) and once for desktop (`hidden lg:block`). That's ~150 lines of near-identical JSX. Any change must be applied in two places or the layouts diverge silently.

**Risk**: High. This is the most likely source of bugs when updating the header.

### Issue 4: Helper functions inside the component file

`countActivities`, `countQuizQuestions`, `estimateReadingTime`, `stripHtmlToText` are utility functions defined in `LessonPageTemplate.tsx`. They belong in a utility file and are untestable in their current location.

**Risk**: Low. Functional but messy.

### Issue 5: LessonData interface defined locally

The `LessonData` and `SiblingLesson` interfaces are defined inside `LessonPageTemplate.tsx` (lines 54-76) AND duplicated in `DynamicLessonPage.tsx` (`SiblingLesson` at line 14). If one changes, the other might not.

**Risk**: Medium. Type drift between pages.

### Issue 6: No ErrorBoundary around tab content

If a tab component throws (e.g., bad AI response crashes `QuizRenderer`), the entire lesson page goes blank. Each tab should be wrapped in an error boundary so one broken tab doesn't take down the whole page.

**Risk**: High. A single parsing error in quiz data can destroy the user's session.

### Issue 7: The page doesn't use AppShell's PageContainer

`LessonPageTemplate` builds its own layout from scratch (`min-h-screen`, custom container, custom sticky nav) instead of using the standardized `PageContainer` and `CourseLayout` components. This means it doesn't benefit from the app's consistent spacing and scroll isolation.

**Risk**: Low-medium. Works now, but diverges from platform conventions.

## Proposed Refactoring Plan

### Step 1: Extract LessonHeader component
Pull the entire header section (badges, title, Jude image, objectif, motivational message, download button) into `src/features/matieres/components/LessonHeader.tsx`. Unify the mobile/desktop markup using responsive classes on a **single** set of elements instead of duplicating the entire block.

### Step 2: Remove duplicate sanitization
Delete the local `PURIFY_CONFIG`, `sanitizeHtml`, and `stripHtmlToText` from `LessonPageTemplate.tsx`. Import `sanitizeHtml` from `@/lib/sanitize`. Move `stripHtmlToText` to a shared utility (`@/lib/text-utils.ts`).

### Step 3: Extract shared types
Create `src/features/matieres/types/lesson.types.ts` containing `LessonData`, `SiblingLesson`, and any other shared lesson interfaces. Import from there in both `DynamicLessonPage.tsx` and `LessonPageTemplate.tsx`.

### Step 4: Extract utility functions
Move `countActivities`, `countQuizQuestions`, `estimateReadingTime` to `src/features/matieres/utils/lesson-stats.ts`.

### Step 5: Add TabErrorBoundary
Create a lightweight `TabErrorBoundary` component that catches errors inside each tab and shows "This section encountered an error -- try refreshing" instead of crashing the whole page. Wrap each `TabsContent` child with it.

### Step 6: Slim down LessonPageTemplate
After steps 1-5, `LessonPageTemplate.tsx` becomes a ~150-line orchestrator that:
- Manages tab state and completion tracking
- Composes `LessonHeader`, `LessonNavigation`, `LessonQuickStats`, tabs, and `LessonFeedback`
- No rendering logic, no utility functions, no type definitions

## File Structure After Refactoring

```text
src/features/matieres/
  types/
    lesson.types.ts           <-- NEW: LessonData, SiblingLesson
  utils/
    lesson-stats.ts           <-- NEW: countActivities, countQuizQuestions, estimateReadingTime
  components/
    LessonHeader.tsx          <-- NEW: unified header (mobile+desktop)
    TabErrorBoundary.tsx      <-- NEW: error boundary for tabs
    tabs/
      (unchanged)

src/lib/
  text-utils.ts               <-- NEW: stripHtmlToText
  sanitize.ts                 (unchanged)

src/components/
  LessonPageTemplate.tsx      <-- SLIMMED: ~150 lines, orchestration only
```

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- pure refactoring, no behavior changes |
| Works with existing data? | Yes -- no database changes |
| 3G optimized? | Yes -- no new network calls, same lazy-loading |
| Backward compatible? | Yes -- same props, same routes |
| Edge cases handled? | Improved -- TabErrorBoundary catches tab crashes |

## What This Does NOT Change
- Tab components stay as-is (already well-structured)
- AI generation hooks stay as-is (already solid)
- ProgressiveContent stays as-is
- Routing stays as-is
- No database changes

