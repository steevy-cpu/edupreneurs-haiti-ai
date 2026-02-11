

# Fix NatCash Payment Flow Gaps

## Issues Found

1. **Missing destination wallet number**: The USSD instructions in `NatCashPaymentFlow.tsx` tell the user to transfer money but never show WHERE to send it (step 3 is missing "enter the number: XXXXXXXX"). The edge function returns `paymentInstructions.accountNumber` but the component ignores it.

2. **Broken fallback**: The `onFallback` prop is never passed from `Settings.tsx`, so the "Televerser mon recu" button does nothing.

3. **Missing secrets**: `NATCASH_ACCOUNT_NUMBER` and `NATCASH_ACCOUNT_NAME` are not configured in the environment. The edge function defaults to `'NOT_CONFIGURED'`.

4. **No reusable receipt upload component**: The receipt upload UI only exists inside `NatCashDemo.tsx` (a demo page), not as a standalone component the fallback can use.

---

## Changes

### 1. Add missing secrets

Prompt you to configure:
- `NATCASH_ACCOUNT_NUMBER` -- your platform's NatCash phone number (8 digits)
- `NATCASH_ACCOUNT_NAME` -- display name for the recipient (e.g., "Edupreneurs Haiti")

### 2. Update `NatCashPaymentFlow.tsx`

- Store the `paymentInstructions` returned by `natcash-create-order` in component state
- Display the **destination wallet number** prominently in the instructions step (step 3: "Entrez le numero: XXXXXXXX")
- Add a built-in receipt upload fallback step directly inside the component (no need for a separate component -- keeps it self-contained)
- The fallback step will: capture a photo/file, call `natcash-upload-receipt`, then show "pending verification" state

### 3. Update `Settings.tsx`

Both NatCash instances (active subscription and expired subscription sections) need:
- Pass `onFallback` prop -- but since we're building the fallback INTO the component itself, this prop becomes unnecessary. The component will handle the full flow internally.

### 4. Flow After Fix

```text
Phone Entry --> Create Order --> Instructions (with wallet number) --> "J'ai effectue le transfert"
    --> Polling (3 min) --> Auto-confirmed? --> Success
                       --> Timeout? --> Fallback: Upload Receipt --> Pending Admin Verification
```

---

## File Changes

| Action | File | Description |
|--------|------|-------------|
| SECRET | `NATCASH_ACCOUNT_NUMBER` | Platform NatCash phone (8 digits) |
| SECRET | `NATCASH_ACCOUNT_NAME` | Platform display name |
| EDIT | `src/components/subscription/NatCashPaymentFlow.tsx` | Use API response for instructions, add built-in receipt upload fallback |
| EDIT | `src/pages/Settings.tsx` | Remove unused `onFallback` prop (flow is self-contained) |

### Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- enhances existing flow |
| Works with existing data? | Yes -- uses existing `natcash-upload-receipt` edge function |
| 3G optimized? | Yes -- receipt image compressed client-side before upload |
| Backward compatible? | Yes -- old orders still work |
| Edge cases? | Missing secrets shows "Contact support" instead of broken number |
