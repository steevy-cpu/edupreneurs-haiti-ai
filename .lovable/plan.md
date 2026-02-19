
## Plan B: Control Center Performance Fixes — 3 Fixes

### Audit of Current State

**Fix 1 — `useModuleBadges.ts` (lines 8–26):**
The `refreshBadges` function iterates `CONTROL_CENTER_MODULES` in a `for...of` loop and `await`s each `module.badge()` call before starting the next. There are 8 badge-bearing modules (users has none, stats has none). Each badge is a Supabase COUNT query with a cold-start round trip on 3G. Running them in sequence can take 3–5 seconds before any badges appear. The `try/catch` inside the loop correctly isolates individual failures already — but the sequential dependency means one slow query delays all subsequent ones.

**Fix 2 — `ControlCenter.tsx` (lines 91–97):**
The `TabsContent` block maps all 10 `CONTROL_CENTER_MODULES` and renders `<module.component />` inside every `TabsContent`. Radix `TabsContent` does render all children into the DOM (it uses CSS visibility, not conditional rendering). This means all 10 `React.lazy` boundaries are hit immediately, all 10 `Suspense` fallbacks can fire, and every module's `useEffect` or TanStack Query on mount fires simultaneously — 10+ Supabase queries on page load when only 1 tab is visible.

The fix: maintain a `mountedTabs` state (`Set<string>`) tracking which tab IDs have been visited. Only render `<module.component />` when `mountedTabs.has(module.id)`. The set is updated via `onValueChange` — adding `activeTab` each time the user switches. Initial tab (`CONTROL_CENTER_MODULES[0].id`, i.e. "users") is pre-added to the set so it renders immediately on load. Once a tab is added to the set it is never removed — so switching back to a previously-visited tab preserves its React state.

**Fix 3 — `StatsModule.tsx` (lines 25–80):**
`fetchStats` runs 7 sequential `await supabase` calls — `profiles` total, `profiles` filtered by `gte`, `posts`, and 4 `user_reports` filtered by `status`. Since these are all independent COUNT queries, they can be fired simultaneously with `Promise.all`. Additionally, `fetchStats` is called only once in `useEffect([], [])` and never again — there is no way to refresh without navigating away. A refresh button with a spinning indicator while loading is added in the header area of the module.

---

### Technical Implementation

#### Fix 1 — `useModuleBadges.ts`

Replace the `for...of await` loop with `Promise.allSettled` over all badge-bearing modules simultaneously:

```typescript
const refreshBadges = useCallback(async () => {
  setIsLoading(true);

  // Collect only modules that have a badge function
  const badgeModules = CONTROL_CENTER_MODULES.filter(m => m.badge);

  // Fire all badge queries simultaneously — allSettled ensures one failure
  // does not cancel the others; failed badges fall back to 0
  const results = await Promise.allSettled(
    badgeModules.map(m => m.badge!())
  );

  const newBadges: Record<string, number> = {};
  results.forEach((result, index) => {
    const moduleId = badgeModules[index].id;
    if (result.status === 'fulfilled') {
      newBadges[moduleId] = result.value;
    } else {
      console.error(`Error fetching badge for ${moduleId}:`, result.reason);
      newBadges[moduleId] = 0; // failed badge silently falls back to 0
    }
  });

  setBadges(newBadges);
  setIsLoading(false);
}, []);
```

The 30-second interval and cleanup are unchanged. The external API (`{ badges, refreshBadges, isLoading }`) is unchanged — `ControlCenter.tsx` does not need to change for this fix.

**Performance impact:** 8 badge queries that previously ran in series (each waiting for the previous) now run in parallel. Total time drops from `sum(all_query_times)` to `max(all_query_times)` — roughly 5× faster on 3G.

#### Fix 2 — `ControlCenter.tsx`

Add `mountedTabs` state initialized with the first tab pre-mounted. Update `onValueChange` to add the incoming tab ID to the set. Conditionally render the module component only when its ID is in the set.

```typescript
// Track which tabs have been visited — once mounted they stay mounted
// to preserve component state when switching between tabs
const [mountedTabs, setMountedTabs] = useState<Set<string>>(
  () => new Set([CONTROL_CENTER_MODULES[0]?.id || "users"])
);

const handleTabChange = (value: string) => {
  setActiveTab(value);
  // Add to mounted set — never remove, preserves state on tab switch-back
  setMountedTabs(prev => new Set([...prev, value]));
};
```

The `TabsContent` render block changes from always rendering to conditional:

```typescript
{CONTROL_CENTER_MODULES.map((module) => (
  <TabsContent key={module.id} value={module.id} className="mt-6">
    {/* Only mount when first visited — stays mounted to preserve state */}
    {mountedTabs.has(module.id) && (
      <Suspense fallback={<ModuleLoader />}>
        <module.component />
      </Suspense>
    )}
  </TabsContent>
))}
```

`onValueChange={handleTabChange}` replaces `onValueChange={setActiveTab}`.

**Behavior:**
- On load: only the "users" tab (`CONTROL_CENTER_MODULES[0]`) mounts and fires its queries. The other 9 modules do not mount, their lazy chunks are not fetched, their `useEffect`s do not fire.
- First visit to any other tab: the module mounts for the first time (shows `ModuleLoader` skeleton while lazy chunk loads, then normal loading state).
- Return visit to a tab: the module was already mounted and is still in the DOM (Radix hides it with CSS). Its state (loaded data, pagination, filters) is preserved exactly as left.

**Radix `TabsContent` note:** Radix `TabsContent` uses `hidden` attribute / CSS to hide non-active tabs — it does not unmount them. The conditional `{mountedTabs.has(module.id) && ...}` inside `TabsContent` means the Radix wrapper node exists for all 10 tabs, but the React component tree inside only mounts when first visited. This is correct behavior and does not fight Radix's tab accessibility model.

#### Fix 3 — `StatsModule.tsx`

Two changes: parallelize the queries with `Promise.all`, and add a refresh button.

**Parallel queries — replace the sequential `fetchStats` body:**

```typescript
const fetchStats = useCallback(async () => {
  setIsLoading(true);
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // All 7 COUNT queries fire simultaneously
    const [
      { count: totalUsers },
      { count: newUsersThisWeek },
      { count: totalPosts },
      { count: pendingReports },
      { count: reviewingReports },
      { count: resolvedReports },
      { count: dismissedReports },
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", oneWeekAgo.toISOString()),
      supabase.from("posts").select("id", { count: "exact", head: true }),
      supabase.from("user_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("user_reports").select("id", { count: "exact", head: true }).eq("status", "reviewing"),
      supabase.from("user_reports").select("id", { count: "exact", head: true }).eq("status", "resolved"),
      supabase.from("user_reports").select("id", { count: "exact", head: true }).eq("status", "dismissed"),
    ]);

    setStats({
      totalUsers: totalUsers || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      totalPosts: totalPosts || 0,
      pendingReports: pendingReports || 0,
      reviewingReports: reviewingReports || 0,
      resolvedReports: resolvedReports || 0,
      dismissedReports: dismissedReports || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
  } finally {
    setIsLoading(false);
  }
}, []);
```

`fetchStats` gains `useCallback` with an empty dep array — stable reference needed for the refresh button.

**Refresh button — added to the top of the returned JSX:**

Above the stats card grid, add a header row with a title and a refresh button:

```tsx
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// In the return:
<div className="flex items-center justify-between mb-2">
  <h2 className="text-lg font-semibold">Statistiques générales</h2>
  <Button
    variant="outline"
    size="sm"
    onClick={fetchStats}
    disabled={isLoading}
    className="gap-2"
  >
    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
    Actualiser
  </Button>
</div>
```

The `RefreshCw` icon spins while `isLoading` is true (the same state already used for the skeleton). `disabled={isLoading}` prevents double-clicks from firing overlapping requests.

`useEffect` remains calling `fetchStats()` on mount. The only change to `useEffect` is removing the dependency array comment — it now depends on `fetchStats` which is now a stable `useCallback`:
```typescript
useEffect(() => {
  fetchStats();
}, [fetchStats]);
```

---

### Files Changed

| File | Lines changed | Action |
|---|---|---|
| `src/pages/control-center/hooks/useModuleBadges.ts` | 8–26 | Replace `for...of await` loop with `Promise.allSettled` parallel execution |
| `src/pages/ControlCenter.tsx` | 1–2, 23, 66, 91–97 | Add `mountedTabs` state; add `handleTabChange`; conditionally render module components |
| `src/pages/control-center/modules/StatsModule.tsx` | 1–5, 17–81, 155–175 | Wrap `fetchStats` in `useCallback`; replace sequential awaits with `Promise.all`; add refresh button with `RefreshCw` icon |

**No DB migrations. No edge function changes. No other files touched.**

---

### Safety Verification

| Check | Status |
|---|---|
| A failed badge query does not prevent other badges from loading | Yes — `Promise.allSettled` never rejects; each settled result is checked individually. A `rejected` result logs the error and sets that badge to `0`. All other badge results are processed regardless. This is strictly better than the current `try/catch` inside the sequential loop (which already isolated failures but still ran them sequentially). |
| Tabs that have been visited maintain their state when switching away and back | Yes — `mountedTabs.has(module.id)` only adds to the set, never removes. Once a module component mounts, it stays mounted in the DOM. Radix `TabsContent` hides it with CSS when inactive but does not unmount it. The module's React state (pagination, filter values, loaded data) survives tab switches. |
| Tabs that have NOT been visited do not fire any data fetches | Yes — `{mountedTabs.has(module.id) && <Suspense>...}` means the React component never mounts, so no `useEffect`, no TanStack Query `onMount`, no lazy chunk fetch. |
| The first tab ("users") renders immediately without requiring a tab click | Yes — `mountedTabs` is initialized as `new Set([CONTROL_CENTER_MODULES[0]?.id || "users"])`, so the first module is pre-included and mounts on initial render. |
| Stats refresh button correctly re-fetches all counts simultaneously | Yes — the button calls `fetchStats` (stable `useCallback` ref). `fetchStats` runs all 7 queries via `Promise.all`. The button shows a spinning icon and is disabled during the fetch to prevent double-submit. |
| Stats module still shows skeleton on initial load | Yes — `isLoading` starts as `true`, `fetchStats` sets it `false` in `finally`. The skeleton render path at line 83 is unchanged. |
| Performance gain at concurrency = 7 (stats) | 7 independent COUNT queries go from sequential (sum of all RTTs) to parallel (max RTT). On 3G with ~400ms per query, this drops from ~2.8 seconds to ~400ms. |
| Performance gain for badges (8 concurrent) | Same — all 8 badge queries now fire simultaneously. Previously a single slow query (e.g. the `count_lesson_feedback_for_admin` RPC) blocked all remaining badge updates. |
| No other files affected | Yes — `useModuleBadges` public API unchanged (`{ badges, refreshBadges, isLoading }`). `StatsModule` public API unchanged (default export, no props). `ControlCenter` behavior is a strict superset of current behavior. |
| AppShell, Provider Stack, routing unaffected | Yes — all changes are scoped to the three listed files. No global context, hooks, or routes are modified. |
