

## Fix Google OAuth redirect_uri_mismatch

**Problem:** `GoogleSignInButton.tsx` uses `supabase.auth.signInWithOAuth` directly, which sends a callback URL that isn't registered in your Google Cloud Console's authorized redirect URIs.

**Solution:** Switch to `lovable.auth.signInWithOAuth("google")` — the Lovable Cloud managed OAuth that handles redirect URIs automatically. No need to configure redirect URIs in Google Cloud Console.

### Changes

**File: `src/components/auth/GoogleSignInButton.tsx`**
- Replace `import { supabase }` with `import { lovable } from "@/integrations/lovable/index"`
- Replace the `handleGoogleSignIn` function body:
  - Use `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` 
  - Handle `result.redirected` (let browser redirect)
  - Handle `result.error` (show toast)
  - On success, navigate to `/dashboard` or `/auth/google-setup` based on `google_needs_setup` flag
- Remove the `supabase` import (no longer needed in this file)

**File: `src/hooks/useEnsureProfile.ts`** — No changes needed; it runs post-auth in Index.tsx.

### Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No — same OAuth flow, different managed client |
| Adds dependencies? | No — `@lovable.dev/cloud-auth-js` already installed |
| Works on 3G? | Yes — same network path |
| RLS impact? | None |
| Existing Google users affected? | No — session/profile logic unchanged |

