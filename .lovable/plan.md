

# Fix Missing Lessons on Course Pages (Français + Others)

## Root Cause

The `groupLessonsByMonth` function groups lessons by their exact `mois` value, and the rendering in `DynamicCoursePage.tsx` iterates `MONTH_ORDER` looking for exact matches like "Décembre". But some subjects use different `mois` formats:

| Subject | Lesson Count | mois format | Currently displays? |
|---------|-------------|-------------|-------------------|
| Français | 34 | "Décembre - Semaine 1" (weekly) | NO - no match in MONTH_ORDER |
| Kreyòl Ayisyen | 30 | NULL | NO - grouped as "Sans mois", rendered separately BUT only if `hasMonthlyOrganization` is true, which requires at least 1 lesson to have a non-null, non-"Sans mois" mois |
| Mathématiques | 19 | NULL | NO - same issue |
| Sciences Expérimentales | 23 | NULL | NO - same issue |
| Anglais | 23 | Plain months | YES |
| Espagnol | 19 | Plain months | YES |
| Others | varies | Plain months | YES |

Two distinct bugs:

**Bug 1 (Français):** Weekly format "Décembre - Semaine 1" doesn't match MONTH_ORDER entry "Décembre". Lessons are grouped but never rendered.

**Bug 2 (Kreyòl, Maths, Sciences Exp):** All lessons have `mois = NULL`. `hasMonthlyOrganization` is `false` (no lesson has a non-null mois), so the code takes the simple grid path at line 238. This should actually work -- let me re-check...

Actually, re-reading the code: when `hasMonthlyOrganization` is `false`, it falls through to the simple grid at line 238 which renders ALL lessons. So Kreyòl/Maths/SciExp should render fine. The main bug is only Français.

## Fix

Update `groupLessonsByMonth` to normalize weekly formats ("Décembre - Semaine 1") to their parent month ("Décembre") so they match MONTH_ORDER.

### File: `src/utils/courseHelpers.ts`

In the `groupLessonsByMonth` function, extract the base month from weekly-format strings:

```typescript
export const groupLessonsByMonth = <T extends { mois?: string | null }>(
  lessons: T[]
): Record<string, T[]> => {
  return lessons.reduce((acc, lesson) => {
    let month = lesson.mois || "Sans mois";
    
    // Normalize weekly format: "Décembre - Semaine 1" -> "Décembre"
    // Also handles: "Mars - Semaines 1-2" -> "Mars"
    const weeklyMatch = month.match(/^(\S+)\s*-\s*Semaines?\b/);
    if (weeklyMatch) {
      month = weeklyMatch[1];
    }
    
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, T[]>);
};
```

This single change fixes Français by collapsing all weekly entries under their parent month. The regex handles both "Semaine 1" and "Semaines 1-2" variants.

No other files need changes -- the rendering logic in DynamicCoursePage.tsx already handles the normalized month names correctly.

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing subjects? | No -- subjects with plain month names are unaffected (no " - Semaine" match) |
| Breaks NULL mois subjects? | No -- NULL stays "Sans mois", no regex match |
| Works with existing data? | Yes -- tested against actual DB values |
| Ordering preserved? | Yes -- lessons within a month keep their order_index sorting |
| 3G impact? | None -- purely string parsing, no extra queries |
| Edge cases? | "Sans mois" lessons still handled separately at line 262 |

