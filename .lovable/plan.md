

## Implementation Plan: 3 UX Fixes in OnboardingQuiz.tsx + Audio Cleanup

### Fix 1 -- "Bonjour" to "Salut" (2 lines)

- **Line 382:** Change `"Bonjour! Comment tu t'appelles?"` to `"Salut! Comment tu t'appelles?"`
- **Line 441:** Change `'Bonjour! Comment tu t\'appelles? ...'` to `'Salut! Comment tu t\'appelles? ...'`

### Fix 2 -- "Je ne suis plus a l'ecole" button visibility (lines 694-700)

Replace the `variant="ghost"` button with a styled `variant="outline"` button:
- Add `GraduationCap` to the lucide-react import on line 15
- Replace button with `variant="outline"`, border/hover styling (`border-2 border-white/30 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/50`), and a `GraduationCap` icon

### Fix 3 -- Quiz UX improvements (4 sub-fixes)

**3a. Skip button (lines 477-480):** Reorder to show "Passer" text before the X icon, change `gap-1` to `gap-1.5`, reduce icon to `w-3.5 h-3.5`

**3b. "Optionnel" badge:** Insert an `<span>` with "Optionnel" text (`text-xs text-white/50 font-medium tracking-wide uppercase`) inside the `space-y-3` div (after line 554), shown when `currentStep >= 3`

**3c. Progress dots + step counter (lines 487-497):**
- Change dot size from `w-2.5 h-2.5` to `w-3 h-3`
- Add `{currentStep + 1} / 7` counter text below the dots

**3d. Helper text on text inputs:**
- Q0 (after Input, before Button, ~line 568): Add `"On gardera ca entre nous"` helper
- Q3 (after nickname availability feedback, before Button, ~line 661): Add `"Choisis un pseudo unique -- c'est comme ca que les autres te verront"` helper
- Q4 (after Input, before Button, ~line 685): Add `"Commence a taper et on trouvera ton ecole"` helper

### Storage Deletion

After the code changes, delete the pre-generated audio file at `jude-voice/onboarding/quiz-q0.mp3` from the `lesson-audio` bucket so it regenerates with the new "Salut" text. This will be done via the Supabase storage API or a data operation.

### Files Modified

| File | Action |
|------|--------|
| `src/components/firsttime/OnboardingQuiz.tsx` | MODIFY (all 3 fixes) |
| Storage: `lesson-audio/jude-voice/onboarding/quiz-q0.mp3` | DELETE via storage API |

### Safety Verification

| Check | Status |
|-------|--------|
| No new dependencies | OK -- GraduationCap already in lucide-react |
| Bundle size | Zero impact |
| 3G performance | No change -- cosmetic updates only |
| Existing functionality | Preserved -- no logic changes |
| Audio regeneration | quiz-q0 deleted; auto-regenerates on next playback |
| RLS / DB | No tables modified |
| Provider stack | Untouched |

