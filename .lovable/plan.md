

# SEO Sitemap & Metadata Improvements

## Current Issues Identified

| Issue | Location | Impact |
|-------|----------|--------|
| Wrong canonical URLs | `TemplatesHomePage.tsx`, `TemplatesCategoryPage.tsx`, `Blog.tsx` | Uses old `edupreneurs-haiti-ai.lovable.app` instead of `mon-edupreneur.com` |
| Missing image sitemap | `sitemap.xml` | OG images and logos not indexed by image search |
| No hreflang tags | All pages | Missing language declaration for French-Haitian content |
| Missing sitemap image extension | `sitemap.xml` | Images not discoverable by Google Image Search |
| No video sitemap | N/A | If you have videos, they're not indexed |
| Missing structured data | Templates pages | No JSON-LD for ItemList or Product schema |
| Static lastmod dates | `sitemap.xml` | All pages show same date, reducing crawl efficiency |
| No alternate link tags | `index.html` | Mobile/desktop relationship not declared |

---

## Proposed Improvements

### 1. Fix Canonical URLs (Critical)

Update all pages to use the correct production domain:

**Files to update:**
- `src/pages/templates/TemplatesHomePage.tsx` (line 64)
- `src/pages/templates/TemplatesCategoryPage.tsx` (line 59)
- `src/pages/Blog.tsx` (line 27)

```tsx
// Before
<link rel="canonical" href="https://edupreneurs-haiti-ai.lovable.app/templates" />

// After
<link rel="canonical" href="https://mon-edupreneur.com/templates" />
```

### 2. Add Image Sitemap Extension

Enhance `sitemap.xml` with image information for better Google Image Search indexing:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://mon-edupreneur.com/</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://mon-edupreneur.com/og-image.jpeg</image:loc>
      <image:title>EDUPRENEURS - Plateforme éducative haïtienne</image:title>
    </image:image>
  </url>
  <!-- More URLs with images -->
</urlset>
```

### 3. Add hreflang Tags

Add language/region targeting for French-Haitian content:

**In `index.html`:**
```html
<link rel="alternate" hreflang="fr-HT" href="https://mon-edupreneur.com/" />
<link rel="alternate" hreflang="fr" href="https://mon-edupreneur.com/" />
<link rel="alternate" hreflang="x-default" href="https://mon-edupreneur.com/" />
```

**In each page's Helmet:**
```tsx
<Helmet>
  <link rel="alternate" hreflang="fr-HT" href="https://mon-edupreneur.com/templates" />
  <!-- ... -->
</Helmet>
```

### 4. Add JSON-LD Structured Data for Templates

Add ItemList schema to templates pages for rich snippets:

**In `TemplatesHomePage.tsx`:**
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Templates Gratuits - EDUPRENEURS",
  "description": "Collection de templates PDF gratuits pour étudiants haïtiens",
  "url": "https://mon-edupreneur.com/templates",
  "isPartOf": {
    "@type": "WebSite",
    "name": "EDUPRENEURS",
    "url": "https://mon-edupreneur.com"
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": categories.map((cat, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": cat.name,
      "url": `https://mon-edupreneur.com/templates/${cat.id}`
    }))
  }
})}
</script>
```

### 5. Add BreadcrumbList Schema

Helps Google understand site hierarchy:

**In category pages:**
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://mon-edupreneur.com" },
    { "@type": "ListItem", "position": 2, "name": "Templates", "item": "https://mon-edupreneur.com/templates" },
    { "@type": "ListItem", "position": 3, "name": categoryName, "item": `https://mon-edupreneur.com/templates/${category}` }
  ]
})}
</script>
```

### 6. Enhance robots.txt

Add crawl-delay and more specific directives:

```text
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /

# Block authenticated/private paths
Disallow: /dashboard
Disallow: /settings
Disallow: /profile
Disallow: /admin
Disallow: /control-center
Disallow: /content-editor

# Sitemap
Sitemap: https://mon-edupreneur.com/sitemap.xml
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `public/sitemap.xml` | Modify | Add image extension, enhance structure |
| `public/robots.txt` | Modify | Add disallow rules for private paths |
| `index.html` | Modify | Add hreflang tags |
| `src/pages/templates/TemplatesHomePage.tsx` | Modify | Fix canonical URL, add JSON-LD |
| `src/pages/templates/TemplatesCategoryPage.tsx` | Modify | Fix canonical URL, add breadcrumb schema |
| `src/pages/Blog.tsx` | Modify | Fix canonical URL, add hreflang |

---

## Priority Order

1. **Critical** - Fix canonical URLs (wrong domain hurts SEO significantly)
2. **High** - Add hreflang tags (language targeting)
3. **High** - Update robots.txt with disallow rules
4. **Medium** - Add image sitemap extension
5. **Medium** - Add structured data (JSON-LD)
6. **Low** - Add breadcrumb schema

---

## Expected SEO Benefits

| Improvement | Benefit |
|-------------|---------|
| Correct canonical URLs | Prevents duplicate content penalties |
| hreflang tags | Better ranking in French-speaking regions |
| Image sitemap | Images appear in Google Image Search |
| robots.txt disallows | Prevents crawl waste on auth pages |
| JSON-LD structured data | Rich snippets in search results |
| Breadcrumb schema | Better SERP appearance with navigation path |

---

## Technical Notes

- All changes are 3G-friendly (no additional network requests)
- Structured data uses inline JSON, not external files
- hreflang targets `fr-HT` (Haitian French) as primary with `fr` fallback
- Image sitemap adds ~50 bytes per URL (negligible impact)

