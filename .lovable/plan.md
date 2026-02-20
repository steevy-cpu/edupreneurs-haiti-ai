
# Notifications Plan C — Smart Push Permission Prompt on Second Login

## Overview

4 fixes: track login count, create a floating push permission prompt component, wire trigger logic, and add a visual hint on the notification bell. All client-side — no database changes.

## Fix 1 — Track login count in localStorage

**File:** `src/auth/services/login.service.ts`

At the end of the `loginWithEmail()` function, on the final successful return (line ~207: `return { success: true, userId: ... }`), increment `edupreneurs_login_count` in localStorage before returning.

```typescript
// Increment login count for push permission prompt timing (Plan C)
const currentCount = parseInt(localStorage.getItem('edupreneurs_login_count') || '0', 10);
localStorage.setItem('edupreneurs_login_count', String(currentCount + 1));
```

This runs only on fully successful logins (email verified + device trusted). It does NOT run on verification/device challenge branches.

## Fix 2 — Create PushPermissionPrompt component

**New file:** `src/components/firsttime/PushPermissionPrompt.tsx`

A framer-motion floating card that slides up from the bottom. Key specs:

- **Position:** `fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[999]` — sits above mobile bottom nav but below Jude
- **Layout:** Eric image (`eric-pointing-up.png`, h-16) on left, title + description + buttons on right
- **Title:** "Ne rate rien! `<bell emoji>`"
- **Description:** "Active les notifications pour etre informe des nouveaux messages, likes et activites de tes amis."
- **Buttons:** "Activer les notifications" (primary) and "Plus tard" (ghost)
- **Activate handler:** Calls `initializePushNotifications(userId)`. On success (permission === 'granted') shows toast "Notifications activees! `<celebration>`". On denial shows toast "Permission refusee — changez dans les parametres du navigateur".
- **Dismiss handler:** Sets `localStorage.push_prompt_dismissed = 'true'`, calls `onDismiss` prop
- **Auto-dismiss:** `setTimeout` at 15s sets the same flag and dismisses
- **Animation:** framer-motion `initial={{ y: 100, opacity: 0 }}` `animate={{ y: 0, opacity: 1 }}` `exit={{ y: 100, opacity: 0 }}`
- **Guard:** Component receives `userId` as prop. Before rendering, checks `registerServiceWorker` availability (if `!('serviceWorker' in navigator)` return null). This naturally excludes iOS Safari non-PWA.

Props: `{ userId: string; onDismiss: () => void }`

## Fix 3 — Trigger logic in FloatingLayer + AppShell

### 3a. Add state in AppShell.tsx

After profile is loaded and user is authenticated, add a `usePushPrompt` custom hook (inline or extracted) that checks 4 conditions:

1. `parseInt(localStorage.getItem('edupreneurs_login_count') || '0') >= 2`
2. `'Notification' in window && Notification.permission === 'default'`
3. `localStorage.getItem('push_prompt_dismissed') !== 'true'`
4. `profile.onboarding_tour_completed === true` — requires fetching this field

Since `useUserProfile` doesn't fetch `onboarding_tour_completed`, we need a lightweight approach. The `FirstTimeUserContext` already tracks `tourCompleted`. We can use that.

**Approach:** Create a new hook `src/shell/hooks/usePushPromptEligible.ts` that:
- Reads `edupreneurs_login_count` from localStorage
- Checks `Notification.permission`
- Checks `push_prompt_dismissed` localStorage
- Uses `useFirstTimeUser().tourCompleted` for tour status
- Returns `{ showPrompt: boolean }` with a 3-second delay via `useState` + `useEffect` + `setTimeout`

### 3b. Wire into FloatingLayer.tsx

Add the `PushPermissionPrompt` lazy import and render it conditionally:

```typescript
const PushPermissionPrompt = lazy(() => import('@/components/firsttime/PushPermissionPrompt'));
```

In FloatingLayer, use the eligibility hook. When eligible, render PushPermissionPrompt inside `<AnimatePresence>` with its own `<Suspense>`.

The `userId` comes from `useSessionAuth().user?.id`.

## Fix 4 — Pulsing amber dot on notification bell

The notification bell is rendered via the data-driven `SidebarNavLink` and `ShellMobileBottomNav` components. Both render items from `navigation.ts` config. Adding a dot requires a new optional prop.

### 4a. Add `showPulsingDot` prop to SidebarNavLink

**File:** `src/shell/components/SidebarNavLink.tsx`

Add optional `showPulsingDot?: boolean` prop. When true, render a small amber pulsing dot next to the icon:

```tsx
{showPulsingDot && (
  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
)}
```

The icon span wrapper needs `relative` positioning (already has flex-shrink-0, add `relative`).

### 4b. Add dot logic in AppSidebar.tsx

**File:** `src/shell/components/AppSidebar.tsx`

Compute `showPushHint` using the same 3 localStorage/permission checks (login count >= 2, permission === 'default', not dismissed). Pass `showPulsingDot={showPushHint}` to the SidebarNavLink for the `/notifications` path only.

### 4c. Add dot in ShellMobileBottomNav.tsx

**File:** `src/shell/components/ShellMobileBottomNav.tsx`

Same logic: compute `showPushHint`, and for the `/notifications` item, render the pulsing amber dot inside the icon `<div className="relative">` wrapper.

### 4d. Create shared helper

To avoid duplicating the 3-check logic, create a tiny utility:

**New file:** `src/shell/hooks/usePushHintVisible.ts`

```typescript
export function isPushHintVisible(): boolean {
  if (typeof window === 'undefined') return false;
  const count = parseInt(localStorage.getItem('edupreneurs_login_count') || '0', 10);
  const permission = 'Notification' in window ? Notification.permission : 'denied';
  const dismissed = localStorage.getItem('push_prompt_dismissed') === 'true';
  return count >= 2 && permission === 'default' && !dismissed;
}
```

This is a pure function (no hook), called inside components that need it.

## Files Changed

| File | Change |
|---|---|
| `src/auth/services/login.service.ts` | Increment `edupreneurs_login_count` on successful login |
| `src/components/firsttime/PushPermissionPrompt.tsx` | **New** — floating push permission prompt component |
| `src/shell/hooks/usePushPromptEligible.ts` | **New** — hook checking 4 conditions + 3s delay |
| `src/shell/hooks/usePushHintVisible.ts` | **New** — pure function for amber dot visibility |
| `src/shell/FloatingLayer.tsx` | Wire PushPermissionPrompt with lazy loading |
| `src/shell/components/SidebarNavLink.tsx` | Add `showPulsingDot` prop |
| `src/shell/components/AppSidebar.tsx` | Pass `showPulsingDot` for notifications link |
| `src/shell/components/ShellMobileBottomNav.tsx` | Add pulsing dot for notifications item |

## Safety Verification

| Check | Status |
|---|---|
| Prompt never shows on first login | Yes — requires `edupreneurs_login_count >= 2` |
| Prompt never shows if permission already granted/denied | Yes — checks `Notification.permission === 'default'` |
| Prompt never shows on iOS non-PWA | Yes — checks `serviceWorker in navigator` |
| `push_prompt_dismissed` prevents repeat showing | Yes — set on "Plus tard", auto-dismiss, and successful activation |
| Existing push-enabled users see nothing new | Yes — their `Notification.permission` is `'granted'`, all checks fail |
| No new dependencies | Correct — uses existing framer-motion + lucide-react |
| No database changes | Correct — fully client-side |
| 3G impact | Minimal — component is lazy-loaded, only mounts after 3s delay |
| Plans A and B untouched | Yes — no overlap with notification preferences, push calls, or UI rendering |
