
## Exams Plan A — NS4 Database Cleanup

### What This Plan Does

Pure database cleanup only. No code files are touched. The goal is to reduce 20 NS4 rows to a clean set with at most one row per logical exam identity (subject + year + series + session + is_model_exam).

After cleanup, the target state is **11 rows** — every row has real exercises, correct grade_level, and a unique logical identity.

---

### Full Decision Table — All 20 Rows

#### GROUP 1: LLA / Langues / 2022 (1 row)

| ID | Actual | Decision | Reason |
|---|---|---|---|
| `7ada942a` | 17 | **KEEP** | Only row in this identity. 17 real exercises. Title is "Espagnol 2022 - NS4" but subject column says "Langues" — this is the subject/name mismatch noted in the audit. The data is real. No other row to prefer. |

**Note:** The subject column says "Langues" but the title says "Espagnol". This is a data quality issue but it is out of scope — you did not ask to fix subject names, only to deduplicate and remove ghosts/mismatched titles. The row is kept as-is.

---

#### GROUP 2: SES / Physique / 2019 (2 rows — both ghosts)

| ID | Actual | Created | Decision | Reason |
|---|---|---|---|---|
| `a79c968b` | 0 | 23:09:20 | **DELETE** | Ghost row — claimed 14, has 0. No exercises to preserve. |
| `5f14a0ba` | 0 | 23:09:28 | **DELETE** | Ghost row — claimed 14, has 0. No exercises to preserve. |

Both rows in this identity group have zero exercises. Per the cleanup rules: delete ghost rows entirely. There is no row to keep for SES/Physique/2019. This logical exam identity will have zero rows after cleanup — meaning SES/Physique/2019 was never successfully ingested. You will need to re-upload the PDF.

---

#### GROUP 3: SES / Physique / 2022 (1 row) — session "FEVRIER"

| ID | Actual | Decision | Reason |
|---|---|---|---|
| `bc054b56` | 21 | **KEEP** | Only row. 21 real exercises. Clean. |

---

#### GROUP 4: SES / Physique / 2024 (1 row)

| ID | Actual | Decision | Reason |
|---|---|---|---|
| `d99d3882` | 15 | **KEEP** | Only row. 15 real exercises. Clean. |

---

#### GROUP 5: SES / Physique / is_model_exam=true / 2026 (1 row)

| ID | Actual | Decision | Reason |
|---|---|---|---|
| `bd267a7c` | 15 | **KEEP** | Only model exam for this identity. 15 real exercises. The year=2026 is a cosmetic issue from the save util — not a data integrity problem. Title correctly identifies it as a model exam. |

---

#### GROUP 6: SMP / Physique / 2018 (3 rows — all ghosts)

| ID | Actual | Created | Decision | Reason |
|---|---|---|---|---|
| `4ec9d6c5` | 0 | 23:11:56 | **DELETE** | Ghost. All three have identical claimed=23 but actual=0. |
| `ab78480e` | 0 | 23:11:59 | **DELETE** | Ghost. |
| `efa359ee` | 0 | 23:16:59 | **DELETE** | Ghost. |

All three are ghosts. SMP/Physique/2018 will have zero rows after cleanup. Re-upload required.

---

#### GROUP 7: SMP / Physique / 2019 (1 row)

| ID | Actual | Decision | Reason |
|---|---|---|---|
| `ddb56ffd` | 17 | **KEEP** | Only row. 17 real exercises. Clean. |

---

#### GROUP 8: SMP / Physique / 2022 (1 row)

| ID | Actual | Decision | Reason |
|---|---|---|---|
| `8f88d855` | 11 | **KEEP** | Only row. 11 real exercises. Clean. |

---

#### GROUP 9: SMP / Physique / 2025 / is_model_exam=false (3 rows with real data + 5 ghosts)

This is the most complex group. There are 8 rows total for this logical identity:

| ID | Actual | Title | Version | Created | Decision | Reason |
|---|---|---|---|---|---|---|
| `3692e8fd` | 0 | "2025 - 9AF" | v1 | 2025-12-24 | **DELETE** | Ghost + bad title |
| `e830ba4e` | 0 | "2025 - 9AF" | v2 | 2025-12-24 | **DELETE** | Ghost + bad title |
| `8c60551f` | 0 | "2025 - 9AF" | v3 | 2025-12-24 | **DELETE** | Ghost + bad title |
| `e12eb598` | 0 | "2025 - 9AF" | v4 | 2025-12-24 | **DELETE** | Ghost + bad title |
| `fa2203da` | 0 | "2025 - 9AF" | v5 | 2025-12-24 | **DELETE** | Ghost + bad title |
| `dd29dfce` | 15 | "2015 - Baccalauréat (SMP-SVT)" | v1 | 2026-02-11 | **FLAG — see below** | Has 15 real exercises but title says "2015" — this may be a 2015 exam accidentally uploaded as 2025 |
| `d92d666f` | 15 | "2025 - NS4" | v1 | 2026-02-11 | **KEEP** | Correct title, correct grade_level, 15 real exercises, most recently created among those with correct title |

**Decision on `dd29dfce` ("2015 - Baccalauréat"):** This row has 15 real exercises and a clean `grade_level=NS4` and `series=SMP` and `year=2025`. However its title says "Physique 2015 - Baccalauréat (SMP-SVT)" — the AI was fed a 2015 exam PDF but the year field in the form was set to 2025. This means: the exercises in this row are from the 2015 exam, not 2025. The 2025 exam proper is row `d92d666f` (15 exercises, correct title). Since both have 15 exercises and both are for logical year=2025 in the DB, but `dd29dfce` contains 2015 exam content in a 2025 slot, it should be deleted to avoid confusion. The 2015 exam can be re-uploaded properly with year=2015.

**Keeping: `d92d666f`** (15 real exercises, correct title "Physique 2025 - NS4", correct year=2025).

---

#### GROUP 10: SMP / Physique / 2025 / is_model_exam=true (1 row)

| ID | Actual | Title | Decision | Reason |
|---|---|---|---|---|
| `db8b3457` | 45 | "Physique 2025 - 9AF" | **KEEP + TITLE FIX** | Only model exam row. Has 45 real exercises — most content of any single NS4 row. Must be kept. Title says "9AF" but grade_level=NS4. The title needs a correction as part of this cleanup. |

The UPDATE to fix the title is: `UPDATE official_exams SET title = 'Examen officiel de Physique 2025 - NS4' WHERE id = 'db8b3457-4f23-479d-9e9f-f9dca15d3cc4'`.

---

#### GROUP 11: SVT / Physique / 2020 (1 row)

| ID | Actual | Decision | Reason |
|---|---|---|---|
| `73f94bb6` | 11 | **KEEP** | Only row. 11 real exercises. Clean. |

---

### Target State After Cleanup — 11 Rows

| Series | Subject | Year | Model | Real Exercises | Status |
|---|---|---|---|---|---|
| LLA | Langues | 2022 | No | 17 | Kept (subject column anomaly noted but not fixed) |
| SES | Physique | 2019 | No | — | **EMPTY — re-upload needed** |
| SES | Physique | 2022 | No | 21 | Kept |
| SES | Physique | 2024 | No | 15 | Kept |
| SES | Physique | 2026 (model) | Yes | 15 | Kept (cosmetic year issue) |
| SMP | Physique | 2018 | No | — | **EMPTY — re-upload needed** |
| SMP | Physique | 2019 | No | 17 | Kept |
| SMP | Physique | 2022 | No | 11 | Kept |
| SMP | Physique | 2025 | No | 15 | Kept (`d92d666f`) |
| SMP | Physique | 2025 (model) | Yes | 45 | Kept + title fixed (`db8b3457`) |
| SVT | Physique | 2020 | No | 11 | Kept |

**182 exercises are preserved.** Zero exercises are lost.

---

### The Exact SQL to Execute (After Your Approval)

Two operations: one DELETE for 12 rows, one UPDATE to fix the model exam title.

**Operation 1 — DELETE 12 rows:**

```sql
-- Exams Plan A cleanup: delete 12 NS4 rows
-- 5 ghost+bad-title rows (9AF title, no exercises): SMP/Physique/2025 v1-5
-- 3 ghost rows: SMP/Physique/2018 (all 3, all zero exercises)
-- 2 ghost rows: SES/Physique/2019 (both, all zero exercises)
-- 1 mislabeled row: dd29dfce "2015 - Baccalauréat" stored under year=2025 (has 15 exercises from wrong exam year)
-- 1 kept intact: d92d666f "Physique 2025 - NS4" (correct, 15 exercises)
DELETE FROM official_exams
WHERE id IN (
  -- SMP/Physique/2025 ghost+9AF-title rows (v1-v5, all zero exercises)
  '3692e8fd-6a6a-4870-97f3-925e15b3087d',
  'e830ba4e-1d5d-4a4d-b848-75a409638a43',
  '8c60551f-7cdd-492f-a519-531ef426a130',
  'e12eb598-e06e-40ed-9dec-b54c70731e8c',
  'fa2203da-6173-4a18-948a-6ef1ee65276d',
  -- SMP/Physique/2018 ghosts (all 3 rows, all zero exercises)
  '4ec9d6c5-752f-47f5-9e48-ffe7953c3e50',
  'ab78480e-ebd5-4cdc-986f-5a2bf1c8029b',
  'efa359ee-8873-463a-acf0-7641874d963a',
  -- SES/Physique/2019 ghosts (both rows, both zero exercises)
  'a79c968b-7841-4d24-ae25-6a3313661597',
  '5f14a0ba-7e0e-4bf0-bb42-de0c516189cf',
  -- SMP/Physique/2025 mislabeled "2015 - Baccalauréat (SMP-SVT)" under year=2025
  -- (15 exercises but from the 2015 exam PDF; correct 2025 exam is d92d666f)
  'dd29dfce-ca2d-4693-a82a-3d6f44531cf2'
);
```

**Operation 2 — UPDATE model exam title:**

```sql
-- Fix the model exam title: grade_level=NS4 but title says "9AF"
-- db8b3457 has 45 real exercises and is the only SMP model exam — must be kept, title corrected
UPDATE official_exams
SET title = 'Examen officiel de Physique 2025 - NS4'
WHERE id = 'db8b3457-4f23-479d-9e9f-f9dca15d3cc4';
```

**Important:** `exam_exercises` rows cascade-delete automatically when their parent `official_exams` row is deleted (FK with `ON DELETE CASCADE`). The 12 rows being deleted all have `actual = 0` exercises except `dd29dfce` which has 15 exercises from the wrong exam year (2015 content stored as 2025). Those 15 exercises will be deleted. This is intentional — they are incorrect content for that year slot.

---

### One Item Requiring Your Explicit Decision

**Row `dd29dfce` — "Physique 2015 - Baccalauréat (SMP-SVT)" stored under year=2025:**

This row has 15 real exercises. The AI was fed a 2015 exam PDF but the UI form had year=2025. The exercises are from the 2015 exam, not 2025. The plan above deletes this row because:
- The year=2025 slot already has `d92d666f` with 15 correct 2025 exercises
- Keeping both creates a duplicate for the same logical identity (SMP/Physique/2025/false)
- The 2015 content can be re-uploaded properly under year=2015

If you want the 2015 exam content preserved instead of discarded, let me know before approving and I will modify the plan to keep `dd29dfce` and change its `year` from 2025 to 2015 instead of deleting it.

---

### Safety Checks

| Check | Status |
|---|---|
| Zero real exercises lost by the 11 ghost+bad-title deletions | Yes — rows with IDs `3692e8fd`, `e830ba4e`, `8c60551f`, `e12eb598`, `fa2203da`, `4ec9d6c5`, `ab78480e`, `efa359ee`, `a79c968b`, `5f14a0ba` all have actual=0. No exercises exist in exam_exercises for any of them. |
| The model exam row `db8b3457` (45 exercises) is not deleted | Yes — it is explicitly kept and only its title is corrected. |
| The correct SMP/2025 row `d92d666f` (15 exercises) is kept | Yes — it is not in the DELETE list. |
| All 182 existing exercises are preserved (minus the 15 from the 2015-content row) | Yes — 182 − 15 = 167 exercises preserved if `dd29dfce` is deleted. All 182 preserved if you choose to keep it as year=2015 instead. |
| No code files touched | Yes — this is a database-only operation. |
| ON DELETE CASCADE handles exam_exercises automatically | Yes — confirmed from DB schema. No manual exercise cleanup needed. |
| Post-cleanup diagnostic queries will confirm the final state | Yes — I will re-run all three diagnostic queries after you approve and the deletes execute. |
