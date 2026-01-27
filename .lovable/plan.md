

# Next Steps: Template Export Function & Initial Templates

## Overview

The templates feature foundation is complete (database, frontend, hooks). Now we need to:
1. Create the server-side export edge function
2. Seed initial templates into the database

---

## 1. Create Export Edge Function

### File: `supabase/functions/export-template/index.ts`

A server-side function that renders templates to PDF/PNG with mandatory branding.

**Key Features:**
- IP-based rate limiting (5 anon / 20 auth exports per minute)
- Schema validation with Zod
- PDF generation with jsPDF
- PNG generation using canvas rendering
- Mandatory Edupreneurs branding footer
- Download counter increment

```typescript
// Core structure:
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Rate limit: stricter for anonymous users
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000,
  maxRequests: 20,
  maxAnonRequests: 5,
  keyPrefix: 'template_export'
};

// Validation schema
const exportRequestSchema = z.object({
  templateId: z.string().uuid(),
  values: z.record(z.unknown()),
  format: z.enum(['pdf', 'png']).default('pdf'),
});

serve(async (req) => {
  // CORS handling
  // Rate limiting
  // Auth check (optional - works for anon too)
  // Validate input
  // Fetch template from DB
  // Generate PDF/PNG with branding
  // Increment download counter
  // Return file
});
```

### PDF Rendering Strategy

Using Deno-compatible jsPDF for server-side rendering:

```typescript
// Import jsPDF for Deno
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";

function generatePDF(template, values) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [template.schema.dimensions.width, template.schema.dimensions.height]
  });
  
  // Set background
  pdf.setFillColor(template.schema.background);
  pdf.rect(0, 0, width, height, 'F');
  
  // Render elements
  for (const element of template.schema.elements) {
    renderElement(pdf, element, values[element.id]);
  }
  
  // MANDATORY: Apply branding (cannot skip)
  applyBranding(pdf, template.schema.branding);
  
  return pdf.output('arraybuffer');
}

function applyBranding(pdf, branding) {
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  
  // Footer text - always added
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(branding.footerText || 'Créé avec Edupreneurs', width / 2, height - 10, { 
    align: 'center' 
  });
}
```

### PNG Rendering Strategy

For PNG export, we'll use a canvas-based approach with deno-canvas:

```typescript
// For MVP, PNG will convert the PDF to image
// Future: direct canvas rendering for better quality
async function generatePNG(template, values) {
  // Generate PDF first
  const pdfData = generatePDF(template, values);
  
  // Convert PDF to PNG (using pdf.js or similar)
  // For MVP, we can use a simpler approach with canvas
  
  return pngBuffer;
}
```

---

## 2. Update Config.toml

Add the edge function configuration:

```toml
[functions.export-template]
verify_jwt = false
```

---

## 3. Seed Initial Templates

Add 3 initial templates to get the feature working:

### Template 1: Emploi du Temps (Schedule)

```sql
INSERT INTO templates (
  slug, title, title_ht, description, category, tags, language,
  schema, seo_title, seo_description, is_featured, is_published
) VALUES (
  'emploi-du-temps-primaire',
  'Emploi du Temps - Primaire',
  'Orè - Primer',
  'Organisez votre semaine scolaire avec ce template d''emploi du temps pour le primaire.',
  'schedule',
  ARRAY['emploi du temps', 'primaire', 'école', '7AF', '8AF', '9AF'],
  'fr',
  -- Full schema JSON with table, text fields, etc.
  'Emploi du Temps Primaire Gratuit | Template PDF',
  'Téléchargez un emploi du temps gratuit pour l''école primaire. Personnalisable et exportable en PDF.',
  true,
  true
);
```

### Template 2: Planificateur d'Études

```sql
INSERT INTO templates (
  slug, title, description, category, tags, language,
  schema, is_featured, is_published
) VALUES (
  'planificateur-etudes-hebdomadaire',
  'Planificateur d''Études Hebdomadaire',
  'Organisez vos sessions d''étude pour la semaine avec objectifs et sujets.',
  'planner',
  ARRAY['planificateur', 'études', 'hebdomadaire', 'organisation'],
  'fr',
  -- Schema JSON
  true,
  true
);
```

### Template 3: Fiche Budget Étudiant

```sql
INSERT INTO templates (
  slug, title, description, category, tags, language,
  schema, is_featured, is_published
) VALUES (
  'budget-etudiant-mensuel',
  'Budget Étudiant Mensuel',
  'Gérez vos finances étudiantes avec cette fiche de budget mensuel.',
  'budget',
  ARRAY['budget', 'finances', 'étudiant', 'mensuel'],
  'fr',
  -- Schema JSON
  true,
  true
);
```

---

## 4. Template Schema Examples

### Schedule Template Schema

```json
{
  "version": 1,
  "dimensions": { "width": 595, "height": 842, "unit": "pt" },
  "background": "#ffffff",
  "elements": [
    {
      "id": "title",
      "type": "text",
      "label": "Titre",
      "defaultValue": "Mon Emploi du Temps",
      "position": { "x": 297, "y": 35 },
      "style": { "fontSize": 22, "fontWeight": "bold", "textAlign": "center", "color": "#1e3a5f" }
    },
    {
      "id": "school_name",
      "type": "text",
      "label": "Nom de l'école",
      "defaultValue": "",
      "placeholder": "Ex: Collège Saint-Louis",
      "position": { "x": 297, "y": 60 },
      "style": { "fontSize": 12, "textAlign": "center", "color": "#666666" }
    },
    {
      "id": "student_name",
      "type": "text",
      "label": "Nom de l'élève",
      "defaultValue": "",
      "placeholder": "Votre nom",
      "position": { "x": 297, "y": 80 },
      "style": { "fontSize": 12, "textAlign": "center" }
    },
    {
      "id": "schedule_table",
      "type": "table",
      "label": "Horaire",
      "rows": 9,
      "columns": 6,
      "headers": ["Heure", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      "defaultData": [
        ["7:00 - 8:00", "", "", "", "", ""],
        ["8:00 - 9:00", "", "", "", "", ""],
        ["9:00 - 10:00", "", "", "", "", ""],
        ["10:00 - 10:30", "Récréation", "Récréation", "Récréation", "Récréation", "Récréation"],
        ["10:30 - 11:30", "", "", "", "", ""],
        ["11:30 - 12:30", "", "", "", "", ""],
        ["12:30 - 13:30", "Déjeuner", "Déjeuner", "Déjeuner", "Déjeuner", "Déjeuner"],
        ["13:30 - 14:30", "", "", "", "", ""],
        ["14:30 - 15:30", "", "", "", "", ""]
      ],
      "position": { "x": 40, "y": 110 },
      "style": { "cellPadding": 6, "borderColor": "#e0e0e0", "fontSize": 9 }
    },
    {
      "id": "year",
      "type": "text",
      "label": "Année scolaire",
      "defaultValue": "2025-2026",
      "position": { "x": 520, "y": 35 },
      "style": { "fontSize": 10, "textAlign": "right", "color": "#666666" }
    }
  ],
  "branding": {
    "logoPosition": "bottom-right",
    "watermark": false,
    "footerText": "Créé avec Edupreneurs | edupreneurs.app"
  }
}
```

---

## 5. Implementation Order

| Step | Task | Priority |
|------|------|----------|
| 1 | Create `export-template` edge function | P0 |
| 2 | Add config.toml entry | P0 |
| 3 | Deploy and test edge function | P0 |
| 4 | Insert 3 seed templates via migration | P0 |
| 5 | Test end-to-end: view, edit, export | P0 |

---

## 6. Security Considerations

| Concern | Mitigation |
|---------|------------|
| Rate limiting | IP-based, 5/min anon, 20/min auth |
| Input validation | Zod schema for all fields |
| XSS in values | Sanitize text before rendering |
| Branding bypass | Branding applied server-side, cannot be removed |
| Large payloads | Max 500 chars per text field, max 50 table rows |

---

## 7. Testing Checklist

- [ ] Edge function deploys without errors
- [ ] PDF export works with sample template
- [ ] PNG export works with sample template
- [ ] Rate limiting blocks after 5 anon requests
- [ ] Branding appears on all exports
- [ ] Template editor loads and previews correctly
- [ ] LocalStorage persistence works across page refresh
- [ ] Download counter increments on export

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/export-template/index.ts` | Create |
| `supabase/config.toml` | Add function entry |
| `supabase/migrations/XXXX_seed_templates.sql` | Create (seed data) |

