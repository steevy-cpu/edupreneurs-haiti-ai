

# Footer Reorganization

## Overview

Unify and properly organize both footers (`Footer.tsx` for inner pages and `HomeFooter.tsx` for homepage) so they share the same well-structured link data and consistent categorization.

---

## Current Problems

| Problem | Where |
|---------|-------|
| "Se connecter" placed under "Legal" | `homePageData.ts` footerLinks |
| Missing "Conditions" (Terms) link | `homePageData.ts` footerLinks |
| Anchor links like `href="#accueil"` don't work from inner pages | `homePageData.ts` footerLinks |
| "Paramètres Cookies" in HomeFooter but not in Footer | Both footers |
| Hardcoded `2025` year | `HomeFooter.tsx` |
| Two completely separate link sets | `Footer.tsx` vs `homePageData.ts` |

---

## Proposed Link Organization

### Navigation
- Accueil (`/`)
- Blog (`/blog`)
- Templates (`/templates`)
- Traducteur (`/translate`)

### A Propos
- Notre Mission (`/#about`)
- L'Equipe (`/#team`)
- Preparation au Bac (`/examens-officiels`)

### Support
- Contact (`mailto:support@edupreneurs.com`)
- FAQ (`/#faq`)
- Ressources (`/resources`)

### Legal
- Conditions (`/terms`)
- Confidentialite (`/privacy-policy`)
- Parametres Cookies (`/cookie-settings`)

---

## Changes

### 1. Update `footerLinks` in `homePageData.ts`

Reorganize the data with proper route-based links (use `to` instead of `href` for internal links) and correct categorization:

- Move "Traducteur" to Navigation (it's a tool, not support)
- Remove "Se connecter" from Legal (it's not a legal page)
- Add "Conditions" (`/terms`) to Legal
- Keep "Parametres Cookies" in Legal
- Replace all anchor `href="#section"` with `to="/#section"` so they work from any page
- Add Contact email to Support

### 2. Update `HomeFooter.tsx`

- Use dynamic `new Date().getFullYear()` instead of hardcoded `2025`

### 3. Update `Footer.tsx` to use shared `footerLinks` data

- Import `footerLinks` from `homePageData.ts` instead of hardcoding links
- Reuse the same `FooterLinkSection` pattern (or a shared helper)
- This ensures both footers always stay in sync

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/data/homePageData.ts` | Reorganize `footerLinks` with correct categories and route-based links |
| `src/components/home/HomeFooter.tsx` | Dynamic year |
| `src/components/Footer.tsx` | Import and use shared `footerLinks` data instead of hardcoded links |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - same links, better organized |
| Works with existing data? | N/A - no database changes |
| 3G performance impact? | None |
| Backward compatible? | Yes - all links preserved, just reorganized |

