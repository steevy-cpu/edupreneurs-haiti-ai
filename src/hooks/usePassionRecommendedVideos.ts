import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PassionRecommendedVideo {
  id: string;
  category_id: string;
  module_id: string;
  youtube_url: string;
  video_id: string;
  title: string | null;
  thumbnail: string | null;
  channel_title: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface BannedYouTubeVideo {
  id: string;
  video_id: string;
  reason: string | null;
  banned_at: string | null;
  banned_by: string;
}

// Fetch recommended videos for a specific module (used by students on PassionDiscovery)
export const usePassionModuleRecommendedVideos = (categoryId: string, moduleId: string) => {
  return useQuery({
    queryKey: ['passion-recommended-videos', categoryId, moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passion_recommended_videos')
        .select('*')
        .eq('category_id', categoryId)
        .eq('module_id', moduleId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as PassionRecommendedVideo[];
    },
    enabled: !!categoryId && !!moduleId
  });
};

// Fetch all recommended videos for content editor
export const useAllPassionRecommendedVideos = () => {
  return useQuery({
    queryKey: ['passion-recommended-videos-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passion_recommended_videos')
        .select('*')
        .order('category_id', { ascending: true })
        .order('module_id', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as PassionRecommendedVideo[];
    }
  });
};

// Save a recommended video
export const useSavePassionRecommendedVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      categoryId, 
      moduleId, 
      youtubeUrl,
      videoId,
      title,
      thumbnail,
      channelTitle
    }: { 
      categoryId: string;
      moduleId: string;
      youtubeUrl: string;
      videoId: string;
      title?: string;
      thumbnail?: string;
      channelTitle?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get current max display_order for this module
      const { data: existingVideos } = await supabase
        .from('passion_recommended_videos')
        .select('display_order')
        .eq('category_id', categoryId)
        .eq('module_id', moduleId)
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = existingVideos && existingVideos.length > 0 
        ? (existingVideos[0].display_order || 0) + 1 
        : 0;
      
      const { data, error } = await supabase
        .from('passion_recommended_videos')
        .upsert({
          category_id: categoryId,
          module_id: moduleId,
          youtube_url: youtubeUrl,
          video_id: videoId,
          title: title || null,
          thumbnail: thumbnail || null,
          channel_title: channelTitle || null,
          display_order: nextOrder,
          created_by: user?.id || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'category_id,module_id,video_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['passion-recommended-videos'] }),
        queryClient.invalidateQueries({ queryKey: ['passion-recommended-videos-all'] })
      ]);
      toast.success("Vidéo recommandée ajoutée avec succès");
    },
    onError: (error) => {
      console.error('Error saving recommended video:', error);
      toast.error("Erreur lors de l'ajout de la vidéo recommandée");
    }
  });
};

// Delete a recommended video
export const useDeletePassionRecommendedVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from('passion_recommended_videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['passion-recommended-videos'] }),
        queryClient.invalidateQueries({ queryKey: ['passion-recommended-videos-all'] })
      ]);
      toast.success("Vidéo recommandée supprimée");
    },
    onError: (error) => {
      console.error('Error deleting recommended video:', error);
      toast.error("Erreur lors de la suppression de la vidéo");
    }
  });
};

// Fetch all banned videos for content editor
export const useBannedYouTubeVideos = () => {
  return useQuery({
    queryKey: ['banned-youtube-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banned_youtube_videos')
        .select('*')
        .order('banned_at', { ascending: false });

      if (error) throw error;
      return data as BannedYouTubeVideo[];
    }
  });
};

// Unban a YouTube video (admin only via RLS)
export const useUnbanYouTubeVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from('banned_youtube_videos')
        .delete()
        .eq('video_id', videoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banned-youtube-videos'] });
      toast.success("Vidéo débannie avec succès");
    },
    onError: (error) => {
      console.error('Error unbanning video:', error);
      toast.error("Erreur lors du débannissement. Vérifiez vos permissions.");
    }
  });
};

// Fetch banned video IDs for filtering (used by PassionDiscovery)
export const useBannedVideoIds = () => {
  return useQuery({
    queryKey: ['banned-video-ids'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('banned_youtube_videos')
        .select('video_id');

      if (error) throw error;
      return new Set(data?.map(v => v.video_id) || []);
    }
  });
};
