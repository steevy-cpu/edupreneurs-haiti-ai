import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
// Content Editor - Lesson Review & Management
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Zap, BarChart3 } from "lucide-react";
import { LessonBrowser } from "@/components/content-editor/LessonBrowser";
import { LessonPreview } from "@/components/content-editor/LessonPreview";
import { YouTubeManager } from "@/components/content-editor/YouTubeManager";
import { LessonComments } from "@/components/content-editor/LessonComments";
import { BatchLessonGenerator } from "@/components/content-editor/BatchLessonGenerator";
import { SingleLessonGenerator } from "@/components/content-editor/SingleLessonGenerator";

const ContentEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAccess();
  }, []);

  // Load lesson from URL parameter
  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (lessonId && hasAccess) {
      loadLessonFromUrl(lessonId);
    }
  }, [searchParams, hasAccess]);

  const loadLessonFromUrl = async (lessonId: string) => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, subjects(id, name)')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedLesson(data);
      }
    } catch (error) {
      console.error('Error loading lesson from URL:', error);
      toast.error("Erreur lors du chargement de la leçon");
    }
  };

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      // Check if user has content editor role
      const { data: editorRole, error } = await supabase
        .from('content_editor_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking editor role:', error);
        toast.error("Erreur lors de la vérification des permissions");
        navigate("/dashboard");
        return;
      }

      if (!editorRole) {
        toast.error("Accès refusé - Vous n'avez pas les permissions nécessaires");
        navigate("/dashboard");
        return;
      }

      if (!['admin', 'editor', 'viewer'].includes(editorRole.role)) {
        toast.error("Accès refusé");
        navigate("/dashboard");
        return;
      }

      setHasAccess(true);
      toast.success("Bienvenue dans la révision des leçons");
    } catch (error) {
      console.error('Access check error:', error);
      toast.error("Erreur lors de la vérification des permissions");
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLesson = async () => {
    if (!selectedLesson) {
      console.warn('⚠️ No lesson selected, cannot refresh');
      return;
    }
    
    try {
      console.log('🔄 Refreshing lesson data for:', selectedLesson.id);
      const { data, error } = await supabase
        .from('lessons')
        .select('*, subjects(id, name)')
        .eq('id', selectedLesson.id)
        .single();

      if (error) throw error;
      
      console.log('✅ Lesson refreshed successfully:', {
        id: data.id,
        title: data.title,
        hasQuiz: !!data.quiz_final,
        hasYouTube: !!data.youtube_url,
        hasActivities: !!data.activites_interactives,
        hasObjectif: !!data.objectif,
        hasIntroduction: !!data.introduction,
        hasContenu: !!data.contenu,
        hasExemples: !!data.exemples_exercices
      });
      
      setSelectedLesson(data);
      setRefreshKey(prev => prev + 1); // Force re-render
    } catch (error) {
      console.error('❌ Error refreshing lesson:', error);
      toast.error("Erreur lors du rafraîchissement");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate("/ai-analytics")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics IA
            </Button>
          </div>
          
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-none">
            <CardHeader className="p-6 md:p-8">
              <CardTitle className="text-2xl md:text-3xl lg:text-4xl flex items-center gap-3">
                <BookOpen className="text-primary h-8 w-8" />
                Révision des Leçons
              </CardTitle>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                Révisez le contenu, ajoutez des vidéos YouTube et laissez des commentaires
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <div className="max-w-[1600px] mx-auto">
          <Tabs defaultValue="review" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
              <TabsTrigger value="review">
                <BookOpen className="mr-2 h-4 w-4" />
                Révision
              </TabsTrigger>
              <TabsTrigger value="batch">
                <Zap className="mr-2 h-4 w-4" />
                Génération par lot
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Lesson Browser - Left Sidebar */}
                <div className="lg:col-span-4 h-[calc(100vh-280px)] min-h-[600px] max-h-[800px]">
                  <LessonBrowser
                    onSelectLesson={(lesson) => {
                      console.log('✅ Lesson selected:', lesson);
                      setSelectedLesson(lesson);
                    }}
                    selectedLesson={selectedLesson}
                  />
                </div>

                {/* Content - Right Column */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Single Lesson Generator */}
                  {selectedLesson && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Génération IA pour cette leçon</h3>
                            <p className="text-sm text-muted-foreground">
                              Générez automatiquement le contenu de toutes les sections
                            </p>
                          </div>
                          <SingleLessonGenerator 
                            lesson={selectedLesson}
                            onComplete={refreshLesson}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Lesson Preview - Student View */}
                  <LessonPreview 
                    key={`lesson-${selectedLesson?.id}-refresh-${refreshKey}`} 
                    lesson={selectedLesson} 
                  />

                  {/* YouTube Manager and Comments */}
                  <div className="grid grid-cols-1 gap-6">
                    <YouTubeManager 
                      lesson={selectedLesson}
                      onUpdate={refreshLesson}
                    />
                    <LessonComments lesson={selectedLesson} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="batch">
              <BatchLessonGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
