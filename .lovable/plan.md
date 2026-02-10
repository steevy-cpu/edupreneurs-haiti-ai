

# Add a Test Plan (25 HTG) to Payment Demo

## Overview
Add a low-cost test plan to the PaymentDemo page so you can verify the live MonCash payment flow without spending much.

## What Changes
**File:** `src/pages/PaymentDemo.tsx`

Add a new plan at the beginning of the `plans` array:

```typescript
{
  id: 'test',
  name: 'Test',
  price: 25,
  period: 'unique',
  features: [
    'Plan de test (25 HTG)',
    'Vérifier le flux de paiement',
    'Aucun abonnement'
  ]
}
```

This plan will appear as the first card in the plan selection step, making it easy to pick and run a quick 25 HTG payment to confirm everything works.

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- existing plans unchanged |
| Works with existing data? | Yes |
| Backward compatible? | Yes |
| 3G optimized? | N/A -- no new assets |

