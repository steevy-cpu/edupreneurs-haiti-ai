import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Youtube, Save, Trash2, Loader2, Sparkles, Plus, GripVertical, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContentEditorPermissions } from "@/hooks/useContentEditorPermissions";

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

interface LessonVideo {
  id: string;
  youtube_url: string;
  video_id: string;
  title: string | null;
  description: string | null;
  order_index: number;
  is_primary: boolean;
}

// YouTube API key is now securely stored in edge function

export const YouTubeManager = ({ lesson, onUpdate }: YouTubeManagerProps) => {
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lessonVideos, setLessonVideos] = useState<LessonVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [searchVideos, setSearchVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [bannedVideoIds, setBannedVideoIds] = useState<Set<string>>(new Set());
  const [aiSuggestedVideos, setAiSuggestedVideos] = useState<YouTubeVideo[]>([]);
  const [isGeneratingAiSuggestions, setIsGeneratingAiSuggestions] = useState(false);
  
  const { canEdit, canDelete } = useContentEditorPermissions();

  // Load banned videos
  useEffect(() => {
    const loadBannedVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('banned_youtube_videos')
          .select('video_id');
        
        if (error) throw error;
        
        if (data) {
          setBannedVideoIds(new Set(data.map(v => v.video_id)));
        }
      } catch (error) {
        console.error('Error loading banned videos:', error);
      }
    };
    loadBannedVideos();
  }, []);

  // Load lesson videos
  useEffect(() => {
    if (lesson?.id) {
      loadLessonVideos();
      if (lesson?.title && lesson?.objectif) {
        searchYouTubeVideos();
      }
    }
  }, [lesson?.id, lesson?.title, lesson?.objectif]);

  const loadLessonVideos = async () => {
    if (!lesson?.id) return;
    
    setIsLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from('lesson_videos')
        .select('*')
        .eq('lesson_id', lesson.id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setLessonVideos(data || []);
    } catch (error) {
      console.error('Error loading lesson videos:', error);
      toast.error("Erreur lors du chargement des vidéos");
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const extractVideoId = (url: string): string | null => {
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
    
    setIsLoadingSearch(true);
    try {
      const searchQuery = buildSearchQuery();
      
      // Use the secure edge function instead of direct API call
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query: searchQuery, maxResults: 5 }
      });

      if (error) throw new Error(error.message || "Erreur YouTube API");

      if (!data?.videos) {
        setSearchVideos([]);
        return;
      }

      const videoList: YouTubeVideo[] = data.videos
        .filter((item: any) => {
          const title = (item.title || '').toLowerCase();
          const englishIndicators = ['english', 'in english', 'english lesson'];
          const isBanned = bannedVideoIds.has(item.id);
          return !isBanned && !englishIndicators.some(indicator => title.includes(indicator));
        })
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          description: '', // Edge function returns minimal data for security
          thumbnail: item.thumbnail,
        }))
        .slice(0, 3);

      setSearchVideos(videoList);
    } catch (error) {
      console.error("YouTube search error:", error);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  const suggestWithAI = async () => {
    if (!lesson?.title) {
      toast.error("Impossible de suggérer des vidéos sans titre de leçon");
      return;
    }

    setIsGeneratingAiSuggestions(true);
    try {
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('contenu, exemples_exercices, title, grade_level, subjects(name)')
        .eq('id', lesson.id)
        .single();

      const { data, error } = await supabase.functions.invoke('suggest-youtube-videos', {
        body: {
          lessonTitle: lessonData?.title || lesson.title,
          contenu: lessonData?.contenu || '',
          exemplesExercices: lessonData?.exemples_exercices || '',
          gradeLevel: lessonData?.grade_level || lesson.grade_level,
          subject: lessonData?.subjects?.name || 'Matière',
        }
      });

      if (error) throw error;
      
      if (data?.videos && data.videos.length > 0) {
        setAiSuggestedVideos(data.videos);
        toast.success(`${data.videos.length} vidéo(s) suggérée(s) par IA`);
      } else {
        toast.info("Aucune vidéo trouvée pour cette leçon");
      }
    } catch (error: any) {
      console.error('Error suggesting videos with AI:', error);
      toast.error("Erreur lors de la suggestion de vidéos");
    } finally {
      setIsGeneratingAiSuggestions(false);
    }
  };

  const addVideo = async (videoId: string, title?: string, description?: string) => {
    if (!canEdit) {
      toast.error("Vous n'avez pas la permission d'ajouter des vidéos");
      return;
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const nextIndex = lessonVideos.length;
      const isPrimary = lessonVideos.length === 0;

      const { error } = await supabase
        .from('lesson_videos')
        .insert({
          lesson_id: lesson.id,
          youtube_url: videoUrl,
          video_id: videoId,
          title: title || null,
          description: description || null,
          order_index: nextIndex,
          is_primary: isPrimary,
          added_by: user.id,
        });

      if (error) throw error;

      toast.success("Vidéo ajoutée avec succès");
      setNewVideoUrl("");
      loadLessonVideos();
      onUpdate();
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error("Erreur lors de l'ajout de la vidéo");
    }
  };

  const handleAddNewVideo = async () => {
    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      toast.error("URL YouTube invalide");
      return;
    }

    // Check if video already exists
    if (lessonVideos.some(v => v.video_id === videoId)) {
      toast.error("Cette vidéo est déjà ajoutée");
      return;
    }

    await addVideo(videoId);
  };

  const removeVideo = async (videoDbId: string) => {
    if (!canDelete) {
      toast.error("Vous n'avez pas la permission de supprimer cette vidéo");
      return;
    }

    try {
      const { error } = await supabase
        .from('lesson_videos')
        .delete()
        .eq('id', videoDbId);

      if (error) throw error;

      toast.success("Vidéo supprimée");
      loadLessonVideos();
      onUpdate();
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const setPrimaryVideo = async (videoDbId: string) => {
    if (!canEdit) {
      toast.error("Vous n'avez pas la permission de modifier");
      return;
    }

    try {
      // First, unset all as primary
      await supabase
        .from('lesson_videos')
        .update({ is_primary: false })
        .eq('lesson_id', lesson.id);

      // Then set the selected one as primary
      const { error } = await supabase
        .from('lesson_videos')
        .update({ is_primary: true })
        .eq('id', videoDbId);

      if (error) throw error;

      toast.success("Vidéo principale mise à jour");
      loadLessonVideos();
      onUpdate();
    } catch (error) {
      console.error('Error setting primary video:', error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const moveVideo = async (videoDbId: string, direction: 'up' | 'down') => {
    if (!canEdit) return;

    const currentIndex = lessonVideos.findIndex(v => v.id === videoDbId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= lessonVideos.length) return;

    try {
      const currentVideo = lessonVideos[currentIndex];
      const swapVideo = lessonVideos[newIndex];

      await Promise.all([
        supabase
          .from('lesson_videos')
          .update({ order_index: newIndex })
          .eq('id', currentVideo.id),
        supabase
          .from('lesson_videos')
          .update({ order_index: currentIndex })
          .eq('id', swapVideo.id),
      ]);

      loadLessonVideos();
    } catch (error) {
      console.error('Error reordering videos:', error);
      toast.error("Erreur lors du réordonnancement");
    }
  };

  const banVideo = async (videoId: string) => {
    if (!canDelete) {
      toast.error("Vous n'avez pas la permission de bannir cette vidéo");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from('banned_youtube_videos')
        .insert({
          video_id: videoId,
          banned_by: user.id,
          reason: 'Vidéo inappropriée ou non pertinente'
        });

      if (error && error.code !== '23505') throw error;

      setBannedVideoIds(prev => new Set([...prev, videoId]));
      setSearchVideos(prev => prev.filter(v => v.id !== videoId));
      setAiSuggestedVideos(prev => prev.filter(v => v.id !== videoId));
      
      toast.success("Vidéo bannie avec succès");
    } catch (error) {
      console.error('Error banning video:', error);
      toast.error("Erreur lors du bannissement de la vidéo");
    }
  };

  if (!lesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Youtube className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour gérer ses vidéos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] max-h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Vidéos YouTube
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Gérez les vidéos de cette leçon (plusieurs vidéos possibles)
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {/* Add New Video */}
            <div className="space-y-2 pb-4 border-b">
              <Label htmlFor="new-video-url" className="text-sm font-semibold">
                Ajouter une nouvelle vidéo
              </Label>
              <div className="flex gap-2">
                <Input
                  id="new-video-url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="font-mono text-sm flex-1"
                />
                <Button 
                  onClick={handleAddNewVideo} 
                  disabled={isSaving || !newVideoUrl}
                  size="sm"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            {/* Current Lesson Videos */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                📹 Vidéos de cette leçon ({lessonVideos.length})
              </Label>
              
              {isLoadingVideos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : lessonVideos.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg bg-muted/20">
                  Aucune vidéo ajoutée. Utilisez le formulaire ci-dessus ou les suggestions ci-dessous.
                </div>
              ) : (
                <div className="space-y-3">
                  {lessonVideos.map((video, index) => (
                    <div
                      key={video.id}
                      className={`rounded-lg overflow-hidden border ${video.is_primary ? 'border-primary border-2' : 'bg-card'}`}
                    >
                      <div className="aspect-video bg-muted relative group">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.video_id}`}
                          title={video.title || "Vidéo"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                      <div className="p-3 bg-muted/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {video.is_primary && (
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                              )}
                              <span className="text-xs font-medium truncate">
                                {video.title || `Vidéo ${index + 1}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!video.is_primary && canEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPrimaryVideo(video.id)}
                              className="h-7 w-7 p-0"
                              title="Définir comme vidéo principale"
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          )}
                          {index > 0 && canEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveVideo(video.id, 'up')}
                              className="h-7 w-7 p-0"
                              title="Monter"
                            >
                              ↑
                            </Button>
                          )}
                          {index < lessonVideos.length - 1 && canEdit && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveVideo(video.id, 'down')}
                              className="h-7 w-7 p-0"
                              title="Descendre"
                            >
                              ↓
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeVideo(video.id)}
                              className="h-7 w-7 p-0"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Suggested Videos */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  🤖 Vidéos suggérées par IA
                </Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={suggestWithAI}
                  disabled={isGeneratingAiSuggestions}
                  className="h-7 text-xs"
                >
                  {isGeneratingAiSuggestions ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1 h-3 w-3" />
                      Suggérer avec IA
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                L'IA analyse le contenu de la leçon pour suggérer les meilleures vidéos
              </p>
              
              {aiSuggestedVideos.length > 0 && (
                <div className="space-y-3">
                  {aiSuggestedVideos.map((video) => (
                    <div
                      key={video.id}
                      className="rounded-lg overflow-hidden border bg-card"
                    >
                      <div className="aspect-video bg-muted relative group">
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
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {video.description}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => addVideo(video.id, video.title, video.description)}
                            disabled={!canEdit || lessonVideos.some(v => v.video_id === video.id)}
                            className="flex-1 h-7 text-xs"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            {lessonVideos.some(v => v.video_id === video.id) ? 'Déjà ajoutée' : 'Ajouter'}
                          </Button>
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => banVideo(video.id)}
                              className="h-7 w-7 p-0"
                              title="Bannir cette vidéo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* YouTube Search Results */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-sm font-semibold">
                🔍 Vidéos de recherche automatique
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Recherche basique basée sur le titre de la leçon
              </p>
              
              {isLoadingSearch ? (
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
                      <div className="aspect-video bg-muted relative group">
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
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {video.description}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => addVideo(video.id, video.title, video.description)}
                            disabled={!canEdit || lessonVideos.some(v => v.video_id === video.id)}
                            className="flex-1 h-7 text-xs"
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            {lessonVideos.some(v => v.video_id === video.id) ? 'Déjà ajoutée' : 'Ajouter'}
                          </Button>
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => banVideo(video.id)}
                              className="h-7 w-7 p-0"
                              title="Bannir cette vidéo"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Aucune vidéo trouvée
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
