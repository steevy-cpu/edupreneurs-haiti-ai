

# Jude-Branded Quiz and Activities Experience

## Overview
Transform the quiz and activities sections so that **Jude** feels like the one generating questions and giving personalized feedback — matching the translate page pattern where Jude's avatar, name, and personality are front and center.

## What Changes

### 1. Loading States -- "Jude is preparing your quiz/activities"
**Files: `LessonActivitiesTab.tsx` and `LessonQuizTab.tsx`**

Replace the generic Skeleton/Sparkles loading with a reusable `JudeGeneratingOverlay` component (similar to `JudeTranslatingOverlay`):
- Jude's avatar (eric-chair-desk.png) with pulse animation
- Text: "Jude prepare tes activites..." / "Jude prepare ton quiz..."
- Bouncing dots indicator

### 2. New Reusable Component: `JudeGeneratingOverlay`
**New file: `src/components/jude/JudeGeneratingOverlay.tsx`**

A generic overlay component that accepts a `message` prop:
```
Props:
- isVisible: boolean
- message: string (e.g., "Jude prepare ton quiz...")
```

Uses the same pattern as `JudeTranslatingOverlay`: Jude avatar + pulse + bouncing dots.

### 3. Feedback Messages -- "Jude says..."
**File: `InteractiveActivitiesEnhanced.tsx`**

When showing feedback after answering:
- Add Jude's small avatar next to the feedback text
- Correct: "Bravo! [explanation]" with Jude's happy avatar
- Incorrect: "Pas tout a fait... [explanation]" with Jude's encouraging avatar

**File: `QuizRenderer.tsx`**

Same pattern:
- Add Jude's avatar next to the feedback block
- Personalized feedback text from Jude

### 4. Completion Screens -- "Jude congratulates you"
**File: `InteractiveActivitiesEnhanced.tsx` (completion section)**

Replace the generic emoji completion with:
- Jude's larger avatar at the top
- Personalized message from Jude based on score:
  - 80%+: "Jude: Excellent travail! Tu maitrises ce sujet!"
  - 60-79%: "Jude: Bien joue! Continue comme ca!"
  - Below 60: "Jude: Ne lache pas! Revise la lecon et reessaye!"

**File: `QuizRenderer.tsx` (completion section)**

Same Jude-branded completion screen.

### 5. Headers -- Jude branding
**Files: `LessonActivitiesTab.tsx` and `LessonQuizTab.tsx`**

Add a small Jude avatar icon next to the section titles:
- "Activites par Jude" (with small avatar)
- "Quiz par Jude" (with small avatar)

## Detailed File Changes

| File | Changes |
|------|---------|
| `src/components/jude/JudeGeneratingOverlay.tsx` | **NEW** -- Reusable Jude loading overlay (avatar + pulse + dots + custom message) |
| `src/features/matieres/components/tabs/LessonActivitiesTab.tsx` | Replace Skeleton loading with JudeGeneratingOverlay; add Jude avatar to header |
| `src/features/matieres/components/tabs/LessonQuizTab.tsx` | Replace Skeleton loading with JudeGeneratingOverlay; add Jude avatar to header |
| `src/components/InteractiveActivitiesEnhanced.tsx` | Add Jude avatar to feedback blocks and completion screen; update loading state |
| `src/features/matieres/renderers/QuizRenderer.tsx` | Add Jude avatar to feedback blocks and completion screen |

## UX Flow

```text
User clicks "Activites" tab
    |
    v
[Jude avatar + pulse + "Jude prepare tes activites..."]
    |
    v
[Questions appear, header shows "Activites par Jude"]
    |
    v
User answers --> [Jude avatar + "Bravo!" or "Pas tout a fait..."]
    |
    v
All done --> [Large Jude avatar + personalized score message]
```

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- only UI/cosmetic changes, no logic changes |
| Works with existing data? | Yes -- no data structure changes |
| 3G optimized? | Yes -- Jude image already cached by service worker; reuses existing asset |
| Edge cases handled? | Yes -- JudeGeneratingOverlay has isVisible guard |
| Backward compatible? | Yes -- same quiz/activity data, just better presentation |

