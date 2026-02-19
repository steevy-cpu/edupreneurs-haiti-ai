

# Fix: Avatar Generation 500 Error + User-Friendly Fallback

## Problem
The `generate-custom-avatar` edge function uses `google/gemini-2.5-flash-image-preview` which is returning 500 errors from the AI Gateway. This is an upstream model issue, not related to the signup redesign.

## Changes

### 1. Edge Function: Switch model + add fallback retry (`supabase/functions/generate-custom-avatar/index.ts`)

- **Primary model**: `google/gemini-2.5-flash-image` (confirmed working name per Lovable AI docs)
- **Fallback model**: `google/gemini-3-pro-image-preview` (next-gen image model)
- Logic: Try primary model. If it returns 500, retry once with fallback model. If both fail, return a clean error.

Specific changes at line 110-121:
- Extract the fetch call into a helper function `tryGenerateWithModel(model, prompt, apiKey)`
- Call with primary model first, on 500 retry with fallback
- Keep existing 429/402 handling unchanged

### 2. Frontend: Graceful error in `AIAvatarGenerator.tsx` during onboarding (lines 165-168)

In `handleGenerate()`, when `isOnboarding` is true and an error occurs:
- Instead of showing a raw toast error, set a new `generationFailed` state to `true`
- Render a fallback UI in the dialog showing:
  - Message: "La generation d'avatar est temporairement indisponible. Tu pourras en creer un depuis tes parametres plus tard."
  - A "Continuer sans avatar" button that calls `onAvatarGenerated('')` (empty string signals skip) or closes the dialog so the parent `AvatarGenerationStep` skip button is accessible

Actually, since `AIAvatarGenerator` receives `onOpenChange` and the parent `AvatarGenerationStep` has a "Plus tard" skip button visible when the dialog is closed, the simplest approach is:
- On error during onboarding: show a friendly toast + close the dialog automatically, revealing the existing "Plus tard" skip button
- Add a dedicated "Continuer sans avatar" button inside the dialog's error state for direct skip

### 3. No changes to `AvatarGenerationStep.tsx`
The existing skip flow ("Plus tard" button calling `skipAvatarGeneration()`) already handles the case. We just need the dialog to not trap the user on error.

---

## Detailed Changes

### File: `supabase/functions/generate-custom-avatar/index.ts`

**Add helper function** (before `serve`):
```typescript
async function tryGenerateImage(model: string, prompt: string, apiKey: string) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text']
    }),
  });
  return response;
}
```

**Replace lines 110-121** with:
```typescript
// Try primary model, fall back to alternative on 500
const PRIMARY_MODEL = 'google/gemini-2.5-flash-image';
const FALLBACK_MODEL = 'google/gemini-3-pro-image-preview';

let response = await tryGenerateImage(PRIMARY_MODEL, prompt, LOVABLE_API_KEY);

if (response.status === 500) {
  console.warn(`Primary model ${PRIMARY_MODEL} returned 500, trying fallback ${FALLBACK_MODEL}`);
  response = await tryGenerateImage(FALLBACK_MODEL, prompt, LOVABLE_API_KEY);
}
```

Keep the existing `if (!response.ok)` block after this (lines 123-140) unchanged.

### File: `src/components/AIAvatarGenerator.tsx`

**Add state** (after line 91):
```typescript
const [generationFailed, setGenerationFailed] = useState(false);
```

**Update `handleGenerate`** (lines 143-171):
- In the catch block, if `isOnboarding` is true, set `generationFailed = true` instead of just showing a toast
- Reset `generationFailed` when dialog opens or user retries

**Add fallback UI** in the preview/footer section:
- When `generationFailed && isOnboarding`, render:
  - Warning icon + French message about temporary unavailability
  - "Continuer sans avatar" button that calls `onOpenChange(false)` (closes dialog, revealing the skip button in AvatarGenerationStep)
  - "Reessayer" button that resets `generationFailed` and retries

### Redeploy
Deploy `generate-custom-avatar` edge function after changes.

---

## Safety Verification

| Check | Status |
|---|---|
| No signup redesign code touched | Correct -- only avatar edge function + AIAvatarGenerator |
| Primary model is confirmed available | `google/gemini-2.5-flash-image` per Lovable AI docs |
| Fallback model is confirmed available | `google/gemini-3-pro-image-preview` per Lovable AI docs |
| User not blocked during onboarding | "Continuer sans avatar" button + existing "Plus tard" skip |
| Non-onboarding avatar generation unchanged | Error toast behavior preserved when `isOnboarding` is false |
| Edge function retry is bounded | Single retry only (primary + fallback = max 2 attempts) |

