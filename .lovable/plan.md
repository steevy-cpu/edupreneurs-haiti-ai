

# Fix Studygram Generation Failures — 2 Reliability Improvements

## Root Cause Analysis

The edge function logs show **two failure modes**, both from AI model non-compliance:

1. **Truncated JSON** (3 occurrences) — The AI returns incomplete JSON that fails `JSON.parse()`. This happens because the combined prompt + lesson content is large, causing the model to hit output token limits or produce malformed responses.

2. **Node text too long** (1 occurrence) — The AI generates a node with text exceeding the 300-character Zod limit at `sections[0].nodes[5].text`.

Currently, both failures return a 500 error with no recovery attempt. The user sees "Edge Function returned a non-2xx status code" and must manually retry.

---

## Fix 1 — Add `response_format: { type: "json_object" }` and Increase Resilience

**Problem:** The AI model returns truncated or non-JSON output because there's no structured output enforcement.

**Changes in `supabase/functions/generate-studygram-visual/index.ts`:**

1. **Add `response_format`** to the AI gateway request body (line 242-248):
   - Add `response_format: { type: "json_object" }` to force the model to return valid JSON
   - This eliminates the markdown code fence wrapping issue and truncated responses

2. **Add `max_tokens: 4096`** to ensure the model has enough output budget for the full 4-section structure

3. **Strengthen the prompt constraint** (line 162):
   - Change "Chaque node fait 10-50 mots maximum" to "Chaque node fait 10-40 mots maximum (200 caractères max)"
   - This gives the AI a character-aware limit that stays well under the 300-char Zod constraint

---

## Fix 2 — Auto-Truncate Long Nodes Instead of Failing

**Problem:** When one node text exceeds 300 characters, the entire studygram fails Zod validation and the user gets nothing.

**Changes in `supabase/functions/generate-studygram-visual/index.ts`:**

1. **Add a sanitization step** between `JSON.parse()` and Zod validation (after line 278):
   - Loop through `parsedData.sections` and truncate any `node.text` longer than 295 characters (with "..." suffix)
   - This gracefully handles AI overflows without losing the entire generation

2. **Add heading truncation** — cap headings at 78 characters (Zod max is 80) for the same reason

---

## Fix 3 — Add a Single Automatic Retry on Parse/Validation Failure

**Problem:** Transient AI failures (truncated JSON) require the user to manually click "Retry". On 3G connections this is frustrating.

**Changes:**

1. **Wrap the AI call + parse + validate block** in a retry loop (max 1 retry):
   - On first failure (parse error or validation error), retry the AI call once automatically
   - On second failure, return the error to the user as before
   - Log which attempt succeeded/failed for observability

---

## Summary of Changes

```text
supabase/functions/generate-studygram-visual/index.ts
  Line 162:      Tighten prompt: "200 caractères max" per node
  Lines 242-248: Add response_format + max_tokens to AI request
  Lines 273-286: Add sanitization step (truncate long nodes/headings)
  Lines 236-286: Wrap in retry loop (1 automatic retry on failure)
```

No frontend changes. No database changes. No new dependencies.

---

## Verification

| Check | Result |
|---|---|
| Existing functionality broken? | No -- same input/output contract |
| New dependencies? | None |
| Bundle size impact? | Zero -- edge function only |
| 3G performance? | Improved -- auto-retry saves manual retry round-trip |
| Rate limiting affected? | No -- retry happens server-side within same request |
| Cold start impact? | None -- no new imports |
| Backward compatible? | Yes -- same response shape |

