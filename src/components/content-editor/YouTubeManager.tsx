import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Youtube, Save, Trash2, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface YouTubeManagerProps {
  lesson: any;
  onUpdate: () => void;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

const YOUTUBE_API_KEY = "AIzaSyDu6sWsM5NEgb48nFFIz49guKR5amdsGWA";

export const YouTubeManager = ({ lesson, onUpdate }: YouTubeManagerProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState(lesson?.youtube_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [searchVideos, setSearchVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  // Update local state when lesson changes
  useEffect(() => {
    setYoutubeUrl(lesson?.youtube_url || "");
    if (lesson?.title && lesson?.objectif) {
      searchYouTubeVideos();
    }
  }, [lesson?.id, lesson?.youtube_url, lesson?.title, lesson?.objectif]);

  const extractVideoId = (url: string) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /youtube\.com\/shorts\/([^&\s]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  };

  const buildSearchQuery = () => {
    if (!lesson?.title) return "";
    const mainWords = lesson.title.toLowerCase().split(' ').slice(0, 3).join(' ');
    return `${mainWords} cours français`;
  };

  const searchYouTubeVideos = async () => {
    if (!lesson?.title) return;
    
    setIsLoadingVideos(true);
    try {
      const searchQuery = buildSearchQuery();
      
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=3&` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `type=video&` +
        `videoEmbeddable=true&` +
        `videoDuration=medium&` +
        `relevanceLanguage=fr&` +
        `regionCode=HT&` +
        `videoDefinition=any&` +
        `safeSearch=strict&` +
        `order=relevance&` +
        `key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) throw new Error("Erreur YouTube API");

      const data = await response.json();
      
      const videoList: YouTubeVideo[] = data.items
        .filter((item: any) => {
          const title = item.snippet.title.toLowerCase();
          const description = item.snippet.description.toLowerCase();
          const englishIndicators = ['english', 'in english', 'english lesson'];
          return !englishIndicators.some(indicator => 
            title.includes(indicator) || description.includes(indicator)
          );
        })
        .map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
        }));

      setSearchVideos(videoList);
    } catch (error) {
      console.error("YouTube search error:", error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const videoId = extractVideoId(youtubeUrl);

  if (!lesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Youtube className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour gérer sa vidéo</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          youtube_url: youtubeUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lesson.id);

      if (error) throw error;

      toast.success("Vidéo YouTube mise à jour avec succès");
      onUpdate();
    } catch (error) {
      console.error('Error updating YouTube URL:', error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({
          youtube_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lesson.id);

      if (error) throw error;

      setYoutubeUrl("");
      toast.success("Vidéo YouTube supprimée");
      onUpdate();
    } catch (error) {
      console.error('Error removing YouTube URL:', error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-[600px] max-h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Vidéos YouTube
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Gérez la vidéo personnalisée et visualisez les suggestions
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {/* Custom Video URL Input */}
            <div className="space-y-2 pb-4 border-b">
              <Label htmlFor="youtube-url" className="text-sm font-semibold">
                Vidéo personnalisée de la leçon
              </Label>
              <Input
                id="youtube-url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Cette vidéo sera affichée en priorité aux étudiants
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex-1"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
                {lesson.youtube_url && (
                  <Button 
                    onClick={handleRemove} 
                    disabled={isSaving}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Custom Video Preview */}
            {videoId && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  ⭐ Aperçu - Vidéo personnalisée
                </Label>
                <div className="rounded-lg overflow-hidden border-2 border-primary/20">
                  <div className="aspect-video bg-muted">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="Aperçu de la vidéo personnalisée"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* YouTube Search Results */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-sm font-semibold">
                📹 Vidéos suggérées (affichées aux étudiants)
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Ces vidéos sont automatiquement suggérées en fonction du titre de la leçon
              </p>
              
              {isLoadingVideos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : searchVideos.length > 0 ? (
                <div className="space-y-3">
                  {searchVideos.map((video) => (
                    <div
                      key={video.id}
                      className="rounded-lg overflow-hidden border bg-card"
                    >
                      <div className="aspect-video bg-muted">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.id}`}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                      <div className="p-3 bg-muted/30">
                        <h4 className="font-medium text-xs line-clamp-2 mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Aucune vidéo suggérée trouvée
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
