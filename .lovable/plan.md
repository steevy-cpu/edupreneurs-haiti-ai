

# Implement Quiz Battle Sound Effects

## Summary
Implement 4 empty stub functions in `src/hooks/useQuizBattleSounds.ts` using pure Web Audio API synthesis. No libraries, no audio files, no changes to existing timer/ticking logic.

## What changes

**File:** `src/hooks/useQuizBattleSounds.ts` — lines 119-123 only

Replace the 4 empty stubs with synthesized sounds using the existing `getAudioContext()` helper. Each function respects the `isMuted` state.

### playCorrect() — Ascending arpeggio (C5-E5-G5)
- Three sine tones at 523Hz, 659Hz, 784Hz
- Each 0.08s, staggered by 0.07s for slight overlap
- Volume 0.3, quick fade per tone

### playIncorrect() — Buzzer (G3-E3)
- Two sawtooth tones at 196Hz, 165Hz
- Each 0.15s, staggered by 0.12s
- Volume 0.25, fade over 0.2s

### playGameStart() — Ready sound (E5-G5)
- Two sine tones at 659Hz, 784Hz
- Each 0.06s, staggered by 0.05s
- Volume 0.25, quick fade

### playGameComplete() — Fanfare (C5-E5-G5-C6)
- Four sine tones at 523Hz, 659Hz, 784Hz, 1047Hz
- First three: 0.12s each, final: 0.2s
- Staggered by 0.1s offsets
- Volume 0.3, gentle fade

## Implementation approach
Each function will:
1. Check `isMuted` — return early if true
2. Get the shared AudioContext via `getAudioContext()`
3. Schedule multiple OscillatorNode + GainNode pairs with precise `ctx.currentTime` offsets
4. Wrap in try/catch matching existing `playTone` pattern

The `playQuestionStart` stub stays empty (no spec provided). All other existing code (timer ticking, mute toggle, lobby stubs) is untouched.

## Call sites confirmed — no wiring needed
- `BattleGameplay.tsx`: calls all 4 functions (lines 69, 127, 129, 151)
- `MultiplayerBattleGameplay.tsx`: calls all 4 functions (lines 184, 242, 309, 311)

## Safety verification

| Check | Status |
|-------|--------|
| No new dependencies added | Correct |
| No audio files loaded | Correct |
| isMuted respected in all 4 functions | Correct |
| Timer ticking logic untouched | Correct |
| Lobby music stubs untouched | Correct |
| Existing call sites already wired | Confirmed |
| Web Audio API only (same pattern as playTone) | Correct |
| Works on 3G (no network requests) | Correct |

