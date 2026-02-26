

# Fix Stale Closure Bug in OnboardingQuiz.tsx and AvatarGenerationStep.tsx

Same pattern as the FirstTimeUserTour fix — stabilize `speak`/`stop` via refs, read mute from localStorage inside effects, remove all `eslint-disable` comments.

## Files Modified
- `src/components/firsttime/OnboardingQuiz.tsx`
- `src/components/firsttime/AvatarGenerationStep.tsx`

---

## OnboardingQuiz.tsx — 7 surgical edits

### 1. Import — add `useMemo` (unused `useCallback` stays for other callbacks)
Line 11: add `useRef` is already imported. No import change needed (useRef already present).

### 2. Replace speak/stop + isMuted (lines 65-67)
Remove the stale `isMuted` const. Add `speakRef`/`stopRef` with sync effects:
```typescript
const { speak, stop } = useJudeAudio();
// Ref-stable speak/stop to avoid stale closures in voice useEffects
const speakRef = useRef(speak);
const stopRef = useRef(stop);
useEffect(() => { speakRef.current = speak; }, [speak]);
useEffect(() => { stopRef.current = stop; }, [stop]);
```

### 3. Replace fetchAndSpeak (lines 354-369)
Remove `useCallback` wrapper. Read mute from localStorage. Use refs:
```typescript
const fetchAndSpeak = async (text: string, storageKey: string) => {
  const isMutedNow = localStorage.getItem('jude-voice-muted') === 'true';
  if (isMutedNow) return;
  try {
    const { data } = await supabase.functions.invoke('generate-jude-voice', {
      body: { text, storageKey, context: 'onboarding' }
    });
    if (data?.url) {
      stopRef.current();
      speakRef.current(data.url);
    }
  } catch {}
};
```

### 4. currentStep effect (lines 371-391)
Remove `isMuted` guard (fetchAndSpeak handles it). Remove `eslint-disable`. Deps: `[currentStep, firstName]`.

### 5. showReaction effect (lines 394-399)
Remove `isMuted` guard. Remove `eslint-disable`. Deps: `[showReaction, reactionText, currentStep, firstName]`.

### 6. isOutro effect (lines 402-408)
Remove `isMuted` guard. Remove `eslint-disable`. Deps: `[isOutro]`.

### 7. Unmount cleanup (line 411)
Change `stop` to `stopRef.current` with empty deps:
```typescript
useEffect(() => () => stopRef.current(), []);
```

---

## AvatarGenerationStep.tsx — 4 surgical edits

### 1. Import (line 1)
Add `useRef` to the import.

### 2. Replace speak/stop + isMuted (lines 19-21)
Same pattern — add `speakRef`/`stopRef` with sync effects, remove stale `isMuted` const.

### 3. Avatar prompt effect (lines 46-58)
Read mute from localStorage inside effect. Use `speakRef.current` and `stopRef.current`. Remove `eslint-disable`.

### 4. Celebration effect (lines 61-72)
Read mute from localStorage inside effect. Use `speakRef.current`. Remove `eslint-disable`. Deps: `[celebrating]`.

---

## Also update SimpleTypewriter `enableSound` prop in AvatarGenerationStep
Line 161 currently passes `enableSound={isMuted}`. Since `isMuted` const is removed, read it inline:
```typescript
enableSound={typeof window !== 'undefined' && localStorage.getItem('jude-voice-muted') === 'true'}
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No — same pattern proven in FirstTimeUserTour |
| Provider stack affected? | No |
| New dependencies? | No |
| Bundle size impact? | None |
| 3G compatible? | Yes — no new network calls |
| Hook count changes? | +4 hooks in OnboardingQuiz (2 refs + 2 sync effects), +4 in AvatarGenerationStep — all unconditional, before early returns |
| eslint-disable comments removed? | All 4 removed (3 in Quiz, 1 in Avatar) |

