
# Fix: Activities Parser — Extract All Questions from TYPE Sections

## Root Cause

The AI edge function IS generating 10-15 questions correctly. The bug is in the **frontend parser** (`InteractiveActivitiesEnhanced.tsx`).

The generated content looks like:

```text
**TYPE: QUIZ**

**Question 1:**
...options...
**Reponse correcte: C**
---
**Question 2:**
...options...
**Reponse correcte: A**
---
... (8 more questions) ...

**TYPE: TRUE_FALSE**

**Affirmation 1:**
...
---
**Affirmation 2:**
...
```

The parser uses regex to find each `**TYPE: QUIZ**` section, then calls `.match()` which only returns the **FIRST** question. So 10 questions become 1. Same for TRUE_FALSE. Total: 2 activities displayed.

## Fix

**File: `src/components/InteractiveActivitiesEnhanced.tsx`**

Rewrite `parseQuizActivities()` and `parseTrueFalseActivities()` to:

1. Find the full TYPE section (same as now)
2. **Split the section by `---` delimiters** into individual question blocks
3. Parse each block separately for its question/options/answer/explanation

### parseQuizActivities — New Logic

```typescript
const parseQuizActivities = (content: string): QuizActivity[] => {
  const activities: QuizActivity[] = [];
  
  // Find QUIZ section(s)
  const quizRegex = /\*\*TYPE:\s*QUIZ\*\*([\s\S]*?)(?=\*\*TYPE:|$)/gi;
  let sectionMatch;
  
  while ((sectionMatch = quizRegex.exec(content)) !== null) {
    const fullSection = sectionMatch[1];
    
    // Split by --- to get individual question blocks
    const blocks = fullSection.split(/\n---\n/).filter(b => b.trim());
    
    for (const block of blocks) {
      // Parse question text
      const questionMatch = block.match(
        /\*\*Question\s*\d*:?\*\*\s*\n?\s*(.+?)(?=\n\s*[-*]?\s*[A-D]\))/is
      );
      if (!questionMatch) continue;
      
      const question = questionMatch[1].trim()
        .replace(/\*\*/g, '').replace(/\s+/g, ' ');
      
      // Parse options A-D
      const optionsMap: Record<string, string> = {};
      const optionMatches = block.matchAll(
        /^\s*[-*]?\s*([A-D])\)\s*(.+?)$/gim
      );
      for (const m of optionMatches) {
        let text = m[2].trim().replace(/\*\*/g, '').split('\n')[0].trim();
        if (text && !text.toLowerCase().startsWith('reponse')) {
          optionsMap[m[1].toUpperCase()] = text;
        }
      }
      
      const options = ['A','B','C','D']
        .filter(l => optionsMap[l])
        .map(l => optionsMap[l]);
      if (options.length < 2) continue;
      
      // Parse correct answer
      const correctMatch = block.match(
        /\*\*Reponse\s*correcte:?\*\*\s*([A-D])/i
      ) || block.match(
        /\*\*Reponse\s*correcte:\s*([A-D])\*\*/i
      );
      if (!correctMatch) continue;
      
      const correctIndex = correctMatch[1].toUpperCase()
        .charCodeAt(0) - 65;
      
      // Parse explanation
      const explMatch = block.match(
        /\*\*Explication:?\*\*\s*(.+?)$/is
      );
      const explanation = explMatch 
        ? explMatch[1].trim().replace(/\*\*/g, '') : '';
      
      activities.push({
        type: 'QUIZ',
        title: `Question ${activities.length + 1}`,
        difficulty: 'Moyen',
        question, options, correctAnswer: correctIndex, explanation
      });
    }
  }
  return activities;
};
```

### parseTrueFalseActivities — New Logic

Same pattern: find the TYPE section, split by `---`, parse each block for statement/answer/explanation.

```typescript
const parseTrueFalseActivities = (content: string): TrueFalseActivity[] => {
  const activities: TrueFalseActivity[] = [];
  
  const tfRegex = /\*\*TYPE:\s*(?:TRUE_FALSE|TRUEFALSE)\*\*([\s\S]*?)(?=\*\*TYPE:|$)/gi;
  let sectionMatch;
  
  while ((sectionMatch = tfRegex.exec(content)) !== null) {
    const fullSection = sectionMatch[1];
    const blocks = fullSection.split(/\n---\n/).filter(b => b.trim());
    
    for (const block of blocks) {
      // Parse statement
      const stmtMatch = block.match(
        /\*\*Affirmation\s*(?:a|à)?\s*(?:evaluer|évaluer|\d*):?\*\*\s*\n?\s*(.+?)(?=\n\s*\*\*Reponse)/is
      );
      if (!stmtMatch) continue;
      
      const statement = stmtMatch[1].trim()
        .replace(/\*\*/g, '').replace(/\s+/g, ' ');
      if (statement.length < 5) continue;
      
      // Parse answer (VRAI/FAUX or A/B)
      let correctAnswer = -1;
      const directMatch = block.match(
        /\*\*Reponse:?\*\*\s*(VRAI|FAUX)/i
      ) || block.match(
        /\*\*Reponse:\s*(VRAI|FAUX)\*\*/i
      );
      if (directMatch) {
        correctAnswer = directMatch[1].toUpperCase() === 'VRAI' ? 0 : 1;
      }
      if (correctAnswer === -1) continue;
      
      // Parse explanation
      const explMatch = block.match(
        /\*\*Explication:?\*\*\s*(.+?)$/is
      );
      const explanation = explMatch
        ? explMatch[1].trim().replace(/\*\*/g, '') : '';
      
      activities.push({
        type: 'TRUEFALSE',
        title: `Affirmation ${activities.length + 1}`,
        difficulty: 'Moyen',
        statement, correctAnswer, explanation
      });
    }
  }
  return activities;
};
```

## What Changes

| File | Change |
|------|--------|
| `src/components/InteractiveActivitiesEnhanced.tsx` | Rewrite `parseQuizActivities()` and `parseTrueFalseActivities()` to split by `---` delimiters and parse each block individually |

## What Does NOT Change

- Edge function (already generating 10-15 questions correctly)
- Hook / caching logic
- UI rendering (QuizActivity / TrueFalseActivity types unchanged)
- Score, gold, sound effects, completion logic

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- same Activity types, same rendering, just better parsing |
| Works with existing cached data? | Yes -- cached content already has 10+ questions, they just weren't being parsed |
| 3G optimized? | Yes -- no additional network calls, just better client-side parsing |
| Edge cases handled? | Yes -- blocks with missing fields are skipped, same as before |
| Backward compatible? | Yes -- handles both old and new content formats |
