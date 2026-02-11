

# Randomized Jude Feedback Messages

## Problem
Currently, Jude always says the same two phrases: "Bravo !" for correct and "Pas tout a fait..." for incorrect. This feels repetitive and less engaging, especially with 10-15 questions per session.

## Solution
Add a pool of varied feedback messages for both correct and incorrect answers, randomly selected each time. This makes Jude feel more alive and conversational.

## Changes

### File: `src/components/jude/JudeFeedback.tsx`

Add two arrays of randomized messages and pick one on each render:

**Correct answer messages (pool of 8+):**
- "Bravo !"
- "Excellent !"
- "Parfait !"
- "Super boulot !"
- "Tu geres !"
- "Impressionnant !"
- "C'est ca !"
- "Bien joue !"
- "Tu assures !"
- "Magnifique !"

**Incorrect answer messages (pool of 8+):**
- "Pas tout a fait..."
- "Presque !"
- "Essaie encore la prochaine fois !"
- "Pas exactement..."
- "C'est pas grave, on apprend !"
- "Bonne tentative !"
- "Continue, tu vas y arriver !"
- "Hmm, pas cette fois..."
- "Ne lache pas !"
- "Regarde bien l'explication !"

**Emojis also randomized** to match the variety of messages.

Implementation uses `useMemo` with a random index so the message stays stable during re-renders but changes per question.

### File: `src/components/jude/JudeCompletionScreen.tsx`

Add more granular score tiers with varied messages:
- 100%: "Parfait ! Tu es un champion !"
- 80-99%: pool of 3 encouraging messages
- 60-79%: pool of 3 motivating messages  
- Below 60%: pool of 3 supportive messages

## Files Modified

| File | Change |
|------|--------|
| `src/components/jude/JudeFeedback.tsx` | Add randomized message pools for correct/incorrect feedback |
| `src/components/jude/JudeCompletionScreen.tsx` | Add more varied score-based messages |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- same component API, just varied text |
| 3G optimized? | Yes -- no network changes, just string arrays |
| Backward compatible? | Yes -- same props interface |

