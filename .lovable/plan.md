

# Optimize Gift/Family Subscription Flow: Diagnosis and Fix

## Full Lifecycle Map

```text
Student Signup (pending_gift)
    |
    v
Dashboard blocked by SubscriptionGate (PendingGiftPrompt)
    |                                              Family member pays via Stripe
    |                                                        |
    v                                                        v
Polling every 30s  <-------- DB update --------  verify-gift-payment edge function
    |                   (subscription_status = 'active')
    v
SubscriptionGate lifts -> Children render
    |
    v
FirstTimeUserTour should start... but DOESN'T (Bug #1)
```

## Bottlenecks Identified

### Bottleneck 1: 30-second polling delay (the biggest issue)

**Where:** `SubscriptionGate.tsx` line 42 -- `refetchInterval: 30_000`

After the family member completes payment and the edge function sets `subscription_status = 'active'` in the database, the student's browser only checks every 30 seconds. On a 3G connection, this means the student could wait 30-45 seconds staring at the "En attente du paiement" screen after their family member has already paid.

**Fix:** Reduce polling to 10 seconds for `pending_gift` status. 10s is a good balance -- frequent enough to feel responsive, light enough for 3G (a single small SELECT query).

### Bottleneck 2: Tour never starts after gate lifts (critical bug)

**Where:** `FirstTimeUserContext.tsx` line 186 -- `hasInitialized.current = true`

When the user first lands on `/dashboard` with `pending_gift` status, the tour's `checkTourStatus` runs, detects the inactive subscription, and sets `hasInitialized.current = true` before returning early. When the subscription later becomes active and `SubscriptionGate` lifts, the tour checks `hasInitialized.current` (line 147) and skips entirely. The tour **never starts**.

**Fix:** Do NOT set `hasInitialized.current = true` in the subscription-inactive early return. Only set it after the tour has been fully evaluated (either started or confirmed as completed). This way, when the gate lifts and the component re-renders, `checkTourStatus` runs again and properly initializes the tour.

### Bottleneck 3: No query invalidation bridge between gate and tour

**Where:** Both `SubscriptionGate` and `FirstTimeUserContext` fetch the profile independently. When the gate's polling detects the change, the tour context doesn't know about it.

**Fix:** After the `SubscriptionGate` polling detects the transition from `pending_gift` to `active`, invalidate the React Query cache for subscription-related queries. This ensures all components consuming subscription state get fresh data simultaneously, rather than waiting for their own stale timers.

## Changes Required

### File 1: `src/components/SubscriptionGate.tsx`

**Change 1a:** Reduce polling from 30s to 10s (line 42):
```typescript
return data?.subscription_status === 'pending_gift' ? 10_000 : false;
```

**Change 1b:** Add query invalidation when status transitions from `pending_gift` to `active`. Use React Query's `onSuccess` or a `useEffect` that watches for the transition and calls `queryClient.invalidateQueries()` on the `subscription-status` key. This forces the FirstTimeUserContext (and any other consumer) to pick up the change immediately.

### File 2: `src/contexts/FirstTimeUserContext.tsx`

**Change 2a:** Remove `hasInitialized.current = true` from the subscription-inactive early return (line 186). Keep the early return itself, but let the ref stay `false` so the effect re-runs when the subscription becomes active:

```typescript
if (!isActive) {
  setIsLoading(false);
  // Do NOT set hasInitialized.current = true here
  // Let it re-run when subscription activates
  return;
}
```

**Change 2b:** Add `isAuthenticated` (or the profile subscription status) as a dependency that resets `hasInitialized.current` when the subscription state changes. Specifically, watch for the transition from non-active to active.

## What This Achieves

| Metric | Before | After |
|---|---|---|
| Max wait after payment | 30-45s | 10-15s |
| Tour starts after activation | NEVER (bug) | Immediately on next render cycle |
| Query freshness sync | Independent timers | Invalidation bridge |
| Extra network cost | None | Negligible (+2 polls/min during pending_gift) |

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- only changes timing and fixes a bug |
| Works with existing data? | Yes -- no schema changes |
| 3G optimized? | Yes -- 10s poll is a tiny SELECT; invalidation prevents redundant fetches |
| Edge cases handled? | Promo users bypass entirely; legacy users unaffected; tour still respects `onboarding_tour_completed` |
| Backward compatible? | Yes -- same polling mechanism, just faster |

## Files Changed Summary

| File | Change | Risk |
|---|---|---|
| `SubscriptionGate.tsx` | Reduce poll to 10s, add invalidation on transition | Low |
| `FirstTimeUserContext.tsx` | Fix hasInitialized bug, add subscription-aware re-trigger | Low |

