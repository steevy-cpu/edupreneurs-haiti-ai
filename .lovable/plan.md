

# Fix: Content Flags Incorrectly Counting Placeholder Text as Real Content

## Problem
The `lesson_content_flags` database view considers any text longer than 10 characters as "having content." However, many lessons contain placeholder strings like **"Contenu a venir..."** (18 chars) and **"Exercices a venir..."** (20 chars) that pass this threshold. This causes the content editor to report 204/204 (100%) when at least **29 lessons** in 7AF actually have no real content.

## Solution
Update the `lesson_content_flags` view to exclude known placeholder strings. The check will require content to be longer than 10 characters **AND** not match placeholder patterns.

## Technical Details

### Step 1: Recreate the database view

Drop and recreate `lesson_content_flags` with additional exclusion logic:

```sql
CREATE OR REPLACE VIEW public.lesson_content_flags AS
SELECT 
  id,
  (objectif IS NOT NULL AND length(trim(objectif)) > 10 
    AND trim(objectif) NOT IN ('Contenu à venir...', 'Contenu a venir...')) AS has_objectif,
  (introduction IS NOT NULL AND length(trim(introduction)) > 10 
    AND trim(introduction) NOT IN ('Contenu à venir...', 'Contenu a venir...')) AS has_introduction,
  (contenu IS NOT NULL AND length(trim(contenu)) > 10 
    AND trim(contenu) NOT IN ('Contenu à venir...', 'Contenu a venir...')) AS has_contenu,
  (exemples_exercices IS NOT NULL AND length(trim(exemples_exercices)) > 10 
    AND trim(exemples_exercices) NOT IN ('Exercices à venir...', 'Exercices a venir...', 'Contenu à venir...', 'Contenu a venir...')) AS has_exemples,
  (quiz_final IS NOT NULL AND length(trim(quiz_final)) > 10) AS has_quiz,
  (activites_interactives IS NOT NULL AND length(trim(activites_interactives)) > 10) AS has_activities
FROM lessons;
```

### Step 2: Update `isLessonMissingContent` in contentGenerator.ts

Add the same placeholder exclusion logic to the fallback raw-text check so both paths are consistent:

```typescript
const PLACEHOLDER_PATTERNS = ['Contenu à venir...', 'Contenu a venir...', 'Exercices à venir...', 'Exercices a venir...'];

const isPlaceholderOrEmpty = (field?: string | null): boolean => {
  if (!field || field.trim().length < 10) return true;
  return PLACEHOLDER_PATTERNS.includes(field.trim());
};
```

### No UI changes needed
The `LessonBrowser` already reads `has_contenu`, `has_objectif`, etc. from the view. Once the view is corrected, the stats bar will automatically show the correct count (e.g., 175/204 instead of 204/204) and the "Vide" badges will appear on the affected lessons.

## Impact
- **29 lessons** in 7AF will correctly show as missing content
- Progress bar will update from 100% to the accurate percentage
- "Contenu manquant uniquement" filter will correctly list these lessons
- Batch content generator button will appear with the correct count

## Safety Verification

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- only changes false positives to correct negatives |
| Works with existing data? | Yes -- the view reads existing columns |
| 3G optimized? | No change -- same lightweight query |
| Backward compatible? | Yes -- same flag names and types |
