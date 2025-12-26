import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Trash2, Youtube, Music, Palette, Brain, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { useAllPassionVideos, useSavePassionVideo, useDeletePassionVideo } from "@/hooks/usePassionVideos";
import { musicActivities, artsActivities, chessActivities, literatureActivities, type CategoryContent, type ActivityContent } from "@/data/passionActivities";

// Passion categories configuration
const passionCategories = [
  { id: 'music', title: 'Musique', icon: Music, emoji: '🎵', activities: musicActivities },
  { id: 'arts', title: 'Arts Plastiques', icon: Palette, emoji: '🎨', activities: artsActivities },
  { id: 'chess', title: 'Échecs', icon: Brain, emoji: '♟️', activities: chessActivities },
  { id: 'literature', title: 'Littérature', icon: BookOpen, emoji: '📖', activities: literatureActivities },
];

const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const PassionVideoManager = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [savingActivity, setSavingActivity] = useState<string | null>(null);

  const { data: allVideos, isLoading } = useAllPassionVideos();
  const saveVideo = useSavePassionVideo();
  const deleteVideo = useDeletePassionVideo();

  // Get modules for selected category
  const modules = useMemo(() => {
    if (!selectedCategory) return [];
    const category = passionCategories.find(c => c.id === selectedCategory);
    if (!category) return [];
    return Object.values(category.activities);
  }, [selectedCategory]);

  // Get video activities for selected module
  const videoActivities = useMemo(() => {
    if (!selectedCategory || !selectedModule) return [];
    const category = passionCategories.find(c => c.id === selectedCategory);
    if (!category) return [];
    const module = category.activities[selectedModule];
    if (!module) return [];
    return module.activities.filter(a => a.type === 'video');
  }, [selectedCategory, selectedModule]);

  // Get saved video URL for an activity
  const getSavedUrl = (activityId: string): string | null => {
    if (!allVideos) return null;
    const video = allVideos.find(
      v => v.category_id === selectedCategory && 
           v.module_id === selectedModule && 
           v.activity_id === activityId
    );
    return video?.youtube_url || null;
  };

  // Handle URL input change
  const handleUrlChange = (activityId: string, url: string) => {
    setVideoUrls(prev => ({ ...prev, [activityId]: url }));
  };

  // Get current URL (input value or saved value)
  const getCurrentUrl = (activityId: string): string => {
    if (videoUrls[activityId] !== undefined) return videoUrls[activityId];
    return getSavedUrl(activityId) || '';
  };

  // Handle save video
  const handleSave = async (activity: ActivityContent) => {
    const url = getCurrentUrl(activity.id);
    if (!url.trim()) return;

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return;
    }

    setSavingActivity(activity.id);
    try {
      await saveVideo.mutateAsync({
        categoryId: selectedCategory,
        moduleId: selectedModule,
        activityId: activity.id,
        youtubeUrl: url.trim(),
        title: activity.title
      });
      // Clear the local input after saving
      setVideoUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[activity.id];
        return newUrls;
      });
    } finally {
      setSavingActivity(null);
    }
  };

  // Handle delete video
  const handleDelete = async (activityId: string) => {
    setSavingActivity(activityId);
    try {
      await deleteVideo.mutateAsync({
        categoryId: selectedCategory,
        moduleId: selectedModule,
        activityId
      });
      setVideoUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[activityId];
        return newUrls;
      });
    } finally {
      setSavingActivity(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            Gestion des Vidéos - Passions
          </CardTitle>
          <CardDescription>
            Configurez les vidéos YouTube pour chaque activité des catégories passion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category and Module Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedModule('');
                  setVideoUrls({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {passionCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span>{category.emoji}</span>
                        <span>{category.title}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Module</Label>
              <Select 
                value={selectedModule} 
                onValueChange={(value) => {
                  setSelectedModule(value);
                  setVideoUrls({});
                }}
                disabled={!selectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video Activities List */}
          {selectedModule && videoActivities.length > 0 && (
            <div className="space-y-4 mt-6">
              <h3 className="font-semibold text-lg">Activités Vidéo</h3>
              
              {videoActivities.map(activity => {
                const savedUrl = getSavedUrl(activity.id);
                const currentUrl = getCurrentUrl(activity.id);
                const videoId = extractYouTubeVideoId(currentUrl);
                const hasCustomVideo = !!savedUrl;
                const hasUnsavedChanges = videoUrls[activity.id] !== undefined && 
                                          videoUrls[activity.id] !== (savedUrl || '');
                const isSaving = savingActivity === activity.id;

                return (
                  <Card key={activity.id} className="border-2">
                    <CardContent className="p-4 space-y-4">
                      {/* Activity Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Youtube className="h-5 w-5 text-red-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                          </div>
                        </div>
                        {hasCustomVideo ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Vidéo personnalisée
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Recherche par défaut
                          </Badge>
                        )}
                      </div>

                      {/* Default Search Query */}
                      {activity.content?.videoQuery && (
                        <div className="text-sm p-2 bg-muted rounded-lg">
                          <span className="text-muted-foreground">Recherche par défaut:</span>{' '}
                          <span className="font-mono text-xs">{activity.content.videoQuery}</span>
                        </div>
                      )}

                      {/* URL Input */}
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="https://youtube.com/watch?v=..."
                            value={currentUrl}
                            onChange={(e) => handleUrlChange(activity.id, e.target.value)}
                            className={hasUnsavedChanges ? 'border-yellow-500' : ''}
                          />
                        </div>
                        <Button
                          onClick={() => handleSave(activity)}
                          disabled={!currentUrl.trim() || !extractYouTubeVideoId(currentUrl) || isSaving}
                          size="icon"
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        {hasCustomVideo && (
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(activity.id)}
                            disabled={isSaving}
                            size="icon"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Video Preview */}
                      {videoId && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={activity.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      )}

                      {currentUrl && !videoId && (
                        <p className="text-sm text-destructive">
                          URL YouTube invalide. Veuillez entrer une URL YouTube valide.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedModule && videoActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune activité vidéo dans ce module
            </div>
          )}

          {!selectedCategory && (
            <div className="text-center py-8 text-muted-foreground">
              Sélectionnez une catégorie pour commencer
            </div>
          )}

          {selectedCategory && !selectedModule && (
            <div className="text-center py-8 text-muted-foreground">
              Sélectionnez un module pour voir les activités vidéo
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
