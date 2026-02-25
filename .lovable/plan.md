

# Phase 5: Onboarding Voice Synchronized with Typewriter

## Overview
Two files modified: `SimpleTypewriter.tsx` and `JudeWelcomePopup.tsx`. Jude's voice plays in sync with the typewriter — typing speed is dynamically calculated from audio duration so text finishes as audio ends.

---

## File 1: `src/components/visitor/SimpleTypewriter.tsx`

### New prop: `onStart`
Add an optional `onStart` callback that fires once when the first character begins typing. This lets the parent trigger audio playback at the exact moment text starts appearing.

```typescript
interface SimpleTypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onStart?: () => void;  // NEW -- fires when typing begins
  className?: string;
  enableSound?: boolean;
  soundVolume?: number;
  skipToEnd?: boolean;
}
```

### Implementation
Add a `hasStartedRef` (useRef) to track whether `onStart` has fired. In the main typing useEffect, call `onStart?.()` on the first character render (when `displayedText.length === 0` and we're about to type the first char). The ref prevents double-firing.

No other changes to SimpleTypewriter -- `speed` prop already controls typing delay, so the parent just passes a different `speed` value per message.

---

## File 2: `src/components/visitor/JudeWelcomePopup.tsx`

### New imports
- `import { useRef } from 'react'` (add to existing React import)
- `import { useSessionAuth } from '@/contexts/SessionAuthContext'`
- `import { useJudeAudio } from '@/contexts/JudeAudioContext'`
- `import { supabase } from '@/integrations/supabase/client'`

### Constants
Define the four messages and their indices at module level for stable storage keys:

```typescript
const WELCOME_MESSAGES = [
  "Salut visiteur! 👋",
  "Moi c'est Jude, ton assistant virtuel!",
  "Je vais te faire découvrir la plateforme...",
  "Mais d'abord, laisse-moi trouver une bonne musique 🎵",
] as const;
```

### Voice sync state
Inside the component, add:

```typescript
const { isAuthenticated } = useSessionAuth();
const { speak, stop } = useJudeAudio();

// Per-message audio state
const audioUrlsRef = useRef<(string | null)[]>([null, null, null, null]);
const audioDurationsRef = useRef<number[]>([0, 0, 0, 0]);
```

### Pre-fetch all four messages on open (authenticated only)
When `isOpen` becomes true AND user is authenticated, fire four parallel fetches:

```typescript
useEffect(() => {
  if (!isOpen || !isAuthenticated) return;
  const isMuted = localStorage.getItem('jude-voice-muted') === 'true';
  if (isMuted) return;

  WELCOME_MESSAGES.forEach((msg, i) => {
    supabase.functions.invoke('generate-jude-voice', {
      body: { text: msg, storageKey: `onboarding/welcome-${i}`, context: 'onboarding' }
    }).then(({ data }) => {
      if (data?.url) {
        audioUrlsRef.current[i] = data.url;
        // Pre-measure duration for typing speed calc
        const audio = new Audio(data.url);
        audio.addEventListener('loadedmetadata', () => {
          audioDurationsRef.current[i] = audio.duration;
        });
        audio.load();
      }
    }).catch(() => { /* silent fail -- typewriter uses default speed */ });
  });
}, [isOpen, isAuthenticated]);
```

### Dynamic typing speed calculator

```typescript
const getTypingSpeed = (messageIndex: number, messageLength: number): number => {
  const duration = audioDurationsRef.current[messageIndex];
  if (!duration || duration <= 0) return defaultSpeeds[messageIndex]; // fallback to current speeds
  const durationMs = duration * 1000;
  // 90% of duration so text finishes slightly before audio ends
  return Math.max(30, Math.floor((durationMs * 0.9) / messageLength));
};
```

Where `defaultSpeeds = [100, 90, 80, 70]` matches the current hardcoded values.

### Play audio on typewriter start
Each SimpleTypewriter gets an `onStart` callback:

```typescript
const handleMessageStart = (index: number) => {
  const isMuted = localStorage.getItem('jude-voice-muted') === 'true';
  if (isMuted || !audioUrlsRef.current[index]) return;
  speak(audioUrlsRef.current[index]!);
};
```

### Updated SimpleTypewriter usage
Each message's `speed` prop becomes dynamic, and adds `onStart`:

```tsx
<SimpleTypewriter
  text="Salut visiteur! 👋"
  speed={getTypingSpeed(0, WELCOME_MESSAGES[0].length)}
  onComplete={handleGreetingComplete}
  onStart={() => handleMessageStart(0)}
  enableSound={false}  // Disable click sounds when voice is playing
  soundVolume={0.06}
/>
```

Note: `enableSound` becomes `false` when voice is available (audio URL exists). If no audio (visitor/muted), keep `enableSound={true}` with original speed. This prevents the typing clicks from competing with Jude's voice.

Computed like:
```typescript
const hasVoice = (i: number) => !!audioUrlsRef.current[i] && !isMuted;
```

### Visitor mode handling
- `useSessionAuth().isAuthenticated` is `false` for visitors
- The pre-fetch useEffect skips entirely for visitors
- All `audioUrlsRef` values remain `null`
- `getTypingSpeed` returns default speeds (100/90/80/70)
- `handleMessageStart` is a no-op (no URL)
- `enableSound` stays `true` (typing clicks continue as today)
- Result: visitors get the exact same experience as currently -- no regression

### Cleanup on close
When popup closes (or unmounts), call `stop()` to halt any playing audio:

```typescript
useEffect(() => {
  if (!isOpen) {
    stop();
  }
}, [isOpen, stop]);
```

---

## Visual Flow

```text
[Popup opens]
    |
    v  (authenticated? fetch all 4 audio URLs in parallel)
    |
[Greeting starts typing]
    |-- onStart fires --> speak(audioUrls[0])
    |-- speed = audioDuration[0] / charCount
    |
[Greeting complete] --> 600ms delay
    |
[Intro starts typing]
    |-- onStart fires --> speak(audioUrls[1])
    |-- speed = audioDuration[1] / charCount
    |
[Intro complete] --> 500ms delay
    |
[Walkthrough + Searching follow same pattern]
    |
[Done]
```

---

## Safety Verification

| Check | Status |
|---|---|
| Existing typewriter behavior preserved? | Yes -- default speeds unchanged when no audio |
| Visitor mode regression? | None -- audio skipped, original UX intact |
| Mute respected? | Yes -- checked before fetch and before play |
| 3G safe? | Yes -- parallel pre-fetch, graceful fallback on failure |
| Provider stack affected? | No |
| New dependencies? | None |
| Bundle impact? | Negligible -- only new imports already in bundle |
| SimpleTypewriter backward compatible? | Yes -- onStart is optional, speed prop already existed |
| Cold start risk? | Mitigated -- pre-fetch fires on popup open, not page load |
| Audio ducking? | Handled by JudeAudioContext (already ducks music player) |

## Files Summary

| File | Action |
|---|---|
| `src/components/visitor/SimpleTypewriter.tsx` | Modify -- add `onStart` prop |
| `src/components/visitor/JudeWelcomePopup.tsx` | Modify -- add voice sync logic |

No other files touched. No edge function changes. No DB changes.

