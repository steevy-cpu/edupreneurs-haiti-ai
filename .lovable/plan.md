
# Updated Sitemap for Google Search Console

## Domain Confirmation

Using the correct published domain: **mon-edupreneur.com**

---

## Public Pages to Include

Based on the App.tsx routes analysis, here are all the **public pages** that should be indexed:

### Core Public Pages

| URL | Priority | Change Frequency | Description |
|-----|----------|------------------|-------------|
| `/` | 1.0 | daily | Homepage |
| `/blog` | 0.9 | weekly | Blog listing |
| `/templates` | 0.9 | weekly | Templates hub |
| `/privacy-policy` | 0.3 | monthly | Privacy policy |
| `/cookie-settings` | 0.3 | monthly | Cookie settings |

### Template Category Pages

| URL | Priority | Change Frequency |
|-----|----------|------------------|
| `/templates/schedule` | 0.8 | weekly |
| `/templates/planner` | 0.8 | weekly |
| `/templates/budget` | 0.8 | weekly |
| `/templates/certificate` | 0.8 | weekly |
| `/templates/resume` | 0.8 | weekly |
| `/templates/invoice` | 0.8 | weekly |

### Auth Pages (publicly accessible)

| URL | Priority | Change Frequency |
|-----|----------|------------------|
| `/auth` | 0.6 | monthly |
| `/auth/login` | 0.6 | monthly |
| `/auth/signup` | 0.6 | monthly |

---

## Pages NOT Included (Require Authentication)

These routes are inside `AppShell` and require login:
- `/dashboard`
- `/matieres`
- `/course/*`
- `/feed`
- `/community`
- `/profile/*`
- `/games`
- `/lecture`
- `/leaderboard`
- `/baccalaureat`
- All admin routes (`/control-center`, `/content-editor`, etc.)

---

## Files to Update

### 1. `public/sitemap.xml`

Complete replacement with:
- Updated `lastmod` to 2026-01-27
- All current public pages
- Correct domain (mon-edupreneur.com)

### 2. `public/robots.txt`

Keep current content (already uses correct domain).

---

## New Sitemap Content

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://mon-edupreneur.com/</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Blog -->
  <url>
    <loc>https://mon-edupreneur.com/blog</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Templates Hub -->
  <url>
    <loc>https://mon-edupreneur.com/templates</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Template Categories -->
  <url>
    <loc>https://mon-edupreneur.com/templates/schedule</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://mon-edupreneur.com/templates/planner</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://mon-edupreneur.com/templates/budget</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://mon-edupreneur.com/templates/certificate</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://mon-edupreneur.com/templates/resume</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>https://mon-edupreneur.com/templates/invoice</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Auth Pages -->
  <url>
    <loc>https://mon-edupreneur.com/auth</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://mon-edupreneur.com/auth/login</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>https://mon-edupreneur.com/auth/signup</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- Legal Pages -->
  <url>
    <loc>https://mon-edupreneur.com/privacy-policy</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <url>
    <loc>https://mon-edupreneur.com/cookie-settings</loc>
    <lastmod>2026-01-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

---

## Changes Summary

| Item | Old Value | New Value |
|------|-----------|-----------|
| Domain | mon-edupreneur.com | mon-edupreneur.com (unchanged) |
| Last modified | 2025-06-25 | 2026-01-27 |
| Total URLs | 26 (many outdated) | 15 (current public pages) |
| Templates section | Not included | 7 URLs added |
| Auth pages | Not included | 3 URLs added |
| Old course URLs | Included | Removed (require auth now) |

---

## Technical Notes

1. **Dynamic pages excluded**: Individual blog posts (`/blog/:slug`) and template editor (`/templates/edit/:slug`) are dynamic and would need a server-side sitemap generator to include all entries
2. **Authenticated routes excluded**: All routes inside `AppShell` require login and should not be indexed
3. **robots.txt**: Already correct, no changes needed

---

## File to Modify

| File | Action |
|------|--------|
| `public/sitemap.xml` | Replace with updated content |

