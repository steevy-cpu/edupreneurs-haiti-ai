

# Fix: Quiz JSON Parse Error in Edge Function

## Problem
The `generate-quiz-final` edge function fails with `SyntaxError: Bad escaped character in JSON at position 8411`. The AI model (Gemini 2.5 Flash) returns JSON containing improperly escaped characters -- typically backslashes in math expressions like `f(x₁) \ne f(x₂)` -- which causes `JSON.parse` to fail. The function returns a 500 error and the student sees "Quiz non disponible."

## Root Cause
Line 417 in `supabase/functions/generate-quiz-final/index.ts` does a raw `JSON.parse(rawContent)` with no sanitization. When the AI includes unescaped special characters (common in math-heavy lessons like "Applications et Bijections"), parsing fails.

## Solution
Add a JSON sanitization step before parsing, and a retry mechanism if the first attempt fails.

## Changes

**File: `supabase/functions/generate-quiz-final/index.ts`** (lines 406-421)

1. After cleaning markdown code blocks (line 410), add a sanitization function that fixes common bad escape sequences:
   - Replace invalid escape sequences like `\n` inside strings that aren't actual newlines, lone backslashes, etc.
   - Use a regex to fix unescaped backslashes: replace `\` followed by a character that isn't a valid JSON escape (`"`, `\`, `/`, `b`, `f`, `n`, `r`, `t`, `u`) with `\\`

2. Wrap the parse in a two-step try/catch:
   - **Step 1**: Try `JSON.parse(rawContent)` as-is
   - **Step 2**: If that fails, sanitize the raw content by fixing bad escapes, then retry `JSON.parse`
   - **Step 3**: If both fail, return the error

### Code

```typescript
// Sanitize common AI JSON escape issues (math backslashes, etc.)
const sanitizeJsonString = (str: string): string => {
  // Fix invalid escape sequences: replace \X where X is not a valid JSON escape char
  return str.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
};

let parsedQuiz;
try {
  parsedQuiz = JSON.parse(rawContent);
} catch (parseError) {
  console.warn('First JSON parse failed, attempting sanitization...');
  try {
    const sanitized = sanitizeJsonString(rawContent);
    parsedQuiz = JSON.parse(sanitized);
    console.log('JSON parse succeeded after sanitization');
  } catch (secondError) {
    console.error('Failed to parse JSON even after sanitization:', secondError);
    return secureErrorResponse('AI returned invalid JSON', 500);
  }
}
```

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- valid JSON still parses on first try |
| Handles math content? | Yes -- fixes unescaped backslashes common in math expressions |
| 3G impact? | None -- server-side only |
| Backward compatible? | Yes -- adds fallback, doesn't change success path |

