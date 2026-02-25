

# Phase 3: Studygram A Retenir Voice Narration

## Overview
Single file modified: `src/features/matieres/components/tabs/LessonStudygramTab.tsx`. Adds speaker buttons exclusively to the A Retenir section -- both per-node and a "read all" button in the section header.

---

## Changes

### 1. New imports (line 4-6 area)
- Add `Volume2`, `VolumeX`, `Square`, `Loader2` to the existing lucide-react import (line 4)
- Add `useJudeVoice` from `@/hooks/useJudeVoice` (new import line after line 6)

### 2. New internal component: `JudeSpeakerButton` (after `getColors`, around line 79)
Same pattern as Points Cles but styled for the emerald A Retenir palette:
- Smaller icons (`h-3.5 w-3.5`) to fit inline with mind-map nodes
- Emerald color scheme: `bg-emerald-100 hover:bg-emerald-200` light, `bg-emerald-900/40` dark
- `context: 'studygram'`, `autoPreload: true`
- Four states: loading spinner, stop square, volume icon, disabled error

### 3. Thread `lessonId` to `MindMapSectionCluster` (line 152, 383)
- Add `lessonId: string` prop to `MindMapSectionCluster`
- Pass `lessonId` from the sections map in `LessonStudygramTab` (line 383)

### 4. A Retenir section header speaker button (line 165-169)
In the header `div` of `MindMapSectionCluster`, when `isRetenir`:
- Add a `JudeSpeakerButton` after the heading text
- text: all node texts concatenated with `. ` separator
- storageKey: `studygram/${lessonId}-retenir-all`
- This "read all" button lets students hear every key point in one tap

### 5. A Retenir per-node speaker buttons (line 144 area in `BranchNode`)
Instead of modifying `BranchNode` generically, add the speaker button at the `MindMapSectionCluster` level:
- When `isRetenir`, wrap each `BranchNode` row in a flex container with the speaker button appended
- storageKey: `studygram/${lessonId}-retenir-${nodeIndex}`
- text: `node.text`
- Speaker button is `flex-shrink-0`, node content is `flex-1 min-w-0`

Non-retenir sections render exactly as before -- no changes to their layout.

---

## Visual Layout (A Retenir section only)

```text
+--------------------------------------------------+
| [Star] [emoji] A Retenir          [Read All 🔊]  |  <-- header
|--------------------------------------------------+
|   |---- Node 1 text here...              [🔊]    |
|   |---- Node 2 text here...              [🔊]    |
|   '---- Node 3 text here...              [🔊]    |
+--------------------------------------------------+
```

Other sections (Explicatif, Approfondissement, Resume Visuel) remain unchanged.

---

## Implementation Detail

The cleanest approach: modify `MindMapSectionCluster` to handle A Retenir specially rather than adding voice logic into `BranchNode` (which serves all section types). The branching node tree block (lines 172-181) gets a conditional wrapper:

- For `a_retenir`: each node renders inside a flex row with `BranchNode` as `flex-1` and `JudeSpeakerButton` as a small aligned button
- For all other types: unchanged `BranchNode` rendering

This keeps `BranchNode` and `MindMapNode` completely untouched.

---

## Safety Verification

| Check | Status |
|---|---|
| Existing functionality preserved? | Yes -- only additive; non-retenir sections untouched |
| Provider stack affected? | No |
| New dependencies? | None -- lucide icons already in bundle, useJudeVoice from Phase 1 |
| Cold start risk? | No -- autoPreload fires in background |
| 3G compatible? | Yes -- pre-generated mp3 via CDN |
| Backward compatible? | Yes -- purely additive UI on one section type |
| Edge cases? | Error shows disabled icon; empty text skipped |
| lessonId already available? | Yes -- LessonStudygramTabProps already includes lessonId (line 14) |

## Files Summary

| File | Action |
|---|---|
| `src/features/matieres/components/tabs/LessonStudygramTab.tsx` | Modify |

No other files touched. No edge function changes. No DB changes.

