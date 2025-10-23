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
}

const YOUTUBE_API_KEY = "AIzaSyDu6sWsM5NEgb48nFFIz49guKR5amdsGWA";

export const YouTubeVideoSection = ({ lessonTitle, objectives, gradeLevel = "AF7" }: YouTubeVideoSectionProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    searchVideos();
  }, [lessonTitle, objectives]);

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
    // Convert grade level to more searchable format
    const gradeMapping: Record<string, string> = {
      "AF7": "7ème année",
      "AF8": "8ème année", 
      "AF9": "9ème année",
      "NS1": "1ère secondaire",
      "NS2": "2ème secondaire",
      "NS3": "3ème secondaire",
      "NS4": "4ème secondaire"
    };
    
    const gradeTerm = gradeMapping[gradeLevel] || "collège";
    
    // Build science-focused query that prioritizes the exact lesson topic
    // For science lessons, focus on the specific topic rather than generic math terms
    const topicWords = lessonTitle.toLowerCase().split(' ');
    
    // Create a highly specific search query
    let searchQuery = '';
    
    // If the lesson is about balance/scales, make it super specific
    if (lessonTitle.toLowerCase().includes('balance')) {
      searchQuery = `comment utiliser une balance cours sciences physiques français ${gradeTerm} expérience laboratoire`;
    } 
    // For other science topics, use the lesson title directly
    else {
      searchQuery = `${lessonTitle} cours sciences français ${gradeTerm} expérience`;
    }
    
    return searchQuery;
  };

  const searchVideos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchQuery = buildOptimalSearchQuery();
      
      console.log("YouTube search query:", searchQuery); // For debugging

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

      // Filter videos to ensure French/Creole content
      const videoList: YouTubeVideo[] = data.items
        .filter((item: any) => {
          const title = item.snippet.title.toLowerCase();
          const description = item.snippet.description.toLowerCase();
          const channelTitle = item.snippet.channelTitle.toLowerCase();
          
          // Keywords that indicate French content
          const frenchIndicators = ['français', 'french', 'cm1', 'cm2', '6ème', '5ème', '4ème', '3ème', 
                                     'primaire', 'collège', 'lycée', 'mathématiques', 'maths'];
          
          // Keywords that indicate English content (to exclude)
          const englishIndicators = ['english', 'mathematics in english', 'english lesson', 
                                      'learn in english', 'tutorial in english'];
          
          // Check if video has English indicators
          const hasEnglishIndicators = englishIndicators.some(indicator => 
            title.includes(indicator) || description.includes(indicator)
          );
          
          // Check if video has French indicators
          const hasFrenchIndicators = frenchIndicators.some(indicator => 
            title.includes(indicator) || description.includes(indicator) || channelTitle.includes(indicator)
          );
          
          // Include only if has French indicators and no English indicators
          return hasFrenchIndicators && !hasEnglishIndicators;
        })
        .map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
        }));

      setVideos(videoList);
    } catch (err) {
      console.error("YouTube API error:", err);
      setError("Impossible de charger les vidéos");
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

  if (videos.length === 0) {
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
          {videos.map((video) => (
            <div
              key={video.id}
              className="rounded-xl overflow-hidden shadow-lg bg-background/50 backdrop-blur-sm border border-purple-200 dark:border-purple-800"
            >
              {/* YouTube Embed */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
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
