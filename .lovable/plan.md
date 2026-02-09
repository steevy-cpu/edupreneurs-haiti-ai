

# Music Player Feature Enhancements

## New Features

### 1. Volume Control (Slider)
Add a volume slider to the expanded player so users can adjust volume up/down. The YouTube IFrame API exposes `setVolume(0-100)` and `getVolume()` methods, so this integrates cleanly.

- Add `volume` state and `setVolume` function to `MusicPlayerContext`
- Render a horizontal slider in the expanded player controls row
- Persist volume preference in `localStorage` so it's remembered across sessions
- Show a mute/unmute toggle icon next to the slider

### 2. Previous Track Button
Currently there's only "Next". Add a "Previous" button so users can go back to the last track.

- Add `prevTrack` to `MusicPlayerContext`
- Render a `SkipBack` icon button in the controls

### 3. Shuffle Toggle
Let users randomize the playlist order instead of sequential playback.

- Add `shuffle` state and `toggleShuffle` to context
- When shuffle is on, `nextTrack` picks a random index instead of `+1`
- Show a shuffle icon button in the controls

### 4. Repeat/Loop Toggle
Allow looping the current track or the entire playlist.

- Add `repeatMode` (`off` | `one` | `all`) to context
- When `one`: replay same track on end. When `all`: wrap around (already default). When `off`: stop at end of playlist
- Show a repeat icon button with visual indicator for mode

---

## Technical Details

### MusicPlayerContext Changes

```typescript
// New state
const [volume, setVolumeState] = useState(() => {
  const saved = localStorage.getItem('music-player-volume');
  return saved ? parseInt(saved) : 70;
});
const [isMuted, setIsMuted] = useState(false);
const [shuffle, setShuffle] = useState(false);
const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('all');

// Volume handler
const setVolume = useCallback((vol: number) => {
  setVolumeState(vol);
  localStorage.setItem('music-player-volume', String(vol));
  if (playerRef.current?.setVolume) {
    playerRef.current.setVolume(vol);
  }
}, []);

// Apply volume when player becomes ready
// In onReady callback: event.target.setVolume(volume);

// Mute toggle
const toggleMute = useCallback(() => {
  if (playerRef.current) {
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
    }
  }
  setIsMuted(prev => !prev);
}, [isMuted, volume]);

// Previous track
const prevTrack = useCallback(() => {
  const currentIndex = currentTrackIndexRef.current;
  const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  playTrack(prevIndex);
}, [tracks.length, playTrack]);

// Shuffle-aware nextTrack
const nextTrack = useCallback(() => {
  const currentIndex = currentTrackIndexRef.current;
  if (repeatMode === 'one') {
    playTrack(currentIndex); // replay same
    return;
  }
  let nextIndex;
  if (shuffle) {
    do { nextIndex = Math.floor(Math.random() * tracks.length); }
    while (nextIndex === currentIndex && tracks.length > 1);
  } else {
    nextIndex = (currentIndex + 1) % tracks.length;
  }
  if (repeatMode === 'off' && nextIndex === 0 && !shuffle) {
    stopMusic(); // end of playlist
    return;
  }
  playTrack(nextIndex);
}, [tracks.length, playTrack, shuffle, repeatMode, stopMusic]);
```

### GlobalMusicPlayer UI Changes

```tsx
{/* Controls row - add SkipBack, volume slider, shuffle, repeat */}
<div className="flex items-center justify-center gap-2">
  <Button variant="ghost" size="icon" onClick={toggleShuffle}>
    <Shuffle className={cn("w-4 h-4", shuffle && "text-primary")} />
  </Button>
  <Button variant="outline" size="icon" onClick={prevTrack}>
    <SkipBack className="w-4 h-4" />
  </Button>
  <Button variant="outline" size="icon" onClick={playPause}>
    {isPlaying ? <Pause /> : <Play />}
  </Button>
  <Button variant="outline" size="icon" onClick={nextTrack}>
    <SkipForward className="w-4 h-4" />
  </Button>
  <Button variant="ghost" size="icon" onClick={toggleRepeat}>
    <Repeat className={cn("w-4 h-4", repeatMode !== 'off' && "text-primary")} />
    {repeatMode === 'one' && <span className="absolute text-[8px]">1</span>}
  </Button>
</div>

{/* Volume row */}
<div className="flex items-center gap-2 mt-2 px-1">
  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMute}>
    {isMuted || volume === 0 ? <VolumeX /> : volume < 50 ? <Volume1 /> : <Volume2 />}
  </Button>
  <Slider value={[isMuted ? 0 : volume]} max={100} step={1}
    onValueChange={([v]) => { setVolume(v); if (v > 0) setIsMuted(false); }}
    className="flex-1"
  />
</div>
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/contexts/MusicPlayerContext.tsx` | Add volume, mute, prevTrack, shuffle, repeatMode state + handlers |
| `src/components/GlobalMusicPlayer.tsx` | Add volume slider, prev/shuffle/repeat buttons to expanded UI |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- all new features are additive |
| Works with existing data? | Yes -- no DB changes |
| 3G performance impact? | None -- no new network requests |
| Backward compatible? | Yes -- safe defaults match current behavior (volume 70, repeat all, shuffle off) |
| Edge cases? | Mute state synced with slider; volume persisted in localStorage |

