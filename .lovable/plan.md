
# ExamHub UX Refactor - Question Runner UI
## Replacing Chat-First with Quiz-First Experience

---

## Current State Analysis

| Component | Lines | Issue |
|-----------|-------|-------|
| `ExamTutorChat.tsx` | 719 | Monolithic: chat + MCQ + navigation + hints all in one |
| `ExamPreparation.tsx` | 363 | Works, but tightly coupled to chat-based tutor |
| `exam-tutor` edge function | Already structured | Returns `blocks`, `actions`, `grading` |

The current UX hides answer options in a collapsible "Options & outils" drawer - students must expand it to see MCQ choices. This is backwards.

---

## Target UX (Simplified)

```text
+----------------------------------+
| ExamTutorPanel                   |
+----------------------------------+
| [Header] Q3/20 - Divisibilité    |
+----------------------------------+
| [Prompt] Calculer 45 mod 7       |  <-- Always visible
+----------------------------------+
| [AnswerInput]                    |
|   (A) 3  (B) 4  (C) 5  (D) 6     |  <-- MCQ tappable cards
|   OR                             |
|   [_________] Vérifier           |  <-- Short answer input
+----------------------------------+
| [FeedbackCard]                   |
|   Correct! +5 points             |  <-- Compact card, not chat
+----------------------------------+
| [ActionRow]                      |
|   [Indice] [Révéler] [Suivant]   |
+----------------------------------+
| [AskJudeDrawer] (collapsed)      |
|   "Demander à Jude" button       |  <-- Opens full chat
+----------------------------------+
```

---

## Component Architecture

```text
src/features/exams/practice/
├── ExamPracticePage.tsx          (page wrapper, replaces ExamPreparation.tsx)
├── components/
│   ├── ExamTutorPanel.tsx        (main container)
│   ├── ExerciseHeader.tsx        (Q#, topic, points badge)
│   ├── ExercisePrompt.tsx        (renders prompt_blocks with KaTeX)
│   ├── AnswerInput.tsx           (MCQ buttons OR short answer input)
│   ├── FeedbackCard.tsx          (compact Jude response card)
│   ├── ActionRow.tsx             (Indice, Révéler, Suivant buttons)
│   └── AskJudeDrawer.tsx         (vaul drawer with full chat)
├── hooks/
│   ├── useExamSession.ts         (session state + persistence)
│   ├── useExercise.ts            (current exercise data)
│   └── useTutorAction.ts         (API calls to exam-tutor)
└── index.ts
```

---

## Phase 1: Core Runner (Minimal Viable)

### 1.1 Create State Machine Types

**File:** `src/features/exams/practice/types.ts`

```typescript
export type RunnerState = 
  | 'idle'        // Prompt shown, waiting for answer
  | 'checking'    // API call in progress
  | 'correct'     // Answer validated, show success
  | 'incorrect'   // Answer wrong, show explanation
  | 'revealed'    // User clicked reveal
  | 'error';      // API error

export interface RunnerContext {
  state: RunnerState;
  hintLevel: number;           // 0-3 progressive hints
  selectedAnswer: string | null;
  feedback: TutorResponse | null;
}
```

### 1.2 Create `useTutorAction` Hook

**File:** `src/features/exams/practice/hooks/useTutorAction.ts`

```typescript
export function useTutorAction(sessionId: string, exerciseId: string) {
  const [state, setState] = useState<RunnerState>('idle');
  const [feedback, setFeedback] = useState<TutorResponse | null>(null);
  const [hintLevel, setHintLevel] = useState(0);

  const checkAnswer = async (answer: string) => {
    setState('checking');
    const { data, error } = await supabase.functions.invoke('exam-tutor', {
      body: { 
        action: 'check', 
        exercise_id: exerciseId, 
        answer: { type: 'mcq', value: answer } 
      }
    });
    if (error) { setState('error'); return; }
    setFeedback(data);
    setState(data.grading?.isCorrect ? 'correct' : 'incorrect');
  };

  const requestHint = async () => {
    setState('checking');
    const newLevel = Math.min(hintLevel + 1, 3);
    const { data } = await supabase.functions.invoke('exam-tutor', {
      body: { action: 'hint', exercise_id: exerciseId, hint_level: newLevel }
    });
    setFeedback(data);
    setHintLevel(newLevel);
    setState('idle');
  };

  const revealAnswer = async () => {
    setState('checking');
    const { data } = await supabase.functions.invoke('exam-tutor', {
      body: { action: 'reveal', exercise_id: exerciseId }
    });
    setFeedback(data);
    setState('revealed');
  };

  const reset = () => {
    setState('idle');
    setFeedback(null);
    setHintLevel(0);
  };

  return { state, feedback, hintLevel, checkAnswer, requestHint, revealAnswer, reset };
}
```

### 1.3 Create Runner Components

**ExerciseHeader.tsx** (~30 lines)
```typescript
// Shows: Q3/20 | Divisibilité | 5 pts
<div className="flex items-center justify-between p-3 border-b">
  <Badge>Q{number}/{total}</Badge>
  <span className="text-sm font-medium">{concept}</span>
  <Badge variant="secondary">{points} pts</Badge>
</div>
```

**ExercisePrompt.tsx** (~25 lines)
```typescript
// Renders prompt_blocks or question_text with KaTeX
<div className="p-4 bg-muted/30 rounded-lg">
  {exercise.prompt_blocks ? (
    <ContentBlocksRenderer blocks={exercise.prompt_blocks} />
  ) : (
    <MathText text={exercise.question_text} />
  )}
</div>
```

**AnswerInput.tsx** (~80 lines)
```typescript
// MCQ: Tappable option cards
// Short answer: Input + Vérifier button
// Disabled when state !== 'idle'
```

**FeedbackCard.tsx** (~50 lines)
```typescript
// Compact card showing Jude's response
// Green border for correct, red for incorrect
// Uses ContentBlocksRenderer for blocks
<Card className={isCorrect ? 'border-green-500' : 'border-red-500'}>
  <div className="flex items-start gap-3 p-4">
    <Avatar src={judeProfile} />
    <ContentBlocksRenderer blocks={feedback.blocks} />
  </div>
</Card>
```

**ActionRow.tsx** (~40 lines)
```typescript
// [Indice] [Révéler] [Suivant]
// Indice disabled when hintLevel >= 3
// Suivant enabled after answer or reveal
<div className="flex gap-2 p-3">
  <Button onClick={onHint} disabled={hintLevel >= 3}>
    <Lightbulb /> Indice {hintLevel > 0 && `(${hintLevel}/3)`}
  </Button>
  <Button onClick={onReveal} variant="secondary">
    <Eye /> Révéler
  </Button>
  <Button onClick={onNext} disabled={!canAdvance}>
    Suivant <ChevronRight />
  </Button>
</div>
```

### 1.4 Create `ExamTutorPanel.tsx`

**File:** `src/features/exams/practice/components/ExamTutorPanel.tsx`

```typescript
export function ExamTutorPanel({ exercise, session, onNext, onPrev }) {
  const { state, feedback, hintLevel, checkAnswer, requestHint, revealAnswer, reset } = 
    useTutorAction(session.id, exercise.id);

  // Reset when exercise changes
  useEffect(() => { reset(); }, [exercise.id]);

  const canAdvance = state === 'correct' || state === 'revealed' || state === 'incorrect';

  return (
    <Card className="flex flex-col h-full">
      <ExerciseHeader 
        number={exercise.exercise_number} 
        total={session.totalExercises}
        concept={exercise.concept}
        points={exercise.points}
      />
      
      <ScrollArea className="flex-1 p-4">
        <ExercisePrompt exercise={exercise} />
        
        <AnswerInput 
          exercise={exercise}
          selectedAnswer={selectedAnswer}
          onSelect={checkAnswer}
          disabled={state !== 'idle'}
          state={state}
        />
        
        {feedback && (
          <FeedbackCard 
            feedback={feedback}
            isCorrect={feedback.grading?.isCorrect}
          />
        )}
      </ScrollArea>
      
      <ActionRow 
        hintLevel={hintLevel}
        onHint={requestHint}
        onReveal={revealAnswer}
        onNext={onNext}
        canAdvance={canAdvance}
        isLoading={state === 'checking'}
      />
    </Card>
  );
}
```

---

## Phase 2: Ask Jude Drawer

### 2.1 Create `AskJudeDrawer.tsx`

Uses `vaul` Drawer for mobile-friendly slide-up:

```typescript
import { Drawer, DrawerContent, DrawerTrigger } from 'vaul';

export function AskJudeDrawer({ exercise, session }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const askJude = async (question: string) => {
    // Call exam-tutor with action: 'ask'
    const { data } = await supabase.functions.invoke('exam-tutor', {
      body: { action: 'ask', exercise_id: exercise.id, question }
    });
    // Append to local messages
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full">
          <MessageCircle /> Demander à Jude
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80vh]">
        {/* Chat interface inside drawer */}
        <ScrollArea className="flex-1 p-4">
          {messages.map(m => <ChatBubble key={m.id} {...m} />)}
        </ScrollArea>
        <ChatInput onSend={askJude} />
      </DrawerContent>
    </Drawer>
  );
}
```

---

## Phase 3: Backend Updates (Minimal)

### 3.1 Update `exam-tutor` to Accept Action Type

Current endpoint already supports structured response. Add explicit `action` handling:

**File:** `supabase/functions/exam-tutor/index.ts`

```typescript
// Add to validation schema
const examTutorSchema = z.object({
  action: z.enum(['check', 'hint', 'reveal', 'ask', 'next']).optional(),
  exercise_id: z.string().uuid().optional(),
  answer: z.object({
    type: z.enum(['mcq', 'short']),
    value: z.string()
  }).optional(),
  hint_level: z.number().min(0).max(3).optional(),
  question: z.string().max(500).optional(),
  // Keep backward compat fields
  exercise: z.any().optional(),
  userMessage: z.string().optional(),
});

// Action-based routing
const action = validatedData.action || 'ask'; // Default to chat for backward compat

switch (action) {
  case 'check':
    // Deterministic validation (already implemented)
    break;
  case 'hint':
    // Generate progressive hint based on hint_level
    break;
  case 'reveal':
    // Return correct answer with explanation
    break;
  case 'ask':
    // Freeform chat (current behavior)
    break;
}
```

### 3.2 Progressive Hint System

```typescript
const HINT_PROMPTS = {
  1: 'Donne un indice qui pointe vers le concept sans révéler la réponse.',
  2: 'Donne un indice plus précis qui élimine certaines mauvaises réponses.',
  3: 'Donne un dernier indice qui mène presque directement à la réponse.'
};
```

---

## File Changes Summary

| Operation | File | Description |
|-----------|------|-------------|
| Create | `src/features/exams/practice/types.ts` | Runner state types |
| Create | `src/features/exams/practice/hooks/useTutorAction.ts` | Action-based API hook |
| Create | `src/features/exams/practice/hooks/useExamSession.ts` | Session state hook |
| Create | `src/features/exams/practice/components/ExerciseHeader.tsx` | Q#/topic header |
| Create | `src/features/exams/practice/components/ExercisePrompt.tsx` | Prompt renderer |
| Create | `src/features/exams/practice/components/AnswerInput.tsx` | MCQ/short answer |
| Create | `src/features/exams/practice/components/FeedbackCard.tsx` | Compact feedback |
| Create | `src/features/exams/practice/components/ActionRow.tsx` | Action buttons |
| Create | `src/features/exams/practice/components/AskJudeDrawer.tsx` | Full chat drawer |
| Create | `src/features/exams/practice/components/ExamTutorPanel.tsx` | Main panel |
| Create | `src/features/exams/practice/index.ts` | Barrel export |
| Modify | `src/pages/ExamPreparation.tsx` | Replace ExamTutorChat with ExamTutorPanel |
| Modify | `supabase/functions/exam-tutor/index.ts` | Add action-based routing |

---

## Implementation Order

| Phase | Task | Est. Time |
|-------|------|-----------|
| 1a | Create types + `useTutorAction` hook | 20 min |
| 1b | Create ExerciseHeader, ExercisePrompt | 15 min |
| 1c | Create AnswerInput (MCQ + short) | 30 min |
| 1d | Create FeedbackCard + ActionRow | 20 min |
| 1e | Create ExamTutorPanel | 25 min |
| 1f | Update ExamPreparation to use new panel | 10 min |
| 2 | Create AskJudeDrawer | 30 min |
| 3 | Update exam-tutor for action routing | 25 min |
| 4 | Deploy + test | 10 min |

**Total: ~3 hours**

---

## Key Simplifications

| User Request | Simplified Approach |
|--------------|---------------------|
| Separate Runner + Ask Jude | Runner is main, Jude is drawer (lazy) |
| Hint ladder (3-level) | `hint_level` param, prompts in edge function |
| State machine | Simple `RunnerState` type, not full FSM |
| PDF jump to page | Deferred to Phase 2 (optional) |
| Conversation persistence | Keep for drawer only, not runner |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Old ExamTutorChat kept, new panel is opt-in |
| Works with existing data? | Yes | Same exercise data structure |
| 3G optimized? | Yes | No chat history on mount, compact feedback |
| Backward compatible? | Yes | `action` param optional, defaults to 'ask' |
| Edge cases handled? | Yes | Error state, loading states, hint limits |
