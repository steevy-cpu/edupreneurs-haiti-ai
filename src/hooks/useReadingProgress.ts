import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useRef, useEffect } from "react";
import { useSessionAuth } from "@/contexts/SessionAuthContext";

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
  const { user } = useSessionAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['reading-progress', ebookId],
    queryFn: async () => {
      if (!ebookId || !userId) return null;

      const { data, error } = await supabase
        .from('ebook_reading_progress')
        .select('*')
        .eq('ebook_id', ebookId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data as ReadingProgress | null;
    },
    enabled: !!ebookId && !!userId,
  });
}

// Fetch all reading progress for current user
export function useAllReadingProgress() {
  const { user } = useSessionAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['all-reading-progress', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('ebook_reading_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as ReadingProgress[];
    },
    enabled: !!userId,
  });
}

// Hook for auto-saving reading progress with debounce
export function useAutoSaveProgress(ebookId: string | undefined, totalPages: number | null) {
  const { user } = useSessionAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedPageRef = useRef<number | null>(null);

  const saveMutation = useMutation({
    mutationFn: async ({ currentPage, isCompleted }: { currentPage: number; isCompleted: boolean }) => {
      if (!userId || !ebookId) throw new Error('Not authenticated or no ebook');

      const { data, error } = await supabase
        .from('ebook_reading_progress')
        .upsert({
          ebook_id: ebookId,
          user_id: userId,
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
      queryClient.invalidateQueries({ queryKey: ['all-reading-progress', userId] });
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
