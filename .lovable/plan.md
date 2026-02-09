

# Music Tracks Manager — Content Editor Tab

## Overview

Move the hardcoded music playlist from `MusicPlayerContext.tsx` into the database, and add a new "Musique" tab in the Content Editor so super users can add/delete tracks without code changes.

## Current State

The 23 study music tracks are **hardcoded** in `src/contexts/MusicPlayerContext.tsx` (lines 97-121). There is no database table for them. Adding or removing a track requires a code deployment.

## Architecture

### 1. Database: `study_music_tracks` table

```text
study_music_tracks
  - id            UUID (PK, default gen_random_uuid())
  - youtube_id    TEXT NOT NULL (the YouTube video ID)
  - title         TEXT NOT NULL
  - thumbnail_url TEXT NOT NULL
  - sort_order    INTEGER NOT NULL DEFAULT 0
  - is_active     BOOLEAN NOT NULL DEFAULT true
  - created_at    TIMESTAMPTZ DEFAULT now()
  - created_by    UUID REFERENCES profiles(user_id)
```

RLS Policy: 
- SELECT: open to all authenticated users (the player needs to fetch tracks)
- INSERT/UPDATE/DELETE: restricted to founders via `is_founder()` check

Migration also seeds the 23 existing hardcoded tracks so nothing breaks.

### 2. Update `MusicPlayerContext.tsx`

Replace the hardcoded `curatedTracks` array in `fetchPlaylistTracks()` with a Supabase query:

```typescript
const { data, error } = await supabase
  .from('study_music_tracks')
  .select('youtube_id, title, thumbnail_url')
  .eq('is_active', true)
  .order('sort_order', { ascending: true });
```

Map `youtube_id` to `id`, `thumbnail_url` to `thumbnail` to keep the existing `PlaylistTrack` interface unchanged. Falls back to empty array on error (matches existing SAFE_DEFAULTS pattern).

### 3. New Component: `StudyMusicManager.tsx`

Located at `src/components/content-editor/StudyMusicManager.tsx`, following the `DailyWordsManager` pattern exactly:

- **Table view**: Shows all tracks with thumbnail, title, YouTube ID, active status, and sort order
- **Add track dialog**: Form with YouTube URL/ID input (auto-extracts ID from URL), title, thumbnail (auto-generated from YouTube ID)
- **Delete**: Confirmation dialog, then hard delete
- **Toggle active**: Switch to enable/disable without deleting
- **Sort order**: Simple numeric input (no drag-and-drop to keep it lightweight for 3G)

### 4. Register Tab in `ContentEditor.tsx`

Add a new tab trigger and content panel:

```text
Tab: "Musique" with Music icon
Value: "study-music"
Component: <StudyMusicManager />
```

Placed after "Bibliotheque" (last position) to avoid disrupting existing tab order.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| Migration SQL | Create | `study_music_tracks` table + RLS + seed 23 tracks |
| `src/components/content-editor/StudyMusicManager.tsx` | Create | CRUD manager following DailyWordsManager pattern |
| `src/pages/ContentEditor.tsx` | Edit | Add tab trigger + tab content + import |
| `src/contexts/MusicPlayerContext.tsx` | Edit | Replace hardcoded array with database query |

## Key Design Decisions

1. **YouTube ID extraction**: The add form accepts both full URLs (`youtube.com/watch?v=xxx`) and raw IDs. A helper function parses either format.
2. **Thumbnail auto-fill**: When a YouTube ID is entered, thumbnail URL auto-populates as `https://i.ytimg.com/vi/{id}/hqdefault.jpg`. Editable if needed.
3. **Fallback**: If the database query fails (network issues on 3G), `MusicPlayerContext` returns an empty array — matching the current safe defaults. No crash.
4. **No migration of user state**: `currentTrackIndex` in `localStorage` may point to a different position after reorder, but the player handles out-of-bounds indices gracefully (wraps around).

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No — seed data preserves all 23 current tracks |
| Backward compatible? | Yes — same PlaylistTrack interface, same context API |
| Works with existing data? | Yes — no existing table to conflict with |
| 3G optimized? | Yes — single lightweight query, no heavy assets |
| Edge cases handled? | Empty DB, failed query, duplicate YouTube IDs |
| Security? | RLS: anyone reads, only founders write |

