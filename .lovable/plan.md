

# Games Plan C -- Push Notifications for Game Events

## Fix 1: Chess Join Push (Host Notification)

**Where:** `src/hooks/useChessMultiplayer.ts`, inside `joinMatch()` (lines 420-478)

After the match is successfully joined and `typedMatch` is fetched (line 451), send a push notification to the host (`white_player_id`). The joiner's nickname is needed -- fetch the current user's profile or use `opponent` (but at this point, the joiner IS the current user).

**Implementation:**
- After `fetchOpponent(typedMatch.white_player_id)` at line 456, fetch the current user's nickname from their profile
- Call `supabase.functions.invoke('send-push-notification', ...)` with:
  - `recipientUserId`: `typedMatch.white_player_id`
  - `type`: `'chess_invite'`
  - `title`: `'Quelqu\'un a rejoint ta partie! ♟️'`
  - `body`: `'{joinerNickname} a accepte ton defi d\'echecs. La partie commence!'`
  - `url`: `/chess/multiplayer/${typedMatch.id}`
  - `actorId`: `userId`
- Fire-and-forget (no await blocking the join flow)

**Files changed:** `src/hooks/useChessMultiplayer.ts` -- `joinMatch()` function only.

---

## Fix 2: Chess Move Push (Turn Alert)

**Where:** `src/hooks/useChessMultiplayer.ts`, inside `submitMove()` (lines 536-579)

After `submit_chess_move` RPC succeeds (line 569 `return true`), send a push to the opponent.

**Implementation:**
- Before `return true`, determine the opponent's ID from `matchRef.current`
- Apply the active-player guard: check if `match.last_move_at` is within the last 30 seconds -- if so, skip the push (opponent is likely actively playing)
- Use `opponentRef` to avoid dependency issues
- Call `supabase.functions.invoke('send-push-notification', ...)` with:
  - `recipientUserId`: opponent's user ID
  - `type`: `'chess_move'`
  - `title`: `'A ton tour! ♟️'`
  - `body`: `'{playerName} a joue. C\'est ton tour.'`
  - `url`: `/chess/multiplayer/${match.id}`
  - `actorId`: `userId`
- Fire-and-forget

**Active-player guard logic:**
```text
const lastMoveTime = match.last_move_at ? new Date(match.last_move_at).getTime() : 0;
const opponentSeemActive = (Date.now() - lastMoveTime) < 30000;
if (!opponentSeemActive) { send push }
```

**Files changed:** `src/hooks/useChessMultiplayer.ts` -- `submitMove()` function only.

---

## Fix 3: Quiz Invitation Push

**Where:** `src/hooks/useQuizInvitations.ts`, inside `sendInvitation()` (lines 125-160)

After the in-app notification insert at line 152, add a push notification call.

**Implementation:**
- After `await supabase.from('notifications').insert(...)` at line 152, call `supabase.functions.invoke('send-push-notification', ...)` with:
  - `recipientUserId`: `recipientId`
  - `type`: `'quiz_invite'`
  - `title`: `'Defi Quiz recu! 🧠'`
  - `body`: `'{senderNickname} t\'a defie en Quiz Battle. Accepte le defi!'`
  - `url`: `/quiz-battle`
  - `actorId`: `userId`
- The sender's nickname is available as `recipientNickname`... wait, that's the recipient's name. We need the sender's name. Fetch it from the current user's profile, or pass it. Since the edge function already fetches `actorName` from `actorId`, we can just pass `actorId` and let the edge function handle the body text. But the plan specifies a custom body. We'll fetch the sender's nickname from profiles or rely on the edge function's `actorId` lookup.
- Simplest: pass `actorId: userId` and let the edge function auto-generate the body from the `actorName` lookup when `body` is not provided. But the plan wants a specific body. We can pass the body with `actorId` and let the edge function use it directly since `body` takes precedence.
- Actually, looking at the edge function code, if `body` is provided it's used directly. If not, it auto-generates from type. So we can either: (a) pass a body with the sender's name, or (b) pass no body and let the edge function generate it from `actorId`. Option (b) requires adding `quiz_invite` to the switch statement in the edge function. Option (a) requires knowing the sender's name.
- Best approach: pass `actorId: userId` and no `body`, and add a case for `quiz_invite` in the edge function's body generation switch. This keeps the logic centralized.
- Fire-and-forget

**Files changed:** `src/hooks/useQuizInvitations.ts` -- `sendInvitation()` function only.

---

## Fix 4: Update Edge Function Type Map

**Where:** `supabase/functions/send-push-notification/index.ts`

**Changes to `getCategoryFromType()` (line 95-118):**
Add three new entries:
```
'chess_invite': 'system',
'chess_move': 'system',
'quiz_invite': 'system',
```

`quiz_invite` does NOT already exist in the map -- confirmed by reading lines 95-118.

**Changes to notification body generation switch (around line 230-260):**
Add cases for the three new types:
```
case 'chess_invite':
  notificationBody = `${actorName} a rejoint ta partie d'echecs!`;
  break;
case 'chess_move':
  notificationBody = `${actorName} a joue. C'est ton tour!`;
  break;
case 'quiz_invite':
  notificationBody = `${actorName} t'a defie en Quiz Battle. Accepte le defi!`;
  break;
```

**Files changed:** `supabase/functions/send-push-notification/index.ts` only.

---

## Implementation Order

1. Update edge function type map and body generation (Fix 4) -- deploy first so push calls work
2. Add chess join push in `joinMatch()` (Fix 1)
3. Add chess move push in `submitMove()` (Fix 2)
4. Add quiz invitation push in `sendInvitation()` (Fix 3)

---

## Safety Verification

| Check | Status |
|---|---|
| Chess join push fires to host when opponent joins | Yes -- in joinMatch() after successful RPC |
| Chess move push fires to opponent after each move | Yes -- in submitMove() after successful RPC |
| Active-player guard skips push if opponent moved within 30s | Yes -- checks last_move_at timestamp |
| Quiz invitation push fires to recipient | Yes -- in sendInvitation() after in-app notification |
| chess_invite maps to system category | Yes -- added to getCategoryFromType() |
| chess_move maps to system category | Yes -- added to getCategoryFromType() |
| quiz_invite maps to system category | Yes -- added to getCategoryFromType() |
| Systeme toggle in Settings controls all game pushes | Yes -- all map to 'system' category, checked by edge function |
| No Plan A or Plan B code touched | Correct -- only adding push calls after existing logic |
| No new dependencies added | Correct |
| Push calls are fire-and-forget (no UI blocking) | Correct |

