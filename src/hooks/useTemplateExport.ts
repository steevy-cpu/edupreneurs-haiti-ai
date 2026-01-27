/**
 * Template Export Hook
 * 
 * Handles exporting templates to PDF/PNG via the edge function.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ExportFormat, ExportRequest } from '@/types/templates';
import { toast } from 'sonner';

interface ExportState {
  isExporting: boolean;
  progress: number;
  error: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Template Export Hook
 * 
 * Provides export functionality with loading state and error handling.
 */
export function useTemplateExport() {
  const [state, setState] = useState<ExportState>({
    isExporting: false,
    progress: 0,
    error: null,
  });

  /**
   * Export template to PDF or PNG
   */
  const exportTemplate = useCallback(async (
    request: ExportRequest,
    filename: string
  ): Promise<boolean> => {
    setState({ isExporting: true, progress: 10, error: null });

    try {
      // Get current session for auth header (optional - works without auth too)
      const { data: { session } } = await supabase.auth.getSession();
      
      setState(prev => ({ ...prev, progress: 30 }));

      const response = await fetch(`${SUPABASE_URL}/functions/v1/export-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session ? `Bearer ${session.access_token}` : '',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify(request),
      });

      setState(prev => ({ ...prev, progress: 70 }));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error(errorData.message || 'Limite de téléchargements atteinte. Veuillez patienter.');
        }
        
        throw new Error(errorData.error || 'Échec de l\'export');
      }

      setState(prev => ({ ...prev, progress: 90 }));

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${request.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setState({ isExporting: false, progress: 100, error: null });
      toast.success(`Template téléchargé en ${request.format.toUpperCase()}`);
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'export';
      setState({ isExporting: false, progress: 0, error: message });
      toast.error(message);
      return false;
    }
  }, []);

  /**
   * Export as PDF
   */
  const exportPDF = useCallback(async (
    templateId: string,
    values: Record<string, unknown>,
    filename: string
  ): Promise<boolean> => {
    return exportTemplate(
      { templateId, values, format: 'pdf' },
      filename
    );
  }, [exportTemplate]);

  /**
   * Export as PNG
   */
  const exportPNG = useCallback(async (
    templateId: string,
    values: Record<string, unknown>,
    filename: string
  ): Promise<boolean> => {
    return exportTemplate(
      { templateId, values, format: 'png' },
      filename
    );
  }, [exportTemplate]);

  return {
    ...state,
    exportPDF,
    exportPNG,
  };
}
