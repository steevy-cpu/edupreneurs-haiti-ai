import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, Save, Trash2, Youtube, Music, Palette, Brain, BookOpen, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ExternalLink, Video } from "lucide-react";
import { useAllPassionVideos, useSavePassionVideo, useDeletePassionVideo, type PassionVideo } from "@/hooks/usePassionVideos";
import { musicActivities, artsActivities, chessActivities, literatureActivities, type ActivityContent } from "@/data/passionActivities";

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

// Helper to get activity title from category data
const getActivityTitle = (categoryId: string, moduleId: string, activityId: string): string => {
  const category = passionCategories.find(c => c.id === categoryId);
  if (!category) return activityId;
  const module = category.activities[moduleId];
  if (!module) return activityId;
  const activity = module.activities.find(a => a.id === activityId);
  return activity?.title || activityId;
};

// Helper to get module title from category data
const getModuleTitle = (categoryId: string, moduleId: string): string => {
  const category = passionCategories.find(c => c.id === categoryId);
  if (!category) return moduleId;
  const module = category.activities[moduleId];
  return module?.title || moduleId;
};

export const PassionVideoManager = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [savingActivity, setSavingActivity] = useState<string | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(true);
  const [deletingFromOverview, setDeletingFromOverview] = useState<string | null>(null);

  const { data: allVideos, isLoading } = useAllPassionVideos();
  const saveVideo = useSavePassionVideo();
  const deleteVideo = useDeletePassionVideo();

  // Calculate video counts per category
  const videoCounts = useMemo(() => {
    if (!allVideos) return {};
    const counts: Record<string, number> = {};
    passionCategories.forEach(cat => {
      counts[cat.id] = allVideos.filter((v: PassionVideo) => v.category_id === cat.id).length;
    });
    return counts;
  }, [allVideos]);

  // Calculate video counts per module for selected category
  const moduleVideoCounts = useMemo(() => {
    if (!allVideos || !selectedCategory) return {};
    const counts: Record<string, number> = {};
    const category = passionCategories.find(c => c.id === selectedCategory);
    if (!category) return counts;
    
    Object.keys(category.activities).forEach(moduleId => {
      counts[moduleId] = allVideos.filter(
        (v: PassionVideo) => v.category_id === selectedCategory && v.module_id === moduleId
      ).length;
    });
    return counts;
  }, [allVideos, selectedCategory]);

  // Get total video activities count for a module
  const getModuleVideoActivityCount = (categoryId: string, moduleId: string): number => {
    const category = passionCategories.find(c => c.id === categoryId);
    if (!category) return 0;
    const module = category.activities[moduleId];
    if (!module) return 0;
    return module.activities.filter(a => a.type === 'video').length;
  };

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

  // Sort activities: configured first, then unconfigured
  const sortedVideoActivities = useMemo((): { configured: ActivityContent[]; unconfigured: ActivityContent[] } => {
    const configured: ActivityContent[] = [];
    const unconfigured: ActivityContent[] = [];
    
    if (!allVideos) {
      return { configured: [], unconfigured: videoActivities };
    }
    
    videoActivities.forEach(activity => {
      const hasVideo = allVideos.some(
        (v: PassionVideo) => v.category_id === selectedCategory && 
             v.module_id === selectedModule && 
             v.activity_id === activity.id
      );
      if (hasVideo) {
        configured.push(activity);
      } else {
        unconfigured.push(activity);
      }
    });
    
    return { configured, unconfigured };
  }, [videoActivities, allVideos, selectedCategory, selectedModule]);

  // Get saved video URL for an activity
  const getSavedUrl = (activityId: string): string | null => {
    if (!allVideos) return null;
    const video = allVideos.find(
      (v: PassionVideo) => v.category_id === selectedCategory && 
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

  // Handle delete from overview table
  const handleDeleteFromOverview = async (video: PassionVideo) => {
    setDeletingFromOverview(video.id);
    try {
      await deleteVideo.mutateAsync({
        categoryId: video.category_id,
        moduleId: video.module_id,
        activityId: video.activity_id
      });
    } finally {
      setDeletingFromOverview(null);
    }
  };

  // Get category info by ID
  const getCategoryInfo = (categoryId: string) => {
    return passionCategories.find(c => c.id === categoryId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalVideos = allVideos?.length || 0;

  return (
    <div className="space-y-6">
      {/* Video Overview Dashboard */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Résumé des Vidéos Configurées
              </CardTitle>
              <CardDescription className="mt-1">
                {totalVideos} vidéo{totalVideos !== 1 ? 's' : ''} personnalisée{totalVideos !== 1 ? 's' : ''} au total
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {totalVideos}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Video Counts */}
          <div className="flex flex-wrap gap-3">
            {passionCategories.map(category => {
              const count = videoCounts[category.id] || 0;
              return (
                <div
                  key={category.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    count > 0 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-muted border-border'
                  }`}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span className="font-medium">{category.title}</span>
                  <Badge 
                    variant={count > 0 ? "default" : "outline"}
                    className={count > 0 ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>

          {/* Collapsible All Videos Table */}
          {totalVideos > 0 && (
            <Collapsible open={overviewOpen} onOpenChange={setOverviewOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    Voir toutes les vidéos configurées
                  </span>
                  {overviewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="rounded-lg border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Catégorie</th>
                        <th className="text-left p-3 font-medium">Module</th>
                        <th className="text-left p-3 font-medium">Activité</th>
                        <th className="text-left p-3 font-medium">URL</th>
                        <th className="text-center p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allVideos?.map((video: PassionVideo) => {
                        const categoryInfo = getCategoryInfo(video.category_id);
                        const videoId = extractYouTubeVideoId(video.youtube_url || '');
                        const isDeleting = deletingFromOverview === video.id;
                        
                        return (
                          <tr key={video.id} className="hover:bg-muted/50">
                            <td className="p-3">
                              <span className="flex items-center gap-2">
                                <span>{categoryInfo?.emoji}</span>
                                <span>{categoryInfo?.title || video.category_id}</span>
                              </span>
                            </td>
                            <td className="p-3">
                              {getModuleTitle(video.category_id, video.module_id)}
                            </td>
                            <td className="p-3 font-medium">
                              {video.title || getActivityTitle(video.category_id, video.module_id, video.activity_id)}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {videoId && (
                                  <img 
                                    src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                    alt="Thumbnail"
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                )}
                                <a 
                                  href={video.youtube_url || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Voir
                                </a>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteFromOverview(video)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {totalVideos === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Aucune vidéo configurée. Sélectionnez une catégorie et un module pour commencer.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Video Manager */}
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
                  {passionCategories.map(category => {
                    const count = videoCounts[category.id] || 0;
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2 w-full">
                          <span>{category.emoji}</span>
                          <span className="flex-1">{category.title}</span>
                          <Badge 
                            variant={count > 0 ? "default" : "outline"} 
                            className={`ml-2 ${count > 0 ? 'bg-green-500' : ''}`}
                          >
                            {count}
                          </Badge>
                        </span>
                      </SelectItem>
                    );
                  })}
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
                  {modules.map(module => {
                    const configuredCount = moduleVideoCounts[module.id] || 0;
                    const totalCount = getModuleVideoActivityCount(selectedCategory, module.id);
                    const allConfigured = configuredCount > 0 && configuredCount >= totalCount;
                    const someConfigured = configuredCount > 0 && configuredCount < totalCount;
                    
                    return (
                      <SelectItem key={module.id} value={module.id}>
                        <span className="flex items-center gap-2 w-full">
                          <span className="flex-1">{module.title}</span>
                          <Badge 
                            variant={configuredCount > 0 ? "default" : "outline"}
                            className={`ml-2 ${
                              allConfigured 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : someConfigured 
                                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                                  : ''
                            }`}
                          >
                            {configuredCount}/{totalCount}
                          </Badge>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video Activities List - Sorted by configured status */}
          {selectedModule && videoActivities.length > 0 && (
            <div className="space-y-4 mt-6">
              {/* Configured Activities Section */}
              {sortedVideoActivities.configured.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">
                      Configurées ({sortedVideoActivities.configured.length})
                    </h3>
                  </div>
                  
                  {sortedVideoActivities.configured.map(activity => (
                    <ActivityCard 
                      key={activity.id}
                      activity={activity}
                      savedUrl={getSavedUrl(activity.id)}
                      currentUrl={getCurrentUrl(activity.id)}
                      hasUnsavedChanges={videoUrls[activity.id] !== undefined && videoUrls[activity.id] !== (getSavedUrl(activity.id) || '')}
                      isSaving={savingActivity === activity.id}
                      onUrlChange={handleUrlChange}
                      onSave={handleSave}
                      onDelete={handleDelete}
                    />
                  ))}
                </>
              )}

              {/* Unconfigured Activities Section */}
              {sortedVideoActivities.unconfigured.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mt-6">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg text-muted-foreground">
                      Non configurées ({sortedVideoActivities.unconfigured.length})
                    </h3>
                  </div>
                  
                  {sortedVideoActivities.unconfigured.map(activity => (
                    <ActivityCard 
                      key={activity.id}
                      activity={activity}
                      savedUrl={null}
                      currentUrl={getCurrentUrl(activity.id)}
                      hasUnsavedChanges={videoUrls[activity.id] !== undefined && videoUrls[activity.id] !== ''}
                      isSaving={savingActivity === activity.id}
                      onUrlChange={handleUrlChange}
                      onSave={handleSave}
                      onDelete={handleDelete}
                    />
                  ))}
                </>
              )}
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

// Extracted Activity Card Component
interface ActivityCardProps {
  activity: ActivityContent;
  savedUrl: string | null;
  currentUrl: string;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onUrlChange: (activityId: string, url: string) => void;
  onSave: (activity: ActivityContent) => void;
  onDelete: (activityId: string) => void;
}

const ActivityCard = ({ 
  activity, 
  savedUrl, 
  currentUrl, 
  hasUnsavedChanges, 
  isSaving,
  onUrlChange,
  onSave,
  onDelete 
}: ActivityCardProps) => {
  const videoId = extractYouTubeVideoId(currentUrl);
  const hasCustomVideo = !!savedUrl;

  return (
    <Card className={`border-2 ${hasCustomVideo ? 'border-green-200 dark:border-green-800' : ''}`}>
      <CardContent className="p-4 space-y-4">
        {/* Activity Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasCustomVideo ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <Youtube className={`h-5 w-5 ${hasCustomVideo ? 'text-green-500' : 'text-red-500'}`} />
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

        {/* Saved URL Display (when configured) */}
        {hasCustomVideo && savedUrl && (
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            {extractYouTubeVideoId(savedUrl) && (
              <img 
                src={`https://img.youtube.com/vi/${extractYouTubeVideoId(savedUrl)}/default.jpg`}
                alt="Thumbnail"
                className="w-20 h-14 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">URL actuelle:</p>
              <a 
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline truncate block"
              >
                {savedUrl}
              </a>
            </div>
          </div>
        )}

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
              onChange={(e) => onUrlChange(activity.id, e.target.value)}
              className={hasUnsavedChanges ? 'border-yellow-500' : ''}
            />
          </div>
          <Button
            onClick={() => onSave(activity)}
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
              onClick={() => onDelete(activity.id)}
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
};
