

# First-Time UX Plan B -- Jude Prompts, Milestone Celebrations, Quiz Explanation

## Fix 1 -- Update Jude Chat Suggested Prompts

**File:** `src/components/JudeChatbot.tsx`

The chatbot already has FAQ chips (lines 407-425) that show when `messages.length <= 1`. The current prompts are generic ("Comment voir mes cours ?", "Ou est le classement ?", "Aide-moi a etudier").

**Change:**
- Replace the 3 existing FAQ prompts (line 409-412) with the new first-time-friendly prompts:
  - "Comment je gagne du Gold ? (gold emoji)"
  - "Explique-moi comment utiliser la plateforme (book emoji)"
  - "Aide-moi a choisir une matiere (target emoji)"
- Change the layout from `flex flex-wrap` to a `grid grid-cols-2` on mobile for better tap targets
- The existing behavior (chips disappear after first message) is already handled by `messages.length <= 1`
- Fix the onClick handler: currently it sets `setInput(faq)` then calls `handleSendMessage()` via setTimeout which reads the old state. Instead, call `onSendMessage` directly by adding the message to state and triggering the AI call inline (same pattern as the chess FloatingChessMessages quick replies)

**Lines affected:** 407-425

---

## Fix 2 -- Add Mobile Tooltip to Jude Avatar

**File:** `src/components/JudeChatbot.tsx`

Currently there's a tooltip (line 386-388) that says "Cliquez sur moi" with the class `eric-floating-tooltip`. This shows on all devices.

**Change:**
- Add a `useState<boolean>` for `showMobileTooltip`, initialized from `!localStorage.getItem('jude-tooltip-shown')`
- Add a `useEffect` that sets a 5-second timer to hide the tooltip and write `localStorage.setItem('jude-tooltip-shown', 'true')`. Only runs when `showMobileTooltip` is true.
- Replace the existing tooltip text "Cliquez sur moi" (line 387) with conditional rendering:
  - On desktop (hidden lg:block): keep "Cliquez sur moi"
  - On mobile (lg:hidden): show "Parle avec Jude! (speech emoji)" only when `showMobileTooltip` is true, with a `animate-fade-in` class and fade-out after 5s
- No new dependencies -- uses existing CSS animations

**Lines affected:** Near lines 90-95 (new state), 232-237 (new effect), 385-389 (tooltip rendering)

---

## Fix 3 -- Celebrate First Lesson Completion with Confetti

**Files:** `src/components/InteractiveQuiz.tsx` and `src/components/HTMLQuizParser.tsx`

These are the two places where `lesson_completions` upserts happen (lines 349-359 in InteractiveQuiz, lines 227-237 in HTMLQuizParser). Both already show a toast on success.

**Change in both files:**
- After the successful upsert + `setIsLessonCompleted(true)`, add a first-lesson check:
  ```
  if (!localStorage.getItem('first-lesson-celebrated')) {
    localStorage.setItem('first-lesson-celebrated', 'true');
    confetti({ particleCount: 120, spread: 80, colors: ['#8b5cf6', '#f59e0b', '#10b981'] });
    // Replace the normal toast with a special first-lesson toast
  }
  ```
- For the first lesson, the toast message changes to: "Felicitations! Tu as complete ta premiere lecon! Continue comme ca! (party emoji)"
- For subsequent lessons, the existing toast remains unchanged
- Import `confetti` from `canvas-confetti` (already installed, used in 4 other files)
- The `isLessonCompleted` state already prevents duplicate upserts, so this only fires once per lesson. The localStorage key ensures the celebration only fires for the very first lesson ever.

**Lines affected:** InteractiveQuiz.tsx lines 361-377, HTMLQuizParser.tsx lines 241-251

---

## Fix 4 -- Celebrate First Quiz Battle Win with Confetti

**File:** `src/components/quiz-battle/MultiplayerResults.tsx`

Lines 61-66 already have a placeholder `useEffect` for winner celebration that only does `console.log('Winner celebration!')`.

**Change:**
- Replace the console.log with actual confetti + localStorage check:
  ```
  if (!localStorage.getItem('first-quiz-win-celebrated')) {
    localStorage.setItem('first-quiz-win-celebrated', 'true');
    confetti({ particleCount: 120, spread: 80, colors: ['#8b5cf6', '#f59e0b', '#10b981'] });
    toast({ title: "Tu as gagne ton premier Quiz Battle! Incroyable! (trophy emoji)", duration: 5000 });
  }
  ```
- Import `confetti` from `canvas-confetti`
- Import `useToast` from `@/hooks/use-toast`
- The existing `isWinner` guard in the useEffect ensures this only fires for wins

**Lines affected:** 1-19 (imports), 40-66 (add toast hook + replace console.log)

---

## Fix 5 -- Add Pre-Game Explanation to Quiz Battle Mode Selector

**File:** `src/components/quiz-battle/BattleModeSelector.tsx`

**Change:**
- After the mode cards grid (line 94), add a collapsible "Comment ca marche ?" section using the existing `Collapsible` + `CollapsibleTrigger` + `CollapsibleContent` components (already in the project)
- Import `ChevronDown` from lucide-react, `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` from `@/components/ui/collapsible`
- Add state `const [rulesOpen, setRulesOpen] = useState(false)`
- Content: a simple list with 4 bullet points:
  - "10 questions sur une matiere de ton choix"
  - "Tu as 15 secondes par question"
  - "Bonne reponse = points bonus"
  - "Le joueur avec le plus de points gagne!"
- Style: muted background card, small text, collapsed by default with ChevronDown rotation animation

**Lines affected:** 1-4 (imports), 12-16 (add state), after line 94 (add collapsible)

---

## Safety Verification

| Check | Status |
|-------|--------|
| Existing Jude chat behavior preserved | Yes -- only prompt text and layout change; disappear-on-message logic unchanged |
| Existing lesson completion flow unchanged | Yes -- confetti is additive after the existing upsert + toast |
| Existing quiz battle results unchanged | Yes -- confetti replaces a console.log placeholder |
| No new dependencies | Correct -- canvas-confetti and Collapsible already installed/available |
| No DB schema changes | Correct |
| No provider stack changes | Correct |
| localStorage keys won't conflict | Verified: 'jude-tooltip-shown', 'first-lesson-celebrated', 'first-quiz-win-celebrated' are all unique |
| 3G impact | Minimal -- confetti is client-side, no network calls added |
| Mobile tooltip only shows once | Yes -- localStorage guard |

## Files Changed

| File | Fix |
|------|-----|
| `src/components/JudeChatbot.tsx` | Fix 1 + Fix 2: Updated prompts, mobile tooltip |
| `src/components/InteractiveQuiz.tsx` | Fix 3: First lesson confetti celebration |
| `src/components/HTMLQuizParser.tsx` | Fix 3: First lesson confetti celebration (second upsert location) |
| `src/components/quiz-battle/MultiplayerResults.tsx` | Fix 4: First quiz win confetti |
| `src/components/quiz-battle/BattleModeSelector.tsx` | Fix 5: Collapsible rules explanation |

