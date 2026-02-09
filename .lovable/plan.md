

# Sitemap Update for Translation Page

## Overview

Add the new `/translate` page to the sitemap so Google Search Console can index it. This is a public tool page that will help with SEO for translation-related searches.

---

## Changes Required

### File: `public/sitemap.xml`

Add a new entry for the translation page after the Templates section and before Auth pages:

```xml
<!-- Translation Tool -->
<url>
  <loc>https://mon-edupreneur.com/translate</loc>
  <lastmod>2026-02-09</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

**Rationale:**
- **Priority 0.8**: Same as template categories (it's a standalone tool page)
- **Changefreq monthly**: The feature won't change frequently
- **Lastmod**: Today's date (2026-02-09) since we just created it

---

## Full Change

Insert after line 85 (after the last template category) and before line 87 (Individual Templates):

```xml
  <!-- Translation Tool -->
  <url>
    <loc>https://mon-edupreneur.com/translate</loc>
    <lastmod>2026-02-09</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
```

---

## SEO Benefits

| Benefit | Description |
|---------|-------------|
| Discoverability | Page will appear in Google for "traducteur créole français" searches |
| Crawl efficiency | Google knows exactly which pages to index |
| Fresh content signal | `lastmod` tells Google when the page was created |

---

## After Publishing

Once this is deployed, you can:
1. Go to Google Search Console
2. Submit the updated sitemap URL
3. Request indexing for the `/translate` page specifically

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing sitemap? | No - additive change only |
| Valid XML? | Yes - follows same format as other entries |
| Correct domain? | Yes - uses `mon-edupreneur.com` |

