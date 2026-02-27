

# Fix Music Ducking for Visitor Audio in VisitorTour and JudeWelcomePopup

## Problem
When Jude's voice plays via direct `new Audio()` calls in visitor mode, background music stays at full volume. The `JudeAudioContext` (which handles ducking) is only used for authenticated users.

## Scope
- **VisitorTour.tsx** -- audio play block at L268-273, mute toggle at L289-299, cleanup at L279-286
- **JudeWelcomePopup.tsx** -- visitor audio path at L146-157, cleanup at L114-122
- No other files modified

---

## Fix 1: VisitorTour.tsx

### Changes
1. **Add import**: `useMusicPlayer` from `@/contexts/MusicPlayerContext`
2. **Add hook call**: `const { setVolume, volume } = useMusicPlayer()` (after existing hooks, before early returns at L302)
3. **Add ref**: `const preDuckVolumeRef = useRef(100)` for saving pre-duck volume
4. **Update audio play block (L268-273)**:
   - Set `audio.volume = 0.90`
   - Save `volume` to `preDuckVolumeRef.current`
   - Call `setVolume(10)` to duck
   - Add `audio.onended` handler that restores via `setVolume(preDuckVolumeRef.current)`
   - Restore on `.play().catch()` error path
5. **Update toggleMute (L294-296)**: When muting and pausing audio, also restore volume via `setVolume(preDuckVolumeRef.current)`
6. **Update cleanup useEffect (L279-286)**: On unmount, also call `setVolume(preDuckVolumeRef.current)` to ensure restore

---

## Fix 2: JudeWelcomePopup.tsx (visitor path only)

### Changes
1. **Expand existing destructure** (L44): Change `{ tracks, playTrack }` to `{ tracks, playTrack, setVolume, volume }`
2. **Add ref**: `const preDuckVolumeRef = useRef(100)` near visitorAudioRef (L54)
3. **Update visitor audio play block (L146-157)**:
   - Set `audio.volume = 0.90`
   - Save `volume` to `preDuckVolumeRef.current`, call `setVolume(10)` before play
   - Add `audio.onended` to restore via `setVolume(preDuckVolumeRef.current)`
   - Restore on `.play().catch()` error path
4. **Update visitor cleanup (L114-122)**: When stopping visitor audio on popup close, also restore volume via `setVolume(preDuckVolumeRef.current)`

The authenticated `speak()` path (L141-144) is NOT touched -- it already uses `JudeAudioContext` which ducks correctly.

---

## Safety Verification

| Check | Status |
|-------|--------|
| Existing RLS / DB functions affected? | No -- frontend-only change |
| Provider stack order impacted? | No -- useMusicPlayer already available |
| New dependencies added? | None |
| 3G performance impact? | None -- no new network calls |
| Backward compatibility? | Yes -- additive behavior only |
| Edge cases (mute, unmount, error)? | All restore volume |

