

# Plan: Save and Delete Chat History in "Demander à Jude" Drawer

## Overview

Currently, the chat messages in the AskJudeDrawer are stored only in React state and are lost when:
- The user navigates to a different exercise
- The user closes and reopens the drawer
- The page is refreshed

We will persist these messages to the database so users can:
1. Return to previous conversations when revisiting an exercise
2. Delete their chat history when desired

---

## Database Design

### New Table: `exam_tutor_chats`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Unique message ID |
| `session_id` | uuid (FK) | Links to `exam_practice_sessions.id` |
| `exercise_id` | uuid (FK) | Links to `exam_exercises.id` |
| `user_id` | uuid (FK) | The user who owns this message |
| `role` | text | `'user'` or `'assistant'` |
| `content` | text | The message text |
| `blocks` | jsonb | Structured content blocks (for assistant responses) |
| `created_at` | timestamptz | When the message was sent |

### RLS Policies

- **SELECT**: Users can view their own messages
- **INSERT**: Users can create their own messages  
- **DELETE**: Users can delete their own messages

---

## Implementation Steps

### Step 1: Create Database Table

```sql
CREATE TABLE public.exam_tutor_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES exam_practice_sessions(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exam_exercises(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  blocks jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX idx_exam_tutor_chats_session_exercise 
  ON exam_tutor_chats(session_id, exercise_id);

-- RLS
ALTER TABLE exam_tutor_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats" ON exam_tutor_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats" ON exam_tutor_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats" ON exam_tutor_chats
  FOR DELETE USING (auth.uid() = user_id);
```

### Step 2: Create Custom Hook for Chat Persistence

**New file**: `src/features/exams/practice/hooks/useExamTutorChat.ts`

```typescript
// Hook responsibilities:
// - Load existing messages for session + exercise on mount
// - Save messages to database when sent
// - Provide delete function for clearing chat history
// - Handle optimistic updates for good UX

export function useExamTutorChat(sessionId: string, exerciseId: string) {
  return {
    messages: ChatMessage[],
    isLoading: boolean,
    saveMessage: (message) => Promise<void>,
    deleteAllMessages: () => Promise<void>,
  }
}
```

### Step 3: Update AskJudeDrawer Component

**File**: `src/features/exams/practice/components/AskJudeDrawer.tsx`

Changes:
1. Accept `sessionId` as a new prop
2. Use `useExamTutorChat` hook instead of local state
3. Add "Clear Chat" button in header with confirmation dialog
4. Load existing messages when drawer opens

```typescript
// Before:
const [messages, setMessages] = useState<ChatMessage[]>([]);

// After:
const { messages, isLoading, saveMessage, deleteAllMessages } = 
  useExamTutorChat(sessionId, exercise.id);
```

### Step 4: Update ExamTutorPanel to Pass Session ID

**File**: `src/features/exams/practice/components/ExamTutorPanel.tsx`

Pass `sessionId` from the session prop to the AskJudeDrawer:

```typescript
<AskJudeDrawer 
  exercise={exercise} 
  sessionId={session.id}  // Add this
  onAskJude={askJude} 
/>
```

---

## UI Changes

### Delete Chat Button

Add a trash icon button in the drawer header that:
1. Shows confirmation dialog: "Supprimer cette conversation?"
2. On confirm, deletes all messages for this exercise
3. Shows toast confirmation

```
┌─────────────────────────────────────┐
│ [Avatar] Demander à Jude    [🗑️]   │
│          Q3 - Conjugaison           │
├─────────────────────────────────────┤
│                                     │
│  [Previous messages load here]      │
│                                     │
└─────────────────────────────────────┘
```

### Loading State

Show skeleton or spinner while loading previous messages.

---

## File Changes Summary

| Operation | File | Description |
|-----------|------|-------------|
| Create | Database migration | New `exam_tutor_chats` table with RLS |
| Create | `src/features/exams/practice/hooks/useExamTutorChat.ts` | Persistence hook |
| Modify | `src/features/exams/practice/components/AskJudeDrawer.tsx` | Use hook, add delete button |
| Modify | `src/features/exams/practice/components/ExamTutorPanel.tsx` | Pass sessionId prop |
| Modify | `src/features/exams/practice/index.ts` | Export new hook |

---

## Data Flow

```text
User opens drawer
      │
      ▼
useExamTutorChat loads messages
(SELECT from exam_tutor_chats WHERE session_id AND exercise_id)
      │
      ▼
Messages displayed in drawer
      │
      ▼
User sends message ─────────────────────────┐
      │                                      │
      ▼                                      ▼
Optimistic update UI                   Save to DB (INSERT)
      │                                      │
      ▼                                      ▼
Call onAskJude (API)               ───────────┘
      │
      ▼
Save assistant response to DB
      │
      ▼
Update UI with response
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | New table, no changes to existing data |
| Works with existing sessions? | Yes | Links via foreign keys |
| 3G optimized? | Yes | Lazy loads only when drawer opens |
| Backward compatible? | Yes | Old sessions work fine, just no history |
| Data cleanup? | Yes | CASCADE delete when session/exercise deleted |

---

## Edge Cases Handled

1. **No previous messages**: Show empty state with prompt
2. **Network error on save**: Show toast, keep message in UI
3. **Network error on load**: Show error state with retry button
4. **Delete confirmation**: Prevent accidental deletion
5. **Same exercise, new session**: Messages are session-scoped

---

## Implementation Time

~45 minutes
- Database migration: 10 min
- useExamTutorChat hook: 15 min
- AskJudeDrawer updates: 15 min
- Testing: 5 min

