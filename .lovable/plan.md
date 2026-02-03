
# Structured Plan: Question Type Detection System + Specialized UIs

## Overview

This plan establishes a **well-structured architecture** for detecting and rendering different question types. Instead of adding ad-hoc detection logic to `AnswerInput.tsx`, we'll create a **Question Type Detection System** that cleanly separates:

1. **Detection Logic** - Pattern recognition algorithms
2. **Type-Specific Renderers** - Specialized UI components
3. **Orchestration** - Smart component that routes to the right renderer

---

## Current State Analysis

**Database Statistics:**
| Detected Type | Count | Current UI |
|--------------|-------|------------|
| MCQ | 500 | ✅ Tappable cards |
| Short Answer | 1,062 | ⚠️ Small textarea |
| Matching | 16 | ❌ Falls back to textarea |
| Essay (multi-part) | 23 | ❌ Falls back to small textarea |

**Matching Question Patterns Found:**
- `"Column A: ... Column B: ..."` (English)
- `"Kolòn A: ... Kolòn B: ..."` (Creole)
- `"Asosye..."` (Creole for "Match...")
- `"Relie..."` (French for "Connect...")
- `"Colonne A ... Colonne B"` (French)

**Essay Question Patterns Found:**
- High point values (25-70 points)
- Multi-part questions with `a)`, `b)`, `c)` structure
- Keywords: "Développe", "rédaction", "paragraphe", "lignes"
- Concept tags like "Production écrite"

---

## Architecture Design

```text
┌─────────────────────────────────────────────────────────────┐
│                    AnswerInput.tsx                          │
│              (Orchestrator - Routes to Renderer)            │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               detectQuestionType()                          │
│          (Pure function - Pattern Detection)                │
│                                                             │
│  Returns: 'mcq' | 'matching' | 'essay' | 'short'           │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┬──────────────┐
          ▼               ▼               ▼              ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
   │ MCQInput   │  │MatchingUI  │  │ EssayInput │  │ ShortInput │
   │ (existing) │  │   (new)    │  │   (new)    │  │ (existing) │
   └────────────┘  └────────────┘  └────────────┘  └────────────┘
```

---

## File Structure (New Files)

```text
src/features/exams/practice/
├── components/
│   ├── AnswerInput.tsx          # Modified: orchestrates renderers
│   ├── inputs/                  # NEW FOLDER
│   │   ├── index.ts             # Barrel exports
│   │   ├── MCQInput.tsx         # Extracted from AnswerInput
│   │   ├── MatchingInput.tsx    # NEW: Matching question UI
│   │   ├── EssayInput.tsx       # NEW: Long-form answer UI
│   │   └── ShortInput.tsx       # Extracted from AnswerInput
│   └── ...
├── utils/                       # NEW FOLDER
│   ├── index.ts                 # Barrel exports
│   ├── detectQuestionType.ts    # NEW: Type detection logic
│   └── parseMatching.ts         # NEW: Matching column parser
├── types.ts                     # Modified: add answer types
└── index.ts                     # Modified: export new items
```

---

## Implementation Details

### 1. Question Type Detection (`detectQuestionType.ts`)

A pure function that analyzes exercise data and returns the appropriate type:

```typescript
export type QuestionType = 'mcq' | 'matching' | 'essay' | 'short';

export function detectQuestionType(exercise: ExerciseForRunner): QuestionType {
  // Priority 1: Has options → MCQ
  if (hasOptions(exercise)) {
    return 'mcq';
  }
  
  // Priority 2: Matching patterns in text
  if (isMatchingQuestion(exercise.question_text)) {
    return 'matching';
  }
  
  // Priority 3: Essay indicators
  if (isEssayQuestion(exercise)) {
    return 'essay';
  }
  
  // Default: Short answer
  return 'short';
}
```

**Matching Detection Patterns:**
```typescript
const MATCHING_PATTERNS = [
  /Kol[òo]n\s*A.*Kol[òo]n\s*B/is,  // Creole
  /Column\s*A.*Column\s*B/is,       // English
  /Colonne\s*A.*Colonne\s*B/is,     // French
  /Asosye\s+.*ak\s+/i,              // "Associate X with Y"
  /Relie\s+.*[àa]\s+/i,             // "Connect X to Y"
  /Match\s+.*to\s+/i,               // English match
];
```

**Essay Detection Logic:**
```typescript
function isEssayQuestion(exercise: ExerciseForRunner): boolean {
  const { question_text, points, concept } = exercise;
  
  // High point value indicates essay
  if (points >= 25) return true;
  
  // Concept-based detection
  if (concept?.toLowerCase().includes('production écrite')) return true;
  if (concept?.toLowerCase().includes('rédaction')) return true;
  
  // Keyword detection
  const essayKeywords = [
    /développe/i, /rédaction/i, /paragraphe/i,
    /\d+\s*(à|a)\s*\d+\s*lignes/i,  // "15 à 20 lignes"
    /multi-part/i, /a\)\s*.*b\)\s*/s  // Has a) b) structure
  ];
  
  return essayKeywords.some(pattern => pattern.test(question_text));
}
```

---

### 2. Matching Input Component (`MatchingInput.tsx`)

**Features:**
- Auto-parse columns from question text
- Two-column tap interface
- Visual match connections
- Mobile-optimized tap targets

**Parsing Algorithm:**
```typescript
interface ParsedMatching {
  columnA: Array<{ id: string; text: string }>;  // id: "1", "2", "3"
  columnB: Array<{ id: string; text: string }>;  // id: "a", "b", "c"
}

function parseMatchingColumns(text: string): ParsedMatching | null {
  // 1. Split text into Column A and Column B sections
  // 2. Extract numbered items (1, 2, 3...) for Column A
  // 3. Extract lettered items (a, b, c...) for Column B
  // 4. Return structured data or null if parsing fails
}
```

**UI Behavior:**
1. Display Column A items on left, Column B on right
2. User taps a number → it highlights
3. User taps a letter → connection is made
4. Matched pairs show visual indicator (badge/line)
5. Tap matched number again to change selection
6. "Vérifier" button enabled when all matched

**Answer Format:** `"1-a, 2-c, 3-b, 4-d"` (sorted, comma-separated)

---

### 3. Essay Input Component (`EssayInput.tsx`)

**Features:**
- Full-height expandable textarea
- Word/character count display
- Auto-save draft (localStorage)
- Clear section separators for multi-part (a, b, c)
- "Soumettre" (Submit) with confirmation

**UI Design:**
```text
┌─────────────────────────────────────────────────┐
│  Ta réponse:                      250 mots / ~  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Full-height textarea with larger font]        │
│                                                 │
│                                                 │
│                                                 │
│                                                 │
├─────────────────────────────────────────────────┤
│  💡 Tip: Pour les questions à plusieurs        │
│     parties, sépare tes réponses avec a), b)   │
├─────────────────────────────────────────────────┤
│                       [Soumettre la réponse]    │
└─────────────────────────────────────────────────┘
```

**Essay-Specific UX:**
- Min height: 200px (vs 60px for short)
- Max height: 400px (vs 200px for short)
- Larger font size for readability
- Word count badge
- Draft auto-save every 30 seconds

---

### 4. Updated AnswerInput Orchestrator

The main `AnswerInput.tsx` becomes a clean orchestrator:

```typescript
export function AnswerInput(props: AnswerInputProps) {
  const questionType = detectQuestionType(props.exercise);
  
  switch (questionType) {
    case 'mcq':
      return <MCQInput {...props} />;
    case 'matching':
      return <MatchingInput {...props} />;
    case 'essay':
      return <EssayInput {...props} />;
    case 'short':
    default:
      return <ShortInput {...props} />;
  }
}
```

---

## Type Updates (`types.ts`)

```typescript
// Extended answer type for different question formats
export type AnswerType = 'mcq' | 'short' | 'matching' | 'essay';

export interface TutorActionPayload {
  action: TutorActionType;
  exercise_id: string;
  answer?: {
    type: AnswerType;  // Extended from 'mcq' | 'short'
    value: string;
  };
  // ...
}
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `utils/detectQuestionType.ts` | Create | Detection algorithm |
| `utils/parseMatching.ts` | Create | Column parsing utility |
| `utils/index.ts` | Create | Barrel exports |
| `components/inputs/MCQInput.tsx` | Create | Extract MCQ logic |
| `components/inputs/ShortInput.tsx` | Create | Extract short answer logic |
| `components/inputs/MatchingInput.tsx` | Create | New matching UI |
| `components/inputs/EssayInput.tsx` | Create | New essay UI |
| `components/inputs/index.ts` | Create | Barrel exports |
| `components/AnswerInput.tsx` | Modify | Slim orchestrator |
| `types.ts` | Modify | Add `AnswerType` |
| `index.ts` | Modify | Export utils |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing MCQ? | No | Extracted, not rewritten |
| Breaks existing short? | No | Extracted, not rewritten |
| Works with database data? | Yes | Pattern-based detection |
| 3G optimized? | Yes | No animations, lazy renders |
| Backward compatible? | Yes | Fallback to short answer |
| Edge cases handled? | Yes | Parsing fallback included |

---

## Implementation Order

**Phase 1: Foundation (~30 min)**
1. Create `utils/` folder with detection logic
2. Create `components/inputs/` folder
3. Extract MCQ and Short into separate files
4. Update `AnswerInput.tsx` to orchestrate

**Phase 2: Matching UI (~45 min)**
1. Build `parseMatching.ts` utility
2. Build `MatchingInput.tsx` component
3. Test with real matching questions

**Phase 3: Essay UI (~30 min)**
1. Build `EssayInput.tsx` component
2. Add word count and auto-save
3. Test with high-point questions

**Phase 4: Polish (~15 min)**
1. Update barrel exports
2. Test all question types end-to-end
3. Verify mobile responsiveness

---

## Edge Case Handling

**Matching:**
- If column parsing fails → Fall back to ShortInput
- If unequal columns → Allow partial matches
- Handle different numbering (1. vs 1) vs (1-)

**Essay:**
- Multi-part detection (a, b, c in text)
- Draft persistence on page navigation
- Handle very long responses (scroll behavior)

**Detection Conflicts:**
- MCQ always wins (explicit options)
- Matching > Essay (more specific pattern)
- Short is the safe fallback
