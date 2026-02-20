

# Fix Avatar Save: Return Base64 from Edge Function

## Problem
DALL-E 3 returns a temporary cross-origin URL (`oaidalleapiprodscus.blob.core.windows.net`). The frontend draws this onto a canvas for 256x256 compression, but the browser taints the canvas because of CORS. `canvas.toBlob()` fails with a `SecurityError`, and the avatar never uploads to storage.

## Solution
Modify the edge function to fetch the DALL-E 3 image bytes server-side and return a base64 data URL. The frontend canvas then processes same-origin data with no CORS issue.

## Single File Change

**`supabase/functions/generate-custom-avatar/index.ts`**

After extracting `imageUrl` from the DALL-E 3 response (line 146), add:

1. `fetch(imageUrl)` to download the image bytes on the server
2. Convert the response to `ArrayBuffer`, then to base64
3. Return `data:image/png;base64,...` as the `imageUrl` instead of the temporary URL

Everything else stays identical: same Zod validation, auth, rate limiting, prompt, response shape.

## What Changes

```text
Current flow:
  Edge function -> returns DALL-E URL -> frontend canvas taints -> toBlob fails

Fixed flow:
  Edge function -> fetches DALL-E image -> encodes base64 -> returns data URL
  -> frontend canvas works -> toBlob succeeds -> uploads to Storage -> saves to profiles
```

## What Does NOT Change
- Frontend (`AIAvatarGenerator.tsx`) -- zero modifications
- Response shape: `{ success: true, imageUrl: string }` -- same key, just base64 value
- Database writes, RLS policies, storage bucket
- Auth check, rate limiting, input validation
- Error handling and French fallback UI

## Safety

| Check | Status |
|---|---|
| Frontend changes? | None |
| Database changes? | None |
| New secrets? | None |
| Response shape preserved? | Yes -- imageUrl is now base64 instead of URL |
| Edge function size increase? | ~1.3MB base64 string per response (acceptable for avatar generation) |
| 3G concern? | One-time transfer during avatar creation only, not on every page load |
| Existing avatars affected? | No -- they are already permanent Storage URLs |

## Technical Detail

Add roughly 10 lines after line 146 in the edge function:

```text
1. const imageResponse = await fetch(imageUrl);
2. if (!imageResponse.ok) throw new Error('Failed to fetch generated image');
3. const arrayBuffer = await imageResponse.arrayBuffer();
4. const uint8Array = new Uint8Array(arrayBuffer);
5. let binary = ''; for (const byte of uint8Array) binary += String.fromCharCode(byte);
6. const base64 = btoa(binary);
7. const base64DataUrl = `data:image/png;base64,${base64}`;
8. Return base64DataUrl as imageUrl in the response
```

