

# Add Voice Feedback to Exam Practice FeedbackCard

## What Changes
Add the same Jude voice audio feedback that exists on lesson pages to the exam practice FeedbackCard. When a student gets a correct or incorrect answer, Jude will speak a short audio clip -- just like in the quiz and activities sections.

## How It Works
The voice clips already exist in storage (`lesson-audio/jude-feedback/correct-{n}.mp3` and `incorrect-{n}.mp3`). The lesson pages use the `JudeFeedback` component which auto-plays these clips with a mute toggle. We will add the same behavior to `FeedbackCard`.

## Technical Details

**File:** `src/features/exams/practice/components/FeedbackCard.tsx`

Changes:
1. Import `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback` from React
2. Import `Volume2`, `VolumeX` from lucide-react (add to existing icon imports)
3. Import `getJudeFeedbackAudioUrl` from `@/utils/judeFeedbackAudio`
4. Add mute state from localStorage (same `jude-voice-muted` key -- shared preference with lessons)
5. Pick a random audio index with `useMemo` based on correct/incorrect state
6. Auto-play audio on feedback appearance (only for correct/incorrect states, not hints/revealed)
7. Add mute toggle button next to the status text

```tsx
// New imports
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { getJudeFeedbackAudioUrl } from '@/utils/judeFeedbackAudio';
// Add Volume2, VolumeX to existing lucide import

const MUTE_KEY = 'jude-voice-muted';

export function FeedbackCard({ feedback, state }: FeedbackCardProps) {
  const isCorrect = state === 'correct';
  const isIncorrect = state === 'incorrect';
  // ... existing code ...

  // Voice feedback (only for correct/incorrect)
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem(MUTE_KEY) === 'true'; } catch { return false; }
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioIndex = useMemo(
    () => (isCorrect || isIncorrect) ? Math.floor(Math.random() * 10) : null,
    [isCorrect, isIncorrect]
  );

  const audioUrl = useMemo(
    () => audioIndex !== null
      ? getJudeFeedbackAudioUrl(isCorrect ? 'correct' : 'incorrect', audioIndex)
      : null,
    [isCorrect, audioIndex]
  );

  useEffect(() => {
    if (isMuted || !audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.volume = 0.7;
    audioRef.current = audio;
    audio.play().catch(() => {});
    return () => { audio.pause(); audio.src = ''; audioRef.current = null; };
  }, [audioUrl, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(MUTE_KEY, String(next)); } catch {}
      if (next && audioRef.current) audioRef.current.pause();
      return next;
    });
  }, []);
```

The mute toggle button will be added next to the status line (after the points badge), only visible when state is correct or incorrect:

```tsx
{(isCorrect || isIncorrect) && (
  <button onClick={toggleMute} className="p-1 rounded-md hover:bg-black/5 ...">
    {isMuted ? <VolumeX .../> : <Volume2 .../>}
  </button>
)}
```

## Key Design Decisions
- **Shared mute preference**: Uses the same `jude-voice-muted` localStorage key as lessons, so if a student mutes Jude in lessons, he stays muted in exams too
- **No audio for hints/revealed**: Voice only plays for correct/incorrect -- hints and reveals are silent
- **Same audio pool**: Reuses the 10 correct + 10 incorrect pre-generated clips already in storage

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- additive only |
| Works with existing data? | Yes -- uses existing audio files |
| 3G optimized? | Yes -- small MP3 clips, already cached by browser |
| Backward compatible? | Yes -- shared mute key is consistent |
| Dark mode compatible? | Yes -- uses theme-aware classes |

