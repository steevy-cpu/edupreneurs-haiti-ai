
## What I checked (structure + database behavior)

### Frontend code path (“Nouvel appareil détecté”)
1. **Login page** (`src/auth/routes/LoginPage.tsx`)
   - Submits email/password to `loginWithEmail()`.
   - The checkbox **“Se souvenir de cet appareil”** (`rememberDevice`) is only used *after* a fully successful login via `handleDeviceTracking(...)`.
   - If device verification is required, the user is redirected to `/auth/verify-device` and the login flow stops early.

2. **Login service** (`src/auth/services/login.service.ts`)
   - `supabase.auth.signInWithPassword(...)`
   - Fetches profile (email_confirmed)
   - Then **device trust check happens here**:
     - `const deviceTrusted = await isDeviceTrusted(authData.user.id);`
   - If `deviceTrusted === false`:
     - immediately `signOut()`
     - calls `createDeviceChallenge(...)` (RPC)
     - persists flow in `authFlow.store.ts` with `flow: 'verify-device'`
     - returns `requiresDeviceVerification: true`

3. **Verify device page** (`src/auth/routes/VerifyDevicePage.tsx`)
   - Phase 1: OTP code → calls `verifyDeviceCode(challengeId, code, trustDevice)`
     - `trustDevice` corresponds to **“Mémoriser cet appareil”** on this page (default is `true`).
   - Phase 2: password confirm → calls `supabase.auth.signInWithPassword(...)` directly (this bypasses `loginWithEmail()`).

### Device fingerprinting
- `src/utils/deviceFingerprint.ts` generates:
  - `fingerprint` (full characteristics incl. `navigator.userAgent`) and then **combines** with a localStorage `edupreneurs_device_id`
  - `hardwareFingerprint` (screen + timezone offset + cores + touch + deviceMemory)

### Backend tables involved
- `public.user_trusted_devices`
  - columns: `user_id`, `device_fingerprint`, `hardware_fingerprint`, `is_trusted`, `last_login_at`, …
  - unique constraint: **(user_id, device_fingerprint)**
  - RLS: user can SELECT/INSERT/UPDATE/DELETE their own rows (`auth.uid() = user_id`)

- `public.device_verification_challenges`
  - stores `device_fingerprint`, `hardware_fingerprint`, `verification_code`, `expires_at` (15 min), attempts, …

### Backend RPC functions (important behavior)
- `public.create_device_challenge(...)`
  - creates/regenerates OTP challenge for a given `device_fingerprint`

- `public.verify_device_challenge(p_challenge_id, p_code, p_trust_device)`
  - marks challenge verified
  - inserts/updates `user_trusted_devices` with `is_trusted = p_trust_device`
  - **Current behavior can downgrade trust** on an existing trusted device if `p_trust_device` is false (it overwrites `is_trusted`).

---

## What the database evidence shows (why you see it every time)

From the current data, the same user has **many `user_trusted_devices` rows with the same `hardware_fingerprint`** but different `device_fingerprint`. That strongly suggests the “device fingerprint” (the one we use for the trust lookup) is **changing over time** (browser updates, user-agent differences, storage differences, etc.).

Even if you check “mémoriser cet appareil”, we only consider the device trusted when:
- the current computed `device_fingerprint` exactly matches a row in `user_trusted_devices` **AND**
- `is_trusted === true`

So if the fingerprint changes, the trust lookup fails → you get “Nouvel appareil détecté” again.

Additionally, the backend RPC currently overwrites `is_trusted` on conflict, which can unintentionally flip a trusted device back to untrusted in some edge cases.

---

## Root cause summary (most likely)
1. **Trust lookup is too strict** (exact match on `device_fingerprint` only).
2. **`device_fingerprint` is not stable enough** in the real world (it includes `navigator.userAgent` + a localStorage-derived device id combo).
3. **Backend trust write can downgrade** (overwrites `is_trusted` rather than “only upgrade”).

---

## Fix approach (keeps structure clean, minimal changes, backward compatible)

### Phase A — Make device trust check resilient (frontend, minimal DB impact)
Update `isDeviceTrusted(userId)` in `src/auth/services/device-verify.service.ts` to:

1. Compute `{ fingerprint, hardwareFingerprint }` once.
2. Query **trusted devices** for that user using:
   - exact match on `device_fingerprint` OR
   - fallback match on `hardware_fingerprint`
3. If trusted by hardware (but fingerprint didn’t match):
   - “repair” by **upserting** a row for the current `device_fingerprint` with `is_trusted = true` and `last_login_at = now()`
   - this ensures the *next* login will match exactly even if the fingerprint changed earlier.

Performance note (3G): do this in **one query** using an `OR` filter, and only do the “repair upsert” when needed.

**Files**
- `src/auth/services/device-verify.service.ts` (primary change)
- `src/auth/services/login.service.ts` (no/low change; it keeps calling `isDeviceTrusted()`)

### Phase B — Prevent accidental trust downgrades (backend RPC)
Update `public.verify_device_challenge` so it **never downgrades** an already-trusted device:
- On conflict update, set:
  - `is_trusted = user_trusted_devices.is_trusted OR p_trust_device`
- Continue updating `last_login_at`

This keeps the security promise: once a device is trusted, it stays trusted unless the user explicitly revokes it (future settings page).

**Files**
- New database migration SQL updating the function body:
  - `supabase/migrations/<new>_device_trust_no_downgrade.sql`

### Phase C — Add targeted debug visibility (dev-only, no noisy prod logs)
Because this issue is subtle, add **DEV-only** diagnostics (no production console spam):
- Log (only in `import.meta.env.DEV`) the computed `fingerprint`, `hardwareFingerprint`, and whether trust matched by fingerprint/hardware.

**Files**
- `src/auth/services/device-verify.service.ts`

---

## Safety verification checklist (per your standards)

| Check | Result / how we ensure it |
|---|---|
| Will this break existing functionality? | No. We keep the existing exact-match behavior and add a safe fallback. |
| Backward compatibility with existing data? | Yes. We still honor existing `user_trusted_devices` rows. |
| Works with existing DB + RLS? | Yes. Reads/writes remain scoped to `auth.uid() = user_id`. |
| Avoid double-processing | Only one extra trust query (combined OR). Repair upsert only when needed. |
| 3G performance impact | Minimal: 1 query + rare upsert; reduces repeated OTP emails (net win). |
| Edge cases | Handles fingerprint drift, browser updates, and preserves trust once granted. |

---

## Test plan (end-to-end)
1. On the same device/browser:
   - Log in → if prompted, complete device verification and check “Mémoriser cet appareil”.
   - Log out.
   - Log in again → should **not** show “Nouvel appareil détecté”.
2. Repeat after:
   - refreshing the page
   - closing and reopening the browser
3. (Optional) Test:
   - same physical device, different browser → should trust via hardware fallback (if previously trusted), depending on our chosen strictness (we’ll implement “only if already trusted on that hardware”).

---

## Implementation notes (how I’ll structure the code)
- Keep `isDeviceTrusted()` as the single “trust decision” function so `login.service.ts` stays clean.
- Add a small internal helper like:
  - `getDeviceTrustRecord(userId, deviceInfo)` returning `{ trusted: boolean, matchedBy: 'fingerprint'|'hardware'|null }`
- Use one query:
  - filter: `user_id == userId AND is_trusted == true AND (device_fingerprint == fp OR hardware_fingerprint == hfp)`
- If matchedBy === 'hardware' then repair via `upsert` into `user_trusted_devices` for current fingerprint.

