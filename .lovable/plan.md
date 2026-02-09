

# Fix React Null Dispatcher Errors & Badge Ref Warning

## Problem Diagnosis

There are two issues causing problems on the `/content-editor` page:

### 1. React "null dispatcher" crashes (causes error page)
The runtime errors show `Cannot read properties of null (reading 'useState')` and `Cannot read properties of null (reading 'useContext')`. These originate from a **stale Vite dependency cache** where React gets pre-bundled into multiple chunks (`chunk-ZMLY2J2T.js` vs `chunk-6RFYUUFA.js`), creating two separate React instances. Components in one instance can't use hooks from the other.

**Affected components:**
- `FirstTimeUserWelcome.tsx` (useState null)
- `CreateMatiereDialog.tsx` (useState null)
- `@radix-ui/react-tabs` (useContext null)

### 2. Badge ref warning (non-crashing)
The `Badge` component is used inside Radix UI's `CollapsibleTrigger` in `LessonBrowser.tsx`. Radix tries to pass a ref, but `Badge` is a plain function component that doesn't support `forwardRef`.

---

## Fix

### 1. Bump Vite cache directory

Force a clean pre-bundle by renaming the cache directory from `.vite-edupreneurs-v3` to `.vite-edupreneurs-v4` in `vite.config.ts`. This eliminates the stale duplicate React chunks.

**File:** `vite.config.ts` (line 15)
```
cacheDir: "node_modules/.vite-edupreneurs-v4"
```

### 2. Add `forwardRef` to Badge component

Wrap the `Badge` component with `React.forwardRef` so Radix UI components can properly pass refs to it.

**File:** `src/components/ui/badge.tsx`
```tsx
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);
Badge.displayName = "Badge";
```

---

## File Changes Summary

| File | Change |
|------|--------|
| `vite.config.ts` | Bump cacheDir to `.vite-edupreneurs-v4` |
| `src/components/ui/badge.tsx` | Add `forwardRef` to Badge |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - cache bump just forces clean rebuild |
| Works with existing data? | N/A |
| 3G performance impact? | None |
| Backward compatible? | Yes - Badge API unchanged, just now supports refs |
| Edge cases? | Cache bump is the established pattern per project history |

