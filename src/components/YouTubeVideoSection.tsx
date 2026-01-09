import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Video, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

interface LessonVideo {
  id: string;
  youtube_url: string;
  video_id: string;
  title: string | null;
  description: string | null;
  order_index: number;
  is_primary: boolean;
}

interface YouTubeVideoSectionProps {
  lessonId?: string;
  lessonTitle: string;
  objectives: string;
  gradeLevel?: string;
  subject?: string;
  // Legacy prop for backward compatibility
  customYoutubeUrl?: string;
}

export const YouTubeVideoSection = ({ 
  lessonId, 
  lessonTitle, 
  objectives, 
  gradeLevel = "AF7", 
  customYoutubeUrl, 
  subject = "mathematiques" 
}: YouTubeVideoSectionProps) => {
  const [searchVideos, setSearchVideos] = useState<YouTubeVideo[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [legacyVideo, setLegacyVideo] = useState<LessonVideo | null>(null);

  // Use React Query for lesson videos - always refetch on mount
  const { data: lessonVideos = [], isLoading, error: queryError } = useQuery({
    queryKey: ['lesson-videos', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];
      
      const { data, error } = await supabase
        .from('lesson_videos')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Sort to show primary first
        return [...data].sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return a.order_index - b.order_index;
        }) as LessonVideo[];
      }
      
      return [];
    },
    enabled: !!lessonId,
    staleTime: 0, // Always refetch on mount
    refetchOnWindowFocus: true,
  });

  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /youtube\.com\/shorts\/([^&\s]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    return null;
  };

  const buildOptimalSearchQuery = (): string => {
    const cleanTitle = lessonTitle.toLowerCase().trim();
    
    const subjectTerm = subject === "mathematiques" ? "mathématiques" : 
                        subject === "sciences" ? "sciences" : 
                        subject === "francais" ? "français" : 
                        subject === "espagnol" ? "espagnol español spanish" :
                        subject;
    
    const stopWords = ["les", "le", "la", "l'", "de", "du", "des", "et", "un", "une"];
    const keywords = cleanTitle
      .split(' ')
      .filter(word => !stopWords.includes(word) && word.length > 2)
      .slice(0, 3)
      .join(' ');
    
    return `${keywords} ${subjectTerm} cours leçon`;
  };

  const searchYouTubeVideos = async () => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const searchQuery = buildOptimalSearchQuery();

      // Use the secure edge function instead of direct API call
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query: searchQuery, maxResults: 4 }
      });

      if (error) {
        throw new Error(error.message || "Erreur lors de la recherche de vidéos");
      }

      if (!data?.videos || data.videos.length === 0) {
        setSearchVideos([]);
        return;
      }

      // Filter out English content
      const videoList: YouTubeVideo[] = data.videos
        .filter((item: any) => {
          const title = (item.title || '').toLowerCase();
          const englishIndicators = ['english', 'in english', 'english lesson', 
                                      'learn in english', 'tutorial in english', 'english version'];
          return !englishIndicators.some(indicator => title.includes(indicator));
        })
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          description: '', // Edge function doesn't return description
          thumbnail: item.thumbnail,
        }));

      setSearchVideos(videoList);
    } catch (err) {
      console.error("YouTube API Error:", err);
      setSearchError("Impossible de charger les vidéos pour le moment");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle legacy URL
  useEffect(() => {
    if (!lessonId && customYoutubeUrl) {
      const videoId = extractYouTubeVideoId(customYoutubeUrl);
      if (videoId) {
        setLegacyVideo({
          id: 'legacy',
          youtube_url: customYoutubeUrl,
          video_id: videoId,
          title: null,
          description: null,
          order_index: 0,
          is_primary: true,
        });
      }
    }
  }, [lessonId, customYoutubeUrl]);

  // Fallback to YouTube search when no lesson videos
  useEffect(() => {
    if (lessonId && !isLoading && lessonVideos.length === 0 && !legacyVideo) {
      searchYouTubeVideos();
    }
    
    if (!lessonId && !customYoutubeUrl) {
      searchYouTubeVideos();
    }
  }, [lessonId, isLoading, lessonVideos.length, customYoutubeUrl, legacyVideo]);

  // Combine all videos for display
  const allLessonVideos = legacyVideo ? [legacyVideo] : lessonVideos;
  const displayLoading = isLoading || isSearching;
  const displayError = queryError ? "Erreur de chargement" : searchError;

  if (displayLoading && allLessonVideos.length === 0 && searchVideos.length === 0) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="text-primary shrink-0" size={20} />
            📹 Vidéos explicatives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Chargement des vidéos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayError && allLessonVideos.length === 0 && searchVideos.length === 0) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="text-primary shrink-0" size={20} />
            📹 Vidéos explicatives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-muted-foreground text-sm">{displayError}</p>
        </CardContent>
      </Card>
    );
  }

  const hasLessonVideos = allLessonVideos.length > 0;
  const hasSearchVideos = searchVideos.length > 0;

  if (!hasLessonVideos && !hasSearchVideos && !displayLoading) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-t-[20px]">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="text-primary shrink-0" size={20} />
            📹 Vidéos explicatives — Aprann pi byen!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-6">
          <div className="p-8 text-center bg-background/50 rounded-lg border border-dashed border-muted">
            <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">Aucune vidéo disponible pour le moment</p>
            <p className="text-xs text-muted-foreground">Recherchez "{lessonTitle}" sur YouTube pour trouver des ressources vidéo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lesson-card border-none rounded-[20px] shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800">
      <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-t-[20px]">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Video className="text-primary shrink-0" size={20} />
          📹 Vidéos explicatives — Aprann pi byen!
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Gade videyo sa yo pou konprann konsèp yo pi byen (Regardez ces vidéos pour mieux comprendre)
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-6">
        <div className="space-y-6">
          {/* Lesson Videos from Database */}
          {allLessonVideos.map((video, index) => (
            <div
              key={video.id}
              className={`rounded-xl overflow-hidden shadow-lg bg-background/50 backdrop-blur-sm ${
                video.is_primary ? 'border-2 border-primary' : 'border border-purple-200 dark:border-purple-800'
              }`}
            >
              <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.video_id}?rel=0&modestbranding=1`}
                  title={video.title || `Vidéo ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>
              <div className={`p-4 ${video.is_primary ? 'bg-gradient-to-r from-primary/10 to-primary/5' : 'bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20'}`}>
                {video.is_primary && (
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-primary">
                      Vidéo principale sélectionnée pour cette leçon
                    </span>
                  </div>
                )}
                {video.title && (
                  <h3 className="font-semibold text-sm mb-2">{video.title}</h3>
                )}
                {video.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Si la vidéo ne s'affiche pas, <a 
                    href={`https://www.youtube.com/watch?v=${video.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    regardez-la sur YouTube
                  </a>
                </p>
              </div>
            </div>
          ))}

          {/* Search Results Videos (only show if no lesson videos) */}
          {!hasLessonVideos && searchVideos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden shadow-lg bg-background/50 backdrop-blur-sm border border-purple-200 dark:border-purple-800"
            >
              <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
                <h3 className="font-semibold text-sm mb-2">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {(hasLessonVideos || hasSearchVideos) && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-center">
              <span className="font-semibold">💡 Konsèy:</span> Gade videyo yo pou w wè eksplikasyon an aksyon! 
              <span className="italic"> (Regardez les vidéos pour voir les explications en action!)</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
