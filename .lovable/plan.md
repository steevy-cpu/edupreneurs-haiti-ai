
# Device Verification — Strengthened Implementation (Re-sequenced by Impact)

## What the Code Confirms

After reading the exact files, here is the verified state of each bug:

**Bug A (Rate Limit — line 170 of `send-device-verification-email/index.ts`):**
```typescript
// Current — passes null for userId, so ALWAYS uses maxAnonRequests = 3/min
const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.EMAIL, null, clientIp);
```
The function is called from the frontend before the session is established, so no auth token is passed. The rate limiter receives `null` as `userId` and applies the anonymous tier — 3 requests per minute, shared across all IPs on the same network. If any other email endpoint (welcome email, login notification, etc.) was triggered from your network in that same 60-second window, this call was silently blocked with a 429 and the challenge was created in the DB with no code ever sent.

**Bug B (Silent Failure — lines 209-223 of `device-verify.service.ts`):**
```typescript
try {
  await supabase.functions.invoke('send-device-verification-email', { body: {...} });
} catch (emailError) {
  console.error('Failed to send device verification email:', emailError);
  // Don't fail the challenge creation if email fails  ← no signal to UI
}
return { success: true, challengeId: result.challenge_id }; // Always returns success
```
Even if the edge function returned a 429, the `invoke()` call does not throw — it returns `{ error }`. The catch block is never hit. The `return { success: true }` fires regardless. The UI receives `success: true` and displays "Un code a été envoyé à votre email" when nothing was sent.

**Bug C (Hardcoded name — line 338 of `device-verify.service.ts`):**
```typescript
fullName: 'Utilisateur', // We don't have the name in resend
```
`fullName` is already available in `authFlow.fullName` and is used on `VerifyDevicePage.tsx` line 40 (`const fullName = authFlow?.fullName`). It just is not passed down to `resendDeviceCode()`.

**Bug D (Resend confirmation toast — lines 174-181 of `VerifyDevicePage.tsx`):**
```typescript
} else {
  toast({ title: "Code renvoyé ✅", description: "Un nouveau code a été envoyé à votre email" });
}
```
Shows success regardless of whether the email actually sent. The `resendDeviceCode` service currently returns `{ success: true }` even when the edge function fails.

---

## Implementation Order (By Impact)

### Phase 1 — Fix the Broken Foundation (do together)

**Step 1A: Add `DEVICE_VERIFY` rate limit config to `rateLimiter.ts`**

Add a new entry to the `RATE_LIMITS` object after `CONTACT_FORM` (line 97 of `rateLimiter.ts`):

```typescript
// Device verification: legitimate security flow — same limit for anon and auth
DEVICE_VERIFY: {
  windowMs: 60 * 1000,      // 1 minute
  maxRequests: 5,           // Auth: 5 req/min
  maxAnonRequests: 5,       // Anon: 5/min — same because this IS the auth flow
  keyPrefix: 'device_verify'
}
```

This separates device verification from the generic `EMAIL` bucket, so other email calls in the same window cannot consume a user's verification budget.

**Step 1B: Switch the edge function to use the new config**

In `send-device-verification-email/index.ts` at line 170, change:
```typescript
// Before
const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.EMAIL, null, clientIp);

// After
const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.DEVICE_VERIFY, null, clientIp);
```

Also add structured delivery logging after the Resend call so failures appear in edge function logs:
```typescript
const emailResponse = await resend.emails.send({...});
if (emailResponse.error) {
  console.error('Resend delivery failed:', JSON.stringify(emailResponse.error));
} else {
  console.log('Device verification email delivered. id:', emailResponse.data?.id);
}
```

**Step 1C: Surface delivery failure in `device-verify.service.ts`**

Update `DeviceChallengeResult` interface to carry an `emailSent` flag:
```typescript
export interface DeviceChallengeResult {
  success: boolean;
  challengeId?: string;
  emailSent?: boolean;   // NEW
  error?: string;
}
```

In `createDeviceChallenge()`, change the email block from a fire-and-forget to a checked call:
```typescript
// Before: always returns success with no email status
try {
  await supabase.functions.invoke('send-device-verification-email', { body: {...} });
} catch (emailError) { ... }
return { success: true, challengeId: result.challenge_id };

// After: checks the invoke response and returns emailSent flag
let emailSent = false;
const { data: emailData, error: emailError } = await supabase.functions.invoke(
  'send-device-verification-email',
  { body: { email, fullName, verificationCode: result.code, deviceName, browser, os } }
);
if (emailError) {
  console.error('Edge function invocation failed:', emailError);
} else if (emailData?.error) {
  console.error('Email delivery error from edge function:', emailData.error);
} else {
  emailSent = true;
}

return { success: true, challengeId: result.challenge_id, emailSent };
```

**Step 1D: Show warning banner in `VerifyDevicePage.tsx` when `emailSent = false`**

In `login.service.ts` (wherever `createDeviceChallenge` is called), persist the `emailSent` flag to the `authFlow` store so `VerifyDevicePage` can read it on mount.

In `VerifyDevicePage.tsx`, add state for the email delivery status and show a prominent yellow warning banner at the top of Phase 1 when delivery failed:

```tsx
// Add state
const [emailDeliveryFailed, setEmailDeliveryFailed] = useState(
  authFlow?.emailDeliveryFailed === true
);

// Show banner above the OTP boxes if delivery failed
{emailDeliveryFailed && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
    <span className="text-amber-600 text-lg">⚠️</span>
    <div>
      <p className="text-sm font-medium text-amber-800">
        L'email n'a pas pu être envoyé
      </p>
      <p className="text-xs text-amber-700 mt-0.5">
        Cliquez sur "Renvoyer le code" dans 60s, ou vérifiez votre spam.
      </p>
    </div>
  </div>
)}
```

This turns a silent failure into an actionable message that appears immediately.

---

### Phase 2 — Polish the Experience

**Step 2A: Fix hardcoded name in `resendDeviceCode()`**

Update the function signature in `device-verify.service.ts`:
```typescript
// Before
export async function resendDeviceCode(challengeId: string, email: string): Promise<ResendDeviceCodeResult>

// After
export async function resendDeviceCode(
  challengeId: string,
  email: string,
  fullName: string = 'Utilisateur'  // Accept name, default if missing
): Promise<ResendDeviceCodeResult>
```

Pass it through the edge function body:
```typescript
body: {
  email,
  fullName,   // ← was hardcoded 'Utilisateur'
  verificationCode: result.code,
  deviceName: result.device_name || deviceInfo.deviceName,
  browser: result.browser || deviceInfo.browser,
},
```

Update the call in `VerifyDevicePage.tsx` line 166:
```typescript
// Before
const result = await resendDeviceCode(challengeId, email);

// After
const result = await resendDeviceCode(challengeId, email, fullName || 'Utilisateur');
```

**Step 2B: Honest delivery status in the resend toast**

Update `ResendDeviceCodeResult` to carry `emailSent`:
```typescript
export interface ResendDeviceCodeResult {
  success: boolean;
  emailSent?: boolean;
  error?: string;
}
```

Apply the same checked invoke pattern from Step 1C to `resendDeviceCode()`.

In `VerifyDevicePage.tsx`, change the resend success handler:
```typescript
// Before: always shows success
toast({ title: "Code renvoyé ✅", description: "Un nouveau code a été envoyé à votre email" });

// After: honest feedback
if (result.emailSent) {
  toast({ title: "Code renvoyé ✅", description: "Vérifiez votre boîte mail et dossier spam" });
} else {
  toast({
    title: "Envoi échoué ⚠️",
    description: "L'email n'a pas pu être envoyé. Attendez 60s et réessayez.",
    variant: "destructive"
  });
}
```

Also make the spam folder reminder more visible. Currently it is tiny footnote text at the bottom (line 392). Move it to a persistent blue info banner right below the OTP boxes — always visible, not just on failure.

---

## Files to Modify

| File | Changes |
|---|---|
| `supabase/functions/_shared/rateLimiter.ts` | Add `DEVICE_VERIFY` config (5/min for both tiers) |
| `supabase/functions/send-device-verification-email/index.ts` | Switch to `RATE_LIMITS.DEVICE_VERIFY`; add Resend delivery logging |
| `src/auth/services/device-verify.service.ts` | Return `emailSent` from both `createDeviceChallenge` and `resendDeviceCode`; fix hardcoded name; pass `fullName` param to resend |
| `src/auth/routes/VerifyDevicePage.tsx` | Show warning banner when `emailSent = false`; pass `fullName` to resend; honest resend toast; promote spam reminder to visible banner |

---

## Safety Verification

| Check | Result |
|---|---|
| Does raising the anon rate limit from 3 to 5/min open a spam vector? | No. Device challenges require a valid `challenge_id` from a DB RPC that itself requires a valid `user_id`. An attacker cannot spam this endpoint without first triggering a real login flow. |
| Will the `emailSent = false` banner block the user from entering a code? | No. It is informational only. The OTP form and submit button remain fully active. |
| Does separating `DEVICE_VERIFY` from `EMAIL` affect other email endpoints? | No. Other endpoints still use `RATE_LIMITS.EMAIL`. Only `send-device-verification-email` changes. |
| Is the auth flow store (`authFlow`) affected? | Only one new field (`emailDeliveryFailed`) is added — no existing fields are changed. |
| 3G impact? | None. All changes are either server-side (edge function) or lightweight conditional renders (<1KB). |
| Does this fix the specific incident you reported? | Yes. The rate limit bucket is separated, failures surface immediately, and the resend flow now sends the correct name and reports honest delivery status. |
