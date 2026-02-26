

# Plan: Static Onboarding Voice Keys

## Goal
Eliminate all dynamic/personalized ElevenLabs calls during onboarding so every audio clip is a pre-generated CDN cache hit. Zero on-demand TTS generation for any user.

## Code Changes

### File 1: FirstTimeUserWelcome.tsx (L57-59)

**What changes:** The pre-fetch messages array (L58-59). Only message 0 is affected.

- Change `text` from `` `Bienvenue sur Edupreneurs, ${displayName}! 👋` `` to `"Bienvenue sur Edupreneurs!"` (generic TTS text)
- Change `storageKey` from `` `onboarding/firsttime-0-${displayName}` `` to `'onboarding/firsttime-0'` (static key)
- Remove `displayName` from the useEffect dependency array (L84) since it's no longer used in the effect
- Update the comment on L57 from "dynamic" to "static"

The typewriter display text on L161 and L241 remains unchanged -- still shows the personalized greeting with the user's name. Only the audio is generic.

### File 2: OnboardingQuiz.tsx (3 edits)

**Edit A -- Q1 voice key (L381-395):**
- Change `text` for step 1 from `` `Et maintenant, ${firstName}, tu es en quelle classe?` `` to `"Et maintenant, tu es en quelle classe?"`
- Change the key logic (L393-395) to always use `onboarding/quiz-q${currentStep}` -- remove the special case for step 1
- Remove `firstName` from the useEffect dependency array (L397)

**Edit B -- Reaction voice key (L403-405):**
- Remove the `nameSlug` variable and its computation
- Change key from `` `onboarding/quiz-reaction-${currentStep}-${nameSlug}` `` to `` `onboarding/quiz-reaction-${currentStep}` ``
- The `reactionText` passed to `fetchAndSpeak` still contains the display text (with emoji and name for step 0), but the `storageKey` is now static, so the edge function will return the pre-generated audio regardless of the text param
- Remove `firstName` from the useEffect dependency array (L406)

**Edit C -- Reaction-0 display text (L253):**
The `reactionText` for step 0 is `` `Enchanté(e), ${fullName.split(/\s+/)[0]}! 🎉` `` which is personalized. Since the audio will now be the pre-generated "Enchanté! Ravi de te rencontrer!" clip (keyed to `quiz-reaction-0`), the display text can stay personalized -- the typewriter shows one thing, Jude says the generic version. No change needed here.

**Note on "Pas de souci!" (L289):** When a user picks "not in school", the reaction text is "Pas de souci!" but the key will be `quiz-reaction-4` (same as "Top!"). The audio will say "Top!" while the screen shows "Pas de souci!". This is an acceptable trade-off for static caching -- both are brief positive acknowledgments.

## Post-Code: Pre-Generate All Static Audio Keys

After code changes, invoke the `generate-jude-voice` edge function 9 times to pre-generate and cache all new static keys in the Storage bucket. These calls only need to happen once -- after that, every user gets instant CDN hits.

Keys to pre-generate:
1. `onboarding/firsttime-0` -- "Bienvenue sur Edupreneurs!"
2. `onboarding/quiz-q1` -- "Et maintenant, tu es en quelle classe?"
3. `onboarding/quiz-reaction-0` -- "Enchanté! Ravi de te rencontrer!"
4. `onboarding/quiz-reaction-1` -- "Super choix!"
5. `onboarding/quiz-reaction-2` -- "Parfait!"
6. `onboarding/quiz-reaction-3` -- "Excellent pseudo!"
7. `onboarding/quiz-reaction-4` -- "Top!"
8. `onboarding/quiz-reaction-5` -- "Noté!"
9. `onboarding/quiz-reaction-6` -- "Merci!"

Existing keys that should already be in Storage (no action needed):
- `onboarding/firsttime-1`, `onboarding/firsttime-2`
- `onboarding/quiz-q0`, `onboarding/quiz-q2` through `onboarding/quiz-q6`
- `onboarding/quiz-outro`
- `onboarding/avatar-prompt`, `onboarding/avatar-celebration`
- `onboarding/tour-step-0` through `onboarding/tour-step-7`
- `onboarding/tour-celebration`

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- only audio text/keys change |
| Typewriter display text changed? | No -- screen text stays personalized |
| Provider stack affected? | No |
| New dependencies? | No |
| Bundle size impact? | None |
| 3G performance? | Improved -- CDN hits instead of ElevenLabs generation |
| Backward compatible? | Yes -- old dynamic cached audio becomes unused but harmless |
| Files modified | FirstTimeUserWelcome.tsx, OnboardingQuiz.tsx only |

## Result
Zero on-demand ElevenLabs calls during onboarding. Every audio clip is a pre-generated CDN cache hit. Full onboarding works on 3G without any TTS latency.

