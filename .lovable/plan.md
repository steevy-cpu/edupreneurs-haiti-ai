

# Fix Template Routing Conflict

## Problem Identified

In `App.tsx` (lines 127-136), two routes use identical dynamic segment patterns:

```tsx
<Route path="/templates/:category" element={<TemplatesCategoryPage />} />
<Route path="/templates/:slug" element={<TemplateEditorPage />} />
```

Since React Router evaluates routes top-to-bottom, **the first matching route always wins**. When a user visits `/templates/emploi-du-temps-primaire`, the router interprets `emploi-du-temps-primaire` as a `category` parameter, not a `slug`, rendering the wrong page.

---

## Solution: Add Unique Prefix to Editor Route

Change the template editor route from `/templates/:slug` to `/templates/edit/:slug`.

This creates unambiguous routing:
| URL | Route | Component |
|-----|-------|-----------|
| `/templates` | `/templates` | TemplatesHomePage |
| `/templates/schedule` | `/templates/:category` | TemplatesCategoryPage |
| `/templates/edit/emploi-du-temps-primaire` | `/templates/edit/:slug` | TemplateEditorPage |

---

## Files to Modify

### 1. `src/App.tsx`

**Current (line 132-136):**
```tsx
<Route path="/templates/:slug" element={
  <Suspense fallback={<GenericPageSkeleton />}>
    <TemplateEditorPage />
  </Suspense>
} />
```

**Change to:**
```tsx
<Route path="/templates/edit/:slug" element={
  <Suspense fallback={<GenericPageSkeleton />}>
    <TemplateEditorPage />
  </Suspense>
} />
```

---

### 2. `src/components/templates/TemplateCard.tsx`

**Current (line 27):**
```tsx
<Link to={`/templates/${template.slug}`}>
```

**Change to:**
```tsx
<Link to={`/templates/edit/${template.slug}`}>
```

---

### 3. `src/pages/templates/TemplatesHomePage.tsx`

The "Voir tout" link currently points to `/templates/schedule`. This is correct for a category link, **no change needed**.

---

### 4. `src/pages/templates/TemplateEditorPage.tsx`

The canonical URL and any self-referential links need updating.

**Current (line 89):**
```tsx
<link rel="canonical" href={`https://edupreneurs-haiti-ai.lovable.app/templates/${template.slug}`} />
```

**Change to:**
```tsx
<link rel="canonical" href={`https://edupreneurs-haiti-ai.lovable.app/templates/edit/${template.slug}`} />
```

Also update the OG URL if present.

---

## Implementation Checklist

| File | Change | Lines |
|------|--------|-------|
| `src/App.tsx` | Route path: `:slug` → `edit/:slug` | 132 |
| `src/components/templates/TemplateCard.tsx` | Link path: add `/edit/` | 27 |
| `src/pages/templates/TemplateEditorPage.tsx` | Canonical URL: add `/edit/` | 89 |

---

## Verification Steps

After implementation:
1. Navigate to `/templates` → Should show homepage with categories
2. Click a category (e.g., "Emplois du temps") → Should go to `/templates/schedule` and show category page
3. Click a template card → Should go to `/templates/edit/emploi-du-temps-primaire` and show editor
4. "Retour" link in editor should return to `/templates/:category` page

---

## Technical Notes

- **No database changes required**
- **No edge function changes required**
- **Backward compatibility**: Old bookmarks to `/templates/:slug` will now incorrectly load the category page (showing "no templates" or redirecting to `/templates`). This is acceptable for a new feature with no existing traffic.
- **SEO impact**: Minimal - templates are new and not yet indexed

