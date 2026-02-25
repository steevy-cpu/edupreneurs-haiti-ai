

# Phase 1: Jude Voice System — Global Audio Foundation

## Overview
Three new files created, one existing file minimally modified. This establishes the infrastructure for all future Jude voice features (Points Cles narration, Studygram, onboarding, visitor tour).

---

## Deliverable 1: Edge Function `generate-jude-voice`

**File:** `supabase/functions/generate-jude-voice/index.ts` (new)

A unified TTS endpoint with Storage-first caching:

1. Receives `{ text, storageKey, context }` from authenticated client
2. Validates inputs (text max 500 chars, storageKey alphanumeric/hyphens/slashes only, context from allowed list)
3. Strips HTML tags from text before sending to ElevenLabs
4. Checks `lesson-audio/jude-voice/{storageKey}.mp3` via HEAD request — if exists, returns CDN URL immediately (`cached: true`)
5. If missing, calls ElevenLabs with Eric voice (`cjVigY5qzO86Huf0OWal`), `eleven_multilingual_v2` model, `mp3_22050_32` format (3G-optimized ~32kbps)
6. Uploads generated audio to Storage with `upsert: false` (never overwrite)
7. Returns `{ url, cached }` response

**Security:**
- `verify_jwt = true` in config.toml (JWT validated in code via `getClaims`)
- In-memory rate limit: 20 requests per user per hour (per-instance counter, resets on cold start — acceptable for abuse prevention)
- storageKey regex validation prevents path traversal
- No secrets exposed to client

**Config change:** Add `[functions.generate-jude-voice]` entry to `supabase/config.toml`

---

## Deliverable 2: Context `JudeAudioContext`

**File:** `src/contexts/JudeAudioContext.tsx` (new)

Global audio manager ensuring only one Jude voice plays at a time, with music ducking.

**Interface:**
```text
speak(audioUrl: string): Promise<void>  — play audio, duck music
stop(): void                            — stop current audio, restore music
isSpeaking: boolean                     — playback state
isError: boolean                        — last play failed
```

**Music ducking logic:**
- When Jude speaks and music is playing: save current volume, set music to 14 (out of 100 scale, ~20%)
- When Jude finishes or stops: restore saved volume
- Uses `useMusicPlayer()` — requires placement AFTER `MusicPlayerProvider` in provider stack

**Safe defaults pattern:** Follows the same pattern as `useMusicPlayer` — returns no-op defaults if context is unavailable, preventing crashes in components outside the provider tree.

**Provider placement in AppProviders.tsx (line 87-88):**
```text
<MusicPlayerProvider>
  <JudeAudioProvider>        <-- NEW: after MusicPlayer, before FirstTimeUser
    <FirstTimeUserProvider>
```

---

## Deliverable 3: Hook `useJudeVoice`

**File:** `src/hooks/useJudeVoice.ts` (new)

Shared hook for all voice surfaces — handles generation request, session caching, and playback.

**Interface:**
```text
Options: { text, storageKey, context, autoPreload? }
Returns: { play, stop, isSpeaking, isLoading, isError, isReady }
```

**Logic:**
- Module-level `Map<string, string>` cache (survives component remounts within session)
- `preload()` calls `generate-jude-voice` edge function, stores returned URL in cache
- `play()` preloads if needed, then calls `speak()` from `JudeAudioContext`
- `autoPreload` option triggers background fetch on mount (for Points Cles, Studygram where text is known ahead of time)
- Respects `jude-voice-muted` localStorage flag (existing mute toggle from JudeFeedback)

---

## Safety Verification

| Check | Status |
|---|---|
| Conflicts with existing RLS/DB functions? | No DB changes |
| Affects Provider Stack order? | Minimal — JudeAudioProvider inserted between MusicPlayer and FirstTimeUser |
| New dependencies added? | None |
| Cold start risk on page load? | No — hook only fires on explicit `play()` or `autoPreload` |
| Works on 3G? | Yes — mp3_22050_32 format (~32kbps), Storage CDN caching |
| Backward compatibility? | Full — no existing files modified except AppProviders (additive only) |
| Edge cases (offline, expired session)? | Error states handled with toast, no crash |
| Existing auth/device trust respected? | Yes — verify_jwt + getClaims |

## Files Summary

| File | Action |
|---|---|
| `supabase/functions/generate-jude-voice/index.ts` | Create |
| `supabase/config.toml` | Add entry (auto-managed) |
| `src/contexts/JudeAudioContext.tsx` | Create |
| `src/hooks/useJudeVoice.ts` | Create |
| `src/providers/AppProviders.tsx` | Modify (add JudeAudioProvider to FeatureProviders) |

