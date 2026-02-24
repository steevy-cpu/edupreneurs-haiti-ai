

# Music Player Optimization — 6 Bug Fixes

## Fix 1: Allow YouTube API on 3G

**File:** `src/contexts/MusicPlayerContext.tsx`

- **Line 86-88:** Remove the `if (!isSlowConnection())` guard around `loadYouTubeAPI()` — call it unconditionally
- YouTube handles adaptive streaming internally; blocking the API entirely on 3G causes silent failure with no recovery path
- The `isSlowConnection()` helper remains available for UI-level decisions (e.g. thumbnail quality in GlobalMusicPlayer)

## Fix 2: Max retries on initPlayer()

**File:** `src/contexts/MusicPlayerContext.tsx`

- Add constants: `const MAX_INIT_RETRIES = 10` and `const INIT_RETRY_INTERVAL = 500`
- Add ref: `const initRetryCountRef = useRef(0)`
- **Line 222:** Replace `setTimeout(initialize, 100)` with retry-limited logic:
  - Increment `initRetryCountRef.current`
  - If exceeds `MAX_INIT_RETRIES`, stop and call `toast.error("La musique n'est pas disponible pour le moment. Reessayez plus tard.")`
  - Otherwise `setTimeout(initialize, INIT_RETRY_INTERVAL)`
- Reset `initRetryCountRef.current = 0` on successful init (inside `onReady` callback, ~line 192)
- Import `toast` from `sonner` at top of file

## Fix 3: Fix playPause() stale closure

**File:** `src/contexts/MusicPlayerContext.tsx`

- Add ref: `const isPlayingRef = useRef(isPlaying)`
- Add sync effect: `useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])`
- **Lines 249-268:** Convert `playPause` from plain function to `useCallback` with `[]` deps
- Inside, read `isPlayingRef.current` instead of `isPlaying`
- Also read `playerRef` and `playerReady` from refs (playerRef is already a ref; add `playerReadyRef` synced via useEffect)

## Fix 4: Debounce play/pause button

**File:** `src/components/GlobalMusicPlayer.tsx`

- Add ref: `const lastPlayPauseRef = useRef(0)`
- **Line 373:** Wrap the play/pause `onClick` handler:
  ```
  onClick={(e) => {
    e.stopPropagation();
    if (Date.now() - lastPlayPauseRef.current < 300) return;
    lastPlayPauseRef.current = Date.now();
    playPause();
  }}
  ```
- Zero dependencies added — uses native `Date.now()` and a ref

## Fix 5: Increase drag threshold

**File:** `src/components/GlobalMusicPlayer.tsx`

- **Line 52:** Change `const DRAG_THRESHOLD = 8` to `const DRAG_THRESHOLD = 12`
- Reduces false drag detection on mobile without affecting desktop UX

## Fix 6: User-facing error toasts

**File:** `src/contexts/MusicPlayerContext.tsx`

All error paths get visible feedback (import `toast` from `sonner` — already needed for Fix 2):

- **onError handler (~line 208-212):** Add `toast.error("Impossible de lire cette piste. Passage a la suivante...")`  before the `setTimeout` skip
- **initPlayer catch (~line 216-220):** Add `toast.error("Erreur d'initialisation du lecteur.")`
- **playTrack catch (~line 237-241):** Add `toast.error("Erreur de lecture. Reessayez.")`
- **playPause catch (~line 263-267):** Add `toast.error("Erreur de lecture. Reessayez.")`

---

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality affected? | No -- all changes are additive hardening |
| RLS policies changed? | No |
| New dependencies? | No -- `sonner` already installed and used in GlobalMusicPlayer |
| Bundle size impact? | Negligible -- one import added to context file |
| 3G performance | Improved -- YouTube API now loads (it handles adaptive streaming) |
| Provider stack / AppShell | Not affected |
| Backward compatibility | Full |

## Files Modified

1. `src/contexts/MusicPlayerContext.tsx` (Fixes 1, 2, 3, 6)
2. `src/components/GlobalMusicPlayer.tsx` (Fixes 4, 5)

No database changes. No edge function changes. No new files.
