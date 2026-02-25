

# Phase 2: Points Cles Voice Narration

## Overview
Single file modified: `src/features/matieres/components/tabs/LessonPointsClesTab.tsx`. Adds a speaker button to each flashcard that reads the card aloud using the Phase 1 `useJudeVoice` hook.

---

## Changes

### 1. New imports (line 13-16 area)
- `useJudeVoice` from `@/hooks/useJudeVoice`
- `Volume2`, `VolumeX`, `Square`, `Loader2` from `lucide-react`

### 2. New internal component: `JudeSpeakerButton`
Placed after the existing helper components (after `ExternalDots`, around line 151). Accepts `text` (narration string) and `storageKey`. Uses `useJudeVoice` with `context: 'points-cles'` and `autoPreload: true`.

Three visual states:
- **Loading**: spinning `Loader2` icon while edge function fetches/generates audio
- **Speaking**: filled `Square` (stop button)
- **Ready**: `Volume2` speaker icon
- **Error**: dimmed `VolumeX`, disabled

Styled as a small `bg-white/10 hover:bg-white/20` pill matching the card's white-on-gradient aesthetic.

### 3. Update `PointsClesCardSlide` signature
Add `lessonId: string` and `cardIndex: number` props alongside the existing `card` prop.

Inside the component:
- Build `narrationText = card.title + '. ' + card.content`
- Build `storageKey = 'points-cles/' + lessonId + '-card-' + cardIndex`
- Render `JudeSpeakerButton` at `absolute top-3 right-3`
- For "remember" cards, shift the existing pulsing `Star` decoration from `top-4 right-4` to `top-4 right-12` so it doesn't overlap the speaker button

### 4. Thread props in carousel map (line 283-286)
Pass `lessonId` and `cardIndex={index}` to each `PointsClesCardSlide`.

---

## Visual Layout (per card)

```text
+----------------------------------+
|                    [Star?] [🔊]  |   <-- top-right corner
|          😊 📖                   |
|        Card Title                |
|     Card content text...         |
|        [ Concept ]               |
+----------------------------------+
```

## Safety Verification

| Check | Status |
|---|---|
| Existing functionality preserved? | Yes -- only additive changes to one file |
| Provider stack affected? | No |
| New dependencies? | None -- Volume2/VolumeX/Square/Loader2 already in lucide-react bundle |
| Cold start risk? | No -- autoPreload fires in background, never blocks UI |
| 3G compatible? | Yes -- pre-generated mp3_22050_32 via CDN, preload is non-blocking |
| Backward compatible? | Yes -- speaker button is purely additive UI |
| Edge cases? | Error state shows disabled icon; empty text skipped by useJudeVoice |

## Files Summary

| File | Action |
|---|---|
| `src/features/matieres/components/tabs/LessonPointsClesTab.tsx` | Modify |

No other files touched. No edge function changes. No DB changes.

