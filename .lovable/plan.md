
# Fix: Auto-Play Next Track When Music Ends

## Problem Analysis

The automatic next track feature is broken due to a **stale closure problem** in the YouTube player callbacks.

### Root Cause
When `initPlayer` creates the YouTube player, it captures `nextTrack` in the `onStateChange` callback. However:

1. `initPlayer` has dependencies `[tracks, currentTrackIndex]` - **missing `nextTrack`**
2. When `nextTrack` updates (because `playTrack` or `tracks.length` changes), the callback inside the player still references the OLD `nextTrack`
3. This old `nextTrack` may have stale references to `playTrack` or stale `tracks.length`

### Evidence
```typescript
// Line 205: initPlayer dependencies are incomplete
}, [tracks, currentTrackIndex]);  // ❌ Missing nextTrack!

// Line 174: But initPlayer uses nextTrack in callback
if (event.data === window.YT.PlayerState.ENDED) {
  nextTrack();  // ← This captures a STALE version of nextTrack
}
```

---

## Solution

Use a **ref** for `nextTrack` to break the circular dependency and always call the latest version.

### Approach
1. Create a `nextTrackRef` that always points to the current `nextTrack` function
2. In `onStateChange` callback, call `nextTrackRef.current()` instead of `nextTrack()` directly
3. This ensures we always call the latest `nextTrack` even if `initPlayer` was created earlier

---

## Implementation

**File**: `src/contexts/MusicPlayerContext.tsx`

### Step 1: Add nextTrackRef after the existing refs (around line 34)

```typescript
const playerRef = useRef<any>(null);
const currentTrackIndexRef = useRef(currentTrackIndex);
const nextTrackRef = useRef<() => void>(() => {});  // NEW: Ref for nextTrack
```

### Step 2: Keep nextTrackRef in sync (after the currentTrackIndex sync effect)

```typescript
// Keep ref in sync for use in callbacks (avoids stale closure)
useEffect(() => {
  currentTrackIndexRef.current = currentTrackIndex;
}, [currentTrackIndex]);

// NEW: Keep nextTrackRef in sync
useEffect(() => {
  nextTrackRef.current = nextTrack;
}, [nextTrack]);
```

### Step 3: Update onStateChange callback to use the ref (line 173-175)

```typescript
// Before
if (event.data === window.YT.PlayerState.ENDED) {
  nextTrack();
}

// After
if (event.data === window.YT.PlayerState.ENDED) {
  nextTrackRef.current();  // Always calls latest nextTrack
}
```

### Step 4: Update onError callback to use the ref (line 188-190)

```typescript
// Before
setTimeout(() => {
  nextTrack();
}, 1000);

// After
setTimeout(() => {
  nextTrackRef.current();  // Always calls latest nextTrack
}, 1000);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/MusicPlayerContext.tsx` | Add `nextTrackRef`, sync effect, and update callbacks |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - same behavior, just using ref |
| Works with existing data? | Yes - no data changes |
| 3G optimized? | Yes - no network changes |
| Backward compatible? | Yes - API unchanged |
| Hook ordering maintained? | Yes - ref and effect at top level |
| Edge cases handled? | Yes - ref initialized with no-op function |

---

## Why This Works

```text
BEFORE (broken):
┌─────────────────────────────────────────────────────┐
│ initPlayer created                                   │
│    └── captures nextTrack@v1                        │
│                                                      │
│ nextTrack updates to @v2 (new playTrack dep)        │
│                                                      │
│ Track ends → onStateChange fires                     │
│    └── calls nextTrack@v1 (STALE!) ❌               │
└─────────────────────────────────────────────────────┘

AFTER (fixed):
┌─────────────────────────────────────────────────────┐
│ initPlayer created                                   │
│    └── captures nextTrackRef (stable reference)     │
│                                                      │
│ nextTrack updates to @v2                            │
│    └── useEffect syncs: nextTrackRef.current = @v2  │
│                                                      │
│ Track ends → onStateChange fires                     │
│    └── calls nextTrackRef.current() → @v2 ✅        │
└─────────────────────────────────────────────────────┘
```

---

## Expected Outcome

After this fix:
1. When a track ends, `onStateChange` receives the `ENDED` event
2. It calls `nextTrackRef.current()` which points to the latest `nextTrack`
3. `nextTrack` calculates the next index using `currentTrackIndexRef.current` (already working)
4. `playTrack` loads the next song
5. Music continues automatically
