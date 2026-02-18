
## Root Cause Confirmed: `JudeChatbot` (and other shell floating components) Missing `isStable` Guard

### What Is Crashing

The console crash is the same null dispatcher error, but it is **not** coming from `HomeChatbot` (which was already fixed). It is coming from **`JudeChatbot`** — the authenticated user's floating AI assistant — which is lazy-loaded in `FloatingLayer.tsx`:

```tsx
const JudeChatbot = lazy(() => import('@/components/JudeChatbot').then(m => ({ default: m.JudeChatbot })));
```

`JudeChatbot` has **8+ `useState` calls, 2 custom hook calls (`useVisitor`, `useSessionAuth`), and `useNavigate`/`useLocation`** — all firing immediately on mount, before the React dispatcher has been fully initialized for that lazy chunk.

Secondary candidates that share the same `<Suspense fallback={null}>` boundary in `FloatingLayer.tsx` and also lack the guard:
- `GlobalMusicPlayer`
- `QuickMessageFAB`
- `CookieConsent`
- `NotificationPermissionBanner`

### Files to Change

4 files — all follow the same one-paragraph change: add `isStable` state at the top of hooks, add the double-RAF `useEffect`, and add `if (!isStable) return null` before the JSX `return`.

#### 1. `src/components/JudeChatbot.tsx` (PRIMARY — this is the crasher)

Add at top of `JudeChatbot` component (before line 90's `useVisitor`):
```tsx
const [isStable, setIsStable] = useState(false);
```
Add after the last `useEffect` (before line 346's `return (`):
```tsx
useEffect(() => {
  const timer = requestAnimationFrame(() => {
    requestAnimationFrame(() => setIsStable(true));
  });
  return () => cancelAnimationFrame(timer);
}, []);

if (!isStable) return null;
```

#### 2. `src/components/GlobalMusicPlayer.tsx`

Add `isStable` state + double-RAF effect + `if (!isStable) return null` before its `return (`.

#### 3. `src/components/shared/QuickMessageFAB.tsx`

Same pattern — `isStable` guard before its `return (` at line 150.

#### 4. `src/components/CookieConsent.tsx`

Same pattern — `isStable` guard before its `return (` at line ~45.

### Why `NotificationPermissionBanner` Is Lower Priority

It's wrapped in `NotificationBannerWrapper` which already gates its render behind `userId` existing. The risk of dispatcher crash is lower because it mounts later in the session lifecycle after full auth resolution. It can be addressed in a follow-up pass.

### Safety Verification

| Check | Status |
|---|---|
| Does this touch RLS or DB functions? | No |
| Does this affect Provider Stack or AppShell? | No — only adds a 2-frame null render to floating components |
| Does this add dependencies? | No |
| Cold start / 3G risk? | None — 2-frame delay is imperceptible, ~32ms max |
| Hook count mismatch? | No — `isStable` state is declared first, before all other hooks |
| Backward compatibility? | Full — all props, APIs, and behaviors unchanged |
| Does this affect auth or device trust? | No |

### Implementation Order

1. `JudeChatbot.tsx` — fixes the active crash
2. `GlobalMusicPlayer.tsx` — preventive, same lazy boundary
3. `QuickMessageFAB.tsx` — preventive, same lazy boundary
4. `CookieConsent.tsx` — preventive, same lazy boundary

All 4 are identical one-pattern changes with zero risk.
