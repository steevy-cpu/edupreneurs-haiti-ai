
# Populate TOUR_STEP_AUDIO_URLS with Generated CDN URLs

## What happened
All 12 tour audio clips were successfully generated via `generate-jude-voice` and are now permanently stored in the `lesson-audio` bucket. Two steps (3 and 6) initially hit ElevenLabs rate limits but succeeded on retry.

## Single change needed

**File:** `src/components/visitor/VisitorTour.tsx` (lines 96-109)

Replace all 12 `null` entries in `TOUR_STEP_AUDIO_URLS` with the permanent public CDN URLs:

```typescript
const TOUR_STEP_AUDIO_URLS: (string | null)[] = [
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-0.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-1.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-2.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-3.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-4.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-5.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-6.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-7.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-8.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-9.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-10.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-11.mp3',
];
```

This is the only change. The playback logic from Phase 6 will now automatically play these clips as visitors navigate through each tour step.
