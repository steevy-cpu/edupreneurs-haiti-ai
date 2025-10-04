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
}

const YOUTUBE_API_KEY = "AIzaSyDu6sWsM5NEgb48nFFIz49guKR5amdsGWA";

export const YouTubeVideoSection = ({ lessonTitle, objectives }: YouTubeVideoSectionProps) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    searchVideos();
  }, [lessonTitle, objectives]);

  const extractKeywords = (text: string): string[] => {
    // Extract important keywords from objectives
    const keywords = text
      .toLowerCase()
      .replace(/[•\-]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 4 && !["pouvoir", "savoir", "cette", "leçon"].includes(word))
      .slice(0, 5);
    return keywords;
  };

  const searchVideos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build search query with lesson title and keywords from objectives
      const keywords = extractKeywords(objectives);
      const searchQuery = `${lessonTitle} mathématiques ${keywords.join(" ")} explication`;

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(
          searchQuery
        )}&type=video&videoEmbeddable=true&relevanceLanguage=fr&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche de vidéos");
      }

      const data = await response.json();

      const videoList: YouTubeVideo[] = data.items.map((item: any) => ({
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <div
              key={video.id}
              className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-background/50 backdrop-blur-sm border border-purple-200 dark:border-purple-800"
            >
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </a>
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
