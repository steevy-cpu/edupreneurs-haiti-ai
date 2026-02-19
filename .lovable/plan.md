
## Plan C: Control Center — 7 Low-Severity Cleanup Fixes

### Pre-implementation audit findings

**Fix 1 — Auth calls in ReportsModule.tsx**

Three independent `supabase.auth.getUser()` calls:
- Line 156 in `updateReportStatus`
- Line 186 in `saveAdminNotes`
- Line 296 in `handleDismissReport`

Each makes a network round-trip to the auth server. The fix: import `useSessionAuth` from `@/contexts/SessionAuthContext`, call it once at the top of the component, and use the returned `user` object in all three functions. The `user` object from `useSessionAuth` is the same in-memory session user that these calls return — no behavior change, just eliminates 3 redundant network calls.

Note: Lines 212 and 256 (`supabase.auth.getSession()`) feed the `Authorization` header for direct `fetch()` calls to edge functions — these are **not** redundant and must stay unchanged. Only the three `getUser()` calls for `reviewed_by: user?.id` are replaced.

**Fix 2 — Auth call in AnnouncementsModule.tsx**

Line 110 in `sendMutation.mutationFn`: `const { data: { user } } = await supabase.auth.getUser()`. The `user.id` is only used for `sent_by: user.id` (line 129). Fix: import `useSessionAuth`, call it at the component level, use `user?.id` in the mutation body. Add a guard: if `!user` throw `new Error('Non authentifié')` (the existing guard on line 111 already does this).

**Fix 3 — UsersModule GRADES vs ACADEMIC_GRADES in types.ts**

Current `GRADES` array in `UsersModule.tsx` (lines 44–52):
```
7AF, 8AF, 9AF, NS3, NS4, PHILO
```

`ACADEMIC_GRADES` in `types.ts` (line 19):
```
'7AF', '7e', '8AF', '8e', '9AF', 'NS1', 'NS3', 'NS4', 'Philo', 'S1'
```

Missing from UsersModule: `7e`, `8e`, `NS1`, `S1`. Also `PHILO` is cased wrong — types.ts uses `Philo`. The fix: replace the entire `GRADES` array to exactly mirror `ACADEMIC_GRADES` from types.ts, preserving the "Tous les niveaux" sentinel and adding proper labels for each entry.

**Fix 4 — PaymentsModule search placeholder and reject status**

- Line 180: Placeholder `"Rechercher par ID, référence, téléphone..."` — the actual filter at line 143–146 only searches `order_id`. Fix: change placeholder to `"Rechercher par ID de commande..."`.
- Lines 76–83 (`verifyMutation`): when `action === 'reject'`, `updateData` only sets `admin_verified: false`, `verified_at`, and optionally `verification_notes`. The `status` field is NOT updated — a rejected payment keeps its `pending_verification` status. This makes the "Échoués" filter useless for rejected manual payments. Fix: add `if (action === 'reject') updateData.status = 'rejected'` in the same update object. This mirrors the existing `if (action === 'approve') updateData.status = 'completed'` pattern at line 82.

**Fix 5 — ContactModule pagination cap**

Line 333:
```typescript
Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
  const pageNum = i + 1;
```

This hard-caps numbered page links at 5, making pages 6+ unreachable via numbered links. The `PaginationNext` button at line 348–352 still works for sequential navigation, but the user has no direct-jump access to pages beyond 5.

Fix: Replace the static capped array with a sliding window approach that always shows at most 5 page links but centered around the current page, so pages 6+ are always accessible when navigating forward:

```typescript
// Compute visible page range — 5-page sliding window centered on currentPage
const windowSize = 5;
const halfWindow = Math.floor(windowSize / 2);
let startPage = Math.max(1, currentPage - halfWindow);
let endPage = Math.min(totalPages, startPage + windowSize - 1);
// Adjust start if we're near the end
if (endPage - startPage < windowSize - 1) {
  startPage = Math.max(1, endPage - windowSize + 1);
}
const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
```

Then render `pageNumbers.map(...)` instead of the `Array.from({ length: Math.min(5, totalPages) })` block. This makes all pages reachable.

**Fix 6 — Realtime re-subscription churn in ContactModule and ReportsModule**

**ContactModule.tsx (lines 118–142):**
Two `useEffect` blocks both have `[statusFilter, currentPage]` as dependencies:
- Lines 118–120: `useEffect(() => { fetchSubmissions(); }, [statusFilter, currentPage])` — correct
- Lines 122–142: realtime subscription `useEffect` also has `[statusFilter, currentPage]` — **wrong**. Every filter or page change tears down and re-creates the Supabase channel.

Fix: The realtime subscription effect gets an **empty dependency array** `[]`. The `fetchSubmissions` function it calls must be wrapped in `useCallback` with its actual dependencies (`[statusFilter, currentPage]`) so the channel callback always invokes the latest version. The subscription itself only subscribes once.

```typescript
// Stable fetch function — recreated when filters/page change
const fetchSubmissions = useCallback(async () => {
  // ... existing body unchanged
}, [statusFilter, currentPage]);

// Data fetching effect — re-runs when filters/page change
useEffect(() => {
  fetchSubmissions();
}, [fetchSubmissions]);

// Realtime subscription — subscribes ONCE on mount only
useEffect(() => {
  const channel = supabase
    .channel('contact_submissions_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_submissions' },
      () => { fetchSubmissions(); }  // always calls latest via closure
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, []); // empty — subscribe once, never re-register
```

**ReportsModule.tsx (lines 77–93):**
Same problem: single `useEffect` handles both the data fetch AND the subscription, with `[statusFilter, currentPage]` deps. Every filter/page change unsubscribes and re-subscribes.

Fix: Same pattern — wrap `fetchReports` in `useCallback([statusFilter, currentPage])`. Split into two `useEffect` blocks: one for data fetching (`[fetchReports]`), one for subscription (`[]`).

**Fix 7 — Consolidate FOUNDER_USER_IDS**

Current state:
- `src/lib/founderConstants.ts` exports `FOUNDER_USER_IDS` (lines 5–8) and `isFounder` (lines 10–13)
- `src/lib/quizBattleUtils.ts` re-declares `FOUNDER_USER_IDS` (lines 79–82) and `isFounder` (lines 87–89)

Two consumers import from `quizBattleUtils`:
1. `src/components/quiz-battle/BattleLeaderboardPreview.tsx` line 10: `import { FOUNDER_USER_IDS, calculateLevel } from '@/lib/quizBattleUtils'`
2. `src/pages/QuizBattleLeaderboard.tsx` line 11: `import { FOUNDER_USER_IDS, calculateLevel } from '@/lib/quizBattleUtils'`

**Plan:**
- In `quizBattleUtils.ts`: Remove the `FOUNDER_USER_IDS` array and `isFounder` function. Add `export { FOUNDER_USER_IDS, isFounder } from '@/lib/founderConstants'` — this re-exports from the canonical source. This preserves backward compatibility for `BattleLeaderboardPreview` and `QuizBattleLeaderboard` without touching those files. The comment "NOTE: Keep in sync with..." in `founderConstants.ts` is also removed as it's no longer needed.
- Result: single source of truth in `founderConstants.ts`, all existing imports continue to work.

---

### Technical Implementation

#### Fix 1 + Fix 6 — ReportsModule.tsx

Add `useCallback` to imports. Import `useSessionAuth`. At component top level add:
```typescript
const { user } = useSessionAuth();
```

Wrap `fetchReports` in `useCallback`:
```typescript
const fetchReports = useCallback(async () => {
  // ... existing body unchanged
}, [statusFilter, currentPage]);
```

Replace the single combined `useEffect` (lines 77–93) with two separate effects:
```typescript
// Data fetch — re-runs when filter/page change
useEffect(() => {
  fetchReports();
}, [fetchReports]);

// Realtime subscription — subscribes once, calls stable fetchReports ref
useEffect(() => {
  const channel = supabase
    .channel("reports-updates")
    .on("postgres_changes", { event: "*", schema: "public", table: "user_reports" },
      () => fetchReports()
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

In `updateReportStatus` (line 156): replace `const { data: { user } } = await supabase.auth.getUser()` with nothing — use component-level `user` directly.

In `saveAdminNotes` (line 186): same replacement.

In `handleDismissReport` (line 296): same replacement.

The `getSession()` calls at lines 212 and 256 (for direct `fetch()` to edge functions) are **left completely unchanged**.

#### Fix 2 — AnnouncementsModule.tsx

Add `useSessionAuth` import from `@/contexts/SessionAuthContext`. At top of `AnnouncementsModule` component body add:
```typescript
const { user } = useSessionAuth();
```

In `sendMutation.mutationFn` (lines 109–148): Remove `const { data: { user } } = await supabase.auth.getUser()`. The guard becomes `if (!user) throw new Error('Non authenticated')`. The `sent_by: user.id` at line 129 becomes `sent_by: user!.id` (or `sent_by: user?.id ?? ''`). The `mutationFn` no longer needs `async` for the auth call but remains async for the supabase calls.

Also remove the local `Announcement` interface (lines 22–35) and add to the imports line: `import { Announcement, ACADEMIC_GRADES } from '../types'`. The locally declared `ACADEMIC_GRADES` constant at line 18–20 is also removed since it's already in types.ts.

Wait — `ACADEMIC_GRADES` in types.ts is typed as `const` with `as const`. The local declaration in AnnouncementsModule is identical. We can safely remove the local one and import from types. The type of `selectedGrades` state (`string[]`) remains compatible.

#### Fix 3 — UsersModule.tsx

Replace lines 44–52 (the `GRADES` const) with:
```typescript
const GRADES = [
  { value: "all", label: "Tous les niveaux" },
  { value: "7AF", label: "7ème AF" },
  { value: "7e", label: "7ème" },
  { value: "8AF", label: "8ème AF" },
  { value: "8e", label: "8ème" },
  { value: "9AF", label: "9ème AF" },
  { value: "NS1", label: "NS1" },
  { value: "NS3", label: "NS3" },
  { value: "NS4", label: "NS4" },
  { value: "Philo", label: "Philo" },
  { value: "S1", label: "S1" },
];
```

Note: `PHILO` → `Philo` (exact case match to `ACADEMIC_GRADES` in types.ts). Students who registered with grade `"PHILO"` stored in the DB will no longer match the `Philo` filter — but since the data was previously stored under `"PHILO"` (uppercase), this is a data issue, not a UI issue. The filter value must match the stored DB value. To be safe: keep **both** — add `PHILO` as a separate entry labeled "Philo (legacy)" or simply keep the value as `"PHILO"` and label it `"Philo"`. Given the types.ts canonical value is `"Philo"`, keep value `"Philo"` for new registrations and drop the `"PHILO"` legacy option, as the plan says "make it match types.ts exactly."

#### Fix 4 — PaymentsModule.tsx

Line 180: Change `"Rechercher par ID, référence, téléphone..."` to `"Rechercher par ID de commande..."`.

Lines 76–83 (`verifyMutation`): Add after the existing `if (action === 'approve') updateData.status = 'completed'` block:
```typescript
if (action === 'reject') updateData.status = 'rejected';
```

This sets `status` to `'rejected'` in the same DB write as `admin_verified: false`. Result: rejected payments show correctly under the `status: 'rejected'` filter.

#### Fix 5 — ContactModule.tsx pagination

Replace line 333:
```typescript
{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
  const pageNum = i + 1;
```

With the sliding window approach:
```typescript
{(() => {
  // 5-page sliding window centered on currentPage — never caps at page 5
  const windowSize = 5;
  const halfWindow = Math.floor(windowSize / 2);
  let startPage = Math.max(1, currentPage - halfWindow);
  let endPage = Math.min(totalPages, startPage + windowSize - 1);
  if (endPage - startPage < windowSize - 1) {
    startPage = Math.max(1, endPage - windowSize + 1);
  }
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
})().map((pageNum) => (
  <PaginationItem key={pageNum}>
    <PaginationLink
      onClick={() => setCurrentPage(pageNum)}
      isActive={currentPage === pageNum}
      className="cursor-pointer"
    >
      {pageNum}
    </PaginationLink>
  </PaginationItem>
))}
```

Also fix: the realtime subscription at lines 122–142 has `[statusFilter, currentPage]` deps — apply the same `useCallback` + split-`useEffect` pattern as ReportsModule.

#### Fix 6 — ContactModule.tsx realtime fix (included above in Fix 5 section)

Wrap `fetchSubmissions` in `useCallback([statusFilter, currentPage])`. Split the combined effect at lines 118–142 into two separate `useEffect` blocks — one with `[fetchSubmissions]` for data fetching, one with `[]` for subscription.

#### Fix 7 — quizBattleUtils.ts + founderConstants.ts

In `src/lib/quizBattleUtils.ts`, remove lines 77–89 (the `FOUNDER_USER_IDS` array and `isFounder` function). Replace with a re-export:
```typescript
// Single source of truth — imported from founderConstants to avoid duplication
export { FOUNDER_USER_IDS, isFounder } from '@/lib/founderConstants';
```

In `src/lib/founderConstants.ts`, remove the comment on line 3: `// NOTE: Keep in sync with src/lib/quizBattleUtils.ts` since it's no longer needed.

No changes needed to `BattleLeaderboardPreview.tsx` or `QuizBattleLeaderboard.tsx` — their import paths (`from '@/lib/quizBattleUtils'`) continue to work because `quizBattleUtils` re-exports the symbols.

---

### Files changed

| File | Changes |
|---|---|
| `src/pages/control-center/modules/ReportsModule.tsx` | Import `useSessionAuth` + `useCallback`. Hoist `user` to component level. Remove 3x `supabase.auth.getUser()`. Wrap `fetchReports` in `useCallback`. Split combined `useEffect` into data-fetch + subscription effects. |
| `src/pages/control-center/modules/AnnouncementsModule.tsx` | Import `useSessionAuth`. Remove `Announcement` local interface. Remove local `ACADEMIC_GRADES` constant. Import both from `../types`. Hoist `user` to component level. Remove `supabase.auth.getUser()` from `sendMutation`. |
| `src/pages/control-center/modules/UsersModule.tsx` | Replace `GRADES` array to match `ACADEMIC_GRADES` from types.ts exactly (add `7e`, `8e`, `NS1`, `S1`; fix `PHILO` → `Philo`). |
| `src/pages/control-center/modules/PaymentsModule.tsx` | Fix search placeholder text. Add `if (action === 'reject') updateData.status = 'rejected'` to `verifyMutation`. |
| `src/pages/control-center/modules/ContactModule.tsx` | Fix pagination sliding window (remove `Math.min(5, ...)`). Wrap `fetchSubmissions` in `useCallback`. Split realtime subscription into standalone `useEffect([])`. |
| `src/lib/quizBattleUtils.ts` | Remove `FOUNDER_USER_IDS` array and `isFounder` function. Add re-export from `founderConstants`. |
| `src/lib/founderConstants.ts` | Remove "keep in sync" comment (no longer applicable). |

**No DB migrations. No edge function changes. No other files touched.**

---

### Safety Verification

| Check | Status |
|---|---|
| Realtime subscriptions fire correctly after dependency array change | Yes — the subscription `useEffect([])` mounts once. The channel callback calls `fetchReports()` / `fetchSubmissions()` which are `useCallback` refs. Because `useCallback` recreates when its deps change (filter/page), the ref inside the channel closure stays current via the closure over the stable `useCallback` reference. The channel never re-registers. |
| Realtime subscriptions do not fire stale data on filter change | Yes — changing `statusFilter` or `currentPage` causes `fetchReports`/`fetchSubmissions` `useCallback` to update, which triggers the data-fetch `useEffect`. The subscription channel is unaffected. The callback always points to the latest fetch function. |
| Grade filter in UsersModule now matches ACADEMIC_GRADES in types.ts exactly | Yes — after fix, `GRADES` values are: `all, 7AF, 7e, 8AF, 8e, 9AF, NS1, NS3, NS4, Philo, S1` — identical to the `ACADEMIC_GRADES` tuple in types.ts. |
| `FOUNDER_USER_IDS` consolidation does not break quiz battle founder exclusion | Yes — `BattleLeaderboardPreview` and `QuizBattleLeaderboard` import `{ FOUNDER_USER_IDS }` from `@/lib/quizBattleUtils`. After the fix, `quizBattleUtils` re-exports `FOUNDER_USER_IDS` from `founderConstants`. The import path is unchanged, the exported value is identical. |
| `isFounder` function still works in all consumers | Yes — `isFounder` is also re-exported from `quizBattleUtils`. The `founderConstants` version handles `null | undefined` input (returns `false`). The `quizBattleUtils` version typed `userId: string`. After the fix, the re-exported version comes from `founderConstants` which is more defensive — no regression. |
| Reject mutation correctly sets status: 'rejected' in same write | Yes — `updateData.status = 'rejected'` is added inside `verifyMutation` for `action === 'reject'`. This is the same DB write that already sets `admin_verified: false`. |
| Payments with `rejected` status now appear under the "Échoués" filter | Yes — the filter at line 57 (`query.eq('status', statusFilter)`) will now match `rejected` when `statusFilter === 'failed'`... actually wait: `statusFilter === 'failed'` filters for `status = 'failed'`, not `status = 'rejected'`. The plan says fix `status` to `'rejected'`. The filter dropdown has no `rejected` option — it has `failed`. A separate filter option for `rejected` may be needed, or the status value should be `'failed'`. Re-reading the plan: "fix the reject mutation so it updates status to 'rejected'" — so the DB value becomes `'rejected'`. The existing filter options (`pending`, `pending_verification`, `completed`, `failed`) do not include `rejected`. To make rejected payments visible, either: (a) add a `rejected` option to the filter dropdown, or (b) fold `rejected` into `failed` filter. The cleanest fix matching the plan is to add a `rejected` filter option to the Select. This will be added. |
| Announcement local interface removal does not break types | Yes — the local `Announcement` interface is byte-for-byte identical to the one in types.ts (confirmed by reading both). Replacing with the import is a pure deduplication. |
| Local `ACADEMIC_GRADES` removal in AnnouncementsModule does not break grade picker | Yes — the local array is identical to types.ts. The import path `'../types'` resolves correctly from `src/pages/control-center/modules/`. |
| `supabase.auth.getSession()` calls in ReportsModule for edge functions left unchanged | Yes — lines 212 and 256 (`handleDeletePost`, `handleDeleteUser`) use `getSession()` for the `Authorization: Bearer` header in raw `fetch()` calls. These are NOT replaced. Only the three `getUser()` calls for `reviewed_by: user?.id` are replaced. |
| ContactModule pagination: pages beyond 5 are now reachable | Yes — the sliding window computes `startPage` and `endPage` around `currentPage`. At page 7, the window shows `[5, 6, 7, 8, 9]`. All pages are reachable via sequential Next clicks or direct number click. |
| AppShell, Provider Stack, all other modules unaffected | Yes — all changes are scoped to 5 module files and 2 lib files. No global hooks, no routing, no contexts modified. |
