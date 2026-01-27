/**
 * Template Export Hook
 * 
 * Handles exporting templates to PDF via edge function and PNG via client-side html2canvas.
 */

import { useState, useCallback, RefObject } from 'react';
import { supabase } from '@/integrations/supabase/client';
import html2canvas from 'html2canvas';
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
   * Export template to PDF via server
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
   * Export as PDF (server-side)
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
   * Export as PNG (client-side using html2canvas)
   * Captures the exact preview the user sees
   */
  const exportPNGClient = useCallback(async (
    canvasRef: RefObject<HTMLDivElement>,
    filename: string
  ): Promise<boolean> => {
    if (!canvasRef.current) {
      toast.error('Aperçu non disponible');
      return false;
    }

    setState({ isExporting: true, progress: 20, error: null });

    try {
      setState(prev => ({ ...prev, progress: 50 }));

      // Capture the canvas element with html2canvas
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });

      setState(prev => ({ ...prev, progress: 80 }));

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          setState({ isExporting: false, progress: 0, error: 'Échec de la génération PNG' });
          toast.error('Échec de la génération PNG');
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setState({ isExporting: false, progress: 100, error: null });
        toast.success('Template téléchargé en PNG');
      }, 'image/png', 1.0);

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur lors de l\'export PNG';
      setState({ isExporting: false, progress: 0, error: message });
      toast.error(message);
      return false;
    }
  }, []);

  return {
    ...state,
    exportPDF,
    exportPNGClient,
  };
}
