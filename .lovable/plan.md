
# Clock Synchronization Fix for Timed Chess Games

## Problem Identified
When a user reloads the page or navigates away from the game, the timer resets to the last stored value (`white_time_remaining`/`black_time_remaining`) without accounting for time elapsed since the last move. The `last_move_at` timestamp exists in the database but is not being used to calculate actual remaining time on page load.

**Example:**
- Player A has 4:30 remaining at their last move
- 45 seconds pass, they reload the page
- Timer shows 4:30 instead of the correct 3:45

---

## Solution
Calculate elapsed time since `last_move_at` and subtract it from the stored `time_remaining` when:
1. Loading match data initially
2. Receiving match updates via realtime subscription
3. The game is active (`status === 'playing'`) and it's that player's turn

---

## Implementation

### File: `src/hooks/useChessMultiplayer.ts`

**Add a helper function** to calculate adjusted time based on `last_move_at`:

```typescript
// Helper to calculate actual remaining time accounting for elapsed time
const calculateActualTimeRemaining = (
  storedTime: number | null,
  lastMoveAt: string | null,
  isActivePlayersTurn: boolean
): number | null => {
  if (storedTime === null || !lastMoveAt || !isActivePlayersTurn) {
    return storedTime;
  }
  
  const lastMoveTime = new Date(lastMoveAt).getTime();
  const now = Date.now();
  const elapsedSeconds = Math.floor((now - lastMoveTime) / 1000);
  
  return Math.max(0, storedTime - elapsedSeconds);
};
```

**Modify the `refreshMatch` function** (around line 223-240) to adjust times when setting match data:

```typescript
if (data) {
  const typedMatch = data as unknown as ChessMatch;
  
  // Adjust time remaining for the active player
  if (typedMatch.status === 'playing' && typedMatch.last_move_at) {
    if (typedMatch.current_turn === 'w') {
      typedMatch.white_time_remaining = calculateActualTimeRemaining(
        typedMatch.white_time_remaining,
        typedMatch.last_move_at,
        true
      );
    } else {
      typedMatch.black_time_remaining = calculateActualTimeRemaining(
        typedMatch.black_time_remaining,
        typedMatch.last_move_at,
        true
      );
    }
  }
  
  setMatch(typedMatch);
  // ... rest of the code
}
```

**Modify the realtime subscription handler** (around line 264-266) to also adjust times:

```typescript
(payload) => {
  const updatedMatch = payload.new as unknown as ChessMatch;
  
  // Adjust time for active player on realtime updates
  if (updatedMatch.status === 'playing' && updatedMatch.last_move_at) {
    if (updatedMatch.current_turn === 'w') {
      updatedMatch.white_time_remaining = calculateActualTimeRemaining(
        updatedMatch.white_time_remaining,
        updatedMatch.last_move_at,
        true
      );
    } else {
      updatedMatch.black_time_remaining = calculateActualTimeRemaining(
        updatedMatch.black_time_remaining,
        updatedMatch.last_move_at,
        true
      );
    }
  }
  
  setMatch(updatedMatch);
  // ... rest of the code
}
```

---

### File: `src/pages/ChessMultiplayerGame.tsx`

**No changes needed** - the existing timer sync effect at lines 272-280 will pick up the already-adjusted values from the hook.

---

## How It Works

```text
User reloads page at 14:30:45
         |
         v
+------------------+
| Database stores: |
| white_time = 300 |
| last_move_at =   |
|   14:30:00       |
+------------------+
         |
         v
+----------------------------+
| calculateActualTimeRemaining |
| elapsed = 14:30:45 - 14:30:00 |
|        = 45 seconds           |
| actual = 300 - 45 = 255 secs  |
+----------------------------+
         |
         v
Timer displays 4:15 (correct!)
```

---

## Edge Cases Handled

| Scenario | Handling |
|----------|----------|
| Not active player's turn | Return stored time unchanged |
| `last_move_at` is null | Return stored time unchanged |
| Game not in `playing` status | Return stored time unchanged |
| Calculated time goes negative | Clamp to 0 (triggers timeout logic) |
| Untimed games | `time_remaining` is null, skipped |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - adds calculation layer only |
| Works with existing data? | Yes - uses existing DB columns |
| 3G optimized? | Yes - no additional network calls |
| Backward compatible? | Yes - null-safe checks throughout |
| Both players see consistent time? | Yes - both calculate from same source |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useChessMultiplayer.ts` | Add `calculateActualTimeRemaining` helper, apply in `refreshMatch` and realtime handler |
