
## Root Cause: `HomeChatbot` Missing the `isStable` Dispatcher Guard

### What Is Happening

The error "Cannot read properties of null (reading 'useState')" is the React null dispatcher crash. It occurs when a lazy-loaded component calls hooks while the React module fiber dispatcher is still `null` — i.e., the module resolves but React's internal reconciler hasn't finished mounting the fiber tree yet.

**The crash is on the `/` (homepage) route.** The `HomeChatbot` component is loaded like this in `src/pages/Index.tsx`:

```tsx
const HomeChatbot = lazy(() => import("@/components/HomeChatbot")...);

// ...then conditionally mounted after scroll/idle:
{chatbotReady && (
  <Suspense fallback={null}>
    <HomeChatbot />
  </Suspense>
)}
```

`HomeChatbot` calls `useState` at the top level immediately when it mounts. When the lazy chunk resolves right as `chatbotReady` flips to `true`, the React fiber for that subtree may not yet have its dispatcher initialized, causing hooks to read `null`.

### Why `JudeChatbot`, `FirstTimeUserTour`, and `VisitorTour` Do NOT Crash

All of those components use the **double `requestAnimationFrame` isStable guard**:

```tsx
const [isStable, setIsStable] = useState(false);

useEffect(() => {
  const timer = requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setIsStable(true);
    });
  });
  return () => cancelAnimationFrame(timer);
}, []);

if (!isStable) return null;
```

This guard defers all other logic (including any risky renders) until two animation frames after mount, which guarantees the React dispatcher is fully initialized.

**`HomeChatbot` is the only floating, lazy-loaded component missing this guard.**

### Safety Verification

| Check | Status |
|---|---|
| Does this touch RLS or DB functions? | No |
| Does this affect the Provider Stack or AppShell? | No |
| Does this add dependencies? | No |
| Cold start / 3G risk? | None — guard is a pure two-frame delay |
| Backward compatibility? | Full — no API, data, or prop changes |
| Does the fix affect auth or device trust? | No |

### What Will Be Changed

**Single file: `src/components/HomeChatbot.tsx`**

Add the `isStable` double-RAF guard at the top of the `HomeChatbot` component, matching the exact same pattern used in `FirstTimeUserTour`, `VisitorTour`, `FirstTimeUserWelcome`, and `AvatarGenerationStep`.

The guard works by:
1. Mounting with `isStable = false` — all hooks still run (no hook count mismatch), but the component renders `null`
2. Two animation frames later, `isStable` becomes `true` and the component renders normally
3. This two-frame window is always enough for React's fiber dispatcher to be fully initialized

No other files need changes. The `JudeChatbot` in `FloatingLayer.tsx` already has its own Suspense boundary and is rendered conditionally by `useVisibility`, so it is not affected.

### Technical Implementation

In `HomeChatbot.tsx`, inside the `HomeChatbot` function:

```tsx
// Add at top (after existing hook declarations):
const [isStable, setIsStable] = useState(false);

useEffect(() => {
  const timer = requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setIsStable(true);
    });
  });
  return () => cancelAnimationFrame(timer);
}, []);

// Add as first conditional return (after ALL hooks):
if (!isStable) return null;
```

This is a one-component, zero-risk, pattern-consistent fix.
