

# Automated Quiz Format Conversion Plan

## Summary

I can handle this **automatically without your intervention**. Here's what I'll do:

---

## What Needs Fixing

| Issue | Count | Solution |
|-------|-------|----------|
| **Markdown quizzes** | 113 lessons | Convert to HTML format via SQL |
| **Missing quizzes** | 316 lessons | Cannot auto-generate (requires content creation) |
| **Invalid quiz content** | 36 lessons | Clear invalid data, mark for regeneration |

---

## What I Can Do Automatically

### 1. Convert Markdown → HTML (113 lessons)

Create a database function that parses the Markdown quiz format:
```
## ✅ Quiz Final
### Question 1
Question text here?
A) Option A
B) Option B
C) Option C
D) Option D
### Réponse correcte: B
### Explication
Explanation text...
```

And converts it to the expected HTML format:
```html
<div class="quiz-container">
  <div class="quiz-question" data-number="1">
    <h3>Question 1</h3>
    <p>Question text here?</p>
    <div class="quiz-options">
      <div class="option" data-answer="A">A) Option A</div>
      <div class="option" data-answer="B">B) Option B</div>
      ...
    </div>
    <div class="correct-answer" data-correct="B">
      <p><strong>Réponse correcte: B</strong></p>
      <p>Explanation text...</p>
    </div>
  </div>
</div>
```

### 2. Clean Up Invalid Entries (36 lessons)

Set `quiz_final = NULL` for entries that contain error messages like:
- "Veuillez fournir le contenu..."
- "Il semblerait que le contenu soit incomplet..."

This ensures the UI shows "Aucun quiz disponible" instead of broken content.

---

## What Cannot Be Automated

**Missing quizzes (316 lessons)** - These require actual content generation. Options:
1. Use the content editor's AI quiz generator to create them one-by-one
2. Create a batch generation tool (future feature)
3. Prioritize by grade (NS2 has 221 missing - the biggest gap)

---

## Implementation Steps

1. **Create PostgreSQL function** `convert_markdown_quiz_to_html()` that parses and converts the format
2. **Run UPDATE** on lessons with Markdown quizzes
3. **Clean invalid entries** by setting them to NULL
4. **Verify** conversion worked correctly

---

## Technical Details

The conversion function will:
- Extract questions using regex: `### Question (\d+)`
- Extract options: `^([A-D])\)\s*(.+)$`
- Extract correct answer: `### Réponse correcte:\s*([A-D])`
- Extract explanation: text after `### Explication`
- Build proper HTML structure with all required data attributes

---

## Expected Results

| Before | After |
|--------|-------|
| 113 Markdown quizzes | 113 HTML quizzes (working) |
| 36 invalid entries | 36 cleared (shows "no quiz") |
| 316 missing | Still 316 missing (requires content) |

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Conversion errors | Run on test batch first, verify parsing |
| Data loss | Keep backup of original content in `lesson_versions` table |
| Partial questions | Validate question has 4 options before converting |

---

**Ready to proceed?** Approve this plan and I'll execute the conversion automatically.

