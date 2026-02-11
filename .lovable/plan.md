

# Two Changes to Lesson Pages

## Change 1: Compact Audio Icon Instead of Full Player

**Problem**: The current audio player takes up a full row with a large `<audio>` element (as seen in the screenshot). This wastes vertical space, especially on mobile.

**Solution**: Replace the full audio bar with a small, clickable speaker icon button placed inline next to the section title. Clicking it plays/pauses the audio. A subtle animation indicates playback.

### Implementation

**New component: `src/components/LessonAudioIconButton.tsx`**
- A small circular button with a `Volume2` icon
- On click: plays or pauses the audio using an `Audio` object via `useRef`
- While playing: icon animates (pulse) and switches to a "pause" or "playing" state
- Lightweight -- no browser `<audio controls>`, just programmatic playback

**Update: `src/features/matieres/components/tabs/LessonIntroductionTab.tsx`**
- Replace `LessonAudioPlayerSimple` with `LessonAudioIconButton` placed next to the "Introduction" title in `CardTitle`

**Update: `src/features/matieres/components/tabs/LessonContenuTab.tsx`**
- Replace both `LessonAudioPlayerSimple` instances with `LessonAudioIconButton` next to "Contenu du cours" and "Exemples et Exercices" titles

**Update: `src/components/LessonPageTemplate.tsx`**
- Replace `LessonAudioPlayerSimple` for the objectif audio with `LessonAudioIconButton` placed inline next to the objectif text/badge area

### Visual Result
```text
Before:  [====== full audio bar with controls ======]
After:   Introduction  [speaker icon]
```

---

## Change 2: Collapsible Objectif Section

**Problem**: The "Objectif de la lecon" text takes too much vertical space in the header, pushing important content down.

**Solution**: Show only the first 2 lines of the objectif text by default with a "Lire plus" button. Clicking it expands to show the full text.

### Implementation

**Update: `src/components/LessonPageTemplate.tsx`**
- Wrap the objectif `div` in a container with `max-h` + `overflow-hidden` and a `line-clamp-2` class
- Add a "Lire plus" / "Lire moins" toggle button below
- Use a simple `useState` boolean (`isObjectifExpanded`) to toggle
- Apply to both mobile and desktop sections of the header

---

## Files Summary

| File | Change |
|------|--------|
| `src/components/LessonAudioIconButton.tsx` | **NEW** -- Small inline audio play/pause icon button |
| `src/components/LessonPageTemplate.tsx` | Replace audio player with icon button; add collapsible objectif |
| `src/features/matieres/components/tabs/LessonIntroductionTab.tsx` | Replace audio player with icon button next to title |
| `src/features/matieres/components/tabs/LessonContenuTab.tsx` | Replace both audio players with icon buttons next to titles |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- audio still plays, just different UI |
| 3G optimized? | Yes -- smaller UI, same audio preload strategy |
| Backward compatible? | Yes -- lessons without audio still work (icon hidden) |
| Works on mobile? | Yes -- icon button is touch-friendly, collapsible saves space |

