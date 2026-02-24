

# Plan B — UX Fixes for Dons and Paiements

## Fix 1: Database-wide stats in DonationsModule

**File:** `src/pages/control-center/modules/DonationsModule.tsx`

Add a separate TanStack Query (`queryKey: ["admin-donations-stats"]`) that runs a single Supabase query to get aggregated totals across the entire `donations` table:

```typescript
const { data: stats } = useQuery({
  queryKey: ["admin-donations-stats"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("donations")
      .select("amount, currency, status");
    if (error) throw error;
    let htg = 0, usd = 0, total = 0;
    for (const d of data) {
      total++;
      if (d.status === "completed") {
        if (d.currency === "HTG") htg += d.amount;
        if (d.currency === "USD") usd += d.amount;
      }
    }
    return { total, htg, usd };
  },
});
```

- Remove the existing `useMemo`-based `stats` calculation
- Update stats card labels from "Total dons (page)" to "Total dons"
- This query is lightweight (only 3 columns, no joins) and cached by TanStack Query

**Note:** Supabase doesn't support `GROUP BY` via the JS client, so we fetch minimal columns and aggregate client-side. With the donations table unlikely to exceed 1000 rows soon, this is safe. If it does, a DB function would be the next step.

---

## Fix 2: Accumulation pagination in DonationsModule

**File:** `src/pages/control-center/modules/DonationsModule.tsx`

Replace the current page-replacement pattern with append-style accumulation:

- Add `const [allDonations, setAllDonations] = useState<DonationAdmin[]>([])` and `const [hasMore, setHasMore] = useState(true)`
- Change query to always fetch from `page * PAGE_SIZE` range
- On query success, append new rows to `allDonations` (instead of replacing)
- Reset `allDonations` and `page` to 0 when filters change
- "Charger plus" button: increments page, which triggers fetch, which appends
- Show `hasMore` = false when last fetch returned fewer than 50 rows
- Add loaded count text: "Affichage de {allDonations.length} dons"
- `filteredDonations` useMemo filters from `allDonations` instead of `donations`

---

## Fix 3: Pagination in PaymentsModule

**File:** `src/pages/control-center/modules/PaymentsModule.tsx`

Add the same accumulation pattern:

- Add `page`, `allPayments`, `hasMore` state variables
- Add `PAGE_SIZE = 50` constant
- Add `.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)` to the existing query
- On success, append to `allPayments`
- Reset on filter changes
- Add "Charger plus" button at bottom of list (same style as DonationsModule)
- Add loaded count text: "Affichage de {allPayments.length} paiements"

---

## Fix 4: Add Stripe to PaymentsModule provider filter

**File:** `src/pages/control-center/modules/PaymentsModule.tsx`

- Line 209-210: Add `<SelectItem value="stripe">Stripe</SelectItem>` after the MonCash option
- Line 136-143: Add `'stripe'` case to `getProviderBadge` with purple styling matching DonationsModule:
  ```
  case 'stripe':
    return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Stripe</Badge>;
  ```
- Reset page to 0 on provider filter change (same as status filter)

---

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality affected? | No -- all changes are additive |
| RLS policies changed? | No |
| New dependencies? | No |
| Bundle size impact? | Negligible (same components) |
| 3G performance | Improved -- stats query fetches only 3 columns; pagination limits to 50 rows |
| Provider stack / AppShell | Not affected |
| Backward compatibility | Full -- no DB or API changes |

## Files Modified

1. `src/pages/control-center/modules/DonationsModule.tsx` (Fixes 1 + 2)
2. `src/pages/control-center/modules/PaymentsModule.tsx` (Fixes 3 + 4)

No database migrations. No edge function changes. No new files.

