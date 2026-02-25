

# Add Voice to Remaining 3 Onboarding Phases

## Overview
Add Jude's ElevenLabs voice narration to the Quiz, Avatar, and Tour phases of onboarding. Currently only Phase 1 (Welcome) has voice. After this change, all 4 phases will have consistent voice support.

## Safety Verification

| Check | Status |
|-------|--------|
| Conflicts with RLS/DB functions? | No — no DB changes |
| Affects Provider Stack / AppShell? | No — uses existing JudeAudioContext |
| Adds bundle size / dependencies? | No — reuses existing imports |
| Cold start risk on page load? | No — voice calls are fire-and-forget, never block UI |
| Works on 3G? | Yes — silent fail on network error, typing sounds as fallback |
| Backward compatible? | Yes — voice is additive, all existing behavior preserved |
| Respects mute state? | Yes — checks `jude-voice-muted` localStorage key |

## Files Modified
Only 3 files: `OnboardingQuiz.tsx`, `AvatarGenerationStep.tsx`, `FirstTimeUserTour.tsx`

---

## Phase 2 — OnboardingQuiz.tsx

**Strategy:** On-demand voice generation via `generate-jude-voice` edge function. Questions are semi-static text; reactions include the user's first name.

**Changes:**
1. Add imports: `useJudeAudio` from JudeAudioContext (supabase client already imported)
2. Add voice state: `const { speak, stop } = useJudeAudio()`
3. Add `fetchAndSpeak(text, storageKey)` helper — calls `generate-jude-voice` with context `'onboarding'`, then `speak(url)`. Silent catch on failure.
4. Add `useEffect` on `currentStep` — calls `fetchAndSpeak` with the question text and a stable storage key:
   - Q0: `onboarding/quiz-q0` (static text)
   - Q1: `onboarding/quiz-q1-{firstName}` (personalized with name)
   - Q2-Q6: `onboarding/quiz-q{N}` (static text)
5. Add `useEffect` on `showReaction` + `reactionText` — voices the reaction. Key: `onboarding/quiz-reaction-{step}-{nameSlug}`
6. Add `useEffect` on `isOutro` — voices the outro. Key: `onboarding/quiz-outro`
7. Update `enableSound` on all 3 `SimpleTypewriter` instances: change from `enableSound` / `enableSound={true}` to `enableSound={isMuted}` so typing sounds only play when voice is muted
8. Add cleanup `useEffect`: `() => stop()` on unmount

**Storage key examples:**
- `jude-voice/onboarding/quiz-q0.mp3` — cached permanently after first generation
- `jude-voice/onboarding/quiz-reaction-0-marie.mp3` — personalized, cached per user name

---

## Phase 3 — AvatarGenerationStep.tsx

**Strategy:** Two static messages with fixed storage keys. Voice generated on-demand, cached permanently in CDN.

**Changes:**
1. Add imports: `useJudeAudio` from JudeAudioContext, `supabase` client
2. Add `const { speak, stop } = useJudeAudio()`
3. Add mount `useEffect` — when component renders (not muted), fetch voice for the prompt message:
   - Text: `"Maintenant, créons ton avatar personnalisé avec l'IA!"`
   - Key: `onboarding/avatar-prompt`
   - On success: `speak(url)`
4. Add `useEffect` on `celebrating` state — when true and not muted, fetch voice for celebration:
   - Text: `"Superbe avatar! Bienvenue dans la famille Edupreneurs!"`
   - Key: `onboarding/avatar-celebration`
5. Update `SimpleTypewriter` `enableSound` prop: `enableSound={isMuted}` — typing sounds only when voice is muted
6. Add cleanup: `() => stop()` on unmount

**Note:** Emojis are stripped from TTS text (the edge function's `stripHtml` handles tags, but emojis pass through harmlessly to ElevenLabs which ignores them).

---

## Phase 4 — FirstTimeUserTour.tsx

**Strategy:** 8 fixed tour steps with static text. Use on-demand generation with stable keys (same as quiz pattern). Audio cached permanently after first play.

**Changes:**
1. Add imports: `useJudeAudio` from JudeAudioContext, `supabase` client
2. Add `const { speak, stop } = useJudeAudio()`
3. Add `isMuted` state: `useState(() => localStorage.getItem('jude-voice-muted') === 'true')`
4. Add `TOUR_VOICE_TEXTS` constant — clean text versions of each step's title + description (no emojis, combined into natural speech):
   ```text
   Step 0: "Votre tableau de bord. Suivez votre progression, vos pièces d'or gagnées et vos statistiques d'apprentissage."
   Step 1: "Musique d'étude. Tu peux écouter de la musique pendant que tu étudies."
   ... (all 8 steps)
   ```
5. Add `useEffect` on `firstTimeUser.tourStep` — when step changes:
   - Stop current audio
   - If muted, return
   - After 600ms delay (navigation settle), call `generate-jude-voice` with text and key `onboarding/tour-step-{N}`
   - On success: `speak(url)`
6. Update `SimpleTypewriter` `enableSound` prop: `enableSound={isMuted}` — typing sounds only when voice is muted
7. Add mute toggle button in the tour card actions area (same style as visitor tour)
8. Add cleanup: `() => stop()` on unmount
9. Add voice for celebration overlay: `useEffect` on `showCelebration` — voices "Tu es prêt! Bienvenue dans la famille Edupreneurs!" with key `onboarding/tour-celebration`

---

## Technical Notes

- **No new edge functions** — all 3 phases reuse the existing `generate-jude-voice` function with context `'onboarding'` (already in the allowed contexts list)
- **No new dependencies** — all imports already exist in the project
- **CDN caching** — after first generation, audio files are permanently stored in `lesson-audio/jude-voice/onboarding/` bucket. Subsequent users hit the cache (HEAD check returns 200)
- **Race condition safe** — voice is fire-and-forget; if it fails or arrives late, typing sounds play as fallback. No blocking waits.
- **Rate limit** — 20 requests/hour per user. Worst case for full onboarding: 7 questions + 7 reactions + 1 outro + 2 avatar + 8 tour + 1 celebration = 26 calls. But most will be cache hits after the first user generates them. Only personalized keys (with firstName) are unique per user.
- **Mute persistence** — all phases read from `jude-voice-muted` localStorage, consistent with the Welcome phase

