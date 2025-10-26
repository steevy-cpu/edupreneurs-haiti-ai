import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ModuleProgress {
  category_id: string;
  module_id: string;
  completed: boolean;
  progress_percentage: number;
}

export const usePassionProgress = (userId: string | null) => {
  const [progress, setProgress] = useState<Record<string, ModuleProgress>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    if (!userId) return;

    try {
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
          completed: item.completed,
          progress_percentage: item.progress_percentage
        };
      });

      setProgress(progressMap);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (
    categoryId: string,
    moduleId: string,
    progressPercentage: number,
    completed: boolean = false
  ) => {
    if (!userId) {
      toast.error("Tu dois être connecté pour sauvegarder ta progression");
      return;
    }

    try {
      const { error } = await supabase
        .from('passion_module_progress')
        .upsert({
          user_id: userId,
          category_id: categoryId,
          module_id: moduleId,
          progress_percentage: progressPercentage,
          completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        });

      if (error) throw error;

      // Update local state
      const key = `${categoryId}-${moduleId}`;
      setProgress(prev => ({
        ...prev,
        [key]: {
          category_id: categoryId,
          module_id: moduleId,
          completed,
          progress_percentage: progressPercentage
        }
      }));

      if (completed) {
        toast.success("🎉 Module terminé! Continue comme ça!");
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Erreur lors de la sauvegarde de ta progression");
    }
  };

  const getModuleProgress = (categoryId: string, moduleId: string) => {
    const key = `${categoryId}-${moduleId}`;
    return progress[key] || {
      category_id: categoryId,
      module_id: moduleId,
      completed: false,
      progress_percentage: 0
    };
  };

  const getCategoryProgress = (categoryId: string, moduleCount: number) => {
    const moduleKeys = Object.keys(progress).filter(key => 
      progress[key].category_id === categoryId
    );
    
    const completedModules = moduleKeys.filter(key => 
      progress[key].completed
    ).length;

    return {
      completed: completedModules,
      total: moduleCount,
      percentage: moduleCount > 0 ? (completedModules / moduleCount) * 100 : 0
    };
  };

  return {
    progress,
    isLoading,
    updateProgress,
    getModuleProgress,
    getCategoryProgress,
    reloadProgress: loadProgress
  };
};