

# Jude Voice Feedback for Quiz and Activities

## Overview
Pre-generate audio clips for all 20 Jude feedback messages using ElevenLabs with a young male voice, cache them in storage, and auto-play the matching clip when JudeFeedback renders.

## Voice Selection

**"Eric" (cjVigY5qzO86Huf0OWal)** -- a younger male voice that fits Jude's character as a boy. Emotion-matched settings:

- **Correct (happy/excited)**: stability 0.35, style 0.6, speed 1.05
- **Incorrect (gentle/encouraging)**: stability 0.55, style 0.25, speed 0.95

## Approach: Pre-generated Audio (NOT real-time TTS)

1. **One-time generation**: Edge function generates all 20 feedback clips once, stores in `lesson-audio` bucket
2. **Cached forever**: Served from CDN -- no API calls during quiz
3. **Instant playback**: Audio plays from cache when feedback appears
4. **Mute toggle**: Users can disable voice via speaker icon, preference saved in localStorage

## Changes

### 1. New Edge Function: `generate-jude-feedback-audio`
**File: `supabase/functions/generate-jude-feedback-audio/index.ts`**

- Iterates over all 20 messages (10 correct, 10 incorrect)
- Uses "Eric" voice with emotion-appropriate settings
- Uploads to `lesson-audio/jude-feedback/correct-0.mp3` through `correct-9.mp3` and `incorrect-0.mp3` through `incorrect-9.mp3`
- One-time admin action, not called by students

### 2. New Utility: `src/utils/judeFeedbackAudio.ts`
Maps message index to public storage URL:
```
getJudeFeedbackAudioUrl(type: 'correct' | 'incorrect', index: number) => string
```

### 3. Update `src/components/jude/JudeFeedback.tsx`
- Add audio index tracking to each message
- Auto-play matching audio clip when feedback renders
- Add mute toggle icon (stored in localStorage as `jude-voice-muted`)
- Graceful fallback if audio fails or is blocked by browser

### 4. Update `src/features/matieres/renderers/QuizRenderer.tsx`
- Import and call `useSoundEffects` for chime/buzzer on answer submit (matching activities behavior)

## File Changes

| File | Change |
|------|--------|
| `supabase/functions/generate-jude-feedback-audio/index.ts` | NEW -- One-time generation of 20 audio clips with Eric voice |
| `src/utils/judeFeedbackAudio.ts` | NEW -- URL mapping for feedback audio files |
| `src/components/jude/JudeFeedback.tsx` | Add audio playback, mute toggle |
| `src/features/matieres/renderers/QuizRenderer.tsx` | Add sound effects on answer submit |

## UX Flow

```text
User submits answer in Quiz
    |
    v
[Chime/buzzer plays] (useSoundEffects)
    |
    v
[JudeFeedback renders + Jude's voice plays the message]
    |
    v
[Speaker icon available to mute]
```

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- audio is additive |
| 3G optimized? | Yes -- clips are 2-5KB each, cached by CDN |
| Backward compatible? | Yes -- works without audio if not generated |
| Cost impact? | 20 one-time API calls, zero ongoing cost |

