
# Fix: Two Critical Auth Bugs

## Bug 1: SubscriptionGate Bypass (Gift Tab Access Without Payment)

### Root Cause
In `SubscriptionGate.tsx` line 42:
```typescript
if (!isAuthenticated || !profile) return <>{children}</>;
```

When a user logs in, the `subscription-status` query takes time to load. During that loading window, `profile` is `undefined`, so the gate **lets the user through to the full dashboard**. This is a race condition that affects ALL subscription enforcement, not just the gift flow.

The gift flow itself is correct -- `pending_gift` status IS being set, and the gate DOES handle it. But the gate's loading state renders `children` instead of a loading spinner.

### Fix
Change the loading behavior to show nothing (or a spinner) while the profile is loading, instead of rendering the protected content:

```typescript
// BEFORE (broken):
if (!isAuthenticated || !profile) return <>{children}</>;

// AFTER (fixed):
if (!isAuthenticated) return <>{children}</>; // Auth guard handles this
if (!profile) return null; // Loading -- block content until we know subscription status
```

**File**: `src/components/SubscriptionGate.tsx` (line 42)

---

## Bug 2: Double Email Verification After Account Creation

### Root Cause
PostgreSQL function overloading conflict. Two versions of `verify_email_code` exist in the database:

1. **Old** (from migration `20251014`): `verify_email_code(p_user_id uuid, p_code text)` -- 2 params
2. **New** (from migration `20260209`): `verify_email_code(p_user_id uuid, p_code text, p_device_fingerprint text DEFAULT NULL, ...)` -- 7 params

In PostgreSQL, `CREATE OR REPLACE` with a different parameter count creates a **new overloaded function**, it does NOT replace the old one. Both functions coexist. When the client calls `supabase.rpc('verify_email_code', {...})` with all 7 params, PostgREST may route to the old 2-param function, silently ignoring the device params. The device is never auto-trusted.

Result: On first login after email verification, `isDeviceTrusted()` returns `false`, triggering device verification -- which looks like a second email verification to the user.

### Fix
Drop the old 2-param function via a database migration, leaving only the 7-param version:

```sql
-- Drop the old overload (2 params only)
DROP FUNCTION IF EXISTS public.verify_email_code(uuid, text);
```

The new function with DEFAULT params already handles calls with just 2 params, so nothing breaks.

**File**: New database migration

---

## Files to Modify

1. **`src/components/SubscriptionGate.tsx`** -- Fix loading state to block content instead of allowing it
2. **Database migration** -- Drop old `verify_email_code(uuid, text)` overload

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- loading spinner is a brief flash before profile loads |
| Works with existing data? | Yes -- no schema changes to data |
| Optimized for 3G? | Yes -- on slow connections, the spinner shows slightly longer but prevents unauthorized access |
| Edge cases handled? | Yes -- unauthenticated users still pass through for auth guard to handle |
| Backward compatible? | Yes -- the 7-param function accepts 2-param calls via DEFAULTs |
