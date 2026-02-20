

# Games Plan B -- Performance Fixes

## Fix 1: Add Missing Index on quiz_battle_weekly_xp

**Problem:** Leaderboard queries by `week_start` and sorts by `xp_earned` with no supporting index.

**Change:** Migration to add a composite index:
```sql
CREATE INDEX IF NOT EXISTS idx_quiz_battle_weekly_xp_week_start
ON quiz_battle_weekly_xp(week_start, xp_earned DESC);
```

**Files changed:** Migration SQL only.

---

## Fix 2: Fix N+1 in useQuizInvitations.ts

**Problem:** Lines 66-78 fetch N invitations then fire 2N separate queries (one for sender profile, one for subject per invitation).

**Approach:** Supabase relation syntax works for `subjects` (FK exists) but NOT for `profiles` via `sender_id` (no FK relationship defined). Instead of adding FKs (which would require a migration and affect the profiles table), we batch the lookups:

1. Fetch all pending invitations in one query (already done)
2. Collect unique `sender_id` values and fetch all sender profiles in ONE `.in()` query
3. Collect unique `subject_id` values and fetch all subjects in ONE `.in()` query
4. Map results back to invitations client-side

This reduces 2N+1 queries to exactly 3 queries regardless of invitation count.

**Files changed:** `src/hooks/useQuizInvitations.ts` -- `fetchPendingInvitations` function only.

---

## Fix 3: Fix Chess Realtime Channel Churn

**Problem:** The realtime useEffect at line 286 depends on `[match?.id, enabled, userId, opponent, fetchOpponent, fetchChatMessages]`. The `opponent` and callback dependencies cause unnecessary channel teardown/recreation.

**Change:** Use the callbackRef pattern:
- Store `fetchOpponent` and `fetchChatMessages` in refs that update every render
- Store `opponent` in a ref for use inside the subscription callback
- Remove `opponent`, `fetchOpponent`, and `fetchChatMessages` from the useEffect dependency array
- The subscription now only recreates when `match?.id`, `enabled`, or `userId` changes

**Files changed:** `src/hooks/useChessMultiplayer.ts` -- add refs near line 180, update useEffect at lines 286-358.

---

## Fix 4: Move Invite Code Generation to DB Functions

**Problem:** Both chess and quiz generate 6-char invite codes client-side. The DB already has `generate_chess_invite_code()` and `generate_invite_code()` functions with uniqueness guaranteed by indexes.

**Changes:**

1. **`src/hooks/useChessMultiplayer.ts`** -- In `createMatch()` (line 377):
   - Replace `const inviteCode = generateInviteCode()` with `const { data: inviteCode } = await supabase.rpc('generate_chess_invite_code')`
   - Remove the client-side `generateInviteCode` function (lines 93-101)

2. **`src/hooks/useMultiplayerBattle.ts`** -- In `createPrivateBattle()` (line 245):
   - Replace `const code = generateInviteCode()` with `const { data: code } = await supabase.rpc('generate_invite_code')`
   - Remove the client-side `generateInviteCode` function (lines 54-61)

**Files changed:** `src/hooks/useChessMultiplayer.ts`, `src/hooks/useMultiplayerBattle.ts`.

---

## Fix 5: Remove TypeScript `any` Cast in useQuizInvitations.ts

**Problem:** Line 33 uses `(supabase as any).from('quiz_battle_invitations')` even though the table exists in the generated types.

**Change:** Remove the `invitationsTable` helper entirely. Replace all calls to `invitationsTable()` with direct `supabase.from('quiz_battle_invitations')` calls throughout the file. This gives full type safety on selects, inserts, and updates.

**Affected calls:**
- Line 56 (fetchPendingInvitations)
- Line 86 (fetchSentInvitation)
- Line 124 (sendInvitation -- existing check)
- Line 143 (sendInvitation -- insert)
- Line 169 (declineInvitation)
- Line 178 (cancelInvitation)

Also remove the `(supabase.rpc as any)` cast on `cleanup_stale_games` (line 46) since this RPC is now in the generated types.

**Files changed:** `src/hooks/useQuizInvitations.ts`.

---

## Safety Verification

| Check | Status |
|---|---|
| Leaderboard query benefits from new index | Yes -- composite index on (week_start, xp_earned DESC) |
| Invitation fetch reduced from 2N+1 to 3 queries | Yes -- batch .in() for profiles and subjects |
| Chess realtime recreates only on match ID/user/enabled | Yes -- callbacks and opponent moved to refs |
| Chess invite codes generated server-side via RPC | Yes -- generate_chess_invite_code() |
| Quiz invite codes generated server-side via RPC | Yes -- generate_invite_code() |
| TypeScript any cast removed from invitations | Yes -- table exists in generated types |
| cleanup_stale_games any cast removed | Yes -- RPC exists in generated types |
| No Plan A code touched | Correct -- only performance improvements |
| No new dependencies added | Correct |
| No DB columns added or removed | Correct (index only) |

