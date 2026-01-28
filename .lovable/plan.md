

# Advanced SEO Improvements: Dynamic Sitemap & Article Schema

## Overview

This plan implements the remaining high-impact SEO enhancements to maximize search visibility for EDUPRENEURS Haiti.

---

## Issues Found During Exploration

| Issue | File | Current Value | Impact |
|-------|------|---------------|--------|
| Wrong canonical URL | `BlogPost.tsx` line 164 | `edupreneurs-haiti-ai.lovable.app` | Duplicate content penalty |
| Wrong canonical URL | `TemplateEditorPage.tsx` line 94 | `edupreneurs-haiti-ai.lovable.app` | Duplicate content penalty |
| Missing Article schema | `BlogPost.tsx` | None | No rich snippets |
| Missing FAQ schema | `FAQSection.tsx` | None | No expandable FAQ in Google |
| Static sitemap | `sitemap.xml` | Only category pages | Individual content not indexed |

---

## Implementation Plan

### Phase 1: Fix Remaining Canonical URLs (Critical)

**Files to update:**
- `src/pages/BlogPost.tsx` (line 164)
- `src/pages/templates/TemplateEditorPage.tsx` (line 94)

```tsx
// Before
href={`https://edupreneurs-haiti-ai.lovable.app/blog/${post.slug}`}

// After  
href={`https://mon-edupreneur.com/blog/${post.slug}`}
```

---

### Phase 2: Add Article JSON-LD Schema for Blog Posts

Implement structured data for rich snippets showing author, date, and image in Google search results.

**File:** `src/pages/BlogPost.tsx`

**Schema to add:**
```tsx
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": post.title,
  "description": post.excerpt || post.title,
  "image": post.cover_image_url || "https://mon-edupreneur.com/og-image.jpeg",
  "datePublished": post.published_at || post.created_at,
  "dateModified": post.updated_at,
  "author": {
    "@type": "Person",
    "name": authorName,
    "url": "https://mon-edupreneur.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "EDUPRENEURS Haiti",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mon-edupreneur.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://mon-edupreneur.com/blog/${post.slug}`
  }
};
```

**Integration point:** Inside the `<Helmet>` component, after line 169.

---

### Phase 3: Add FAQ Schema for Homepage

Add FAQPage structured data to enable expandable FAQ rich snippets in Google.

**File:** `src/components/home/FAQSection.tsx`

**Schema to add:**
```tsx
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};
```

**Integration:** Add a `<script>` tag in the component's return JSX.

---

### Phase 4: Create Dynamic Sitemap Edge Function

Create an edge function that dynamically generates sitemap entries from the database.

**New file:** `supabase/functions/generate-sitemap/index.ts`

**Functionality:**
1. Fetch all published blog posts from `blog_posts` table
2. Fetch all published templates from `templates` table
3. Generate XML entries with proper `lastmod` dates
4. Return complete sitemap XML

**Endpoint:** `GET /functions/v1/generate-sitemap`

**Why edge function?**
- Can query database for real-time content
- Returns proper `lastmod` from actual `updated_at` columns
- Automatically includes new content without manual updates

---

### Phase 5: Update Static Sitemap with Dynamic Content Reference

Modify `public/sitemap.xml` to act as a sitemap index pointing to:
1. Static pages (current content)
2. Dynamic pages from edge function

**Alternative approach:** Since the edge function generates XML, we can:
- Keep the static sitemap for core pages
- Add a note in robots.txt for the dynamic endpoint
- Or merge them into one during build

**Recommended:** Add individual blog and template URLs directly to sitemap (simpler for small sites).

---

## Database Content Summary

Based on current data:

| Content Type | Count | URLs to Add |
|--------------|-------|-------------|
| Published Blog Posts | 1 | `/blog/bienvenue-edupreneurs-haiti` |
| Published Templates | 3 | `/templates/edit/emploi-du-temps-primaire`, etc. |

---

## Updated Sitemap Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Existing static pages -->
  ...
  
  <!-- Dynamic blog posts -->
  <url>
    <loc>https://mon-edupreneur.com/blog/bienvenue-edupreneurs-haiti</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Dynamic template editors -->
  <url>
    <loc>https://mon-edupreneur.com/templates/edit/emploi-du-temps-primaire</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <!-- ... more templates -->
  
</urlset>
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/BlogPost.tsx` | Modify | Fix canonical URL + add Article schema |
| `src/pages/templates/TemplateEditorPage.tsx` | Modify | Fix canonical URL |
| `src/components/home/FAQSection.tsx` | Modify | Add FAQ schema |
| `public/sitemap.xml` | Modify | Add individual blog/template URLs |
| `supabase/functions/generate-sitemap/index.ts` | Create (optional) | Dynamic sitemap generation |

---

## Expected SEO Benefits

| Improvement | Benefit |
|-------------|---------|
| Fixed canonical URLs | Prevents duplicate content penalties |
| Article schema | Rich snippets with author, date, image |
| FAQ schema | Expandable FAQ in Google search results |
| Individual content URLs | All blog posts and templates indexed |
| Dynamic lastmod | More efficient crawling |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Backward compatible? | Yes - no existing functionality affected |
| 3G optimized? | Yes - JSON-LD is inline, no extra requests |
| Existing data preserved? | Yes - read-only database queries |
| All canonical URLs corrected? | Yes - BlogPost.tsx and TemplateEditorPage.tsx |

---

## Technical Notes

1. **JSON-LD placement**: Inside `<Helmet>` using `<script type="application/ld+json">`
2. **FAQ schema location**: In FAQSection component, not index.html (component-level)
3. **Sitemap updates**: Manual for now (3 templates + 1 blog post), can automate later
4. **No console.logs in production**: All implementations follow clean patterns

---

## Implementation Order

1. Fix canonical URLs (critical - immediate SEO impact)
2. Add Article schema to BlogPost.tsx
3. Add FAQ schema to FAQSection.tsx
4. Update sitemap.xml with individual content URLs
5. (Optional) Create dynamic sitemap edge function for future automation

