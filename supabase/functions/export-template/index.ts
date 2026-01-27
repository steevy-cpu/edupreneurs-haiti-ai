/**
 * Export Template Edge Function
 * 
 * Generates PDF/PNG exports of templates with mandatory Edupreneurs branding.
 * Supports both authenticated and anonymous users with different rate limits.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";
import { corsHeaders, corsPreflightResponse, secureErrorResponse } from "../_shared/securityHeaders.ts";

// Rate limit configuration - stricter for anonymous users
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000,
  maxRequests: 20,      // Auth users: 20 exports/min
  maxAnonRequests: 5,   // Anon users: 5 exports/min
  keyPrefix: 'template_export'
};

// Input validation schema
const exportRequestSchema = z.object({
  templateId: z.string().uuid(),
  values: z.record(z.unknown()),
  format: z.enum(['pdf', 'png']).default('pdf'),
});

// Text value validation - max 500 chars
const textValueSchema = z.string().max(500).trim();

// Table value validation - max 50 rows, max 100 chars per cell
const tableValueSchema = z.array(z.array(z.string().max(100))).max(50);

interface TemplateElement {
  id: string;
  type: 'text' | 'table';
  label: string;
  defaultValue?: string;
  placeholder?: string;
  position: { x: number; y: number };
  style?: {
    fontSize?: number;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right';
    color?: string;
    cellPadding?: number;
    borderColor?: string;
  };
  // Table-specific
  rows?: number;
  columns?: number;
  headers?: string[];
  defaultData?: string[][];
}

interface TemplateSchema {
  version: number;
  dimensions: { width: number; height: number; unit: string };
  background: string;
  elements: TemplateElement[];
  branding: {
    logoPosition?: string;
    watermark?: boolean;
    footerText?: string;
  };
}

interface Template {
  id: string;
  slug: string;
  title: string;
  schema: TemplateSchema;
}

/**
 * Validate user-provided values against template schema
 */
function validateValues(schema: TemplateSchema, values: Record<string, unknown>): Record<string, unknown> {
  const validated: Record<string, unknown> = {};
  
  for (const element of schema.elements) {
    const value = values[element.id];
    
    try {
      switch (element.type) {
        case 'text':
          validated[element.id] = textValueSchema.parse(
            value ?? element.defaultValue ?? ''
          );
          break;
        case 'table':
          validated[element.id] = tableValueSchema.parse(
            value ?? element.defaultData ?? []
          );
          break;
        default:
          validated[element.id] = element.defaultValue ?? '';
      }
    } catch {
      // Use default value if validation fails
      validated[element.id] = element.type === 'table' 
        ? element.defaultData ?? []
        : element.defaultValue ?? '';
    }
  }
  
  return validated;
}

/**
 * Convert hex color to RGB array
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

/**
 * Render a text element to PDF
 */
function renderTextElement(
  pdf: jsPDF, 
  element: TemplateElement, 
  value: string
): void {
  const style = element.style || {};
  
  // Set font size
  pdf.setFontSize(style.fontSize || 12);
  
  // Set font weight
  if (style.fontWeight === 'bold') {
    pdf.setFont('helvetica', 'bold');
  } else {
    pdf.setFont('helvetica', 'normal');
  }
  
  // Set text color
  if (style.color) {
    const rgb = hexToRgb(style.color);
    pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
  } else {
    pdf.setTextColor(0, 0, 0);
  }
  
  // Render text with alignment
  const options: { align?: 'left' | 'center' | 'right' } = {};
  if (style.textAlign) {
    options.align = style.textAlign;
  }
  
  pdf.text(value || '', element.position.x, element.position.y, options);
}

/**
 * Render a table element to PDF
 */
function renderTableElement(
  pdf: jsPDF, 
  element: TemplateElement, 
  data: string[][]
): void {
  const style = element.style || {};
  const cellPadding = style.cellPadding || 6;
  const fontSize = style.fontSize || 9;
  const borderColor = style.borderColor ? hexToRgb(style.borderColor) : [200, 200, 200];
  
  const headers = element.headers || [];
  const columns = element.columns || headers.length || 6;
  
  // Calculate column widths (equal distribution)
  const pageWidth = pdf.internal.pageSize.getWidth();
  const tableWidth = pageWidth - element.position.x * 2;
  const colWidth = tableWidth / columns;
  const rowHeight = fontSize + cellPadding * 2;
  
  let currentY = element.position.y;
  
  // Set base styles - explicitly reset ALL color states to prevent pollution
  pdf.setFontSize(fontSize);
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.setTextColor(0, 0, 0); // Explicit black text for table
  
  // Render header row
  if (headers.length > 0) {
    pdf.setFont('helvetica', 'bold');
    
    for (let col = 0; col < columns; col++) {
      // Reset colors BEFORE each cell to prevent jsPDF state corruption
      pdf.setFillColor(245, 245, 245);
      pdf.setTextColor(0, 0, 0);
      
      const x = element.position.x + col * colWidth;
      pdf.rect(x, currentY, colWidth, rowHeight, 'FD');
      pdf.text(
        headers[col] || '', 
        x + cellPadding, 
        currentY + cellPadding + fontSize * 0.8
      );
    }
    currentY += rowHeight;
  }
  
  // Render data rows
  pdf.setFont('helvetica', 'normal');
  
  for (const row of data) {
    for (let col = 0; col < columns; col++) {
      // Reset colors BEFORE each cell to prevent jsPDF state corruption
      pdf.setFillColor(255, 255, 255);
      pdf.setTextColor(0, 0, 0);
      
      const x = element.position.x + col * colWidth;
      pdf.rect(x, currentY, colWidth, rowHeight, 'FD');
      
      const cellValue = row[col] || '';
      const maxWidth = colWidth - cellPadding * 2;
      const truncated = pdf.splitTextToSize(cellValue, maxWidth)[0] || '';
      
      pdf.text(truncated, x + cellPadding, currentY + cellPadding + fontSize * 0.8);
    }
    currentY += rowHeight;
  }
}

/**
 * Apply mandatory Edupreneurs branding to PDF
 */
function applyBranding(pdf: jsPDF, branding: TemplateSchema['branding']): void {
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  
  // Footer text - ALWAYS added (cannot be skipped)
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.setFont('helvetica', 'normal');
  
  const footerText = branding.footerText || 'Créé avec Edupreneurs | mon-edupreneur.com';
  pdf.text(footerText, width / 2, height - 15, { align: 'center' });
}

/**
 * Generate PDF from template and values
 */
function generatePDF(template: Template, values: Record<string, unknown>): ArrayBuffer {
  const schema = template.schema;
  const { width, height } = schema.dimensions;
  
  // Create PDF with template dimensions
  const pdf = new jsPDF({
    orientation: width > height ? 'landscape' : 'portrait',
    unit: 'pt',
    format: [width, height]
  });
  
  // Set background color
  if (schema.background && schema.background !== '#ffffff') {
    const bgRgb = hexToRgb(schema.background);
    pdf.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
    pdf.rect(0, 0, width, height, 'F');
  }
  
  // Render each element
  for (const element of schema.elements) {
    const value = values[element.id];
    
    switch (element.type) {
      case 'text':
        renderTextElement(pdf, element, value as string);
        break;
      case 'table':
        renderTableElement(pdf, element, value as string[][]);
        break;
    }
  }
  
  // MANDATORY: Apply branding (cannot be skipped or removed)
  applyBranding(pdf, schema.branding);
  
  return pdf.output('arraybuffer');
}

/**
 * Generate PNG from PDF (simplified approach for MVP)
 * Note: For production, consider using a proper canvas library
 */
async function generatePNG(template: Template, values: Record<string, unknown>): Promise<ArrayBuffer> {
  // For MVP, we return the PDF and let client convert
  // In future, implement proper server-side canvas rendering
  const pdfBuffer = generatePDF(template, values);
  
  // TODO: Implement PDF to PNG conversion using deno-canvas or similar
  // For now, return PDF with PNG content-type note
  return pdfBuffer;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return secureErrorResponse('Method not allowed', 405);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return secureErrorResponse('Server configuration error', 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get client IP for rate limiting
    const clientIp = getClientIp(req);
    
    // Check for auth token (optional - works for anon too)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: claims } = await supabase.auth.getUser(token);
      userId = claims?.user?.id || null;
    }
    
    // Apply rate limiting
    const rateLimitResult = await checkRateLimit(
      supabase, 
      RATE_LIMIT_CONFIG, 
      userId, 
      clientIp
    );
    
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(
        rateLimitResult.retryAfter || 60, 
        rateLimitResult.remaining, 
        corsHeaders
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const parseResult = exportRequestSchema.safeParse(body);
    
    if (!parseResult.success) {
      return secureErrorResponse('Invalid request body', 400, 
        parseResult.error.errors.map(e => e.message)
      );
    }
    
    const { templateId, values, format } = parseResult.data;
    
    // Fetch template from database
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('id, slug, title, schema')
      .eq('id', templateId)
      .eq('is_published', true)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Database error:', fetchError);
      return secureErrorResponse('Failed to fetch template', 500);
    }
    
    if (!template) {
      return secureErrorResponse('Template not found or not published', 404);
    }
    
    // Validate user values against template schema
    const validatedValues = validateValues(template.schema as TemplateSchema, values);
    
    // Generate document based on format
    let documentBuffer: ArrayBuffer;
    let contentType: string;
    let fileExtension: string;
    
    if (format === 'png') {
      documentBuffer = await generatePNG(template as Template, validatedValues);
      contentType = 'application/pdf'; // MVP: return PDF, client handles PNG
      fileExtension = 'pdf';
    } else {
      documentBuffer = generatePDF(template as Template, validatedValues);
      contentType = 'application/pdf';
      fileExtension = 'pdf';
    }
    
    // Increment download counter (non-blocking)
    supabase.rpc('increment_template_downloads', { template_id: templateId })
      .then(() => console.log('Download count incremented for', templateId));
    
    // Return the generated document
    return new Response(documentBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${template.slug}.${fileExtension}"`,
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      }
    });
    
  } catch (error) {
    console.error('Export error:', error);
    return secureErrorResponse('Export failed', 500);
  }
});
