

# Add Typing Sound Effect to Jude's Generation Overlay

## Overview
Add a subtle keyboard typing sound that plays while Jude is "working" (generating quiz/activities/translations). The sound will be synthesized using the Web Audio API -- no external files needed, keeping it lightweight for 3G connections.

## Approach
Embed the typing sound logic directly inside the `JudeGeneratingOverlay` component. Since this is the shared overlay used by all three generation screens (Quiz, Activities, and the Activities enhanced loader), adding the sound here means every consumer gets it automatically with zero changes.

The sound will use the Web Audio API (already used elsewhere in the project via `useSoundEffects.ts` and `useMessageSounds.ts`) to create a realistic typing pattern: short noise bursts at random intervals simulating keyboard clicks.

## Changes

**File: `src/components/jude/JudeGeneratingOverlay.tsx`**

1. Add a `useEffect` that starts a typing sound loop when `isVisible` becomes true:
   - Create an `AudioContext`
   - Use a recurring interval (~80-150ms random spacing) that plays short filtered noise bursts (like key clicks)
   - Each "keystroke" is a ~30ms burst of filtered white noise with a quick gain envelope
   - Add random pauses every few keystrokes to simulate natural typing rhythm
   - Clean up the interval and close the `AudioContext` on unmount or when `isVisible` becomes false

2. Keep overall volume low (gain ~0.08) so it's ambient, not distracting

3. No new files, no network requests, no additional bundle size

### Sound Design (Web Audio API)
```
Keystroke = white noise -> bandpass filter (2000-4000Hz) -> gain envelope (30ms attack/decay)
Pattern = random 80-150ms intervals, with occasional 300-500ms pauses
Volume = 0.08 (subtle background)
```

This follows the existing project pattern from `useSoundEffects.ts` and `useMessageSounds.ts` which both use the Web Audio API for synthesized sounds.

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- adds audio only, no UI changes |
| 3G optimized? | Yes -- zero network requests, pure Web Audio API synthesis |
| Works across consumers? | Yes -- sound lives in the shared overlay component |
| Cleanup on unmount? | Yes -- interval cleared and AudioContext closed |
| Browser compatibility? | Yes -- Web Audio API supported in all modern browsers, with webkitAudioContext fallback |
| Doesn't interfere with music player? | No -- uses separate AudioContext at low volume |

