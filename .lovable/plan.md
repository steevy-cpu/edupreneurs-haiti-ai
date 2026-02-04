
# Plan: End-to-End Testing for Phase 3B Validation & Regeneration Flow

## Test Objective
Verify that the complete validation-regeneration workflow functions correctly from end-to-end:
1. Validation detects content alignment issues
2. Issues display in the lesson browser with regenerate buttons
3. One-click regeneration executes and updates the database
4. UI refreshes to reflect the changes
5. Dashboard syncs with the updated validation state

## Pre-Test Requirements

**What You Need:**
- A lesson with quiz and/or activities content
- The lesson should have validation issues (off-content questions)
- Access to the Content Editor page (`/content-editor`)
- Browser DevTools open (optional but recommended for error checking)

**How to Ensure Validation Issues Exist:**
1. Open a lesson in the editor that has been previously validated with issues
2. OR run the "Valider alignement contenu" or "Valider alignement activités" batch validators on a subject to generate fresh validation results

## Test Sequence (Step-by-Step)

### Step 1: Navigate to Content Editor & Observe Initial State
**Location:** `/content-editor`
**Expected:** The lesson browser should display lessons grouped by subject

**What to verify:**
- [ ] Content Editor loads without errors
- [ ] Grade level and subject filters work
- [ ] Lesson list displays correctly
- [ ] Lessons with regeneration flags show the `RotateCcw` badge with "Quiz" or "Activités" label

---

### Step 2: Run Validation to Create Issues
**Action:** Click one of these buttons in the header:
- "Valider alignement contenu" (to validate quizzes)
- "Valider alignement activités" (to validate activities)

**Expected:** A dialog appears showing validation progress
- [ ] Progress bar moves as lessons are validated
- [ ] After completion, the dialog shows summary (X lessons validated)
- [ ] Toast notification confirms completion
- [ ] Lessons now display validation issues in their `validation_details_json`

**Console Check:** Open DevTools → Console tab
- [ ] No errors should appear
- [ ] Look for successful API calls to the edge function

---

### Step 3: Select a Lesson with Issues
**Action:** In the lesson browser, click on a lesson that has:
- A "Quiz" or "Activités" regeneration badge, OR
- Validation issues stored in its `validation_details_json`

**Expected:**
- [ ] Lesson becomes highlighted (selected)
- [ ] Below the lesson title, one or more `ValidationDetailsPanel` components appear
- [ ] Each panel shows:
  - ✓ An amber alert box with "⚠️ Problèmes d'alignement détectés"
  - ✓ Number of off-content questions (e.g., "3 questions hors-contenu")
  - ✓ A collapsible arrow (chevron) to expand/collapse
- [ ] No errors in console

**Validation Details Panel Content (when expanded):**
- [ ] Panel shows issue categories (concepts, formulas, etc.) grouped with icons
- [ ] Each category lists the specific questions and reasons they're off-content
- [ ] At the bottom: "Recommandation:" text and a **Regenerate Button**

---

### Step 4: Click Regenerate Button (Quiz)
**Precondition:** A ValidationDetailsPanel for a quiz is visible and expanded

**Action:** Click the "Régénérer le quiz" button

**Immediate feedback (while loading):**
- [ ] Button becomes disabled
- [ ] Button text changes to "Régénération en cours..."
- [ ] A spinning `Loader2` icon appears (loading animation)

**Console Check:**
- [ ] Log entry: `POST /functions/v1/generate-quiz-final` (or similar edge function call)
- [ ] No errors in the response
- [ ] Response data includes `quizContent` (new generated quiz HTML)

---

### Step 5: Verify Database Update & UI Refresh
**After regeneration completes (5-15 seconds):**

**UI Changes:**
- [ ] Spinner disappears, button returns to normal state
- [ ] Toast notification appears: "Quiz régénéré avec succès"
- [ ] ValidationDetailsPanel **disappears** (no more issues detected)
- [ ] Lesson's `RotateCcw` badge disappears (validation flag cleared)
- [ ] Lesson list refreshes automatically

**Database Verification (check console Network tab or backend logs):**
- [ ] `PATCH /rest/v1/lessons` request was made
- [ ] Update included: `needs_quiz_regeneration: false` and `content_alignment_score: null`
- [ ] These changes indicate validation flags were cleared

**Console Check:**
- [ ] No errors after regeneration
- [ ] Look for confirmation logs: "loadSubjects()" was called to refresh

---

### Step 6: Click Regenerate Button (Activities)
**Precondition:** A ValidationDetailsPanel for activities is visible and expanded

**Action:** Click the "Régénérer les activités" button

**Expected (same pattern as Quiz):**
- [ ] Button shows loading state with spinner
- [ ] Edge function `generate-interactive-activities` is called
- [ ] Toast: "Activités régénérées avec succès"
- [ ] ValidationDetailsPanel disappears
- [ ] Lesson's activities regeneration badge disappears
- [ ] Database update clears `needs_activities_regeneration: false`

**Console Check:**
- [ ] No errors
- [ ] Response includes `content` (new generated activities)

---

### Step 7: Verify Dashboard Sync
**Action:** Open the Quality Dashboard (if available in the same layout)

**Expected:**
- [ ] The lesson's validation scores have been updated
- [ ] Validation details panel no longer shows for that lesson
- [ ] The overall lesson validation status reflects the regeneration

**Or if dashboard is separate:**
- [ ] Refresh the dashboard page
- [ ] The lesson's validation state should reflect the changes

---

### Step 8: Test Error Handling (Optional)
**Action (to test error recovery):**
1. Try regenerating a lesson with **no contenu/exemples_exercices** (empty content)
2. Observe error handling

**Expected:**
- [ ] Toast error: "Erreur lors de la régénération" or similar
- [ ] Button returns to normal state (no infinite loading)
- [ ] Lesson remains selected so you can try again
- [ ] Console shows the actual error for debugging

---

## Success Criteria

| Criterion | Pass/Fail | Notes |
|-----------|-----------|-------|
| ValidationDetailsPanel renders with correct data | [ ] | Issues should be grouped by category |
| Regenerate buttons are clickable and show loading state | [ ] | Spinner should animate |
| Edge function is invoked with correct parameters | [ ] | Check Network tab for request payload |
| Database updates remove regeneration flags | [ ] | `needs_quiz_regeneration: false` and `content_alignment_score: null` |
| UI refreshes automatically after regeneration | [ ] | Panel should disappear, badges removed |
| Toast notifications display for success/error | [ ] | Should show in bottom-right |
| Dashboard syncs without manual refresh | [ ] | onDashboardRefresh callback was invoked |
| No console errors throughout entire flow | [ ] | Clean console = no bugs |

---

## Troubleshooting Guide

**If ValidationDetailsPanel doesn't appear:**
- Check that the lesson has `validation_details_json` with issues
- Run the batch validators first to populate validation data
- Ensure the lesson has quiz/activities content

**If regenerate button is disabled or grayed out:**
- It may be actively regenerating (check spinner)
- Or the `onRegenerate` callback is not being passed
- Check React DevTools to inspect props

**If regeneration fails silently:**
- Open DevTools → Network tab
- Check the edge function response for error messages
- Look for 400/402/429 status codes (validation/payment/rate limit errors)
- Console will show the error: `console.error('Regeneration error:', error)`

**If database doesn't update:**
- Check RLS policies allow the update (for content_editor role)
- Verify the lesson ID is correct
- Check that the edge function returned valid data

**If dashboard doesn't sync:**
- Verify `onDashboardRefresh` callback was passed to LessonBrowser
- The callback is called in regenerateQuiz/Activities after loadSubjects()
- Manual refresh of dashboard page should show updated state

---

## Performance Notes

**Expected Timing:**
- Validation: 3-10 seconds per lesson (depending on content length)
- Regeneration (Quiz): 5-15 seconds (AI model inference time)
- Regeneration (Activities): 5-15 seconds
- UI refresh: Immediate after API response

**3G Optimization:**
- All operations use Supabase edge functions (optimized for slow connections)
- Content fetching happens in the existing `loadSubjects` query (no extra round trips)
- Toast notifications are lightweight
- No large file downloads

---

## Post-Test Checklist

After completing all 8 steps:
- [ ] All validation-regeneration cycles completed without errors
- [ ] Dashboard reflects latest validation state
- [ ] No console errors or warnings
- [ ] All badges and UI elements update correctly
- [ ] Toast notifications display clear feedback
- [ ] Database records show cleared validation flags
- [ ] Ready to mark Phase 3B as **production-ready**

---

## Documentation for Future Reference

Once testing is complete, document:
1. **Validated features:** Which browsers/devices tested?
2. **Performance:** Average regeneration times observed
3. **Edge cases:** Any lessons that failed or behaved unexpectedly?
4. **Confidence level:** 0-100% confidence in the implementation
5. **Next steps:** Phase 3C enhancements or different features?

