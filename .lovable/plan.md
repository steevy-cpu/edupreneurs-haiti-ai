
## Set has_free_access = true for Test Account

This is a single-row data update — no schema change, no migration needed.

### What Will Be Done

Run the following UPDATE directly against the `profiles` table for the test account UUID:

```sql
UPDATE public.profiles
SET has_free_access = true
WHERE user_id = '6698f395-7f46-48b9-b7d3-d1151d9cec8c';
```

### Why This Is Safe

- `has_free_access` is an existing boolean column — no structural change.
- The `SubscriptionGate` checks `has_free_access` first, before any subscription date or status logic. Setting this to `true` immediately bypasses the gate for this account.
- The `FirstTimeUserContext` also checks `has_free_access` to decide whether to skip the subscription check. Setting this to `true` means the onboarding tour will fire correctly on the next dashboard visit.
- No other users are affected — the WHERE clause is scoped to the single test account UUID.

### Expected Result After Update

| Field | Before | After |
|---|---|---|
| `has_free_access` | `false` | `true` |
| `subscription_status` | `none` | `none` (unchanged) |
| Onboarding tour triggers? | No (blocked by SubscriptionGate) | Yes |

### How to Re-Test the Tour After

1. Log in with `vibemusical02@gmail.com`
2. Navigate to `/dashboard`
3. The welcome overlay (Phase 1) will appear immediately
4. To repeat the tour in the same session, open DevTools console and run:
   ```js
   sessionStorage.removeItem('tour_session_started_6698f395-7f46-48b9-b7d3-d1151d9cec8c');
   ```
   Then refresh the page.
