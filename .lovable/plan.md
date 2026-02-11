

# Subscription Renewal via Settings Page

## Overview

When a user clicks "Renouveler" on the expiry banner, instead of immediately triggering MonCash, they are redirected to the **Settings > Preferences** tab, scrolled to the subscription card, where they can see their subscription details and renew from there. This gives users a clear, centralized place to manage their subscription.

## Changes

### 1. Banner redirects to Settings instead of calling MonCash directly

**File: `src/components/SubscriptionExpiryBanner.tsx`**

Replace the `handleRenew` function (which calls `moncash-create-payment`) with a simple navigation to `/settings?tab=preferences#subscription`. The banner becomes a signpost, not a payment trigger.

### 2. Settings page reads URL params to auto-select tab and scroll

**File: `src/pages/Settings.tsx`**

- On mount, read `?tab=preferences` from the URL and set `activeTab` accordingly.
- After rendering, if `#subscription` hash is present, scroll the subscription card into view with smooth scrolling.
- Add an `id="subscription"` to the subscription card for scroll targeting.

### 3. Replace static subscription card with dynamic data

**File: `src/pages/Settings.tsx`** (lines 840-888)

Replace the hardcoded "Plan Gratuit / 0 HTG" placeholder with a dynamic card that reads real subscription data from the existing profile fetch (line 144 already fetches `select("*")`). Three visual states:

**State A -- Free Access (promo user):**
- Green badge: "Acces Gratuit"
- Message: "Vous beneficiez d'un acces gratuit a la plateforme."
- No renewal button needed.

**State B -- Active subscription:**
- Green badge: "Actif"
- Shows: "200 HTG / 30 jours"
- Shows expiry date formatted in French (e.g., "Expire le 15 mars 2026")
- Shows days remaining
- "Renouveler (+30 jours)" button -- triggers MonCash payment

**State C -- Expired or no subscription:**
- Red badge: "Expire"
- Message: "Votre abonnement a expire. Renouvelez pour continuer."
- Prominent "Renouveler maintenant -- 200 HTG" button -- triggers MonCash payment

The MonCash trigger logic (calling `moncash-create-payment` and redirecting) stays the same, just lives in the Settings card now.

### 4. Backend: Extend subscription on verified payment

**File: `supabase/functions/moncash-verify-payment/index.ts`**

After a payment is confirmed `completed` (around line 131), add logic to:
- Look up `user_id` from `payment_transactions` for the order
- Update `profiles`: extend `subscription_end_date` by 30 days (stacking if still active, from now if expired)
- Set `subscription_status = 'active'`

This is the missing piece that actually grants access after payment.

### 5. PaymentCallback invalidates subscription queries

**File: `src/pages/PaymentCallback.tsx`**

On `completed` status, call `queryClient.invalidateQueries` for `['subscription-status']` and `['subscription-banner']` so the banner disappears and the Settings card updates immediately.

### 6. SubscriptionGate also redirects to Settings

**File: `src/components/SubscriptionGate.tsx`**

The `RenewalPrompt` "Renouveler" button should also navigate to `/settings?tab=preferences#subscription` instead of calling MonCash directly, keeping the Settings page as the single renewal hub.

---

## Technical Details

### URL-based tab and scroll (Settings.tsx)

```typescript
import { useSearchParams } from 'react-router-dom';

const [searchParams] = useSearchParams();

// On mount, read tab from URL
useEffect(() => {
  const tabParam = searchParams.get('tab');
  if (tabParam === 'preferences') {
    setActiveTab('preferences');
  }
}, [searchParams]);

// Scroll to subscription card after tab switch
useEffect(() => {
  if (activeTab === 'preferences' && window.location.hash === '#subscription') {
    setTimeout(() => {
      document.getElementById('subscription')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  }
}, [activeTab]);
```

### Banner navigation (SubscriptionExpiryBanner.tsx)

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const handleRenew = () => {
  navigate('/settings?tab=preferences#subscription');
};
```

### Subscription extension logic (moncash-verify-payment)

```typescript
if (paymentStatus === 'completed' && dbOrderId) {
  const { data: txn } = await supabase
    .from('payment_transactions')
    .select('user_id')
    .eq('order_id', dbOrderId)
    .maybeSingle();

  if (txn?.user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_end_date')
      .eq('user_id', txn.user_id)
      .maybeSingle();

    const now = new Date();
    const currentEnd = profile?.subscription_end_date
      ? new Date(profile.subscription_end_date)
      : null;
    const baseDate = (currentEnd && currentEnd > now) ? currentEnd : now;
    const newEnd = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await supabase.from('profiles').update({
      subscription_status: 'active',
      subscription_end_date: newEnd.toISOString(),
      payment_order_id: dbOrderId,
    }).eq('user_id', txn.user_id);
  }
}
```

### Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- banner still works, just navigates instead of paying directly |
| Works with existing data? | Yes -- profile fetch already returns all subscription fields |
| 3G optimized? | Yes -- no extra network requests, reuses existing profile data |
| Edge cases handled? | Free access, expired, active, null end date, stacking renewals |
| Backward compatible? | Yes -- legacy users without subscription data see "no subscription" state |
| Single renewal hub? | Yes -- banner and gate both point to Settings |

