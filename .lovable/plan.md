

# Offline Mode for Lesson Pages

## Overview

Two surgical changes: (1) cache lesson content to localStorage on successful load and fall back to it when offline, (2) show offline indicators on the lesson page and disable network-dependent tabs.

No architecture changes. No new dependencies. No changes to query config, Matieres page, or grade selection.

## Changes

### 1. DynamicLessonPage.tsx -- localStorage cache + offline fallback

**Cache key:** `lesson_cache_{subjectSlug}_{lessonSlug}`

**On successful load (after line 140):**
- Write to localStorage: `{ lesson: transformedLesson, subject: { name, slug, grade_level }, savedAt: Date.now() }`

**On fetch failure (in catch block, line 141-143):**
- Read from localStorage using the cache key
- Check TTL: only use if `savedAt` is less than 24 hours old
- If valid cache exists: populate `lesson` and `subject` state from cache, set new state flag `isOfflineMode = true`
- If no valid cache: fall through to existing "lesson not found" UI

**New state:** `const [isOfflineMode, setIsOfflineMode] = useState(false);`

**Pass down:** Add `isOfflineMode` prop to `LessonPageTemplate`

### 2. LessonPageTemplate.tsx -- offline banner + prop threading

**New prop:** `isOfflineMode?: boolean` added to `LessonPageTemplateProps`

**Offline banner:** Rendered between `LessonHeader` and the stats section when `isOfflineMode` is true:
- Amber background, subtle styling consistent with existing alert patterns
- Text: "Mode hors-ligne -- contenu mis en cache. Certaines fonctionnalites sont indisponibles."
- Uses `WifiOff` icon from lucide-react (already installed)

**Prop threading:** Pass `isOfflineMode` to `LessonActivitiesTab` and `LessonQuizTab`

### 3. LessonActivitiesTab.tsx -- offline guard

**New optional prop:** `isOfflineMode?: boolean`

**Early return:** If `isOfflineMode` is true, render a Card with a friendly message:
- "Activites non disponibles hors-ligne. Reconnectez-vous pour acceder a cet onglet."
- Uses `WifiOff` icon
- Skips all AI generation hooks (the hook still runs but its fetch will fail gracefully; the early return prevents showing error states)

### 4. LessonQuizTab.tsx -- offline guard

Same pattern as Activities: new `isOfflineMode?: boolean` prop, early return with friendly offline message before any data fetching UI.

### 5. Types update -- lesson.types.ts

Add `isOfflineMode?: boolean` to `LessonPageTemplateProps`.

## Files Modified

| File | Change |
|------|--------|
| `src/pages/DynamicLessonPage.tsx` | Add localStorage write on success, read on failure, `isOfflineMode` state, pass prop |
| `src/components/LessonPageTemplate.tsx` | Accept `isOfflineMode`, render amber banner, pass to tabs |
| `src/features/matieres/components/tabs/LessonActivitiesTab.tsx` | Accept `isOfflineMode`, early return with offline message |
| `src/features/matieres/components/tabs/LessonQuizTab.tsx` | Accept `isOfflineMode`, early return with offline message |
| `src/features/matieres/types/lesson.types.ts` | Add `isOfflineMode` to `LessonPageTemplateProps` |

## What is NOT touched

- TanStack Query configuration
- Matieres page / grade selection
- lesson_assets queries
- Service worker
- No new dependencies

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality affected? | No -- online path unchanged, cache write is additive |
| Bundle size impact? | Negligible -- ~40 lines of localStorage logic, WifiOff icon already in lucide bundle |
| 3G performance? | Improved -- cached lessons load instantly on revisit when offline |
| RLS / DB impact? | None -- purely client-side localStorage |
| Provider stack / AppShell? | Untouched |
| Backward compatibility? | Yes -- no cache = normal behavior |

