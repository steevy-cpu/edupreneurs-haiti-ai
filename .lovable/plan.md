

# Fix: Next Track Button Not Working

## Problem Identified

The "Next Track" button (skip forward icon) doesn't work properly. Looking at the console logs:

```text
⏭️ Moving to next track: 1 from 0
▶️ Playing track: 1 Musique Relaxante pour Étudier - Concentration
⏳ Player not ready, reinitializing...
```

The `nextTrack` function calculates the correct index, but when it calls `playTrack`, the player goes into "not ready" mode and tries to reinitialize instead of using the existing player.

## Root Cause: Stale Function Reference

The `nextTrack` function is wrapped in `useCallback` with only `[tracks.length]` as a dependency:

```typescript
const nextTrack = useCallback(() => {
  const currentIndex = currentTrackIndexRef.current;
  const nextIndex = (currentIndex + 1) % tracks.length;
  playTrack(nextIndex);  // ← Captures stale playTrack reference!
}, [tracks.length]);  // ← playTrack NOT in dependencies
```

Since `playTrack` is a regular function (not memoized), every render creates a new `playTrack`. But `nextTrack` holds onto the old one because `tracks.length` hasn't changed.

The stale `playTrack` reference may have outdated values for:
- `playerRef.current`
- `playerReady`
- `tracks` array

## Solution

Wrap `playTrack` in `useCallback` and add it to `nextTrack`'s dependency array.

### File: `src/contexts/MusicPlayerContext.tsx`

### Change 1: Wrap `playTrack` in `useCallback` (Lines 212-240)

**Current:**
```typescript
const playTrack = (index: number) => {
  console.log('▶️ Playing track:', index, tracks[index]?.title);
  // ... rest of function
};
```

**Fixed:**
```typescript
const playTrack = useCallback((index: number) => {
  console.log('▶️ Playing track:', index, tracks[index]?.title);
  setCurrentTrackIndex(index);
  
  // Ensure YouTube API is loaded on first play
  if (!youtubeApiLoaded) {
    loadYouTubeAPI();
  }
  
  if (playerRef.current && playerReady && typeof playerRef.current.loadVideoById === 'function') {
    try {
      console.log('🎵 Loading video:', tracks[index].id);
      playerRef.current.loadVideoById(tracks[index].id);
      playerRef.current.playVideo();
      setIsPlaying(true);
    } catch (error) {
      console.error('❌ Error playing track:', error);
      setPlayerReady(false);
      playerRef.current = null;
      initPlayer(index);
    }
  } else {
    console.log('⏳ Player not ready, reinitializing...');
    setPlayerReady(false);
    playerRef.current = null;
    initPlayer(index);
  }
}, [tracks, youtubeApiLoaded, loadYouTubeAPI, playerReady, initPlayer]);
```

### Change 2: Add `playTrack` to `nextTrack` dependencies (Lines 267-273)

**Current:**
```typescript
const nextTrack = useCallback(() => {
  const currentIndex = currentTrackIndexRef.current;
  const nextIndex = (currentIndex + 1) % tracks.length;
  console.log('⏭️ Moving to next track:', nextIndex, 'from', currentIndex);
  playTrack(nextIndex);
}, [tracks.length]);
```

**Fixed:**
```typescript
const nextTrack = useCallback(() => {
  const currentIndex = currentTrackIndexRef.current;
  const nextIndex = (currentIndex + 1) % tracks.length;
  console.log('⏭️ Moving to next track:', nextIndex, 'from', currentIndex);
  playTrack(nextIndex);
}, [tracks.length, playTrack]);
```

## Order of Changes

Since `playTrack` depends on `initPlayer` and `loadYouTubeAPI`, and these are already defined before `playTrack` in the code, the dependency chain is:

```text
loadYouTubeAPI (already useCallback) 
    ↓
initPlayer (regular function - should be useCallback)
    ↓
playTrack (needs useCallback)
    ↓
nextTrack (already useCallback, needs playTrack in deps)
```

### Additional Change: Wrap `initPlayer` in `useCallback` (Lines 127-208)

Since `playTrack` calls `initPlayer`, we need to stabilize it too:

```typescript
const initPlayer = useCallback((trackIndex?: number) => {
  // ... existing implementation
}, [tracks, currentTrackIndex]);
```

## Summary of Changes

| Location | Change |
|----------|--------|
| Lines 127-208 | Wrap `initPlayer` in `useCallback` |
| Lines 212-240 | Wrap `playTrack` in `useCallback` |
| Line 273 | Add `playTrack` to `nextTrack` dependencies |

## Why This Works

1. `initPlayer` is now stable (same reference between renders unless dependencies change)
2. `playTrack` is now stable and always has current values for `playerReady`, `playerRef`, etc.
3. `nextTrack` now gets the fresh `playTrack` when it changes
4. When user clicks next, `playTrack` sees the actual current player state

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - same logic, just stabilized references |
| Works with existing data? | Yes - no data changes |
| 3G optimized? | Yes - no additional network calls |
| Backward compatible? | Yes |
| Circular dependency risk? | No - clear dependency chain |

