

# Donate Page Front-End Improvements

## Changes Overview

Two targeted updates to the `/donate` page:

1. **Add the HomeChatbot (Jude) to the donate page** so visitors can ask questions while considering a donation
2. **Remove "Enseignants" from the impact cards** since teacher training is not currently a use of funds

---

## 1. Add HomeChatbot to Donate Page

**File: `src/pages/Donate.tsx`**

- Import the `HomeChatbot` component
- Render it inside the page, after `<Footer />` but still within the fragment
- This places Jude's floating chat bubble in the bottom-right corner, just like on the home page

---

## 2. Update ImpactSection: Remove "Enseignants"

**File: `src/components/donate/ImpactSection.tsx`**

- Remove the "Enseignants" card (the `GraduationCap` entry) from the `impactCards` array
- Change the grid from `sm:grid-cols-3` to `sm:grid-cols-2` since there are now only 2 cards
- Remove the unused `GraduationCap` import
- The remaining cards ("Technologie" and "Contenu educatif") stay as-is

---

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- purely visual/additive changes |
| Works with existing data? | N/A -- no data changes |
| 3G optimized? | Yes -- HomeChatbot already lazy-loads its assets |
| Backward compatible? | Yes |
| Edge cases? | HomeChatbot is self-contained with fixed positioning, no layout conflicts |

