import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
// Content Editor - Lesson Review & Management
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, BookMarked, Zap, BarChart3, Sparkles, GraduationCap, Youtube, CheckCircle2 } from "lucide-react";
import { LessonBrowser } from "@/components/content-editor/LessonBrowser";
import { LessonPreview } from "@/components/content-editor/LessonPreview";
import { YouTubeManager } from "@/components/content-editor/YouTubeManager";
import { LessonComments } from "@/components/content-editor/LessonComments";
import { SingleLessonGenerator } from "@/components/content-editor/SingleLessonGenerator";
import { CreateMatiereDialog } from "@/components/content-editor/CreateMatiereDialog";
import { ExamAdminPage } from "@/features/exams/admin";
import { PassionVideoManager } from "@/components/content-editor/PassionVideoManager";
import { CurriculumAnalyzer } from "@/components/content-editor/CurriculumAnalyzer";
import { LessonImageManager } from "@/components/content-editor/LessonImageManager";
import { LessonValidationPanel } from "@/components/content-editor/LessonValidationPanel";
import { BatchGenerationValidation } from "@/components/content-editor/BatchGenerationValidation";
import { DailyWordsManager } from "@/components/content-editor/DailyWordsManager";
import { EbookManager } from "@/components/content-editor/EbookManager";

const CONTENT_EDITOR_STORAGE_KEY = 'content_editor_preferences';

interface EditorPreferences {
  activeTab: string;
  lastLessonId?: string;
}

const getStoredPreferences = (): EditorPreferences => {
  try {
    const saved = localStorage.getItem(CONTENT_EDITOR_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return { activeTab: 'review' };
};

const ContentEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [subjectLessons, setSubjectLessons] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreateMatiere, setShowCreateMatiere] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => getStoredPreferences().activeTab);

  const savePreferences = (tab: string, lessonId?: string) => {
    const prefs: EditorPreferences = {
      activeTab: tab,
      lastLessonId: lessonId || selectedLesson?.id
    };
    localStorage.setItem(CONTENT_EDITOR_STORAGE_KEY, JSON.stringify(prefs));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    savePreferences(value);
  };

  useEffect(() => {
    checkAccess();
  }, []);

  // Load lesson from URL parameter or localStorage
  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (lessonId && hasAccess) {
      loadLessonFromUrl(lessonId);
    } else if (hasAccess && !selectedLesson) {
      // Try to load last lesson from localStorage
      const prefs = getStoredPreferences();
      if (prefs.lastLessonId) {
        loadLessonFromUrl(prefs.lastLessonId);
      }
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
        navigate("/auth/login");
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
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateMatiere(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Créer une matière (IA)
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/ai-analytics")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics IA
              </Button>
            </div>
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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-[1200px]">
              <TabsTrigger value="review">
                <BookOpen className="mr-2 h-4 w-4" />
                Révision
              </TabsTrigger>
              <TabsTrigger value="batch">
                <Zap className="mr-2 h-4 w-4" />
                Génération
              </TabsTrigger>
              <TabsTrigger value="exams">
                <GraduationCap className="mr-2 h-4 w-4" />
                Examens
              </TabsTrigger>
              <TabsTrigger value="passion-videos">
                <Youtube className="mr-2 h-4 w-4" />
                Passions
              </TabsTrigger>
              <TabsTrigger value="daily-words">
                <Sparkles className="mr-2 h-4 w-4" />
                Mots du Jour
              </TabsTrigger>
              <TabsTrigger value="ebooks">
                <BookMarked className="mr-2 h-4 w-4" />
                Bibliothèque
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Lesson Browser - Left Sidebar */}
                <div className="lg:col-span-4 h-[calc(100vh-280px)] min-h-[600px] max-h-[800px]">
                  <LessonBrowser
                    onSelectLesson={async (lesson) => {
                      console.log('✅ Lesson selected:', lesson);
                      try {
                        const { data, error } = await supabase
                          .from('lessons')
                          .select('*, subjects(id, name)')
                          .eq('id', lesson.id)
                          .single();
                        
                        if (error) throw error;
                        if (data) {
                          setSelectedLesson(data);
                          savePreferences(activeTab, data.id); // Save lesson to localStorage
                          
                          // Fetch all lessons for this subject for CurriculumAnalyzer
                          const { data: allLessons } = await supabase
                            .from('lessons')
                            .select('id, title, slug')
                            .eq('subject_id', data.subject_id);
                          setSubjectLessons(allLessons || []);
                        }
                      } catch (error) {
                        console.error('Error loading full lesson:', error);
                        toast.error("Erreur lors du chargement de la leçon");
                      }
                    }}
                    selectedLesson={selectedLesson}
                    refreshKey={refreshKey}
                  />
                </div>

                {/* Content - Right Column */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Curriculum Analyzer - Subject Level */}
                  {selectedLesson?.subjects && (
                    <CurriculumAnalyzer
                      subjectId={selectedLesson.subjects.id}
                      subjectName={selectedLesson.subjects.name}
                      gradeLevel={selectedLesson.grade_level}
                      existingLessons={subjectLessons}
                    />
                  )}

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

                  {/* Lesson Validation Panel - Quick validation for current lesson */}
                  <LessonValidationPanel
                    key={`validation-${selectedLesson?.id}-refresh-${refreshKey}`}
                    lesson={selectedLesson}
                    onRefresh={refreshLesson}
                  />

                  {/* Image Manager */}
                  {selectedLesson && (
                    <LessonImageManager
                      lessonId={selectedLesson.id}
                      lessonTitle={selectedLesson.title}
                      contenu={selectedLesson.contenu}
                      exemplesExercices={selectedLesson.exemples_exercices}
                      onContentUpdate={async (field, newContent) => {
                        await supabase
                          .from('lessons')
                          .update({ [field]: newContent })
                          .eq('id', selectedLesson.id);
                        refreshLesson();
                      }}
                    />
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
              <BatchGenerationValidation />
            </TabsContent>

            <TabsContent value="exams">
              <ExamAdminPage />
            </TabsContent>

            <TabsContent value="passion-videos">
              <PassionVideoManager />
            </TabsContent>

            <TabsContent value="daily-words">
              <DailyWordsManager />
            </TabsContent>

            <TabsContent value="ebooks">
              <EbookManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateMatiereDialog 
        open={showCreateMatiere} 
        onOpenChange={setShowCreateMatiere}
        onMatiereCreated={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
};

export default ContentEditor;
