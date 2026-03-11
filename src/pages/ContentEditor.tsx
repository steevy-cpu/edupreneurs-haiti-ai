import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
// Content Editor - Lesson Review & Management
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, BookMarked, Zap, BarChart3, Sparkles, GraduationCap, Youtube, CheckCircle2, Music } from "lucide-react";
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
// DailyWordsManager removed — management consolidated into Control Center
import { EbookManager } from "@/components/content-editor/EbookManager";
import { ContentQualityDashboard } from "@/components/content-editor/ContentQualityDashboard";
import { StudyMusicManager } from "@/components/content-editor/StudyMusicManager";
import { BatchOperationsPanel } from "@/components/content-editor/BatchOperationsPanel";
import type { BatchPanelData } from "@/components/content-editor/BatchOperationsPanel";
import { ContentEditorPermissionsProvider } from "@/contexts/ContentEditorPermissionsContext";
// Revision panel — workflow, version history, and change log for selected lessons
import { WorkflowManagement } from "@/components/content-editor/WorkflowManagement";
import { VersionHistory } from "@/components/content-editor/VersionHistory";
import { ChangeLog } from "@/components/content-editor/ChangeLog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [showCreateMatiere, setShowCreateMatiere] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => getStoredPreferences().activeTab);
  // Batch data lifted from LessonBrowser to feed BatchOperationsPanel
  const [batchData, setBatchData] = useState<BatchPanelData | null>(null);
  // Track latest loadSubjects trigger so BatchOperationsPanel can request a refresh
  const [browserRefreshKey, setBrowserRefreshKey] = useState(0);

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

  const refreshDashboard = () => {
    setDashboardRefreshKey(prev => prev + 1);
  };

  const refreshLesson = async () => {
    if (!selectedLesson) {
      console.warn('⚠️ No lesson selected, cannot refresh');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, subjects(id, name)')
        .eq('id', selectedLesson.id)
        .single();

      if (error) throw error;
      
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
    // Provider mounts only after hasAccess is confirmed — single permission check for all children
    <ContentEditorPermissionsProvider>
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between gap-2 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <BookOpen className="text-primary h-6 w-6 shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg font-semibold truncate">Révision des Leçons</h1>
                <p className="text-xs text-muted-foreground hidden sm:block truncate">
                  Révisez le contenu, ajoutez des vidéos YouTube et laissez des commentaires
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setShowCreateMatiere(true)}
                size="sm"
              >
                <Sparkles className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Créer une matière (IA)</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/ai-analytics")}
              >
                <BarChart3 className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Analytics IA</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="max-w-[1600px] mx-auto">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="flex w-full overflow-x-auto">
              <TabsTrigger value="review" className="flex-shrink-0 gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Révision</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex-shrink-0 gap-1.5">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Qualité</span>
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex-shrink-0 gap-1.5">
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Génération</span>
              </TabsTrigger>
              <TabsTrigger value="exams" className="flex-shrink-0 gap-1.5">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Examens</span>
              </TabsTrigger>
              <TabsTrigger value="passion-videos" className="flex-shrink-0 gap-1.5">
                <Youtube className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Passions</span>
              </TabsTrigger>
              <TabsTrigger value="daily-words" className="flex-shrink-0 gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Mots du Jour</span>
              </TabsTrigger>
              <TabsTrigger value="ebooks" className="flex-shrink-0 gap-1.5">
                <BookMarked className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Bibliothèque</span>
              </TabsTrigger>
              <TabsTrigger value="study-music" className="flex-shrink-0 gap-1.5">
                <Music className="h-4 w-4" />
                <span className="hidden md:inline text-xs">Musique</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="review" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
                {/* Left Sidebar: BatchOperationsPanel stacked above LessonBrowser */}
                <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-3 h-[calc(100vh-200px)]">
                  <BatchOperationsPanel
                    data={batchData}
                    onRefresh={() => setBrowserRefreshKey(prev => prev + 1)}
                    onDashboardRefresh={refreshDashboard}
                  />
                  <div className="flex-1 min-h-0">
                  <LessonBrowser
                    onSelectLesson={async (lesson) => {
                      try {
                        const { data, error } = await supabase
                          .from('lessons')
                          .select('*, subjects(id, name)')
                          .eq('id', lesson.id)
                          .single();
                        
                        if (error) throw error;
                        if (data) {
                          setSelectedLesson(data);
                          savePreferences(activeTab, data.id);
                          
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
                    refreshKey={browserRefreshKey || refreshKey}
                    onDashboardRefresh={refreshDashboard}
                    onBatchDataUpdate={setBatchData}
                  />
                  </div>
                </div>


                {/* Content - Right Column */}
                <div className="md:col-span-7 lg:col-span-8 space-y-4">
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

                  {/* Revision Panel — visible only when a lesson is selected */}
                  {selectedLesson && (
                    <Accordion type="multiple" defaultValue={["workflow"]} className="space-y-0">
                      {/* Workflow section — open by default, most actionable */}
                      <AccordionItem value="workflow" className="border rounded-lg px-0 mb-2">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <span className="font-semibold text-sm">Workflow</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <WorkflowManagement
                            selectedLesson={selectedLesson}
                            onUpdate={refreshLesson}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Version history section — collapsed by default */}
                      <AccordionItem value="versions" className="border rounded-lg px-0 mb-2">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <span className="font-semibold text-sm">Historique des versions</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <VersionHistory
                            selectedLesson={selectedLesson}
                            onRestore={refreshLesson}
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Change log section — collapsed by default */}
                      <AccordionItem value="changelog" className="border rounded-lg px-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <span className="font-semibold text-sm">Journal des modifications</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <ChangeLog selectedLesson={selectedLesson} />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quality">
              <ContentQualityDashboard key={`dashboard-${dashboardRefreshKey}`} refreshKey={dashboardRefreshKey} />
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
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gestion déplacée</h3>
                  <p className="text-muted-foreground mb-4">
                    La gestion des mots du jour a été déplacée vers le Centre de Contrôle.
                  </p>
                  <Button onClick={() => navigate('/control-center')}>
                    Ouvrir le Centre de Contrôle
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ebooks">
              <EbookManager />
            </TabsContent>

            <TabsContent value="study-music">
              <StudyMusicManager />
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
    </ContentEditorPermissionsProvider>
  );
};

export default ContentEditor;
