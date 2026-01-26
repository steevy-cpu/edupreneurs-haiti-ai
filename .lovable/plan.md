
# Quiz Battle Session Persistence Integration

## Problem Statement

Unlike the Chess module (which has `src/chess/store/chessSession.store.ts`), Quiz Battle lacks session persistence. When a user accidentally:
- Refreshes the page during an active battle
- Navigates away and returns
- Closes and reopens the browser tab

...they lose their game progress and cannot rejoin.

## Current State Analysis

| Feature | Chess | Quiz Battle |
|---------|-------|-------------|
| Session Store | `chessSession.store.ts` | Missing |
| Active Session Detection | On lobby load | Missing |
| Rejoin UI | Toast with "Rejoindre" button | Missing |
| Database State Available | Yes | Yes (but unused for recovery) |

### Database Already Supports Recovery

The `quiz_battles` table stores:
- `status`: `'in_progress'` indicates active game
- `questions`: Full question array (no regeneration needed)
- `current_question_index`: Where the game left off
- `round_started_at`: Timer sync for multiplayer
- `round_answers`: Partial results for score recovery

The `quiz_battle_players` table stores:
- `answers`: User's answered questions with timestamps
- `score`: Running score
- `finished_at`: null = still playing

## Implementation Plan

### 1. Create Quiz Battle Session Store

**New file:** `src/quiz-battle/store/quizBattleSession.store.ts`

```text
Purpose: Mirror the Chess session store pattern
TTL: 30 minutes (shorter than Chess since quiz rounds are faster)
Storage: sessionStorage (survives refresh, not cross-tab)
```

**Interface:**
```typescript
interface QuizBattleSessionState {
  battleId: string;
  mode: 'solo' | 'friend' | 'random';
  joinedAt: number;
  expiresAt: number;
}
```

**Functions:**
- `saveQuizBattleSession(battleId, mode)` - Save when entering gameplay
- `getQuizBattleSession()` - Check for active session
- `clearQuizBattleSession()` - Clear on game completion/abandonment

---

### 2. Save Session on Game Start

**Files to modify:**

**`QuizBattleSolo.tsx` (lines ~169)**
When `setPhase('playing')` is called, also save session:
```typescript
saveQuizBattleSession(battle.id, 'solo');
setPhase('playing');
```

**`QuizBattleMultiplayer.tsx` (lines ~164, ~269, ~306)**
When transitioning to `'playing'` phase:
```typescript
saveQuizBattleSession(battleId, battleMode);
updatePhase('playing');
```

---

### 3. Clear Session on Game End

**`QuizBattleSolo.tsx` (line ~178-179)**
In `handleGameComplete`, clear before setting results:
```typescript
clearQuizBattleSession();
setResult(gameResult);
setPhase('results');
```

**`QuizBattleMultiplayer.tsx` (lines ~324-395)**
In `handleGameComplete`, clear on:
- Abandonment (`wasAbandoned`)
- Opponent abandonment (`opponentAbandoned`)
- Normal completion

---

### 4. Check for Active Session on Quiz Battle Hub

**File:** `src/pages/QuizBattle.tsx`

Add session check in `useEffect` (after line 43):

```typescript
// Check for active session that can be rejoined
const session = getQuizBattleSession();
if (session && userId) {
  // Verify battle still exists and is in_progress
  const { data: battle } = await supabase
    .from('quiz_battles')
    .select('id, mode, status')
    .eq('id', session.battleId)
    .eq('status', 'in_progress')
    .maybeSingle();
  
  if (battle) {
    // Show rejoin toast
    toast.info('Tu as une partie en cours!', {
      action: {
        label: 'Rejoindre',
        onClick: () => {
          if (session.mode === 'solo') {
            navigate(`/quiz-battle/solo?resume=${session.battleId}`);
          } else {
            navigate(`/quiz-battle/multiplayer/${session.battleId}`);
          }
        },
      },
      duration: 10000,
    });
  } else {
    // Battle no longer valid, clear stale session
    clearQuizBattleSession();
  }
}
```

---

### 5. Solo Mode: Resume from Database State

**File:** `QuizBattleSolo.tsx`

Add resume detection in `useEffect` (after line 84):

```typescript
// Check for resume parameter
const searchParams = new URLSearchParams(window.location.search);
const resumeBattleId = searchParams.get('resume');

if (resumeBattleId) {
  // Load battle state from database
  const { data: battle } = await supabase
    .from('quiz_battles')
    .select('*, quiz_battle_players(*)')
    .eq('id', resumeBattleId)
    .single();
  
  if (battle?.status === 'in_progress' && battle.questions?.length > 0) {
    // Find player's progress
    const playerData = battle.quiz_battle_players?.find(p => p.user_id === user.id);
    const answeredCount = playerData?.answers?.length || 0;
    
    setBattleId(battle.id);
    setQuestions(battle.questions);
    setSelectedSubject(battle.subject_id);
    setSelectedGrade(battle.grade_level);
    setSelectedDifficulty(battle.difficulty);
    
    // Resume from where they left off
    // Note: BattleGameplay will need modification to accept initialIndex
    setPhase('playing');
    toast.success(`Partie reprise - Question ${answeredCount + 1}/${battle.questions.length}`);
    return;
  } else {
    clearQuizBattleSession();
    toast.error('Cette partie n\'est plus disponible');
  }
}
```

---

### 6. Modify BattleGameplay to Support Resume

**File:** `src/components/quiz-battle/BattleGameplay.tsx`

Add optional props for resuming:

```typescript
interface BattleGameplayProps {
  questions: BattleQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  onComplete: (result: BattleResult) => void;
  // New props for resume
  initialIndex?: number;
  previousAnswers?: BattleResult['answers'];
}
```

Update initial state:
```typescript
const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
const [answers, setAnswers] = useState<BattleResult['answers']>(previousAnswers || []);
```

---

### 7. Multiplayer Mode: Automatic Recovery

**File:** `QuizBattleMultiplayer.tsx`

Multiplayer already loads battle state from database on mount (lines 96-106). The existing logic handles recovery well because:
- It fetches `battle.questions` from DB
- It checks `battle.status` before proceeding
- It redirects if battle is already completed

Only change needed: Save session when entering `'playing'` phase so the hub can detect it.

---

## File Structure

```text
src/
├── quiz-battle/
│   └── store/
│       └── quizBattleSession.store.ts  ← NEW
├── pages/
│   ├── QuizBattle.tsx                   ← MODIFY (add rejoin detection)
│   ├── QuizBattleSolo.tsx               ← MODIFY (save/clear/resume)
│   └── QuizBattleMultiplayer.tsx        ← MODIFY (save/clear)
└── components/
    └── quiz-battle/
        └── BattleGameplay.tsx           ← MODIFY (add resume props)
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - additive changes only |
| Works with existing data? | Yes - uses existing DB columns |
| 3G optimized? | Yes - single DB query for resume check |
| Backward compatible? | Yes - resume params are optional |
| Edge cases handled? | Yes - stale session cleanup |

---

## Edge Cases Handled

1. **Stale session in storage**: Verified against DB before showing rejoin
2. **Battle already completed**: Cleared from session, user continues normally
3. **Battle cancelled by opponent (multiplayer)**: Existing redirect logic handles this
4. **Multiple tabs**: sessionStorage is tab-scoped, no conflicts
5. **Session expiry**: 30-minute TTL prevents zombie sessions

---

## User Experience Flow

```text
User starts Solo Quiz
    ↓
Session saved to sessionStorage
    ↓
User accidentally refreshes page
    ↓
Lands on /quiz-battle hub
    ↓
Hub detects active session
    ↓
Toast: "Tu as une partie en cours!" [Rejoindre]
    ↓
User clicks → Navigates to /quiz-battle/solo?resume=battleId
    ↓
QuizBattleSolo loads battle from DB
    ↓
Resumes at question where user left off
```
