

# Phase 6: Visitor Tour Voice Narration

## Overview
One file modified: `src/components/visitor/VisitorTour.tsx`. Adds infrastructure for pre-generated audio playback on each tour step, with a mute toggle. No edge function calls during the tour -- visitors are unauthenticated, so audio is served directly from Storage CDN URLs populated later via an admin operation.

---

## Audit Results

- **12 tour steps** (indices 0-11)
- Step changes detected via `tourStep` state from `useVisitor()` context
- Descriptions to be narrated (one per step):
  0. "Suivez votre progression, vos series de jours d'etude et vos objectifs hebdomadaires..."
  1. "Etudiez avec de la musique ! Cliquez sur ce bouton flottant..."
  2. "Points Gold, lecons completees, score et heures d'etude en temps reel..."
  3. "Accedez aux cours de maths, francais, sciences et plus..."
  4. "Connectez-vous avec d'autres etudiants, partagez vos succes..."
  5. "Voyez les meilleurs apprenants et leur progression..."
  6. "Debloquez des badges en completant des lecons et quiz..."
  7. "Explorez la musique, les arts, les echecs et la litterature..."
  8. "Choisissez ce qui vous passionne -- musique, art, echecs..."
  9. "Jouez aux echecs contre Jude, notre coach IA !..."
  10. "Discutez en prive avec d'autres etudiants..."
  11. "Rejoignez une communaute d'eleves haitiens passionnes..."

---

## Changes to `src/components/visitor/VisitorTour.tsx`

### New imports (line 5)
Add `Volume2`, `VolumeX` to the existing lucide-react import. Add `useRef` to the React import.

### New constant: `TOUR_STEP_AUDIO_URLS` (after `tourSteps` array, ~line 93)
```typescript
// Pre-generated audio URLs for each tour step.
// Populated via admin operation -- null entries mean no audio for that step.
const TOUR_STEP_AUDIO_URLS: (string | null)[] = [
  null, // step 0: Tableau de bord
  null, // step 1: Musique d'etude
  null, // step 2: Progression
  null, // step 3: Matieres
  null, // step 4: Fil d'actualite
  null, // step 5: Classement
  null, // step 6: Defis et recompenses
  null, // step 7: Decouverte des passions
  null, // step 8: Apprentissage par la passion
  null, // step 9: Jeux educatifs
  null, // step 10: Messages et communaute
  null, // step 11: Rejoignez la famille
];
```

### New state and ref (inside component, after existing useState declarations)
```typescript
const [isMuted, setIsMuted] = useState(() =>
  localStorage.getItem('jude-voice-muted') === 'true'
);
const audioRef = useRef<HTMLAudioElement | null>(null);
```

### Audio playback on step change (new useEffect, after the tracking useEffect at line 224)
```typescript
// Play pre-generated audio when tour step changes
useEffect(() => {
  if (!isStable || !tourActive || tourCompleted) return;

  // Stop previous step audio
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
  }

  if (isMuted) return;

  const url = TOUR_STEP_AUDIO_URLS[tourStep];
  if (!url) return;

  // Small delay to let page navigation settle before playing
  const timer = setTimeout(() => {
    const audio = new Audio(url);
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, 600);

  return () => clearTimeout(timer);
}, [tourStep, isStable, tourActive, tourCompleted, isMuted]);
```

### Cleanup on tour end/unmount (new useEffect)
```typescript
// Stop audio when tour closes or component unmounts
useEffect(() => {
  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, []);
```

### Mute toggle handler (before early returns)
```typescript
const toggleMute = () => {
  setIsMuted(prev => {
    const next = !prev;
    localStorage.setItem('jude-voice-muted', String(next));
    // Stop audio immediately when muting
    if (next && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    return next;
  });
};
```

### Mute toggle button in the UI
Add a small speaker button in the progress bar header area (line 295-297), next to the step counter:

```tsx
<div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
  <span>Etape {tourStep + 1} sur {tourSteps.length}</span>
  <div className="flex items-center gap-2">
    <button
      onClick={toggleMute}
      className="p-1 rounded hover:bg-muted transition-colors"
      aria-label={isMuted ? "Activer le son" : "Couper le son"}
    >
      {isMuted ? (
        <VolumeX className="w-3.5 h-3.5" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
    </button>
    <span>{Math.round(progress)}%</span>
  </div>
</div>
```

---

## Visual Flow

```text
[Tour step changes]
    |
    v
[Stop previous audio]
    |
    v  (check isMuted + URL exists)
    |
[Play TOUR_STEP_AUDIO_URLS[tourStep]] after 600ms settle delay
    |
[User taps mute] --> audio.pause() immediately
```

---

## Why No Edge Function Calls

Visitors have no JWT. Instead of adding a public edge function (security risk), all 12 audio clips will be pre-generated once as an admin operation and stored permanently in the `lesson-audio` Storage bucket with public CDN URLs. The `TOUR_STEP_AUDIO_URLS` array is populated with those URLs after generation -- a separate admin step outside this implementation.

---

## Safety Verification

| Check | Status |
|---|---|
| Existing tour behavior preserved? | Yes -- audio is purely additive |
| Visitor authentication required? | No -- uses public Storage CDN URLs |
| Mute toggle shared with auth system? | Yes -- same `jude-voice-muted` localStorage key |
| Previous audio stopped on step change? | Yes -- `audioRef.current.pause()` before new play |
| Audio stopped on unmount/tour end? | Yes -- cleanup useEffect |
| 3G safe? | Yes -- small pre-generated clips, no fetch overhead |
| Provider stack affected? | No |
| New dependencies? | None -- Volume2/VolumeX already in lucide-react |
| All hooks before early returns? | Yes -- new hooks placed before line 230 |
| Bundle impact? | Negligible |

## Files Summary

| File | Action |
|---|---|
| `src/components/visitor/VisitorTour.tsx` | Modify -- add audio playback + mute toggle |

No other files touched. No edge function changes. No DB changes.

