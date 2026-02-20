

# Performance Plan B -- Dead Code and Latency Removal

## Overview

Four fixes targeting unused code, CSS bloat, script loading, and a redundant database index. No Plan A changes are touched.

---

## Fix 1 -- Remove Mermaid CDN from index.html

**Why:** The Mermaid CDN script (lines 136-210 in `index.html`) creates a `MutationObserver` on every page load. The only consumer, `LessonSchemas.tsx`, is dead code with zero imports anywhere.

**Changes:**
- Delete the entire Mermaid `<script type="module">` block (lines 136-210) from `index.html`
- Delete `src/components/LessonSchemas.tsx` (dead file, zero imports)

---

## Fix 2 -- Remove Unused CSS from index.css

Below is the exact list of CSS blocks proposed for removal. Every class was verified via grep across all `.tsx`, `.ts`, and `.html` files -- zero references found.

| CSS Class/Block | Lines | Reason |
|----------------|-------|--------|
| `.card-glow` | 260-263 | Zero references in codebase |
| `@keyframes loading-bar` + `.animate-loading-bar` | 292-309 | Zero references |
| `.video-placeholder` | 912-922 | Zero references |
| `.lesson-markdown h2` + `h2::after` | 813-826 | Zero references (lesson-markdown never used) |
| `.lesson-markdown h5` | 889-892 | Zero references |
| `.lesson-markdown p` | 894-896 | Zero references |
| `.lesson-markdown ul, ol` | 898-900 | Zero references |
| `.lesson-markdown strong` | 902-905 | Zero references |
| `.lesson-markdown-title` | 907-910 | Zero references |
| `.exercise-box` (all rules) | 1291-1305 | Zero references |

**KEPT (actively used):**
- All CSS variables and Tailwind directives
- `.gradient-text` (used in CustomizeAI.tsx, Onboarding.tsx)
- `.gold-text` (used in QuizGame, MatchingGame, SpeedCalcGame)
- `.logo-no-filter` (used in AppSidebar.tsx)
- `.lesson-content` (used in 10+ files)
- `.lesson-card` (used in InteractiveActivities, LessonSchemas)
- `.lesson-bg`, `.lesson-topbar`, `.lesson-pill` (used in lesson pages)
- `.prose` styles (used in lesson content rendering)
- All auth-* classes (used in auth pages)
- All eric-* chatbot classes (used in HomeChatbot, JudeChatbot)
- All community animation classes (used in messaging)
- `.overflow-wrap-anywhere` (used in MessageBubble)
- All mobile/touch utility classes (used across app)

Estimated removal: ~60 lines of CSS.

---

## Fix 3 -- Defer Non-Critical Scripts in index.html

Current script tags in `index.html`:
1. **Structured Data** (lines 103-134): Two `<script type="application/ld+json">` blocks -- these are JSON-LD, not executable JS. No change needed.
2. **Mermaid** (lines 136-210): Being removed entirely in Fix 1.
3. **Main app** (line 262): `<script type="module" src="/src/main.tsx">` -- already deferred by default (ES modules are deferred). No change needed.

**Result:** After Fix 1 removes Mermaid, all remaining scripts are either non-executable (JSON-LD) or already deferred (ES module). No additional changes needed.

---

## Fix 4 -- Drop Redundant Database Index

Confirmed via `pg_indexes` query: the table `user_daily_word` has:
- `idx_user_daily_word_lookup` -- regular btree on `(user_id, date)`
- `user_daily_word_user_id_date_key` -- UNIQUE constraint index on `(user_id, date)`

The regular index is fully redundant since the UNIQUE index already serves all lookups.

**Action:** Run migration: `DROP INDEX IF EXISTS idx_user_daily_word_lookup;`

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Remove Mermaid script block (lines 136-210) |
| `src/components/LessonSchemas.tsx` | Delete entire file |
| `src/index.css` | Remove ~60 lines of unused CSS (10 blocks listed above) |
| Database migration | `DROP INDEX IF EXISTS idx_user_daily_word_lookup` |

## Safety Verification

| Check | Status |
|-------|--------|
| No Plan A changes touched | Confirmed -- only index.css, index.html, dead file |
| No actively-used CSS removed | All 10 blocks verified zero references via grep |
| Auth pages unaffected | All auth-* CSS preserved |
| Lesson pages unaffected | lesson-content, lesson-card, lesson-bg, prose all preserved |
| Chatbot unaffected | All eric-* CSS preserved |
| Community animations preserved | All animate-* community classes preserved |
| No new dependencies | Removes code only |
| Database data unaffected | Only dropping a redundant index, not a table/column |
| 3G performance improved | Eliminates CDN request + MutationObserver + unused CSS |

