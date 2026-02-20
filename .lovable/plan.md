

# Settings Plan B — Structural Improvements

## Overview

5 fixes across 4 files. The subscription card move requires updating 4 external references that currently link to `tab=preferences#subscription`.

## Fix 1 — Remove dead-end theme card

**File:** `src/pages/Settings.tsx` (lines 1161-1168)

Remove the entire block:
```
<Separator />
<div className="space-y-4">
  <Label>Theme de l'application</Label>
  <p>Utilisez le bouton de theme en haut a droite...</p>
</div>
```

## Fix 2 — Replace cosmetic language selector

**File:** `src/pages/Settings.tsx`

- Remove the `language` state (line 126-128) and the `localStorage` save effect (lines 222-224)
- Replace the language `<select>` dropdown (lines 1145-1158) with a static info card:

```
La plateforme est disponible en Francais.
Le support du Kreyol est en cours de developpement.
```

Styled as a muted `p` with `text-sm text-muted-foreground` inside a `bg-muted rounded-lg p-4` wrapper.

After removing theme and language, the Preferences tab "App Preferences" card (lines 1134-1170) will contain only this info text. The card header stays as-is.

## Fix 3 — Move subscription card to top of Compte tab

**What moves:** The entire subscription card (lines 977-1131, `<Card id="subscription">`) moves from the Preferences tab to the Account tab, inserted as the first child inside the `<div className="space-y-4 sm:space-y-6">` at line 793.

**External references to update (4 files):**

| File | Current | New |
|---|---|---|
| `src/components/SubscriptionExpiryBanner.tsx` L35 | `tab=preferences#subscription` | `tab=account#subscription` |
| `src/components/SubscriptionGate.tsx` L247 | `tab=preferences#subscription` | `tab=account#subscription` |
| `src/pages/StripeRenewalCallback.tsx` L107 | `tab=preferences#subscription` | `tab=account#subscription` |
| `supabase/functions/create-stripe-renewal/index.ts` L94 | `tab=preferences#subscription` | `tab=account#subscription` |

**Settings.tsx internal update:** The `useEffect` scroll-to-subscription (lines 214-220) changes from checking `activeTab === 'preferences'` to `activeTab === 'account'`.

**New Compte tab order:**
1. Subscription card (moved here)
2. Email display + Logout button
3. Change password
4. Danger zone (delete account)

## Fix 4 — Add push notification toggle to Notifications tab

**File:** `src/pages/Settings.tsx`

Add a push toggle card **above** the existing notification categories card (before line 935).

Implementation approach using existing infrastructure:
- Import `initializePushNotifications`, `registerServiceWorker`, `subscribeToPushNotifications` from `@/utils/pushNotifications`
- On mount: check `Notification.permission` and whether a `push_subscriptions` row exists for this user/device to determine toggle state
- Toggle ON: call `initializePushNotifications(userId)` -- this handles permission request, SW registration, and subscription in one call
- Toggle OFF: get existing SW registration via `navigator.serviceWorker.ready`, call `getSubscription().unsubscribe()`, then delete the row from `push_subscriptions` table for this device
- Show permission status text: "Autorise" (granted), "Bloque -- changez dans les parametres du navigateur" (denied), or the toggle

New state variables:
- `pushEnabled: boolean` (derived from subscription existence check)
- `pushLoading: boolean` (while toggling)

Device ID retrieved via the existing `getDeviceId()` pattern from `pushNotifications.ts` (reads from localStorage key `edupreneurs_device_id`). Since `getDeviceId` is not exported, we replicate the same localStorage read inline (3 lines).

## Fix 5 — Remove duplicate NotificationSettings page

**Navigation link found:** `src/pages/Notifications.tsx` line 599 navigates to `/notification-settings`.

**Action:**
1. Delete `src/pages/NotificationSettings.tsx`
2. Remove the lazy import (line 88) and route (lines 397-401) from `src/App.tsx`
3. Update `src/pages/Notifications.tsx` line 599: change `navigate('/notification-settings')` to `navigate('/settings?tab=notifications')`

This redirects users to the Settings Notifications tab instead of the deleted duplicate page.

## Files Changed

| File | Change |
|---|---|
| `src/pages/Settings.tsx` | Fixes 1-4 |
| `src/App.tsx` | Remove NotificationSettings route + import |
| `src/pages/Notifications.tsx` | Redirect settings gear to `/settings?tab=notifications` |
| `src/pages/NotificationSettings.tsx` | DELETE |
| `src/components/SubscriptionExpiryBanner.tsx` | `tab=preferences` -> `tab=account` |
| `src/components/SubscriptionGate.tsx` | `tab=preferences` -> `tab=account` |
| `src/pages/StripeRenewalCallback.tsx` | `tab=preferences` -> `tab=account` |
| `supabase/functions/create-stripe-renewal/index.ts` | `tab=preferences` -> `tab=account` |

## Safety Verification

| Check | Status |
|---|---|
| Push toggle uses existing `initializePushNotifications` | Yes -- no new infrastructure |
| Push toggle OFF unsubscribes SW + deletes DB row | Yes -- clean teardown |
| Subscription card renders for free/active/expired | Yes -- moved intact, no logic changes |
| All 4 external subscription links updated | Yes -- `tab=account#subscription` |
| Edge function cancel_url updated | Yes -- `create-stripe-renewal` |
| NotificationSettings.tsx safely removed | Yes -- only 1 nav link, redirected |
| No data layer changes | Correct -- no save functions touched |
| No new dependencies | Correct |
| Bundle size | Slightly smaller (deleted file) |
| 3G performance | No impact |
