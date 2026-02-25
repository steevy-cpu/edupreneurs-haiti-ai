

# Phase 4: Quiz/Activities Feedback Voice (Explanation Narration)

## Overview
Two files modified. Chains explanation voice playback after the existing reaction clip finishes. Never breaks the pre-generated clip behavior.

---

## File 1: `src/components/jude/JudeFeedback.tsx`

### New imports (line 10-12)
- Add `Loader2`, `Square` to the existing lucide-react import
- Add `import { useJudeVoice } from '@/hooks/useJudeVoice'`

### Explanation voice hook (after line 56, inside the component)
```typescript
// Stable key from explanation text hash (first 32 chars of base64)
const explanationKey = explanation
  ? `feedback/${isCorrect ? 'correct' : 'incorrect'}-${btoa(encodeURIComponent(explanation)).slice(0, 32)}`
  : null;

const {
  play: playExplanation,
  stop: stopExplanation,
  isSpeaking: isExplanationSpeaking,
  isLoading: isExplanationLoading
} = useJudeVoice({
  text: explanation || '',
  storageKey: explanationKey || 'feedback/empty',
  context: 'feedback',
  autoPreload: !!explanation,
});
```

### Chain reaction clip to explanation (modify useEffect at lines 70-85)
After creating the Audio object and before playing, attach `onended`:
```typescript
audio.onended = () => {
  // Chain explanation voice after reaction clip finishes
  if (explanation && !isMuted) {
    playExplanation();
  }
};
```
Add `playExplanation` and `explanation` to the dependency array (via ref to avoid re-triggering -- see detail below).

**Important detail**: Since `playExplanation` changes on every render, we store it in a ref (`playExplanationRef`) to avoid re-triggering the useEffect. The `onended` callback reads from the ref.

### Update mute toggle (line 87-99)
When muting, also stop explanation audio:
```typescript
if (next && audioRef.current) {
  audioRef.current.pause();
}
// Also stop explanation voice if playing
if (next) {
  stopExplanation();
}
```

### Update speaker icon (lines 122-133)
Replace the simple Volume2/VolumeX toggle with state-aware icons:
- `isExplanationLoading` -- show `Loader2` with `animate-spin`
- `isExplanationSpeaking` -- show `Square` (stop button); onClick calls `stopExplanation()` instead of `toggleMute`
- `isMuted` -- show `VolumeX`
- Default -- show `Volume2`

The button onClick becomes conditional:
- If explanation is speaking, stop it
- Otherwise, toggle mute

---

## File 2: `src/features/exams/practice/components/FeedbackCard.tsx`

### New imports (line 14)
- Add `Loader2`, `Square` to existing lucide-react import
- Add `import { useJudeVoice } from '@/hooks/useJudeVoice'`

### Explanation text extraction (after line 29)
```typescript
// Extract plain text explanation for voice narration
const explanationText = feedback.response || '';
```

### Explanation voice hook (after audioRef, around line 35)
```typescript
const explanationKey = explanationText
  ? `feedback/exam-${btoa(encodeURIComponent(explanationText)).slice(0, 32)}`
  : null;

const {
  play: playExplanation,
  stop: stopExplanation,
  isSpeaking: isExplanationSpeaking,
  isLoading: isExplanationLoading
} = useJudeVoice({
  text: explanationText,
  storageKey: explanationKey || 'feedback/empty',
  context: 'feedback',
  autoPreload: !!explanationText && (isCorrect || isIncorrect),
});
```

Note: `autoPreload` only activates for correct/incorrect states (same states that play reaction clips).

### Chain reaction clip to explanation (modify useEffect at lines 49-56)
Same pattern as JudeFeedback -- attach `onended` via a ref-based callback:
```typescript
audio.onended = () => {
  if (explanationText && !isMuted) {
    playExplanationRef.current();
  }
};
```

### Update mute toggle (lines 58-65)
Add `stopExplanation()` when muting.

### Update speaker icon (lines 133-145)
Same state-aware icon pattern as JudeFeedback:
- Loading: `Loader2` spinner
- Speaking: `Square` stop button
- Muted: `VolumeX`
- Default: `Volume2`

---

## Ref Pattern for Stable Callbacks

Both files use a `playExplanationRef` to avoid re-triggering the audio useEffect when `playExplanation` changes identity:

```typescript
const playExplanationRef = useRef(playExplanation);
useEffect(() => { playExplanationRef.current = playExplanation; }, [playExplanation]);
```

The `onended` handler reads `playExplanationRef.current()` instead of `playExplanation` directly. This keeps the useEffect dependency array clean (no `playExplanation` in it) and prevents the reaction clip from restarting.

---

## Playback Flow

```text
[Feedback appears]
    |
    v
[Reaction clip plays] -- "Bravo!" / "Pas exactement..."
    |
    v  (onended fires)
[Explanation voice plays] -- reads the explanation text via useJudeVoice
    |
    v
[Done]

At any point: user taps mute --> both stop immediately
```

---

## Safety Verification

| Check | Status |
|---|---|
| Existing reaction clips preserved? | Yes -- onended is additive, play logic unchanged |
| Empty explanation handled? | Yes -- skipped in onended guard and autoPreload |
| Mute during reaction stops explanation? | Yes -- onended checks isMuted before chaining |
| Mute during explanation stops it? | Yes -- stopExplanation called in toggleMute |
| Provider stack affected? | No |
| New dependencies? | None -- Loader2/Square already in lucide-react bundle |
| Cold start risk? | No -- autoPreload fires in background |
| 3G compatible? | Yes -- edge function generates and caches audio |
| useEffect re-trigger risk? | Mitigated via playExplanationRef pattern |

## Files Summary

| File | Action |
|---|---|
| `src/components/jude/JudeFeedback.tsx` | Modify |
| `src/features/exams/practice/components/FeedbackCard.tsx` | Modify |

No other files touched. No edge function changes. No DB changes.

