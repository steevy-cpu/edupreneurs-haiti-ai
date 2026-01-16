import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useRef, useEffect } from "react";

export interface ReadingProgress {
  id: string;
  ebook_id: string;
  user_id: string;
  current_page: number;
  is_completed: boolean;
  last_read_at: string;
}

// Fetch reading progress for a specific ebook
export function useReadingProgress(ebookId: string | undefined) {
  return useQuery({
    queryKey: ['reading-progress', ebookId],
    queryFn: async () => {
      if (!ebookId) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('ebook_reading_progress')
        .select('*')
        .eq('ebook_id', ebookId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as ReadingProgress | null;
    },
    enabled: !!ebookId,
  });
}

// Fetch all reading progress for current user
export function useAllReadingProgress() {
  return useQuery({
    queryKey: ['all-reading-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ebook_reading_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as ReadingProgress[];
    },
  });
}

// Hook for auto-saving reading progress with debounce
export function useAutoSaveProgress(ebookId: string | undefined, totalPages: number | null) {
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPageRef = useRef<number | null>(null);

  const saveMutation = useMutation({
    mutationFn: async ({ currentPage, isCompleted }: { currentPage: number; isCompleted: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !ebookId) throw new Error('Not authenticated or no ebook');

      const { data, error } = await supabase
        .from('ebook_reading_progress')
        .upsert({
          ebook_id: ebookId,
          user_id: user.id,
          current_page: currentPage,
          is_completed: isCompleted,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'ebook_id,user_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-progress', ebookId] });
      queryClient.invalidateQueries({ queryKey: ['all-reading-progress'] });
    },
  });

  const saveProgress = useCallback((currentPage: number) => {
    // Don't save if same page
    if (lastSavedPageRef.current === currentPage) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 5 seconds
    saveTimeoutRef.current = setTimeout(() => {
      const isCompleted = totalPages ? currentPage >= totalPages : false;
      saveMutation.mutate({ currentPage, isCompleted });
      lastSavedPageRef.current = currentPage;
    }, 5000);
  }, [ebookId, totalPages, saveMutation]);

  // Immediate save (for when user leaves the page)
  const saveProgressNow = useCallback((currentPage: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    if (lastSavedPageRef.current !== currentPage) {
      const isCompleted = totalPages ? currentPage >= totalPages : false;
      saveMutation.mutate({ currentPage, isCompleted });
      lastSavedPageRef.current = currentPage;
    }
  }, [ebookId, totalPages, saveMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveProgress,
    saveProgressNow,
    isSaving: saveMutation.isPending,
  };
}
