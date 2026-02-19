
## Plan A: Control Center — Two High-Severity Bug Fixes

### Pre-implementation findings

#### Fix 1 — DonationsModule.tsx

Three problems exist, not two:

1. **Double USD division** — Line 61: `usd: usd / 100` in stats. Line 91: `(amount / 100).toFixed(2)` in `formatAmount`. Both divide by 100. Since the DB stores Stripe USD amounts already in dollars (e.g. `5.00`), dividing produces `$0.05` instead of `$5.00`. Fix: remove both `/100` divisions.

2. **No reject mutation exists** — The entire `DonationsModule.tsx` has no `useMutation`, no approve button, no reject button. The plan requires adding a reject action that sets `status: 'rejected'` in the DB. This is a net-new addition (the plan says "also fix the reject mutation" which implies it was intended but is simply missing).

3. **No pagination** — The query at line 18–37 fetches all rows with no `.limit()`. Fix: add `.limit(50)` and a pagination state variable with a "Charger plus" button.

#### Fix 2 — WordsModule.tsx + send-daily-word-notification

**Three algorithms, all different:**

| Location | Algorithm | Ordering |
|---|---|---|
| `useWordOfTheDay.ts` | `daysSince(2026-01-01) % totalWords + 1` → maps to `display_order` | `display_order` ASC |
| `WordsModule.tsx calculateTodaysWord` | reads `app_settings.word_of_day` → `(lastOrder % maxOrder) + 1` | `display_order` ASC |
| `send-daily-word-notification` | djb2 hash of date string → `abs(hash) % totalWords` as array index | `id` ASC |

Target after fix: all three use the **exact same algorithm** as `useWordOfTheDay.ts`.

**The correct algorithm (from `useWordOfTheDay.ts`):**
```typescript
const REFERENCE_DATE = new Date('2026-01-01T00:00:00');

const computeDisplayOrder = (haitiDate: string, totalWords: number): number => {
  const today = new Date(haitiDate + 'T00:00:00');
  const daysSince = Math.floor(
    (today.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  return (((daysSince % totalWords) + totalWords) % totalWords) + 1;
};
```

Then fetch `daily_words WHERE is_active = true AND display_order = computeDisplayOrder(...)`.

**Other bugs in WordsModule.tsx:**
- Line 421: ElevenLabs voice label says "Sarah" — platform standard is "Eric" per `generate-word-audio/index.ts` which does use ElevenLabs voice `EXAVITQu4vr4xnSDxMaL` (Sarah) but the platform standard voice is Eric per custom knowledge. The label is the fix — change the descriptive text from "voix naturelle (Sarah)" to "voix naturelle (Eric)".
- Lines 197–201: `await supabase.auth.getSession()` before `supabase.functions.invoke("generate-word-audio", ...)` — redundant. `supabase.functions.invoke` attaches the auth header automatically. Remove the session check and the early return.
- Lines 251–255: Same redundant `supabase.auth.getSession()` before `supabase.functions.invoke("send-daily-word-notification", ...)` — same fix.

---

### Technical Implementation

#### DonationsModule.tsx — exact changes

**Change 1 — Remove USD /100 from stats (line 61):**
```typescript
// Before:
return { total: donations.length, htg, usd: usd / 100 };

// After:
return { total: donations.length, htg, usd };
```

**Change 2 — Remove USD /100 from formatAmount (line 91):**
```typescript
// Before:
if (currency === "USD") return `$${(amount / 100).toFixed(2)} USD`;

// After:
if (currency === "USD") return `$${amount.toFixed(2)} USD`;
```

**Change 3 — Add reject action mutation + approve/reject buttons per donation row:**

The mutation fires `supabase.from('donations').update({ status: 'rejected', admin_verified: false }).eq('id', id)` for reject, and `{ status: 'completed', admin_verified: true }` for approve. Use TanStack `useMutation` + `invalidateQueries` on completion.

The reject mutation per the plan: `status: 'rejected'` must be set in the same write. The `DonationAdmin` type in `types.ts` does not have an `admin_verified` field — only the `donations` table may have it. The mutation update object for reject is: `{ status: 'rejected' }`. For approve (bonus, not in plan but needed to make the feature useful): `{ status: 'completed' }`.

Buttons are added to each donation card, conditionally shown only for `pending` status donations.

**Change 4 — Add pagination:**

Add `const [page, setPage] = useState(0)` state. The query adds `.range(page * 50, page * 50 + 49)`. A "Charger plus" button appears below the list if `donations?.length === 50`. The `queryKey` includes `page`. The search client-side filter operates on the current page only (this is acceptable and matches the plan's "limit 50 rows per page" framing).

#### WordsModule.tsx — exact changes

**Change 1 — Replace `calculateTodaysWord` with deterministic algorithm:**

Remove the entire `calculateTodaysWord` function (lines 107–145). Replace with a pure synchronous function matching `useWordOfTheDay.ts` exactly:

```typescript
// Reference date matches useWordOfTheDay.ts
const REFERENCE_DATE = new Date('2026-01-01T00:00:00');

const computeDisplayOrder = (haitiDate: string, totalWords: number): number => {
  const today = new Date(haitiDate + 'T00:00:00');
  const daysSince = Math.floor(
    (today.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  // Double-mod guards against negative daysSince (dates before reference)
  return (((daysSince % totalWords) + totalWords) % totalWords) + 1;
};
```

In `fetchWords`, after loading the word list, compute today's word synchronously:

```typescript
if (wordsList.length > 0) {
  const haitiDate = getHaitiDate();
  const displayOrder = computeDisplayOrder(haitiDate, wordsList.length);
  // Find word with matching display_order
  const todayWord = wordsList.find(w => w.display_order === displayOrder);
  // Fallback if gap in display_order sequence
  setTodaysWord(todayWord ?? wordsList[0]);
}
```

The `fetchWords` function no longer needs to be `async` for the word-selection step — but the supabase query is already async, so it stays async. The `calculateTodaysWord` call at line 97 is replaced with the above inline synchronous logic. No `app_settings` query is made. The `async` on `fetchWords` is unaffected.

**Change 2 — Fix ElevenLabs voice label (line 421):**
```typescript
// Before:
'✨ Volume plus élevé, meilleur français, voix naturelle (Sarah)'

// After:
'✨ Volume plus élevé, meilleur français, voix naturelle (Eric)'
```

**Change 3 — Remove redundant `supabase.auth.getSession()` in `generateAudio` (lines 197–201):**
```typescript
// Before:
const { data: session } = await supabase.auth.getSession();
if (!session?.session?.access_token) {
  toast.error("Session expirée, veuillez vous reconnecter");
  return;
}

const response = await supabase.functions.invoke("generate-word-audio", { ... });

// After:
// (lines 197–201 deleted — supabase.functions.invoke handles auth automatically)
const response = await supabase.functions.invoke("generate-word-audio", { ... });
```

**Change 4 — Remove redundant `supabase.auth.getSession()` in `sendDailyWordNotification` (lines 251–255):**
Same removal. The `supabase.functions.invoke("send-daily-word-notification", ...)` call remains; only the session check preceding it is removed.

#### send-daily-word-notification edge function — exact changes

The current algorithm (djb2 hash → array index by `id` ordering) diverges completely from `useWordOfTheDay.ts` (daysSince → `display_order`). Must be replaced.

**Replace `getGlobalWordIndex` with the deterministic date-math algorithm:**

```typescript
const REFERENCE_DATE_MS = new Date('2026-01-01T00:00:00').getTime();

const computeDisplayOrder = (haitiDate: string, totalWords: number): number => {
  const today = new Date(haitiDate + 'T00:00:00').getTime();
  const daysSince = Math.floor((today - REFERENCE_DATE_MS) / (1000 * 60 * 60 * 24));
  return (((daysSince % totalWords) + totalWords) % totalWords) + 1;
};
```

**Replace the word fetch + selection logic:**

Currently the edge function:
1. Fetches all active words ordered by `id` (line 104–105)
2. Uses `getGlobalWordIndex(haitiDate, allWords.length)` as an array index into that list

After fix:
1. Fetches the **count** of active words (HEAD request)
2. Computes `displayOrder = computeDisplayOrder(haitiDate, count)`
3. Fetches the word with `display_order = displayOrder` (with fallback to first word by `display_order` ASC if gap)

```typescript
// 1. Get count
const { count, error: countError } = await supabase
  .from('daily_words')
  .select('*', { count: 'exact', head: true })
  .eq('is_active', true);

if (countError || !count || count === 0) { /* error response */ }

// 2. Compute display_order
const displayOrder = computeDisplayOrder(haitiDate, count);

// 3. Fetch the word
let { data: todaysWord } = await supabase
  .from('daily_words')
  .select('id, word, phonetic, definition')
  .eq('is_active', true)
  .eq('display_order', displayOrder)
  .maybeSingle();

// 4. Fallback if display_order gap
if (!todaysWord) {
  const { data: fallback } = await supabase
    .from('daily_words')
    .select('id, word, phonetic, definition')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  todaysWord = fallback;
}

if (!todaysWord) { /* no active words error */ }
```

The `specificWordId` override path is preserved as-is — it bypasses the algorithm entirely and uses the explicitly requested word for testing.

---

### Files changed

| File | Changes |
|---|---|
| `src/pages/control-center/modules/DonationsModule.tsx` | Remove `/ 100` from `usd` in stats (line 61). Remove `/ 100` from `formatAmount` (line 91). Add `useMutation` for reject action. Add reject button to pending donation cards. Add `page` state + `.range()` pagination with "Charger plus" button. |
| `src/pages/control-center/modules/WordsModule.tsx` | Remove `calculateTodaysWord` function (lines 107–145). Add `REFERENCE_DATE` constant + `computeDisplayOrder` pure function. Inline deterministic word selection in `fetchWords`. Fix ElevenLabs label "Sarah" → "Eric" (line 421). Remove both redundant `supabase.auth.getSession()` calls (lines 197–201 and 251–255). |
| `supabase/functions/send-daily-word-notification/index.ts` | Remove `getGlobalWordIndex` hash function. Add `computeDisplayOrder` date-math function (identical logic to `useWordOfTheDay.ts`). Replace word-fetch logic: count → computeDisplayOrder → fetch by `display_order` → fallback. Preserve `specificWordId` override path. |

**No DB migrations. No schema changes. No other files touched.**

---

### Safety Verification

| Check | Status |
|---|---|
| USD donation amounts now display correctly | Yes — both `/100` divisions removed. DB stores `5.00` → displays `$5.00 USD`. Previously displayed `$0.05 USD`. HTG path (`return \`${amount} HTG\``) is untouched — no division was applied to HTG. |
| HTG donation formatting unchanged | Yes — `formatAmount` early-returns `${amount} HTG` for non-USD currency with no arithmetic. Stats compute `htg += d.amount` unchanged. Both untouched. |
| Reject mutation correctly sets `status: 'rejected'` | Yes — the new `useMutation` calls `supabase.from('donations').update({ status: 'rejected' }).eq('id', donationId)`. The `status` field is updated in the same write. |
| Reject mutation only appears on pending donations | Yes — the reject/approve buttons are conditionally rendered: `donation.status === 'pending'`. |
| Pagination does not lose existing data | Yes — page 0 returns rows 0–49 (the most recent 50). "Charger plus" advances to page 1 (rows 50–99). Search filters client-side within the loaded page. The `queryKey` includes `page` so TanStack Query caches each page independently. |
| Admin word preview matches what students see on their dashboard | Yes — `WordsModule.tsx` now uses `computeDisplayOrder` with the same `REFERENCE_DATE = 2026-01-01` and the same formula: `(((daysSince % totalWords) + totalWords) % totalWords) + 1`. Both the admin panel and `useWordOfTheDay.ts` select the same `display_order` value on the same Haiti-timezone date. |
| `send-daily-word-notification` sends the correct word | Yes — the edge function now uses `computeDisplayOrder` (same algorithm, same reference date) and fetches by `display_order` (same field as the frontend hook). All three systems converge. |
| The `specificWordId` override in the edge function still works | Yes — the override path is structurally identical: it bypasses the algorithm and finds the word by ID. No change to this path. |
| ElevenLabs voice label corrected | Yes — line 421 "Sarah" → "Eric". This is a display label only; it does not change which voice is used in the edge function (that is configured server-side). |
| Redundant session calls removed without breaking auth | Yes — `supabase.functions.invoke()` automatically includes the auth token from the Supabase JS client's in-memory session. The manual `getSession()` + early-return was a redundant guard. Removing it does not change the auth header sent to the edge function. |
| AppShell, Provider Stack, payment flows unaffected | Yes — all changes are scoped to two module files and one edge function. No shared context, no global hooks, no payment gateway code is touched. |
