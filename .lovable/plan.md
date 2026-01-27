

# Public Free Templates Feature - Implementation Plan

## Executive Summary
Build a no-auth-required, SEO-optimized templates system for Haitian students. Users can edit templates in-browser and download as PDF/PNG with Edupreneurs branding enforced at export time.

---

## 1. Architecture Overview

```text
PUBLIC ROUTES (No Auth Required)
┌─────────────────────────────────────────────────────────────────┐
│  /templates                    Template Directory (Landing)     │
│  /templates/:category          Category Listing                 │
│  /templates/:slug              Template Editor Page             │
└─────────────────────────────────────────────────────────────────┘

DATA FLOW
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Supabase DB    │─────▶│  React Query    │─────▶│  localStorage   │
│  (templates)    │      │  (5min stale)   │      │  (user edits)   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                          │
                                                          ▼
                         ┌─────────────────────────────────────────┐
                         │  EXPORT (Server-Side Edge Function)      │
                         │  • Validates input                       │
                         │  • Applies branding                      │
                         │  • Returns PDF/PNG                       │
                         └─────────────────────────────────────────┘
```

---

## 2. Database Schema

### Table: `templates`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `slug` | text | Unique URL-safe identifier |
| `title` | text | Display title (French) |
| `title_ht` | text | Title in Creole (optional) |
| `description` | text | 150-300 char description |
| `category` | text | `'schedule' | 'planner' | 'invoice' | 'resume' | 'certificate' | 'budget'` |
| `tags` | text[] | Searchable tags |
| `language` | text | `'fr' | 'ht' | 'en'` |
| `thumbnail_url` | text | WebP thumbnail path in storage |
| `schema` | jsonb | Editable fields + layout definition |
| `seo_title` | text | Meta title override |
| `seo_description` | text | Meta description |
| `og_image_url` | text | Open Graph image |
| `is_featured` | boolean | Show on homepage |
| `is_published` | boolean | Public visibility |
| `download_count` | integer | Analytics counter |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update |

### Table: `template_categories`

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Primary key (slug) |
| `name` | text | Display name (French) |
| `name_ht` | text | Creole name |
| `description` | text | Category description |
| `icon` | text | Lucide icon name |
| `order_index` | integer | Sort order |

### RLS Policies (Public Read, Admin Write)

```sql
-- Anyone can view published templates
CREATE POLICY "Public read templates"
ON templates FOR SELECT
USING (is_published = true);

-- Only founders can manage templates
CREATE POLICY "Founders can manage templates"
ON templates FOR ALL
TO authenticated
USING (public.is_founder(auth.uid()))
WITH CHECK (public.is_founder(auth.uid()));
```

### Storage Bucket: `template-assets`

```sql
-- Public bucket for thumbnails and preview images
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-assets', 'template-assets', true);

-- Anyone can view template assets
CREATE POLICY "Public read template assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-assets');

-- Only founders can upload
CREATE POLICY "Founders can manage template assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'template-assets' AND public.is_founder(auth.uid()));
```

---

## 3. Template Schema Format (JSON)

Each template's `schema` field defines its editable structure:

```json
{
  "version": 1,
  "dimensions": {
    "width": 595,
    "height": 842,
    "unit": "pt"
  },
  "background": "#ffffff",
  "elements": [
    {
      "id": "title",
      "type": "text",
      "label": "Titre",
      "defaultValue": "Mon Emploi du Temps",
      "position": { "x": 297, "y": 40 },
      "style": {
        "fontSize": 24,
        "fontWeight": "bold",
        "textAlign": "center",
        "color": "#1e3a5f"
      }
    },
    {
      "id": "school_name",
      "type": "text",
      "label": "Nom de l'école",
      "defaultValue": "",
      "placeholder": "Ex: Collège Saint-Louis",
      "position": { "x": 297, "y": 70 },
      "style": { "fontSize": 14, "textAlign": "center" }
    },
    {
      "id": "schedule_table",
      "type": "table",
      "label": "Horaire",
      "rows": 8,
      "columns": 6,
      "headers": ["Heure", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      "defaultData": [
        ["7:00 - 8:00", "", "", "", "", ""],
        ["8:00 - 9:00", "", "", "", "", ""]
      ],
      "position": { "x": 40, "y": 100 },
      "style": { "cellPadding": 8, "borderColor": "#e5e7eb" }
    },
    {
      "id": "student_name",
      "type": "text",
      "label": "Nom de l'élève",
      "defaultValue": "",
      "position": { "x": 40, "y": 780 }
    }
  ],
  "branding": {
    "logoPosition": "bottom-right",
    "watermark": false,
    "footerText": "Créé avec Edupreneurs"
  }
}
```

---

## 4. Frontend Component Structure

### File Organization

```text
src/
├── pages/
│   └── templates/
│       ├── TemplatesHomePage.tsx      # /templates
│       ├── TemplatesCategoryPage.tsx  # /templates/:category
│       └── TemplateEditorPage.tsx     # /templates/:slug
├── components/
│   └── templates/
│       ├── TemplateCard.tsx           # Grid card component
│       ├── TemplateCanvas.tsx         # Canvas renderer
│       ├── EditorSidebar.tsx          # Field inputs
│       ├── StickyActionBar.tsx        # Download/Reset buttons
│       ├── TemplateSearch.tsx         # Search + filters
│       ├── CategoryCard.tsx           # Category grid item
│       ├── RelatedTemplates.tsx       # Internal linking
│       ├── TemplateFAQ.tsx            # FAQ schema.org block
│       └── TemplateHowToUse.tsx       # SEO content section
├── hooks/
│   ├── useTemplates.ts                # Template data fetching
│   ├── useTemplateEditor.ts           # Editor state management
│   └── useTemplateExport.ts           # Export functionality
├── utils/
│   └── templates/
│       ├── schema.ts                  # Schema types + validation
│       ├── persistEdits.ts            # localStorage management
│       └── compressShareLink.ts       # URL state encoding
└── types/
    └── templates.ts                   # TypeScript interfaces
```

### Route Registration (App.tsx)

```tsx
// PUBLIC ROUTES - No shell, no auth
<Route path="/templates" element={
  <Suspense fallback={<GenericPageSkeleton />}>
    <TemplatesHomePage />
  </Suspense>
} />
<Route path="/templates/:category" element={
  <Suspense fallback={<GenericPageSkeleton />}>
    <TemplatesCategoryPage />
  </Suspense>
} />
<Route path="/templates/:slug" element={
  <Suspense fallback={<GenericPageSkeleton />}>
    <TemplateEditorPage />
  </Suspense>
} />
```

---

## 5. SEO Implementation

### Per-Page Meta Tags

**TemplatesHomePage.tsx:**
```tsx
<Helmet>
  <title>Templates Gratuits | EDUPRENEURS - Emploi du temps, Planificateurs</title>
  <meta name="description" content="Téléchargez gratuitement des templates PDF: emplois du temps, planificateurs d'études, fiches de budget. Personnalisez et exportez sans inscription." />
  <link rel="canonical" href="https://edupreneurs-haiti-ai.lovable.app/templates" />
  <meta property="og:type" content="website" />
</Helmet>
```

**TemplateEditorPage.tsx:**
```tsx
<Helmet>
  <title>{template.seo_title || template.title} | Templates EDUPRENEURS</title>
  <meta name="description" content={template.seo_description || template.description} />
  <link rel="canonical" href={`https://edupreneurs-haiti-ai.lovable.app/templates/${template.slug}`} />
  <meta property="og:image" content={template.og_image_url || template.thumbnail_url} />
  <meta property="og:type" content="article" />
</Helmet>
```

### Structured Data (JSON-LD)

```tsx
// Inject in TemplateEditorPage
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": template.title,
  "description": template.description,
  "step": [
    { "@type": "HowToStep", "text": "Personnalisez les champs du template" },
    { "@type": "HowToStep", "text": "Prévisualisez vos modifications" },
    { "@type": "HowToStep", "text": "Téléchargez en PDF ou PNG" }
  ],
  "tool": { "@type": "SoftwareApplication", "name": "EDUPRENEURS" }
})}
</script>
```

### Sitemap Addition

Update `public/sitemap.xml` with:
```xml
<!-- Template Directory -->
<url>
  <loc>https://edupreneurs-haiti-ai.lovable.app/templates</loc>
  <changefreq>weekly</changefreq>
  <priority>0.9</priority>
</url>

<!-- Dynamic template pages generated via edge function -->
```

---

## 6. Editor Architecture

### State Management (useTemplateEditor.ts)

```typescript
interface EditorState {
  templateId: string;
  values: Record<string, any>;      // User's current edits
  isDirty: boolean;                 // Has unsaved changes
  selectedElementId: string | null; // Currently focused field
}

// Persist to localStorage keyed by templateId
const STORAGE_KEY = (id: string) => `template_edits_${id}`;

export function useTemplateEditor(template: Template) {
  const [state, setState] = useState<EditorState>(() => {
    // Load saved edits from localStorage
    const saved = localStorage.getItem(STORAGE_KEY(template.id));
    return saved ? JSON.parse(saved) : {
      templateId: template.id,
      values: getDefaultValues(template.schema),
      isDirty: false,
      selectedElementId: null
    };
  });

  // Auto-save to localStorage on changes
  useEffect(() => {
    if (state.isDirty) {
      localStorage.setItem(STORAGE_KEY(template.id), JSON.stringify(state));
    }
  }, [state]);

  const updateField = (fieldId: string, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [fieldId]: value },
      isDirty: true
    }));
  };

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY(template.id));
    setState({
      templateId: template.id,
      values: getDefaultValues(template.schema),
      isDirty: false,
      selectedElementId: null
    });
  };

  return { state, updateField, reset };
}
```

### Canvas Renderer (TemplateCanvas.tsx)

```tsx
// Uses HTML Canvas API for consistent rendering
export function TemplateCanvas({ schema, values, onElementSelect }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
    // Clear and set background
    ctx.fillStyle = schema.background;
    ctx.fillRect(0, 0, schema.dimensions.width, schema.dimensions.height);
    
    // Render each element
    for (const element of schema.elements) {
      const value = values[element.id] ?? element.defaultValue;
      renderElement(ctx, element, value);
    }
  }, [schema, values]);
  
  return (
    <canvas
      ref={canvasRef}
      width={schema.dimensions.width}
      height={schema.dimensions.height}
      className="max-w-full h-auto shadow-lg rounded-lg"
      onClick={(e) => {
        // Detect clicked element for selection
        const element = findElementAtPosition(schema, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        onElementSelect(element?.id || null);
      }}
    />
  );
}
```

---

## 7. Export System (Server-Side)

### Edge Function: `export-template`

```typescript
// supabase/functions/export-template/index.ts
import { createClient } from '@supabase/supabase-js';
import { jsPDF } from 'jspdf';
import { corsHeaders } from '../_shared/cors.ts';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '../_shared/rateLimiter.ts';

const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000,
  maxRequests: 20,      // Auth users: 20 exports/min
  maxAnonRequests: 5,   // Anon users: 5 exports/min (stricter)
  keyPrefix: 'template_export'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Rate limiting
  const clientIp = getClientIp(req);
  const rateLimitResult = await checkRateLimit(supabase, RATE_LIMIT_CONFIG, null, clientIp);
  
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult.retryAfter!, 0, corsHeaders);
  }

  const { templateId, values, format = 'pdf' } = await req.json();

  // Validate template exists
  const { data: template, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_published', true)
    .single();

  if (error || !template) {
    return new Response(JSON.stringify({ error: 'Template not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Validate values against schema
  const validatedValues = validateValues(template.schema, values);

  // Generate document with branding
  const document = await generateDocument(template, validatedValues, format);

  // Increment download counter (non-blocking)
  supabase.rpc('increment_template_downloads', { template_id: templateId });

  // Return file
  return new Response(document, {
    headers: {
      ...corsHeaders,
      'Content-Type': format === 'pdf' ? 'application/pdf' : 'image/png',
      'Content-Disposition': `attachment; filename="${template.slug}.${format}"`
    }
  });
});

async function generateDocument(template, values, format) {
  const pdf = new jsPDF();
  
  // Render template content
  renderTemplateContent(pdf, template.schema, values);
  
  // ALWAYS apply branding (cannot be skipped)
  applyBranding(pdf, template.schema.branding);
  
  if (format === 'pdf') {
    return pdf.output('arraybuffer');
  } else {
    // Convert to PNG using canvas
    return await pdfToPng(pdf);
  }
}

function applyBranding(pdf, brandingConfig) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add Edupreneurs logo in corner
  const logoSize = 15;
  pdf.addImage(LOGO_BASE64, 'PNG', pageWidth - logoSize - 10, pageHeight - logoSize - 10, logoSize, logoSize);
  
  // Add footer text
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text('Créé avec Edupreneurs | edupreneurs.app', pageWidth / 2, pageHeight - 5, { align: 'center' });
}
```

---

## 8. Performance Optimizations (3G Focus)

### Image Optimization

| Asset Type | Format | Max Size | Loading |
|------------|--------|----------|---------|
| Thumbnails | WebP | 100KB | Lazy |
| Preview Images | WebP | 200KB | Lazy |
| OG Images | JPEG | 150KB | Preload |
| Logo | WebP | 10KB | Preload |

### Data Fetching Strategy

```typescript
// useTemplates.ts
export function useTemplates(category?: string) {
  return useQuery({
    queryKey: ['templates', category],
    queryFn: async () => {
      const query = supabase
        .from('templates')
        .select('id, slug, title, description, category, thumbnail_url, download_count')
        .eq('is_published', true)
        .order('download_count', { ascending: false });
      
      if (category) {
        query.eq('category', category);
      }
      
      return query.limit(50);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (templates rarely change)
    gcTime: 30 * 60 * 1000,    // 30 minutes cache
    refetchOnWindowFocus: false
  });
}
```

### Lazy Loading

```tsx
// TemplatesHomePage.tsx
const TemplateCard = lazy(() => import('@/components/templates/TemplateCard'));
const EditorSidebar = lazy(() => import('@/components/templates/EditorSidebar'));
```

---

## 9. Security & Anti-Abuse

### Rate Limiting

| Endpoint | Anon Limit | Auth Limit | Window |
|----------|------------|------------|--------|
| `/api/templates` (list) | 100/min | 200/min | 1 min |
| `/api/templates/:slug` (detail) | 60/min | 120/min | 1 min |
| `/api/export-template` | 5/min | 20/min | 1 min |

### Input Validation

```typescript
// utils/templates/schema.ts
import { z } from 'zod';

const TextValueSchema = z.string().max(500).trim();
const TableValueSchema = z.array(z.array(z.string().max(100))).max(50);

export function validateValues(schema: TemplateSchema, values: Record<string, any>) {
  const validated: Record<string, any> = {};
  
  for (const element of schema.elements) {
    const value = values[element.id];
    
    switch (element.type) {
      case 'text':
        validated[element.id] = TextValueSchema.parse(value ?? element.defaultValue);
        break;
      case 'table':
        validated[element.id] = TableValueSchema.parse(value ?? element.defaultData);
        break;
    }
  }
  
  return validated;
}
```

---

## 10. MVP Scope

### Phase 1 (Initial Release)

| Templates | Category | Priority |
|-----------|----------|----------|
| Emploi du temps 7AF-NS4 | schedule | P0 |
| Planificateur d'études hebdomadaire | planner | P0 |
| Fiche de budget étudiant | budget | P0 |
| Liste de tâches quotidienne | planner | P1 |
| Certificat de réussite | certificate | P1 |

### Features

- [x] Template directory with search
- [x] Category pages
- [x] In-browser editor with live preview
- [x] LocalStorage persistence
- [x] PDF export with branding
- [x] PNG export with branding
- [x] Mobile-responsive editor
- [x] SEO meta tags + sitemap
- [ ] Share links (Phase 2)
- [ ] Multi-language toggle (Phase 2)
- [ ] Template analytics dashboard (Phase 2)

---

## 11. Implementation Checklist

### Database & Backend

- [ ] Create `templates` table migration
- [ ] Create `template_categories` table migration
- [ ] Create `template-assets` storage bucket
- [ ] Configure RLS policies
- [ ] Create `export-template` edge function
- [ ] Add rate limit config for exports
- [ ] Add `increment_template_downloads` RPC function

### Frontend

- [ ] Create `/templates` route and page components
- [ ] Build `TemplateCard` component
- [ ] Build `TemplateCanvas` renderer
- [ ] Build `EditorSidebar` with field inputs
- [ ] Build `StickyActionBar` for actions
- [ ] Implement `useTemplates` hook
- [ ] Implement `useTemplateEditor` hook
- [ ] Implement `useTemplateExport` hook
- [ ] Add localStorage persistence
- [ ] Add SEO meta tags with Helmet
- [ ] Update sitemap.xml

### Content

- [ ] Design 5 initial template schemas
- [ ] Create thumbnails (WebP, 400x300)
- [ ] Create OG images (1200x630)
- [ ] Write SEO descriptions (150-300 chars)
- [ ] Write "How to Use" content blocks

### Testing

- [ ] Test on 3G throttled connection
- [ ] Test export on mobile Safari
- [ ] Verify branding cannot be removed
- [ ] Test rate limiting
- [ ] Verify localStorage works in incognito

---

## 12. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Export Location | Server-side (Edge Function) | Branding enforcement, consistent output |
| State Persistence | localStorage | No auth required, survives page refresh |
| Renderer | HTML Canvas | Consistent export, mobile-friendly |
| Image Format | WebP with JPEG fallback | Best compression for 3G |
| Rate Limiting | IP-based (stricter) | Prevent abuse without auth |
| SEO | Per-page Helmet + JSON-LD | Maximize indexability |

