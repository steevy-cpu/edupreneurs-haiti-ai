

# Media Plan A — Fix, Wire, and Harden Media Handling

## Overview

Six targeted fixes to harden media handling in the messaging system. No changes to Community Plans A, B, or C code paths.

---

## Fix 1 — RLS Gap for document_url (CRITICAL)

**Database migration** to replace the existing SELECT policy on `storage.objects` for the `message-media` bucket. The current policy only checks `image_url` and `video_url` — it must also check `document_url`.

```sql
DROP POLICY IF EXISTS "Users can view message media" ON storage.objects;

CREATE POLICY "Users can view message media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-media' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp 
        ON cp.conversation_id = m.conversation_id
      WHERE cp.user_id = auth.uid()
        AND (
          m.image_url LIKE '%' || name || '%'
          OR m.video_url LIKE '%' || name || '%'
          OR m.document_url LIKE '%' || name || '%'
        )
    )
  )
);
```

**Note:** Since the bucket is public, this policy is a defense-in-depth layer. But it must be correct in case the bucket ever becomes private.

---

## Fix 2 — Wire NetworkAwareImage into MessageBubble

**File:** `src/components/community/MessageBubble.tsx` (lines 294-305)

- Import `NetworkAwareImage` from `@/components/feed/NetworkAwareMedia`
- Replace the raw `<img>` tag with `<NetworkAwareImage>` keeping identical `src`, `alt`, `className`, and wrapping the `onClick` handler

Before:
```tsx
<img src={message.image_url} alt="Image" className="..." loading="lazy" ... />
```

After:
```tsx
<NetworkAwareImage src={message.image_url!} alt="Image" className="..." />
```

The `onClick` for full-size viewer wraps the component in a clickable div. This gives 3G users automatic quality reduction via the existing `useNetworkAwareLoading` hook.

---

## Fix 3 — Wire NetworkAwareVideo into MessageBubble

**File:** `src/components/community/MessageBubble.tsx` (lines 307-327)

- Import `NetworkAwareVideo` from `@/components/feed/NetworkAwareMedia`
- Replace the raw `<video>` tag with `<NetworkAwareVideo>` keeping the same `src` and `className`
- Keep the download button overlay as-is

Before:
```tsx
<video src={message.video_url} controls className="..." preload="metadata" />
```

After:
```tsx
<NetworkAwareVideo src={message.video_url!} className="rounded-lg w-full max-h-64" />
```

On slow connections, users see a tap-to-load placeholder instead of auto-downloading the video.

---

## Fix 4 — Wire uploadWithProgress for Video Uploads

**File:** `src/pages/Community.tsx`

- Import `uploadWithProgress` from `@/utils/uploadWithProgress`
- Add state: `const [uploadProgress, setUploadProgress] = useState<number | null>(null)`
- For video uploads only (line 1492-1494), replace `supabase.storage.upload()` with `uploadWithProgress('message-media', fileName, currentMediaFile, callback)`
- The callback updates `uploadProgress` state (0-100)
- Display a small progress indicator in the message input area while uploading (e.g., "Envoi vidéo: 45%")
- Reset `uploadProgress` to `null` on complete or error
- Image and document uploads continue using the standard `supabase.storage.upload()` (they are small enough not to need progress)

---

## Fix 5 — Set Bucket-Level Limits

**Database migration** to update the `message-media` bucket with server-side enforcement:

```sql
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
WHERE id = 'message-media';
```

Current state: `file_size_limit = NULL`, `allowed_mime_types = NULL` (no enforcement). This adds server-side blocking for oversized files and disallowed types.

---

## Fix 6 — Thumbnail System for Images

### 6a. Database migration

```sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS thumbnail_url text;
```

### 6b. Type update

**File:** `src/types/community.ts` — Add to Message interface:
```typescript
thumbnail_url?: string | null;
```

### 6c. Thumbnail generation

**File:** `src/utils/mediaOptimization.ts` — Add new function:

```typescript
export const generateImageThumbnail = async (file: File): Promise<Blob> => {
  // Canvas-based 300x300 center-crop thumbnail, JPEG 0.6 quality
};
```

Uses the same Canvas API pattern already in `compressImage()`. Center-crops to square, outputs ~5-15KB thumbnails.

### 6d. Upload flow

**File:** `src/pages/Community.tsx` — When sending an image:

1. Call `compressImage()` (existing) and `generateImageThumbnail()` (new) in parallel
2. Upload full image to `message-media/{userId}/{timestamp}-full.jpg`
3. Upload thumbnail to `message-media/{userId}/{timestamp}-thumb.jpg`
4. Store thumbnail URL in `thumbnail_url` column
5. Store full image URL in `image_url` column

### 6e. Display

**File:** `src/components/community/MessageBubble.tsx`:

- In the image display section, use `message.thumbnail_url || message.image_url` as the `src` for `NetworkAwareImage`
- When user clicks to open full-size viewer, pass `message.image_url` (the full image)
- Existing messages without `thumbnail_url` fall back to `image_url` seamlessly

---

## Files Changed

| File | Change |
|---|---|
| DB migration | RLS policy update, bucket limits, `thumbnail_url` column |
| `src/types/community.ts` | Add `thumbnail_url` to Message interface |
| `src/utils/mediaOptimization.ts` | Add `generateImageThumbnail()` function |
| `src/pages/Community.tsx` | Wire `uploadWithProgress` for video, thumbnail generation + upload for images, progress state |
| `src/components/community/MessageBubble.tsx` | Wire `NetworkAwareImage`, `NetworkAwareVideo`, thumbnail display |

## Safety Verification

| Check | Status |
|---|---|
| Existing images without `thumbnail_url` display correctly via `image_url` fallback | Yes -- `thumbnail_url \|\| image_url` |
| RLS policy covers `image_url`, `video_url`, and `document_url` | Yes -- all three in OR clause |
| `NetworkAwareImage` renders correctly with quality adaptation | Yes -- same component used in Feed |
| `NetworkAwareVideo` shows tap-to-load on 3G | Yes -- same component used in Feed |
| Video upload shows progress percentage | Yes -- `uploadWithProgress` callback |
| Bucket rejects files outside allowed MIME types | Yes -- server-side `allowed_mime_types` |
| Bucket rejects files over 50MB | Yes -- `file_size_limit = 52428800` |
| No Community Plan A/B/C code touched | Correct |
| No new dependencies added | Correct |

