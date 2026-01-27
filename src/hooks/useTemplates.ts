/**
 * Template Data Hooks
 * 
 * React Query hooks for fetching template data with caching optimized for 3G.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Template, TemplateCategory, TemplateListItem, TemplateSchema } from '@/types/templates';

// Type guard for TemplateSchema validation
function isValidTemplateSchema(schema: unknown): schema is TemplateSchema {
  if (!schema || typeof schema !== 'object') return false;
  const s = schema as Record<string, unknown>;
  return (
    typeof s.version === 'number' &&
    typeof s.dimensions === 'object' &&
    Array.isArray(s.elements) &&
    typeof s.branding === 'object'
  );
}

/**
 * Fetch all template categories
 */
export function useTemplateCategories() {
  return useQuery({
    queryKey: ['template-categories'],
    queryFn: async (): Promise<TemplateCategory[]> => {
      const { data, error } = await supabase
        .from('template_categories')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (categories rarely change)
    gcTime: 60 * 60 * 1000,    // 1 hour cache
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch published templates with optional category filter
 */
export function useTemplates(category?: string) {
  return useQuery({
    queryKey: ['templates', category ?? 'all'],
    queryFn: async (): Promise<TemplateListItem[]> => {
      let query = supabase
        .from('templates')
        .select('id, slug, title, description, category, thumbnail_url, download_count, is_featured')
        .eq('is_published', true)
        .order('download_count', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes cache
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch featured templates for homepage
 */
export function useFeaturedTemplates() {
  return useQuery({
    queryKey: ['templates', 'featured'],
    queryFn: async (): Promise<TemplateListItem[]> => {
      const { data, error } = await supabase
        .from('templates')
        .select('id, slug, title, description, category, thumbnail_url, download_count, is_featured')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('download_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch a single template by slug
 */
export function useTemplate(slug: string) {
  return useQuery({
    queryKey: ['template', slug],
    queryFn: async (): Promise<Template | null> => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Validate and transform the schema
        if (!isValidTemplateSchema(data.schema)) {
          console.error('Invalid template schema for:', slug);
          return null;
        }
        
        return {
          ...data,
          schema: data.schema as TemplateSchema,
        };
      }
      
      return null;
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 15 * 60 * 1000,   // 15 minutes cache
    refetchOnWindowFocus: false,
    enabled: !!slug,
  });
}

/**
 * Fetch templates count by category (for category cards)
 */
export function useTemplateCounts() {
  return useQuery({
    queryKey: ['template-counts'],
    queryFn: async (): Promise<Record<string, number>> => {
      const { data, error } = await supabase
        .from('templates')
        .select('category')
        .eq('is_published', true);

      if (error) throw error;

      const counts: Record<string, number> = {};
      (data || []).forEach((t) => {
        counts[t.category] = (counts[t.category] || 0) + 1;
      });

      return counts;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Search templates by query
 */
export function useTemplateSearch(query: string) {
  return useQuery({
    queryKey: ['templates', 'search', query],
    queryFn: async (): Promise<TemplateListItem[]> => {
      if (!query.trim()) return [];

      const { data, error } = await supabase
        .from('templates')
        .select('id, slug, title, description, category, thumbnail_url, download_count, is_featured')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('download_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for search
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: query.length >= 2,
  });
}
