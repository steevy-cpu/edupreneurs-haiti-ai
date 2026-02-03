
# Fix Plan: MCQ Detection for Object-Based Options

## Problem Summary

Questions that should appear as multiple choice (MCQ) are showing as free-text input. The database stores options as an **object** with letter keys:
```json
{"A":"yo te kontinye fè lagè", "B":"yo te ka siyen lapè", "C":"yo t al planifye lagè...", "D":"diskite sou eta malè..."}
```

But the UI checks only for **arrays**:
```typescript
const hasOptions = exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0;
```

Since `Array.isArray({A: "..."})` returns `false`, the MCQ options are never detected.

---

## Root Cause

In `AnswerInput.tsx` (lines 37-40):
```typescript
// Current logic - only checks for arrays
const hasOptions = exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0;
const hasOptionsJson = exercise.options_json && Object.keys(exercise.options_json).length > 0;
const isMCQ = hasOptions || hasOptionsJson;
```

The `options` field from the database is an **object** `{A, B, C, D}`, not an array. The code only checks `options_json` for objects, but the actual data is in `options`.

---

## Solution

Update the MCQ detection logic to check if `options` is an object with keys (not just an array):

```typescript
// Check for array-based options (legacy format)
const hasOptionsArray = exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0;

// Check for object-based options (current database format: {A: "...", B: "..."})
const hasOptionsObject = exercise.options && 
  typeof exercise.options === 'object' && 
  !Array.isArray(exercise.options) && 
  Object.keys(exercise.options).length > 0;

// Check for structured options_json (with blocks)
const hasOptionsJson = exercise.options_json && Object.keys(exercise.options_json).length > 0;

const isMCQ = hasOptionsArray || hasOptionsObject || hasOptionsJson;
```

Also update the rendering logic to handle the object format in `options` (not just `options_json`).

---

## File Changes

### File: `src/features/exams/practice/components/AnswerInput.tsx`

**1. Update MCQ Detection (lines 37-40)**

Current:
```typescript
const hasOptions = exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0;
const hasOptionsJson = exercise.options_json && Object.keys(exercise.options_json).length > 0;
const isMCQ = hasOptions || hasOptionsJson;
```

Fixed:
```typescript
// Check for array-based options (legacy format)
const hasOptionsArray = exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0;
// Check for object-based options (current database format: {A: "...", B: "..."})
const hasOptionsObject = exercise.options && 
  typeof exercise.options === 'object' && 
  !Array.isArray(exercise.options) && 
  Object.keys(exercise.options as Record<string, unknown>).length > 0;
// Check for structured options_json (with blocks)
const hasOptionsJson = exercise.options_json && Object.keys(exercise.options_json).length > 0;
const isMCQ = hasOptionsArray || hasOptionsObject || hasOptionsJson;
```

**2. Update Options Rendering (lines 57-60)**

Current:
```typescript
const optionEntries = hasOptionsJson
  ? Object.entries(exercise.options_json!).sort(([a], [b]) => a.localeCompare(b))
  : (exercise.options || []).map((opt, idx) => [LETTERS[idx], { value: opt, blocks: null }] as const);
```

Fixed:
```typescript
// Priority: options_json > options (object) > options (array)
let optionEntries: [string, { value: string; blocks: any } | string][];

if (hasOptionsJson) {
  optionEntries = Object.entries(exercise.options_json!).sort(([a], [b]) => a.localeCompare(b));
} else if (hasOptionsObject) {
  // Handle object format: {A: "text", B: "text", ...}
  optionEntries = Object.entries(exercise.options as Record<string, string>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => [key, { value, blocks: null }]);
} else {
  // Handle array format: ["option1", "option2", ...]
  optionEntries = (exercise.options as string[] || []).map((opt, idx) => 
    [LETTERS[idx], { value: opt, blocks: null }] as [string, { value: string; blocks: null }]
  );
}
```

**3. Update Type Definition (types.ts line 45)**

Current:
```typescript
options?: string[] | null;
```

Fixed:
```typescript
options?: string[] | Record<string, string> | null;
```

---

## Files to Modify

| File | Change | Lines |
|------|--------|-------|
| `src/features/exams/practice/components/AnswerInput.tsx` | Update MCQ detection and rendering logic | ~15 lines |
| `src/features/exams/practice/types.ts` | Update `options` type to include object format | 1 line |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Adds support for object format while keeping array support |
| Works with existing data? | Yes | Database already has object format |
| 3G optimized? | N/A | No performance change |
| Backward compatible? | Yes | Still supports array format if used |
| Edge cases handled? | Yes | Checks for null, array, and object types |

---

## Expected Result

After this fix:
- Q1 "Wa Frans ak Espay te vle rankontre pou" will show 4 MCQ options (A, B, C, D)
- Q2 will also show MCQ options
- Q3-Q5 (which have `options: null`) will correctly show as short answer
