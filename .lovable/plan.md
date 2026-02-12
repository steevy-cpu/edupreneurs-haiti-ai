

# Make the Exam Practice Page "Jude's Domain"

## Goal
Transform the exam practice page so it feels like **Jude is personally running the session** for the student. Make the UI more welcoming, explicit, and student-friendly -- especially for first-time 9th graders testing it.

---

## Changes Overview

### 1. Add a Jude Welcome Banner at the top of the practice page

Replace the plain title `exam.title` with a **branded Jude welcome section** that includes:
- Jude's avatar (using `jude-profile.jpeg`)
- A friendly greeting: "Salut! Je suis Jude, ton tuteur pour cet examen."
- A disclaimer: "Voici quelques questions de cet examen -- pas toutes! Si tu as besoin d'aide, n'hesite pas a me demander."
- The exam title and subject as secondary info

This sets expectations immediately: partial questions, Jude is here to help.

**File:** `src/pages/ExamPreparation.tsx`

### 2. Rebrand the Tab labels to be Jude-centric

Current tabs:
- "Document PDF" / "Tuteur Jude"

New tabs:
- "Document PDF" (keep as-is, it's clear)
- "Pratique avec Jude" (instead of "Tuteur Jude" -- more inviting, action-oriented)

**File:** `src/pages/ExamPreparation.tsx`

### 3. Add a contextual info banner inside the ExamTutorPanel

At the top of the question runner (below the header, above the question), add a **small dismissible info card** on first load:
- "Ces questions sont extraites de l'examen. Reponds a chacune et je te guiderai! Utilise le bouton 'Demander a Jude' si tu bloques."
- Dismissible via a small X button, stored in `sessionStorage` so it only shows once per session

**File:** `src/features/exams/practice/components/ExamTutorPanel.tsx`

### 4. Improve the AskJudeDrawer empty state

Current empty state says: "Pose ta question a Jude! Il t'aidera avec cet exercice."

Replace with a richer empty state:
- Jude's avatar (larger)
- "Je suis la pour t'aider! Tu peux me poser n'importe quelle question sur cet exercice."
- 2-3 suggestion chips: "Explique-moi la question", "Donne-moi un exemple", "Je ne comprends pas"
- Clicking a chip auto-sends that message

**File:** `src/features/exams/practice/components/AskJudeDrawer.tsx`

### 5. Improve the ExerciseHeader with Jude branding

Add Jude's small avatar next to the question number to reinforce that "Jude is running this." Keep it subtle -- just a 20px avatar before the badge.

**File:** `src/features/exams/practice/components/ExerciseHeader.tsx`

### 6. Humanize the ActionRow button labels

Current: "Indice", "Reveler", "Suivant", "Precedent"

New labels (more student-friendly):
- "Indice" stays but add subtitle text showing hint level as dots (visual)
- "Voir la reponse" instead of "Reveler" (clearer for students)
- "Question suivante" instead of "Suivant"
- "Precedent" stays

**File:** `src/features/exams/practice/components/ActionRow.tsx`

### 7. Warm up the FeedbackCard messages

Current: "Correct!", "Pas tout a fait...", "Reponse revelee"

New (more Jude-like personality):
- Correct: "Bravo, c'est correct!" (with confetti emoji already there)
- Incorrect: "Pas exactement... Regarde bien l'explication."
- Revealed: "Voici la reponse. Etudie-la bien!"
- Hint: "Voici un indice pour t'aider"

**File:** `src/features/exams/practice/components/FeedbackCard.tsx`

---

## Technical Details

### `ExamPreparation.tsx`
- Add a `JudeWelcomeBanner` section between the back button and the progress bar
- Uses `jude-profile.jpeg` asset
- Contains exam title, Jude greeting, and disclaimer text
- Compact on mobile (avatar + 2 lines), expanded on desktop

### `ExamTutorPanel.tsx`
- Add `showInfoBanner` state initialized from `sessionStorage.getItem('exam-info-dismissed-{sessionId}')`
- Render a small Card with info text and X button above the question
- On dismiss, set sessionStorage flag

### `AskJudeDrawer.tsx`
- Replace the empty state div (lines 187-191) with a richer component
- Add `suggestionChips` array with 3 pre-written questions
- Each chip calls `handleSend` with the chip text when clicked

### `ExerciseHeader.tsx`
- Import `jude-profile.jpeg`
- Add a small Avatar (20x20) before the Q badge

### `ActionRow.tsx`
- Change "Reveler" to "Voir la reponse"
- Change "Suivant" to "Question suivante"

### `FeedbackCard.tsx`
- Update the 4 status strings to be more conversational

---

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- all changes are text/UI only |
| Works with existing data? | Yes -- no schema changes |
| 3G optimized? | Yes -- jude-profile.jpeg already cached, no new assets |
| Backward compatible? | Yes |
| Edge cases? | Empty exercises handled, dismissible banner persisted per session |

