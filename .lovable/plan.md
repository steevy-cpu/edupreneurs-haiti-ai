

# Fix: Music Player Icon Not Showing After Login

## Root Cause

The music player tracks are fetched from the database **before authentication completes**. Here's the sequence:

1. `MusicPlayerProvider` mounts and immediately calls `fetchPlaylistTracks()`
2. At this point, the user session hasn't been restored yet (Supabase `getSession()` is still resolving)
3. The database query runs with **anonymous** credentials
4. The `study_music_tracks` table has RLS enabled -- the SELECT policy only allows **authenticated** users
5. Result: 0 tracks returned, `tracks` stays empty permanently
6. `GlobalMusicPlayer` checks `tracks.length === 0` and returns `null` (no icon)
7. Tracks are never re-fetched after login completes

This is why refreshing the page fixes it -- on refresh, the session is already in localStorage, so `getSession()` resolves immediately and the fetch succeeds.

## Fix (2 changes)

### 1. Re-fetch tracks when authentication state changes

In `MusicPlayerContext.tsx`, watch the auth state and re-fetch tracks when the user becomes authenticated. This ensures tracks load correctly even if the initial fetch happened before auth was ready.

```typescript
// Add import
import { useSessionAuth } from "@/contexts/SessionAuthContext";

// Inside MusicPlayerProvider:
const { isAuthenticated } = useSessionAuth();

// Replace the current useEffect that calls fetchPlaylistTracks()
useEffect(() => {
  // Only fetch when authenticated (RLS requires it)
  if (isAuthenticated) {
    fetchPlaylistTracks();
  }
  if (!isSlowConnection()) {
    loadYouTubeAPI();
  }
}, [isAuthenticated]); // Re-runs when auth state changes
```

### 2. Remove redundant checks from GlobalMusicPlayer

`GlobalMusicPlayer.tsx` has redundant auth and route checks that are already handled by the `FloatingLayer` visibility system. Simplify line 147:

```typescript
// Before (redundant):
if (!isAuthenticated || tracks.length === 0 || isPublicPage) return null;

// After (only check tracks, since FloatingLayer already gates on auth + route):
if (tracks.length === 0) return null;
```

Also remove the unused `isPublicPage` variable and the `useSessionAuth` import from this file since auth gating is handled by `FloatingLayer`.

## Why This Works

- On fresh login: `isAuthenticated` changes from `false` to `true`, triggering the `useEffect` to fetch tracks with a valid session
- On page refresh: Session restores from localStorage, `isAuthenticated` is `true` quickly, fetch succeeds on first try
- On visitor mode: `FloatingLayer` visibility config already allows music for visitors -- but since visitors aren't authenticated, tracks won't load (correct behavior since visitors use a different music trigger)

## Safety

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- adds a re-fetch trigger, doesn't remove any logic |
| Works with existing data? | Yes -- same query, just re-timed |
| 3G optimized? | Yes -- no extra fetches, only re-fetches once on auth change |
| Backward compatible? | Yes -- existing refresh workaround still works |
| Edge cases? | Handles logout (won't re-fetch) and visitor mode (won't fetch) |

