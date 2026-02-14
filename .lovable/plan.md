

# Fix Visitor Mode Music Not Playing

## Root Cause

Two issues prevent music from playing in visitor mode:

### Issue 1: Database blocks visitors
The `study_music_tracks` table has an RLS policy that only allows `authenticated` users to read tracks. Visitors use the anonymous role, so the database returns zero rows.

### Issue 2: Tracks never fetched for visitors
In `MusicPlayerContext.tsx`, the playlist fetch only triggers when `isAuthenticated` is `true`. Since visitors are not authenticated, `tracks` stays as an empty array. When `JudeWelcomePopup` calls `playTrack()`, there is nothing to play.

## Fix

### Change 1: Add RLS policy for anonymous read access

Add a new policy allowing the `anon` role to read active tracks from `study_music_tracks`. This is safe because the playlist is public content (YouTube IDs and titles) with no sensitive data. Write policies remain restricted to founders.

```sql
CREATE POLICY "Anyone can read active tracks"
ON public.study_music_tracks FOR SELECT
TO anon
USING (is_active = true);
```

### Change 2: Fetch tracks for visitors too

In `MusicPlayerContext.tsx`, update the initialization effect to also fetch tracks when the user is in visitor mode. Import `useVisitor` and trigger `fetchPlaylistTracks()` when either `isAuthenticated` or `isVisitor` is true.

```typescript
const { isVisitor } = useVisitor();

useEffect(() => {
  if (isAuthenticated || isVisitor) {
    fetchPlaylistTracks();
  }
  // ...
}, [isAuthenticated, isVisitor]);
```

This ensures the tracks array is populated before Jude's welcome popup tries to play music.

## Files Changed

| File | Change | Risk |
|---|---|---|
| Database migration | Add anon SELECT policy for active tracks | None -- read-only public content |
| `src/contexts/MusicPlayerContext.tsx` | Fetch tracks when visitor mode is active | Low -- additive condition |

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- authenticated flow unchanged |
| Works with existing data? | Yes -- same table, same query |
| 3G optimized? | Yes -- single small SELECT, same as before |
| Security concern? | None -- YouTube IDs and titles are not sensitive; write access stays founder-only |
| Backward compatible? | Yes -- only adds a new code path for visitors |

