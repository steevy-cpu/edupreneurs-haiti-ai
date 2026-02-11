

# Fix: MonCash Payment Validation Rejects Signup Fields

## Root Cause
The `paymentSchema` in `supabase/functions/_shared/validation.ts` (line 259) uses `.strict()`, which means it rejects any keys not defined in the schema. The signup payment sends `isSignupPayment` and `email` alongside `amount` and `description`, causing the 400 error:

```
{"error":"Données invalides","details":["Unrecognized key(s) in object: 'isSignupPayment', 'email'"]}
```

## Fix
Update `paymentSchema` to include the two optional signup fields: `isSignupPayment` (boolean) and `email` (string).

## Change

**File: `supabase/functions/_shared/validation.ts`** (lines 253-259)

```typescript
// From:
export const paymentSchema = z.object({
  amount: z.number()
    .positive("Montant doit être positif")
    .max(1000000, "Montant trop élevé"),
  description: z.string().max(500).optional(),
  orderId: z.string().max(100).optional(),
}).strict();

// To:
export const paymentSchema = z.object({
  amount: z.number()
    .positive("Montant doit être positif")
    .max(1000000, "Montant trop élevé"),
  description: z.string().max(500).optional(),
  orderId: z.string().max(100).optional(),
  isSignupPayment: z.boolean().optional(),
  email: z.string().email().max(320).optional(),
}).strict();
```

This keeps `.strict()` for security (rejecting truly unknown fields) while allowing the two signup-specific fields that the edge function already handles.

