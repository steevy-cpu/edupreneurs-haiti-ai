

# Games Plan A — Critical Bugs and Security Fixes

## Fix 1: XP Formula Mismatch

**Problem:** Client uses `100 * level^1.5` (iterative accumulation), DB uses `floor(sqrt(xp/100))` (direct formula). Levels displayed in the UI may not match what the DB stores.

**Change:** Replace the entire `calculateLevel`, `getXpForLevel`, `getXpToNextLevel`, and `getLevelProgress` functions in `src/lib/quizBattleUtils.ts` to match the DB formulas:

- `calculateLevel(xp)` = `Math.max(1, Math.floor(Math.sqrt(xp / 100)))`
- `xpForLevel(level)` = `100 * level * level`
- Derived functions (`getXpToNextLevel`, `getLevelProgress`) updated accordingly

**Callers verified (all import from `quizBattleUtils.ts` -- no inline calculations found):**
- `src/pages/QuizBattleSolo.tsx` (line 298)
- `src/pages/QuizBattleMultiplayer.tsx` (line 510)
- `src/pages/QuizBattleLeaderboard.tsx` (line 158)
- `src/components/quiz-battle/BattleLeaderboardPreview.tsx` (line 54)
- `src/components/quiz-battle/BattleStatsCard.tsx` (lines 30-32)

No code changes needed in callers -- they all use the shared functions.

**Files changed:** `src/lib/quizBattleUtils.ts` only.

---

## Fix 2: Stale Games Cleanup

**Problem:** 8 quiz battles stuck `in_progress`, 1 chess match stuck `playing`, no server-side cleanup.

**Steps:**
1. Create `cleanup_stale_games()` DB function via migration (exact SQL from user request)
2. Run it immediately via insert tool to clean existing stale records
3. In `src/hooks/useMultiplayerBattle.ts` -- replace the ~40-line fragmented client-side cleanup at the start of `joinMatchmaking()` with a single `supabase.rpc('cleanup_stale_games')` call
4. In `src/hooks/useQuizInvitations.ts` -- replace similar client-side cleanup with the same RPC call
5. In `src/hooks/useChessMultiplayer.ts` -- add `supabase.rpc('cleanup_stale_games')` at the start of `createMatch()`

**Files changed:** Migration SQL, `useMultiplayerBattle.ts`, `useQuizInvitations.ts`, `useChessMultiplayer.ts`.

---

## Fix 3: Tighter UPDATE RLS on chess_matches

**Problem:** Current policy `Participants can update matches` allows any participant to UPDATE any column (winner_id, status, etc.) directly, bypassing SECURITY DEFINER RPCs.

**Direct client-side `.update()` calls on `chess_matches` found:**
1. `useChessMultiplayer.ts:611` -- `status: 'cancelled'` on own match while `status = 'waiting'` (host cancelling before opponent joins)

This is the ONLY direct update. All other mutations go through RPCs (`submit_chess_move`, `end_chess_match`, `join_chess_match`).

**New policies for chess_matches:**
- **"Host can cancel waiting match"** -- allows white_player_id to set status to cancelled when match is waiting
- **"Players can join chess matches"** -- allows setting black_player_id when match is waiting (covers `join_chess_match` RPC which runs as SECURITY DEFINER, but also provides belt-and-suspenders if any client path exists)
- **"Players can request rematch"** -- allows setting rematch_requested_by on completed matches

**quiz_battles UPDATE policy:** The existing policy (`created_by OR is_battle_participant`) is already appropriately scoped. No change needed -- it matches the user's proposed SQL exactly.

**Files changed:** Migration SQL only.

---

## Safety Verification

| Check | Status |
|---|---|
| `calculateLevel()` matches DB `level_from_xp()` | Will match after fix |
| Existing DB-stored levels unaffected | Yes -- DB trigger already uses correct formula |
| All 5 callers use shared function (no inline calc) | Verified -- all import from quizBattleUtils |
| 8 stale quiz battles cleaned up | Will be cleaned by immediate RPC call |
| 1 stale chess match cleaned up | Will be cleaned by immediate RPC call |
| `cleanup_stale_games()` called at matchmaking start | Yes -- replaces fragmented client cleanup |
| `cancelMatch` still works with new RLS | Yes -- new policy allows host to cancel waiting match |
| `submit_chess_move` RPC unaffected | Yes -- runs as SECURITY DEFINER |
| `end_chess_match` RPC unaffected | Yes -- runs as SECURITY DEFINER |
| `join_chess_match` RPC unaffected | Yes -- runs as SECURITY DEFINER |
| Quiz battle updates still work | Yes -- existing policy already scoped correctly |
| No new dependencies added | Correct |
| Plan A/B/C feed code untouched | Correct |

