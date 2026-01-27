/**
 * Template System Types
 * 
 * Defines the schema and data structures for the public templates feature.
 */

// Template element types
export type TemplateElementType = 'text' | 'table' | 'image' | 'checkbox' | 'date';

// Text alignment options
export type TextAlign = 'left' | 'center' | 'right';

// Element style definition
export interface ElementStyle {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: TextAlign;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  cellPadding?: number;
}

// Position definition
export interface Position {
  x: number;
  y: number;
}

// Base element interface
interface BaseElement {
  id: string;
  type: TemplateElementType;
  label: string;
  position: Position;
  style?: ElementStyle;
}

// Text element
export interface TextElement extends BaseElement {
  type: 'text';
  defaultValue: string;
  placeholder?: string;
  maxLength?: number;
}

// Table element
export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  columns: number;
  headers: string[];
  defaultData: string[][];
}

// Image element (for logos, etc.)
export interface ImageElement extends BaseElement {
  type: 'image';
  defaultUrl?: string;
  width: number;
  height: number;
}

// Checkbox element
export interface CheckboxElement extends BaseElement {
  type: 'checkbox';
  defaultChecked: boolean;
  checkboxLabel: string;
}

// Date element
export interface DateElement extends BaseElement {
  type: 'date';
  defaultValue?: string;
  format: string;
}

// Union type for all elements
export type TemplateElement = TextElement | TableElement | ImageElement | CheckboxElement | DateElement;

// Branding configuration
export interface BrandingConfig {
  logoPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  watermark: boolean;
  footerText: string;
}

// Template schema (stored in JSONB)
export interface TemplateSchema {
  version: number;
  dimensions: {
    width: number;
    height: number;
    unit: 'pt' | 'px' | 'mm';
  };
  background: string;
  elements: TemplateElement[];
  branding: BrandingConfig;
}

// Template category (from database)
export interface TemplateCategory {
  id: string;
  name: string;
  name_ht: string | null;
  description: string | null;
  icon: string;
  order_index: number;
  created_at: string;
}

// Template (from database)
export interface Template {
  id: string;
  slug: string;
  title: string;
  title_ht: string | null;
  description: string;
  category: string;
  tags: string[];
  language: string;
  thumbnail_url: string | null;
  schema: TemplateSchema;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

// Template list item (lighter for directory pages)
export interface TemplateListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  download_count: number;
  is_featured: boolean;
}

// Editor state
export interface EditorState {
  templateId: string;
  values: Record<string, unknown>;
  isDirty: boolean;
  selectedElementId: string | null;
}

// Export format
export type ExportFormat = 'pdf' | 'png';

// Export request payload
export interface ExportRequest {
  templateId: string;
  values: Record<string, unknown>;
  format: ExportFormat;
}
