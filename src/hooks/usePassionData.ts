import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ModuleProgress {
  category_id: string;
  module_id: string;
  completed: boolean;
  progress_percentage: number;
  activity_states?: Record<string, boolean>;
}

interface PassionPreferences {
  music_score: number;
  arts_score: number;
  chess_score: number;
  literature_score: number;
  quiz_completed: boolean;
}

export const usePassionPreferences = (userId: string | null) => {
  return useQuery({
    queryKey: ['passion-preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_passion_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const usePassionProgress = (userId: string | null) => {
  const queryClient = useQueryClient();

  const progressQuery = useQuery({
    queryKey: ['passion-progress', userId],
    queryFn: async () => {
      if (!userId) return {};
      
      const { data, error } = await supabase
        .from('passion_module_progress')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const progressMap: Record<string, ModuleProgress> = {};
      data?.forEach(item => {
        const key = `${item.category_id}-${item.module_id}`;
        progressMap[key] = {
          category_id: item.category_id,
          module_id: item.module_id,
          completed: item.completed ?? false,
          progress_percentage: item.progress_percentage ?? 0,
        };
      });
      
      return progressMap;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({
      categoryId,
      moduleId,
      progressPercentage,
      completed = false,
    }: {
      categoryId: string;
      moduleId: string;
      progressPercentage: number;
      completed?: boolean;
    }) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('passion_module_progress')
        .upsert({
          user_id: userId,
          category_id: categoryId,
          module_id: moduleId,
          progress_percentage: progressPercentage,
          completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        }, { onConflict: 'user_id,category_id,module_id' });
      
      if (error) throw error;
      
      return { categoryId, moduleId, progressPercentage, completed };
    },
    onMutate: async ({ categoryId, moduleId, progressPercentage, completed }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['passion-progress', userId] });
      
      // Snapshot the previous value
      const previousProgress = queryClient.getQueryData<Record<string, ModuleProgress>>(
        ['passion-progress', userId]
      );
      
      // Optimistically update
      const key = `${categoryId}-${moduleId}`;
      queryClient.setQueryData<Record<string, ModuleProgress>>(
        ['passion-progress', userId],
        (old) => ({
          ...old,
          [key]: {
            category_id: categoryId,
            module_id: moduleId,
            completed: completed ?? false,
            progress_percentage: progressPercentage,
          },
        })
      );
      
      return { previousProgress };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(
          ['passion-progress', userId],
          context.previousProgress
        );
      }
      toast.error("Erreur lors de la sauvegarde de ta progression");
    },
    onSuccess: (data) => {
      if (data.completed) {
        toast.success("🎉 Module terminé! Continue comme ça!");
      }
    },
  });

  const getModuleProgress = (categoryId: string, moduleId: string): ModuleProgress => {
    const key = `${categoryId}-${moduleId}`;
    return progressQuery.data?.[key] || {
      category_id: categoryId,
      module_id: moduleId,
      completed: false,
      progress_percentage: 0,
    };
  };

  const getCategoryProgress = (categoryId: string, moduleCount: number) => {
    const progress = progressQuery.data || {};
    const moduleKeys = Object.keys(progress).filter(
      (key) => progress[key].category_id === categoryId
    );
    
    const completedModules = moduleKeys.filter(
      (key) => progress[key].completed
    ).length;

    return {
      completed: completedModules,
      total: moduleCount,
      percentage: moduleCount > 0 ? (completedModules / moduleCount) * 100 : 0,
    };
  };

  return {
    progress: progressQuery.data || {},
    isLoading: progressQuery.isLoading,
    updateProgress: updateProgressMutation.mutate,
    getModuleProgress,
    getCategoryProgress,
    refetch: progressQuery.refetch,
  };
};

export const useSaveQuizResults = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      userId,
      scores,
    }: {
      userId: string;
      scores: { music: number; arts: number; chess: number; literature: number };
    }) => {
      const { error } = await supabase
        .from('user_passion_preferences')
        .upsert({
          user_id: userId,
          music_score: scores.music,
          arts_score: scores.arts,
          chess_score: scores.chess,
          literature_score: scores.literature,
          quiz_completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['passion-preferences', variables.userId] });
      toast.success("Tes préférences ont été sauvegardées!");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
    },
  });
};

export const useResetQuiz = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_passion_preferences')
        .delete()
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['passion-preferences', userId] });
      toast.success("Quiz réinitialisé! Tu peux recommencer.");
    },
    onError: () => {
      toast.error("Erreur lors de la réinitialisation");
    },
  });
};
