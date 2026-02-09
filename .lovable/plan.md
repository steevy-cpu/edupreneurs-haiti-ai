

# Fix Word of the Day — Deterministic Date-Based Rotation

## Root Cause

The current system relies on a **mutable global counter** (`app_settings.word_of_day`) that every authenticated client can overwrite. This causes:

1. **Race condition**: Multiple users logging in on the same day each independently compute and write the "next word," overwriting each other
2. **Login/logout instability**: The `useEffect` depends on `isVisitor`, so every auth state change re-triggers the rotation logic, potentially writing a different order
3. **Evidence**: Today's `app_settings` says `last_order: 1` (Ephemere), but `user_daily_word` tracking shows users saw words at order 3 and 4 — the counter was overwritten multiple times

## Solution: Deterministic Rotation (Zero Writes)

Replace the mutable counter with a **pure math formula**. Every client computes the same word for the same date, with zero database writes needed:

```text
word_index = (days_since_reference_date % total_word_count) + 1
```

- Reference date: a fixed date (e.g., 2026-01-01)
- Total word count: 15 (current active words)
- Feb 9 = day 39 since Jan 1 -> 39 % 15 = 9 -> display_order 10 (Apotheose)
- Feb 10 = day 40 -> 40 % 15 = 10 -> display_order 11

This is deterministic: same date always produces the same word, regardless of who logs in first, how many times, or in what order.

## What Changes

### `src/hooks/useWordOfTheDay.ts` — Major refactor

**Remove:**
- All `app_settings` reads (the `word_of_day` key query)
- The `update_app_setting` RPC call
- The `needsUpdate` / `lastDate` / `lastOrder` tracking logic
- The max display_order query
- The `isVisitor` dependency from useEffect (word selection no longer depends on auth state)

**Add:**
- A `computeDisplayOrder(haitiDate, totalWords)` pure function that returns the display_order for today
- A single query to get `count(*)` of active words (cacheable, rarely changes)

**Keep:**
- localStorage cache for 3G optimization (same key, same logic)
- Audio playback (unchanged)
- `user_daily_word` tracking for analytics (unchanged, still authenticated-only)
- Deferred audio for slow connections (unchanged)

### Simplified Flow

```text
1. Check localStorage cache -> if today's date matches, use cached word
2. Query: SELECT count(*) FROM daily_words WHERE is_active = true
3. Compute: display_order = (daysSince(2026-01-01, haitiDate) % count) + 1
4. Query: SELECT * FROM daily_words WHERE display_order = {computed} AND is_active = true
5. Cache result in localStorage
6. (Authenticated only) Track in user_daily_word
```

### useEffect Dependencies

Current: `[isVisitor, shouldDeferAudio]` — causes re-runs on login/logout

New: `[shouldDeferAudio]` — only re-runs if network conditions change. Auth state is checked inside the effect for the tracking step, not as a trigger.

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useWordOfTheDay.ts` | Replace mutable counter with deterministic date formula; remove `app_settings` dependency; remove `isVisitor` from useEffect deps |

## What We Do NOT Change

- `app_settings` table stays (other features may use it)
- `update_app_setting` RPC stays (other settings may need it)
- `user_daily_word` tracking stays (analytics)
- Audio playback logic stays (working correctly)
- `WordOfTheDayCard.tsx` stays (no prop changes)
- localStorage cache key stays (`cached_daily_word_v3`)

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No — same word displayed, same UI, same audio |
| Race conditions? | Eliminated — pure math, no writes for rotation |
| Login/logout stability? | Fixed — word computation no longer depends on auth state |
| Works with existing 15 words? | Yes — `(daysSince % 15) + 1` covers all display_orders 1-15 |
| 3G optimized? | Better — removed 1 query (app_settings) and 1 RPC call (update_app_setting) |
| Backward compatible? | Yes — localStorage cache from previous version gracefully handled |
| Visitor mode? | Still works — visitors see the same deterministic word, just no tracking |

