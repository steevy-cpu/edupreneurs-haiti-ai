

# Fix: React Error Page on "Créer un compte" / "Se connecter" Click

## Root Cause

The `AuthRouteGuard` component (rendered by `AuthLayout` on all `/auth/*` routes) runs an async function `checkAuthState` inside a `useEffect` **without a try/catch block** (lines 26-95 of `src/auth/guards/AuthRouteGuard.tsx`).

When the Supabase profile query on line 54 fails (network timeout, 3G flakiness, or transient error), the unhandled promise rejection propagates to React's ErrorBoundary, which displays the error page.

Additionally, if an error occurs, `setIsChecking(false)` is never called -- leaving users permanently stuck on a blank screen even if the ErrorBoundary doesn't catch it.

This is intermittent because it only happens when the network request fails at the exact moment of navigation.

## Fix

Wrap the entire `checkAuthState` body in a try/catch/finally block in `src/auth/guards/AuthRouteGuard.tsx`:

### Change in `src/auth/guards/AuthRouteGuard.tsx`

```typescript
useEffect(() => {
  const checkAuthState = async () => {
    if (isLoading) return;

    try {
      const authFlow = getAuthFlow();
      const currentPath = location.pathname;

      // ... all existing logic stays the same ...

    } catch (error) {
      console.error('AuthRouteGuard: Error checking auth state:', error);
      // On error, allow rendering children rather than blocking
      // The page itself will handle unauthenticated state gracefully
    } finally {
      setIsChecking(false);
    }
  };

  checkAuthState();
}, [isAuthenticated, isLoading, user, location.pathname, location.search, navigate]);
```

Key changes:
- **try/catch** around the entire async body prevents unhandled rejections
- **finally** block ensures `setIsChecking(false)` always runs, preventing permanent blank screens
- On error, children render normally -- the login/signup page will show as expected since the user is unauthenticated anyway
- Remove the existing `setIsChecking(false)` calls scattered throughout the function body (3 occurrences) and consolidate into `finally`

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- adds error handling only |
| Works with existing data? | Yes -- no data changes |
| 3G optimized? | Yes -- this specifically fixes 3G failures |
| Backward compatible? | Yes -- same behavior on success path |
| Edge cases? | Error during profile fetch falls through to render login/signup page normally |

## File Changed

Only one file: `src/auth/guards/AuthRouteGuard.tsx`
