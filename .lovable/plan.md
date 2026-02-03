

# Fix Plan: Exam Tutor Validation Schema - Options Format Mismatch

## Problem

The `exam-tutor` edge function returns a **400 error** with:
```json
{"error":"Validation failed","details":["Expected array, received object"]}
```

**Root Cause:** The database stores exercise options as an **object**:
```json
{"A":"option 1","B":"option 2","C":"option 3","D":"option 4"}
```

But the Zod validation schema expects an **array**:
```typescript
options: z.array(z.string().max(1000)).max(10).optional().nullable()
```

The edge function's business logic already handles both formats, but the validation schema rejects the object format before execution reaches that code.

---

## Solution

Update the `examTutorSchema` in `supabase/functions/_shared/validation.ts` to accept **both formats**:
1. Array of strings: `["option 1", "option 2", "option 3"]`
2. Object with letter keys: `{"A": "option 1", "B": "option 2"}`

---

## Implementation

### File: `supabase/functions/_shared/validation.ts`

**Current (Line 132):**
```typescript
options: z.array(z.string().max(1000)).max(10).optional().nullable(),
```

**Fixed:**
```typescript
options: z.union([
  z.array(z.string().max(1000)).max(10),
  z.record(z.string().max(1), z.string().max(1000))
]).optional().nullable(),
```

This accepts:
- An array of strings (original format)
- A record/object with single-character keys (A-Z) and string values (database format)

---

## File Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `supabase/functions/_shared/validation.ts` | Update `options` field to accept both array and object formats | Fixes 400 error on exam tutor API calls |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Still accepts array format |
| Works with database format? | Yes | Now accepts object format too |
| Edge function logic compatible? | Yes | Line 66 already handles both formats |
| 3G optimized? | N/A | No performance change |
| Backward compatible? | Yes | All existing formats supported |

---

## Implementation Time

~5 minutes - Single line change in validation schema

