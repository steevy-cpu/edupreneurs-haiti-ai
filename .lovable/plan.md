

# Fix: Bazik.io Token Field Name Mismatch

## Problem Identified

The logs show the authentication is **successful**, but we're looking for the wrong field name in the response:

```text
ERROR No access token in Bazik response: {
  success: true,
  token: "eyJ1c2VySWQi...",     <-- API returns "token"
  user_id: "bzk_sandbox_...",
  expires_at: 1769912084221,
  message: "Authentication successful"
}
```

Our code expects `access_token` but Bazik.io returns `token`.

---

## Fix Required

**File:** `supabase/functions/moncash-create-payment/index.ts`

**Line 51** - Update token extraction to check both field names:

```typescript
// BEFORE (line 51-54)
if (!data.access_token) {
  console.error('No access token in Bazik response:', data);
  throw new Error('No access token received from Bazik.io');
}

// AFTER
const accessToken = data.token || data.access_token;
if (!accessToken) {
  console.error('No token in Bazik response:', data);
  throw new Error('No access token received from Bazik.io');
}
```

**Line 57** - Update return statement:

```typescript
// BEFORE
return data.access_token;

// AFTER  
return accessToken;
```

---

## Verification Checklist

| Check | Status |
|-------|--------|
| Authentication working? | Yes - API returns success |
| Token received? | Yes - in `token` field |
| Field name correct? | No - we check `access_token` |
| Fix complexity | Low - 2 line changes |
| Risk of breaking | None - adds fallback |

---

## Summary

This is a simple field name fix. The Bazik.io authentication is working correctly - we just need to read the token from the right field (`token` instead of `access_token`).

