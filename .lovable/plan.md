
# Plan: Fix NS4 Subject Lists for Exam Admin

## Problem Identified

The "Sélectionner une matière" dropdown for NS4 series shows **incorrect subjects**. Comparing against the **official 2024 Haitian Baccalaureate exam schedule**:

### Current vs Official Subjects

| Series | Current (Incorrect) | Official (Correct) |
|--------|---------------------|-------------------|
| **SVT** | SVT, Chimie, Physique, Mathématiques, Philosophie, Français, Anglais | Philosophie, Chimie, Histoire-Géographie, SVT, Physique, Mathématiques, Anglais/Espagnol, Créole |
| **SMP** | Mathématiques, Physique, Chimie, Philosophie, Français, Anglais | Philosophie, Chimie, Histoire-Géographie, SVT, Physique, Mathématiques, Anglais/Espagnol, Créole |
| **SES** | Sciences Économiques, Sociologie, Mathématiques, Philosophie, Français, Anglais | Philosophie, Chimie, Histoire-Géographie, SVT, Physique, Économie, Mathématiques, Anglais/Espagnol, Créole |
| **LLA** | Littérature, Langues, Philosophie, Histoire-Géographie, Français, Anglais | Philosophie, Chimie, Histoire-Géographie, SVT, Arts et Musique, Anglais, Mathématiques, Créole, Espagnol |

### Key Issues
1. All series incorrectly include "Français" (not a separate exam subject)
2. All series missing "Créole" and "Histoire-Géographie"
3. SES has "Sociologie" instead of proper subjects
4. LLA has "Littérature" and "Langues" instead of "Arts et Musique"
5. Series-specific subjects like "Économie" (SES), "Arts et Musique" (LLA) are missing

---

## Solution

Update `SUBJECTS_BY_SERIES` in **two files** to match the official 2024 exam curriculum:

### Corrected Subject Lists

```typescript
const SUBJECTS_BY_SERIES: Record<string, string[]> = {
  SVT: [
    "SVT",
    "Chimie", 
    "Physique",
    "Mathématiques",
    "Philosophie",
    "Histoire-Géographie",
    "Anglais",
    "Espagnol",
    "Créole"
  ],
  SMP: [
    "Mathématiques",
    "Physique",
    "Chimie",
    "SVT",
    "Philosophie",
    "Histoire-Géographie",
    "Anglais",
    "Espagnol",
    "Créole"
  ],
  SES: [
    "Économie",
    "Histoire-Géographie",
    "Mathématiques",
    "Philosophie",
    "SVT",
    "Physique",
    "Chimie",
    "Anglais",
    "Espagnol",
    "Créole"
  ],
  LLA: [
    "Arts et Musique",
    "Philosophie",
    "Histoire-Géographie",
    "SVT",
    "Anglais",
    "Espagnol",
    "Mathématiques",
    "Chimie",
    "Créole"
  ],
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/features/exams/admin/ExamAdminPage.tsx` | Update `SUBJECTS_BY_SERIES` (lines 35-40) |
| `src/components/content-editor/BaccExamManager.tsx` | Update `SUBJECTS_BY_SERIES` (lines 68-73) |

---

## Technical Details

### Exam Subject Ordering
- Specialty subjects listed first (SVT for SVT series, Économie for SES, etc.)
- Common subjects follow: Philosophie, Histoire-Géographie
- Languages last: Anglais, Espagnol, Créole

### Subject Name Standardization
| Old Name | New Name | Reason |
|----------|----------|--------|
| Sciences Économiques | Économie | Official exam name |
| Littérature | Arts et Musique | Official LLA specialty |
| Langues | Espagnol | Specific language exam |
| Français | (removed) | Not a separate exam subject |
| Sociologie | (removed) | Not in official curriculum |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing exams? | No | Existing exams keep their subject field |
| Works with database? | Yes | Subject field is freeform text |
| Backward compatible? | Yes | New exams use correct subjects |
| 3G optimized? | N/A | No network impact |
| Edge cases? | N/A | Simple config update |

---

## Expected Result

After implementation:
1. When selecting NS4 + LLA series, dropdown shows: Arts et Musique, Philosophie, Histoire-Géographie, SVT, Anglais, Espagnol, Mathématiques, Chimie, Créole
2. When selecting NS4 + SES series, dropdown shows: Économie, Histoire-Géographie, etc.
3. All series show complete subject lists matching official exams
4. Content editors can upload exams for all official subjects
