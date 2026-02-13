

# Donations Control Center Tab + Donor Email Collection

## What We're Building

Two interconnected features:
1. A new **"Donations" tab** in the Control Center for super users to monitor all contributions
2. A **donor email field** on the `/donate` page so we can send thank-you emails and display emails in the admin view

---

## 1. Database: Add `donor_email` Column

Add a single nullable `TEXT` column to the existing `donations` table:

```sql
ALTER TABLE public.donations ADD COLUMN donor_email TEXT;
```

No other schema changes needed. The existing RLS policies (public INSERT, founder-only SELECT) already cover this column automatically.

---

## 2. Frontend: Donor Email Input on `/donate`

**File: `src/components/donate/DonationCard.tsx`**

- Add a `donorEmail` state variable
- Add an email `<Input>` field between the name and message fields with:
  - Placeholder: "Votre email (pour recevoir un remerciement)"
  - Type `email`, maxLength 255
  - Basic client-side validation (HTML5 email type handles this)
- Pass `donor_email` to the `donations` INSERT call (MonCash flow)
- Pass `donorEmail` to both edge functions (`moncash-create-payment` and `stripe-create-donation`)

---

## 3. Edge Functions: Accept & Store Email

**File: `supabase/functions/stripe-create-donation/index.ts`**
- Accept `donorEmail` from the request body
- Include it in the `donations` INSERT as `donor_email`
- Add it to Stripe checkout session metadata for traceability

**File: `supabase/functions/moncash-create-payment/index.ts`**
- No changes needed here -- the email is already stored in the `donations` table directly from the client before calling this function

---

## 4. Control Center: Donations Module

### New Type (in `src/pages/control-center/types.ts`)

```typescript
export interface DonationAdmin {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  provider: string;
  donor_name: string | null;
  donor_email: string | null;
  donor_message: string | null;
  status: string;
  created_at: string;
}
```

### New Module: `src/pages/control-center/modules/DonationsModule.tsx`

Following the exact same pattern as `PaymentsModule.tsx`:

- **Header**: Title "Dons" with a refresh button and pending count badge
- **Filters bar** (Card with 3 controls):
  - Search input (searches order_id, donor_name, donor_email)
  - Status filter dropdown: Tous / En attente / Completes / Echoues
  - Provider filter dropdown: Tous / MonCash / Stripe
- **Donations list**: Cards showing for each donation:
  - Order ID (mono font, bold)
  - Provider badge (MonCash blue / Stripe purple)
  - Status badge (pending yellow / completed green / failed red)
  - Amount + currency
  - Donor name (if provided)
  - Donor email (if provided, with a mail icon)
  - Donor message (if provided, italic)
  - Created date
- **Summary stats row** at the top:
  - Total donations count
  - Total HTG amount
  - Total USD amount (stored in cents, displayed as dollars)
- Data fetched via `useQuery` from the `donations` table, ordered by `created_at DESC`

### Register Module (in `src/pages/control-center/modules.ts`)

Add the new module to the `CONTROL_CENTER_MODULES` array:

```typescript
{
  id: "donations",
  label: "Dons",
  shortLabel: "Dons",
  icon: Heart, // from lucide-react
  component: lazy(() => import("./modules/DonationsModule")),
  badge: async () => {
    const { count } = await supabase
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    return count || 0;
  },
}
```

Position it after "Payments" in the array for logical grouping.

---

## File Summary

| File | Action | What Changes |
|------|--------|--------------|
| `donations` table | Migration | Add `donor_email TEXT` column |
| `src/components/donate/DonationCard.tsx` | Edit | Add email input + pass to insert/functions |
| `supabase/functions/stripe-create-donation/index.ts` | Edit | Accept + store `donorEmail` |
| `src/pages/control-center/types.ts` | Edit | Add `DonationAdmin` interface |
| `src/pages/control-center/modules.ts` | Edit | Register DonationsModule |
| `src/pages/control-center/modules/DonationsModule.tsx` | Create | Full admin view for donations |

---

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- additive column, no existing code reads `donor_email` |
| Works with existing data? | Yes -- column is nullable, old rows get NULL |
| Backward compatible? | Yes -- email field is optional for donors |
| 3G optimized? | Yes -- no new assets, simple text field |
| Edge cases? | Empty email stored as NULL, not empty string |
| Security? | Email visible only to founders via existing RLS SELECT policy |

