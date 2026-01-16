import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PassionVideo {
  id: string;
  category_id: string;
  module_id: string;
  activity_id: string;
  youtube_url: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

// Fetch all videos for a specific module
export const usePassionModuleVideos = (categoryId: string, moduleId: string) => {
  return useQuery({
    queryKey: ['passion-videos', categoryId, moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passion_activity_videos')
        .select('*')
        .eq('category_id', categoryId)
        .eq('module_id', moduleId);

      if (error) throw error;
      return data as PassionVideo[];
    },
    enabled: !!categoryId && !!moduleId
  });
};

// Fetch all videos for content editor
export const useAllPassionVideos = () => {
  return useQuery({
    queryKey: ['passion-videos-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passion_activity_videos')
        .select('*')
        .order('category_id', { ascending: true })
        .order('module_id', { ascending: true });

      if (error) throw error;
      return data as PassionVideo[];
    }
  });
};

// Save or update a video
export const useSavePassionVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      categoryId, 
      moduleId, 
      activityId, 
      youtubeUrl, 
      title 
    }: { 
      categoryId: string;
      moduleId: string;
      activityId: string;
      youtubeUrl: string;
      title?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('passion_activity_videos')
        .upsert({
          category_id: categoryId,
          module_id: moduleId,
          activity_id: activityId,
          youtube_url: youtubeUrl,
          title: title || null,
          updated_by: user?.id || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'category_id,module_id,activity_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passion-videos'] });
      queryClient.invalidateQueries({ queryKey: ['passion-videos-all'] });
      toast.success("Vidéo enregistrée avec succès");
    },
    onError: (error) => {
      console.error('Error saving passion video:', error);
      toast.error("Erreur lors de l'enregistrement de la vidéo");
    }
  });
};

// Delete a video
export const useDeletePassionVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      categoryId, 
      moduleId, 
      activityId 
    }: { 
      categoryId: string;
      moduleId: string;
      activityId: string;
    }) => {
      const { error } = await supabase
        .from('passion_activity_videos')
        .delete()
        .eq('category_id', categoryId)
        .eq('module_id', moduleId)
        .eq('activity_id', activityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passion-videos'] });
      queryClient.invalidateQueries({ queryKey: ['passion-videos-all'] });
      toast.success("Vidéo supprimée avec succès");
    },
    onError: (error) => {
      console.error('Error deleting passion video:', error);
      toast.error("Erreur lors de la suppression de la vidéo");
    }
  });
};

// Get a single video for an activity
export const usePassionActivityVideo = (categoryId: string, moduleId: string, activityId: string) => {
  return useQuery({
    queryKey: ['passion-video', categoryId, moduleId, activityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passion_activity_videos')
        .select('*')
        .eq('category_id', categoryId)
        .eq('module_id', moduleId)
        .eq('activity_id', activityId)
        .maybeSingle();

      if (error) throw error;
      return data as PassionVideo | null;
    },
    enabled: !!categoryId && !!moduleId && !!activityId
  });
};
