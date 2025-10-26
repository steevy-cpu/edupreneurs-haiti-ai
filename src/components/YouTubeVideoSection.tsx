import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Video } from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

interface YouTubeVideoSectionProps {
  lessonTitle: string;
  objectives: string;
  gradeLevel?: string; // e.g., "AF7", "AF8", "AF9"
  customYoutubeUrl?: string; // Custom YouTube URL for the lesson
  subject?: string; // "mathematiques", "sciences", etc.
}

const YOUTUBE_API_KEY = "AIzaSyDu6sWsM5NEgb48nFFIz49guKR5amdsGWA";

export const YouTubeVideoSection = ({ lessonTitle, objectives, gradeLevel = "AF7", customYoutubeUrl, subject = "mathematiques" }: YouTubeVideoSectionProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customVideoId, setCustomVideoId] = useState<string | null>(null);

  useEffect(() => {
    // Extract custom video ID if URL is provided
    if (customYoutubeUrl) {
      const videoId = extractYouTubeVideoId(customYoutubeUrl);
      setCustomVideoId(videoId);
      setIsLoading(false);
      // Skip API search when we have a custom video URL
      return;
    }
    searchVideos();
  }, [lessonTitle, objectives, customYoutubeUrl]);

  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
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
    
    // If it's already just the video ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    return null;
  };

  const extractKeywords = (text: string): string[] => {
    // Common French/Creole stop words to exclude
    const stopWords = [
      "pouvoir", "savoir", "cette", "leçon", "être", "avoir", "faire", 
      "pour", "dans", "avec", "plus", "tout", "mais", "vous", "nous",
      "que", "qui", "sur", "une", "des", "les", "aux", "par"
    ];

    // Extract important mathematical and educational keywords
    const keywords = text
      .toLowerCase()
      .replace(/[•\-:;,]/g, " ")
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !stopWords.includes(word) &&
        !word.match(/^\d+$/) // exclude pure numbers
      )
      .slice(0, 6); // Get top 6 keywords

    return keywords;
  };

  const buildOptimalSearchQuery = (): string => {
    // Build topic-specific search queries based on subject and lesson title
    const cleanTitle = lessonTitle.toLowerCase().trim();
    
    // Determine subject term for search
    const subjectTerm = subject === "mathematiques" ? "mathématiques" : 
                        subject === "sciences" ? "sciences" : 
                        subject === "francais" ? "français" : 
                        subject;
    
    // Extract key words from title (remove articles)
    const stopWords = ["les", "le", "la", "l'", "de", "du", "des", "et", "un", "une"];
    const keywords = cleanTitle
      .split(' ')
      .filter(word => !stopWords.includes(word) && word.length > 2)
      .slice(0, 4)
      .join(' ');
    
    // Build query: topic keywords + cours + subject + français + grade level
    return `${keywords} cours ${subjectTerm} français ${gradeLevel}`;
  };

  const searchVideos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchQuery = buildOptimalSearchQuery();
      
      console.log("🎬 [YouTube] Searching for videos with query:", searchQuery);

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=3&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `type=video&` +
        `videoEmbeddable=true&` +
        `videoDuration=medium&` + // Prefer 4-20 min videos
        `relevanceLanguage=fr&` +
        `regionCode=HT&` + // Prioritize Haiti region for French/Creole content
        `videoDefinition=any&` +
        `safeSearch=strict&` +
        `order=relevance&` +
        `key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche de vidéos");
      }

      const data = await response.json();
      
      console.log("🎬 [YouTube] API Response:", data);
      
      if (!data.items || data.items.length === 0) {
        console.warn("🎬 [YouTube] No videos found for query:", searchQuery);
        setVideos([]);
        return;
      }

      // Filter videos to ensure French/Creole content with relaxed rules
      const videoList: YouTubeVideo[] = data.items
        .filter((item: any) => {
          const title = item.snippet.title.toLowerCase();
          const description = item.snippet.description.toLowerCase();
          
          // Keywords that strongly indicate English content (to exclude)
          const englishIndicators = ['english', 'in english', 'english lesson', 
                                      'learn in english', 'tutorial in english', 'english version'];
          
          // Check if video has strong English indicators
          const hasEnglishIndicators = englishIndicators.some(indicator => 
            title.includes(indicator) || description.includes(indicator)
          );
          
          // Include if not clearly English (more permissive for French content)
          return !hasEnglishIndicators;
        })
        .map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
        }));

      console.log("🎬 [YouTube] Filtered videos:", videoList.length, "videos found");
      setVideos(videoList);
    } catch (err) {
      console.error("🎬 [YouTube] API Error:", err);
      setError("Impossible de charger les vidéos pour le moment");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
            <p className="text-muted-foreground text-sm">Recherche de vidéos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lesson-card border-none rounded-[20px] shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Video className="text-primary shrink-0" size={20} />
            📹 Vidéos explicatives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-muted-foreground text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0 && !customVideoId) {
    return null;
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
          {/* Custom Video (if provided) */}
          {customVideoId && (
            <div className="rounded-xl overflow-hidden shadow-lg bg-background/50 backdrop-blur-sm border-2 border-primary">
              <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${customVideoId}?rel=0&modestbranding=1`}
                  title="Vidéo personnalisée pour cette leçon"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
                <p className="text-sm font-semibold text-primary">
                  ⭐ Vidéo sélectionnée spécialement pour cette leçon
                </p>
              </div>
            </div>
          )}

          {/* Search Results Videos */}
          {videos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden shadow-lg bg-background/50 backdrop-blur-sm border border-purple-200 dark:border-purple-800"
            >
              {/* YouTube Embed */}
              <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>

              {/* Video Info */}
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

        <div className="mt-6 p-4 bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-center">
            <span className="font-semibold">💡 Konsèy:</span> Gade videyo yo pou w wè eksplikasyon an aksyon! 
            <span className="italic"> (Regardez les vidéos pour voir les explications en action!)</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
