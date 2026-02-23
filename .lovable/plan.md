

# Timed Free Access via Promo Codes — 3 Surgical Fixes

## Overview

Enable promo codes with `grants_free_access = true` to give users full platform access until May 2, 2026, then auto-expire them via the existing hourly cron. Show an info banner in Settings for users with timed free access. Founders are fully excluded from expiry logic.

---

## Fix 1: Update `redeem-promo-code` Edge Function

**File:** `supabase/functions/redeem-promo-code/index.ts`

After the gold award block (after line 155), add a new step 4 that grants timed free access when `promo.grants_free_access` is true:

- Update the user's profile with `has_free_access: true`, `subscription_status: 'active'`, `subscription_end_date: '2026-05-02T00:00:00.000Z'`
- Update the success message to reflect free access activation: `"Acces gratuit active + X Gold!"`
- Non-fatal error handling (redemption + gold already recorded)

---

## Fix 2: Update `expire_subscriptions()` DB Function

**Via SQL migration** — replace the function to add a second UPDATE that revokes timed free access:

- Existing logic (expire paid subscriptions) stays unchanged
- New block: set `has_free_access = false` and `subscription_status = 'expired'` where `has_free_access = true AND subscription_end_date < now()`
- Founder UUIDs explicitly excluded via `NOT IN` clause
- No new cron job — runs on the existing hourly schedule

---

## Fix 3: Free Access Expiry Notice in Settings

**File:** `src/pages/Settings.tsx`

### 3a. Update `subscriptionInfo` (lines 631-651)

Distinguish timed vs permanent free access:
- `has_free_access = true` + `subscription_end_date` exists -> state `'free_timed'` with formatted date
- `has_free_access = true` + no end date -> state `'free'` (founders, permanent)

### 3b. Add amber info card (around line 978)

Add a new condition for `subscriptionInfo?.state === 'free_timed'` before the existing `'free'` case:
- Amber background (`bg-amber-50 dark:bg-amber-900/20`)
- `Info` icon from lucide-react
- Text: "Vous beneficiez d'un acces gratuit a la plateforme jusqu'au [date]."
- Subtext: "Apres cette date, un abonnement sera requis pour acceder aux fonctionnalites premium."
- Import `Info` from lucide-react

### 3c. Add `Info` to lucide imports (line 14-34)

---

## Files Modified

1. `supabase/functions/redeem-promo-code/index.ts` — add profile update for free access grants + update success message
2. DB migration — replace `expire_subscriptions()` with founder-safe timed expiry
3. `src/pages/Settings.tsx` — add `free_timed` state + amber info card + `Info` icon import

## Safety Verification

| Check | Status |
|-------|--------|
| Existing RLS policies affected? | No |
| Provider stack or AppShell changed? | No |
| New dependencies added? | No |
| Bundle size impact? | Negligible (one info card) |
| Works on 3G? | Yes — no extra network calls |
| Backward compatibility? | Yes — founders untouched, existing free users unaffected |
| Existing data at risk? | No — only new promo redemptions set end dates |
| Super users excluded? | Yes — founder UUIDs excluded in DB function |

