import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Trash2, Youtube, Music, Palette, Brain, BookOpen, CheckCircle2, AlertCircle, ExternalLink, Video, ChevronRight, Plus, Edit2, FolderOpen, Ban, Unlock, Film } from "lucide-react";
import { useAllPassionVideos, useSavePassionVideo, useDeletePassionVideo, type PassionVideo } from "@/hooks/usePassionVideos";
import { 
  useAllPassionRecommendedVideos, 
  useSavePassionRecommendedVideo, 
  useDeletePassionRecommendedVideo,
  useBannedYouTubeVideos,
  useUnbanYouTubeVideo,
  type PassionRecommendedVideo,
  type BannedYouTubeVideo
} from "@/hooks/usePassionRecommendedVideos";
import { musicActivities, artsActivities, chessActivities, literatureActivities, type ActivityContent, type ModuleContent } from "@/data/passionActivities";

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

// Tree structure types
interface TreeModule extends ModuleContent {
  videoActivities: ActivityContent[];
  configuredCount: number;
  totalCount: number;
  configuredVideos: PassionVideo[];
}

interface TreeCategory {
  id: string;
  title: string;
  emoji: string;
  modules: TreeModule[];
  configuredCount: number;
  totalCount: number;
}

// Recommended videos tree types
interface RecommendedTreeModule {
  id: string;
  title: string;
  videos: PassionRecommendedVideo[];
}

interface RecommendedTreeCategory {
  id: string;
  title: string;
  emoji: string;
  modules: RecommendedTreeModule[];
  totalVideos: number;
}

export const PassionVideoManager = () => {
  const [activeTab, setActiveTab] = useState<string>('activities');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [savingActivity, setSavingActivity] = useState<string | null>(null);
  const [deletingFromTree, setDeletingFromTree] = useState<string | null>(null);
  
  // Recommended videos state
  const [recCategory, setRecCategory] = useState<string>('');
  const [recModule, setRecModule] = useState<string>('');
  const [recUrl, setRecUrl] = useState<string>('');
  const [recTitle, setRecTitle] = useState<string>('');
  const [savingRecommended, setSavingRecommended] = useState(false);
  const [deletingRecommended, setDeletingRecommended] = useState<string | null>(null);
  
  // Banned videos state
  const [unbanningVideo, setUnbanningVideo] = useState<string | null>(null);
  
  const configSectionRef = useRef<HTMLDivElement>(null);
  const recSectionRef = useRef<HTMLDivElement>(null);

  // Activity videos hooks
  const { data: allVideos, isLoading } = useAllPassionVideos();
  const saveVideo = useSavePassionVideo();
  const deleteVideo = useDeletePassionVideo();
  
  // Recommended videos hooks
  const { data: allRecommendedVideos, isLoading: loadingRecommended } = useAllPassionRecommendedVideos();
  const saveRecommendedVideo = useSavePassionRecommendedVideo();
  const deleteRecommendedVideo = useDeletePassionRecommendedVideo();
  
  // Banned videos hooks
  const { data: bannedVideos, isLoading: loadingBanned } = useBannedYouTubeVideos();
  const unbanVideo = useUnbanYouTubeVideo();

  // Build hierarchical tree structure for activity videos
  const categoryTree = useMemo((): TreeCategory[] => {
    return passionCategories.map(category => {
      const modules = Object.values(category.activities).map((module: ModuleContent) => {
        const videoActivities = module.activities.filter(a => a.type === 'video');
        const configuredVideos = allVideos?.filter(
          (v: PassionVideo) => 
            v.category_id === category.id && 
            v.module_id === module.id
        ) || [];
        
        return {
          ...module,
          videoActivities,
          configuredCount: configuredVideos.length,
          totalCount: videoActivities.length,
          configuredVideos
        };
      });
      
      const totalConfigured = modules.reduce((sum, m) => sum + m.configuredCount, 0);
      const totalVideos = modules.reduce((sum, m) => sum + m.totalCount, 0);
      
      return {
        id: category.id,
        title: category.title,
        emoji: category.emoji,
        modules,
        configuredCount: totalConfigured,
        totalCount: totalVideos
      };
    });
  }, [allVideos]);

  // Build tree structure for recommended videos
  const recommendedTree = useMemo((): RecommendedTreeCategory[] => {
    return passionCategories.map(category => {
      const modules = Object.values(category.activities).map((module: ModuleContent) => {
        const videos = allRecommendedVideos?.filter(
          (v: PassionRecommendedVideo) => 
            v.category_id === category.id && 
            v.module_id === module.id
        ) || [];
        
        return {
          id: module.id,
          title: module.title,
          videos
        };
      });
      
      const totalVideos = modules.reduce((sum, m) => sum + m.videos.length, 0);
      
      return {
        id: category.id,
        title: category.title,
        emoji: category.emoji,
        modules,
        totalVideos
      };
    });
  }, [allRecommendedVideos]);

  // Get modules for selected category
  const modules = useMemo(() => {
    if (!selectedCategory) return [];
    const category = passionCategories.find(c => c.id === selectedCategory);
    if (!category) return [];
    return Object.values(category.activities);
  }, [selectedCategory]);

  // Get modules for recommended videos category
  const recModules = useMemo(() => {
    if (!recCategory) return [];
    const category = passionCategories.find(c => c.id === recCategory);
    if (!category) return [];
    return Object.values(category.activities);
  }, [recCategory]);

  // Get video activities for selected module
  const videoActivities = useMemo(() => {
    if (!selectedCategory || !selectedModule) return [];
    const category = passionCategories.find(c => c.id === selectedCategory);
    if (!category) return [];
    const module = category.activities[selectedModule];
    if (!module) return [];
    return module.activities.filter(a => a.type === 'video');
  }, [selectedCategory, selectedModule]);

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

  // Handle quick select from tree view - navigate to configuration section
  const handleQuickSelect = (categoryId: string, moduleId: string) => {
    setSelectedCategory(categoryId);
    setSelectedModule(moduleId);
    setVideoUrls({});
    
    // Scroll to configuration section
    setTimeout(() => {
      configSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle delete from tree view
  const handleDeleteFromTree = async (video: PassionVideo) => {
    setDeletingFromTree(video.id);
    try {
      await deleteVideo.mutateAsync({
        categoryId: video.category_id,
        moduleId: video.module_id,
        activityId: video.activity_id
      });
    } finally {
      setDeletingFromTree(null);
    }
  };

  // Check if an activity is configured
  const isActivityConfigured = (categoryId: string, moduleId: string, activityId: string): PassionVideo | undefined => {
    return allVideos?.find(
      (v: PassionVideo) => 
        v.category_id === categoryId && 
        v.module_id === moduleId && 
        v.activity_id === activityId
    );
  };

  // Handle save recommended video
  const handleSaveRecommended = async () => {
    if (!recCategory || !recModule || !recUrl.trim()) return;
    
    const videoId = extractYouTubeVideoId(recUrl);
    if (!videoId) {
      return;
    }
    
    setSavingRecommended(true);
    try {
      await saveRecommendedVideo.mutateAsync({
        categoryId: recCategory,
        moduleId: recModule,
        youtubeUrl: recUrl.trim(),
        videoId,
        title: recTitle || undefined,
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      });
      setRecUrl('');
      setRecTitle('');
    } finally {
      setSavingRecommended(false);
    }
  };

  // Handle delete recommended video
  const handleDeleteRecommended = async (video: PassionRecommendedVideo) => {
    setDeletingRecommended(video.id);
    try {
      await deleteRecommendedVideo.mutateAsync(video.id);
    } finally {
      setDeletingRecommended(null);
    }
  };

  // Handle quick select for recommended videos
  const handleRecQuickSelect = (categoryId: string, moduleId: string) => {
    setRecCategory(categoryId);
    setRecModule(moduleId);
    setActiveTab('recommended');
    
    setTimeout(() => {
      recSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle unban video
  const handleUnban = async (videoId: string) => {
    setUnbanningVideo(videoId);
    try {
      await unbanVideo.mutateAsync(videoId);
    } finally {
      setUnbanningVideo(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalActivityVideos = allVideos?.length || 0;
  const totalPossibleActivityVideos = categoryTree.reduce((sum, cat) => sum + cat.totalCount, 0);
  const totalRecommendedVideos = allRecommendedVideos?.length || 0;
  const totalBannedVideos = bannedVideos?.length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Vidéos Passion - Vue d'ensemble
              </CardTitle>
              <CardDescription className="mt-1">
                Gérez les vidéos d'activités, recommandées et bannies
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Film className="h-3 w-3 mr-1" />
                {totalActivityVideos}/{totalPossibleActivityVideos} activités
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Youtube className="h-3 w-3 mr-1" />
                {totalRecommendedVideos} recommandées
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Ban className="h-3 w-3 mr-1" />
                {totalBannedVideos} bannies
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            <span className="hidden sm:inline">Vidéos d'Activités</span>
            <span className="sm:hidden">Activités</span>
          </TabsTrigger>
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Youtube className="h-4 w-4" />
            <span className="hidden sm:inline">Vidéos Recommandées</span>
            <span className="sm:hidden">Recommandées</span>
          </TabsTrigger>
          <TabsTrigger value="banned" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            <span className="hidden sm:inline">Vidéos Bannies</span>
            <span className="sm:hidden">Bannies</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Activity Videos */}
        <TabsContent value="activities" className="space-y-6">
          {/* Category Stats */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-3">
                {categoryTree.map(category => {
                  const allConfigured = category.configuredCount >= category.totalCount;
                  const someConfigured = category.configuredCount > 0 && category.configuredCount < category.totalCount;
                  
                  return (
                    <div
                      key={category.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        allConfigured 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : someConfigured
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            : 'bg-muted border-border hover:bg-muted/80'
                      }`}
                      onClick={() => handleQuickSelect(category.id, category.modules[0]?.id || '')}
                    >
                      <span className="text-lg">{category.emoji}</span>
                      <span className="font-medium">{category.title}</span>
                      <Badge 
                        variant={category.configuredCount > 0 ? "default" : "outline"}
                        className={
                          allConfigured 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : someConfigured 
                              ? 'bg-yellow-500 hover:bg-yellow-600' 
                              : ''
                        }
                      >
                        {category.configuredCount}/{category.totalCount}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Hierarchical Tree View */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Structure des Passions
              </CardTitle>
              <CardDescription>
                Vue hiérarchique: Catégorie → Module → Activités vidéo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {categoryTree.map(category => (
                  <AccordionItem key={category.id} value={category.id} className="border rounded-lg mb-2 px-2">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xl">{category.emoji}</span>
                        <span className="font-semibold text-base">{category.title}</span>
                        <Badge 
                          variant={category.configuredCount > 0 ? "default" : "outline"}
                          className={`ml-auto mr-2 ${
                            category.configuredCount >= category.totalCount 
                              ? 'bg-green-500' 
                              : category.configuredCount > 0 
                                ? 'bg-yellow-500' 
                                : ''
                          }`}
                        >
                          {category.configuredCount}/{category.totalCount} vidéos
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <div className="space-y-2 ml-4">
                        {category.modules.map(module => (
                          <div key={module.id} className="border rounded-lg overflow-hidden">
                            {/* Module Header */}
                            <div 
                              className={`flex items-center justify-between p-3 ${
                                module.configuredCount >= module.totalCount 
                                  ? 'bg-green-50 dark:bg-green-900/20' 
                                  : module.configuredCount > 0 
                                    ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                                    : 'bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{module.title}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    module.configuredCount >= module.totalCount 
                                      ? 'border-green-500 text-green-700 dark:text-green-400' 
                                      : module.configuredCount > 0 
                                        ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' 
                                        : ''
                                  }`}
                                >
                                  {module.configuredCount}/{module.totalCount}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickSelect(category.id, module.id)}
                                className="text-xs"
                              >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Gérer
                              </Button>
                            </div>
                            
                            {/* Module Activities */}
                            <div className="divide-y">
                              {module.videoActivities.map(activity => {
                                const configuredVideo = isActivityConfigured(category.id, module.id, activity.id);
                                const videoId = configuredVideo?.youtube_url ? extractYouTubeVideoId(configuredVideo.youtube_url) : null;
                                const isDeleting = deletingFromTree === configuredVideo?.id;
                                
                                return (
                                  <div 
                                    key={activity.id} 
                                    className="flex items-center gap-3 p-3 pl-8 text-sm hover:bg-muted/30"
                                  >
                                    {/* Status Icon */}
                                    {configuredVideo ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                    
                                    {/* Activity Title */}
                                    <span className={`flex-1 ${configuredVideo ? 'font-medium' : 'text-muted-foreground'}`}>
                                      {activity.title}
                                    </span>
                                    
                                    {/* Configured Video Info */}
                                    {configuredVideo && videoId && (
                                      <div className="flex items-center gap-2">
                                        <img 
                                          src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                          alt="Thumbnail"
                                          className="w-12 h-8 object-cover rounded"
                                        />
                                        <a 
                                          href={configuredVideo.youtube_url || '#'} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline flex items-center gap-1"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteFromTree(configuredVideo)}
                                          disabled={isDeleting}
                                        >
                                          {isDeleting ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                    
                                    {/* Not Configured - Quick Add Button */}
                                    {!configuredVideo && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => handleQuickSelect(category.id, module.id)}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Configurer
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Detailed Configuration Section */}
          <Card ref={configSectionRef} id="video-config-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                Configuration Détaillée
              </CardTitle>
              <CardDescription>
                Sélectionnez une catégorie et un module pour configurer les vidéos
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
                      {categoryTree.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2 w-full">
                            <span>{category.emoji}</span>
                            <span className="flex-1">{category.title}</span>
                            <Badge 
                              variant={category.configuredCount > 0 ? "default" : "outline"} 
                              className={`ml-2 ${
                                category.configuredCount >= category.totalCount 
                                  ? 'bg-green-500' 
                                  : category.configuredCount > 0 
                                    ? 'bg-yellow-500' 
                                    : ''
                              }`}
                            >
                              {category.configuredCount}/{category.totalCount}
                            </Badge>
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
                  Sélectionnez une catégorie pour commencer, ou utilisez la vue hiérarchique ci-dessus
                </div>
              )}

              {selectedCategory && !selectedModule && (
                <div className="text-center py-8 text-muted-foreground">
                  Sélectionnez un module pour voir les activités vidéo
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Recommended Videos */}
        <TabsContent value="recommended" className="space-y-6">
          {loadingRecommended ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Recommended Videos Tree View */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    Vidéos Recommandées par Module
                  </CardTitle>
                  <CardDescription>
                    Ces vidéos apparaissent dans la section "Vidéos recommandées" de PassionDiscovery
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {recommendedTree.map(category => (
                      <AccordionItem key={category.id} value={category.id} className="border rounded-lg mb-2 px-2">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-xl">{category.emoji}</span>
                            <span className="font-semibold text-base">{category.title}</span>
                            <Badge 
                              variant={category.totalVideos > 0 ? "default" : "outline"}
                              className={`ml-auto mr-2 ${category.totalVideos > 0 ? 'bg-primary' : ''}`}
                            >
                              {category.totalVideos} vidéos
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-3">
                          <div className="space-y-2 ml-4">
                            {category.modules.map(module => (
                              <div key={module.id} className="border rounded-lg overflow-hidden">
                                {/* Module Header */}
                                <div className={`flex items-center justify-between p-3 ${
                                  module.videos.length > 0 
                                    ? 'bg-primary/10' 
                                    : 'bg-muted/50'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{module.title}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {module.videos.length} vidéos
                                    </Badge>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRecQuickSelect(category.id, module.id)}
                                    className="text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Ajouter
                                  </Button>
                                </div>
                                
                                {/* Module Videos */}
                                {module.videos.length > 0 && (
                                  <div className="divide-y">
                                    {module.videos.map(video => {
                                      const isDeleting = deletingRecommended === video.id;
                                      
                                      return (
                                        <div 
                                          key={video.id} 
                                          className="flex items-center gap-3 p-3 pl-8 text-sm hover:bg-muted/30"
                                        >
                                          {video.thumbnail && (
                                            <img 
                                              src={video.thumbnail}
                                              alt={video.title || 'Video'}
                                              className="w-16 h-10 object-cover rounded"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{video.title || 'Sans titre'}</p>
                                            <p className="text-xs text-muted-foreground truncate">{video.channel_title}</p>
                                          </div>
                                          <a 
                                            href={video.youtube_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </a>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteRecommended(video)}
                                            disabled={isDeleting}
                                          >
                                            {isDeleting ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-3 w-3" />
                                            )}
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Add Recommended Video Form */}
              <Card ref={recSectionRef}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Ajouter une vidéo recommandée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select 
                        value={recCategory} 
                        onValueChange={(value) => {
                          setRecCategory(value);
                          setRecModule('');
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
                        value={recModule} 
                        onValueChange={setRecModule}
                        disabled={!recCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un module" />
                        </SelectTrigger>
                        <SelectContent>
                          {recModules.map(module => (
                            <SelectItem key={module.id} value={module.id}>
                              {module.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>URL YouTube</Label>
                    <Input
                      placeholder="https://youtube.com/watch?v=..."
                      value={recUrl}
                      onChange={(e) => setRecUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Titre (optionnel)</Label>
                    <Input
                      placeholder="Titre de la vidéo"
                      value={recTitle}
                      onChange={(e) => setRecTitle(e.target.value)}
                    />
                  </div>

                  {/* Preview */}
                  {recUrl && extractYouTubeVideoId(recUrl) && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black max-w-md">
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeVideoId(recUrl)}`}
                        title="Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {recUrl && !extractYouTubeVideoId(recUrl) && (
                    <p className="text-sm text-destructive">
                      URL YouTube invalide
                    </p>
                  )}

                  <Button
                    onClick={handleSaveRecommended}
                    disabled={!recCategory || !recModule || !recUrl.trim() || !extractYouTubeVideoId(recUrl) || savingRecommended}
                    className="w-full sm:w-auto"
                  >
                    {savingRecommended ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab 3: Banned Videos */}
        <TabsContent value="banned" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                Vidéos Bannies ({totalBannedVideos})
              </CardTitle>
              <CardDescription>
                Ces vidéos ne s'affichent plus dans les résultats de recherche YouTube
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingBanned ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bannedVideos && bannedVideos.length > 0 ? (
                <div className="space-y-2">
                  {bannedVideos.map((video: BannedYouTubeVideo) => {
                    const isUnbanning = unbanningVideo === video.video_id;
                    
                    return (
                      <div 
                        key={video.id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <img 
                          src={`https://img.youtube.com/vi/${video.video_id}/default.jpg`}
                          alt="Thumbnail"
                          className="w-20 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm text-muted-foreground">{video.video_id}</p>
                          <p className="text-sm">{video.reason || 'Aucune raison spécifiée'}</p>
                          <p className="text-xs text-muted-foreground">
                            Banni le {video.banned_at ? new Date(video.banned_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </p>
                        </div>
                        <a 
                          href={`https://youtube.com/watch?v=${video.video_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnban(video.video_id)}
                          disabled={isUnbanning}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          {isUnbanning ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Unlock className="h-4 w-4 mr-1" />
                          )}
                          Débannir
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune vidéo bannie
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
