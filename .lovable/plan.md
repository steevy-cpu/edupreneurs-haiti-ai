

# Fix: First-Time Tour Conflicting with SubscriptionGate

## The Problem

When a new user with `pending_gift` status lands on `/dashboard` after email verification:

1. `SubscriptionGate` blocks the dashboard and shows the "En attente du paiement" prompt
2. But `FirstTimeUserContext` also activates because `location.pathname === '/dashboard'` and `onboarding_tour_completed === false`
3. The welcome overlay (z-index 9999) renders ON TOP of the payment prompt
4. The user sees Jude's animated welcome covering a screen they can't interact with
5. If they complete the welcome + avatar steps, the tour tries to navigate to `/matieres`, `/feed`, etc. -- all blocked by `SubscriptionGate`

The tour and the subscription gate are completely unaware of each other.

## The Fix

**File: `src/contexts/FirstTimeUserContext.tsx`** (single file change)

In the `checkTourStatus` function (around line 132), add a subscription status check BEFORE triggering the onboarding sequence. If the user's subscription is not active (status is `pending_gift`, `none`, or expired), skip the tour entirely and don't set `showWelcome = true`.

### What Changes

Inside `checkTourStatus`, after fetching the profile (line 162), also fetch `subscription_status`, `subscription_end_date`, and `has_free_access`. Then add a guard:

```
// Skip onboarding if subscription is not active
// (SubscriptionGate will show payment/pending prompt instead)
if (!profile.has_free_access) {
  const isActive = profile.subscription_status === 'active' 
    && profile.subscription_end_date 
    && new Date(profile.subscription_end_date) > new Date();
  
  if (!isActive) {
    // Don't show tour -- SubscriptionGate handles this state
    setIsLoading(false);
    return;
  }
}
```

This means:
- `has_free_access` users: tour shows normally (promo users bypass subscription)
- `active` subscription users: tour shows normally
- `pending_gift` users: tour is deferred until subscription activates
- `expired` users: tour is deferred until renewal

When the gift payment comes through and `SubscriptionGate` refreshes (via the 30s polling), `hasInitialized.current` is still `false` for the tour context, so on the next render cycle, `checkTourStatus` re-runs and this time the subscription IS active -- the tour starts naturally.

### Technical Details

**Modified query** (line 164):
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('nickname, academic_grade, onboarding_tour_completed, subscription_status, subscription_end_date, has_free_access')
  .eq('user_id', authUser.id)
  .single();
```

**New guard** (inserted after line 173, before the tour completion check):
- Check `has_free_access` first (bypass for promo users)
- Check if subscription is active and not expired
- If not active, return early without starting the tour

### Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- only adds an early return condition |
| Works with existing data? | Yes -- reads existing profile columns |
| 3G optimized? | Yes -- no extra query, just additional columns in existing fetch |
| Edge cases? | Promo users bypass check; legacy users with active status proceed normally |
| Tour still works after payment? | Yes -- `hasInitialized.current` stays false, re-runs on next dashboard visit |

