import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import DOMPurify from "dompurify";
import {
  ChevronLeft,
  BookOpen,
  Lightbulb,
  ClipboardCheck,
  Palette,
  Award,
  Trophy,
  NotebookPen,
  Save,
  Gamepad2,
  Music,
  Heart
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EricChatbot } from "@/components/EricChatbot";

export default function ArtsLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activitiesContent, setActivitiesContent] = useState("");
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [quizContent, setQuizContent] = useState("");
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLessonData();
    loadPersonalNotes();
    fetchActivitiesContent();
    fetchQuizContent();
  }, [topicId]);

  const fetchLessonData = async () => {
    if (!topicId) return;
    
    setLoading(true);
    try {
      // First get the Arts subject ID
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'arts')
        .eq('grade_level', '7AF')
        .single();

      if (subjectError || !subjectData) {
        console.error('Error fetching subject:', subjectError);
        toast({
          title: "Erreur",
          description: "Impossible de charger le sujet",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Then get the lesson with subject filter
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', topicId)
        .eq('grade_level', '7AF')
        .eq('subject_id', subjectData.id)
        .eq('is_published', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching lesson:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la leçon",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setLessonData(data);
        setYoutubeUrl(data.youtube_url);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivitiesContent = async () => {
    if (!topicId) return;
    
    setIsLoadingActivities(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('activites_interactives')
        .eq('slug', topicId)
        .eq('grade_level', '7AF')
        .maybeSingle();

      if (data?.activites_interactives) {
        setActivitiesContent(data.activites_interactives);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const fetchQuizContent = async () => {
    if (!topicId) return;
    
    setIsLoadingQuiz(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('quiz_final')
        .eq('slug', topicId)
        .eq('grade_level', '7AF')
        .maybeSingle();

      if (data?.quiz_final) {
        setQuizContent(data.quiz_final);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', `arts-${topicId}`)
        .maybeSingle();

      if (!error && data) {
        setPersonalNotes((data as any)?.notes || "");
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    setIsSavingNotes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('lesson_notes' as any)
        .upsert({
          user_id: user.id,
          lesson_id: `arts-${topicId}`,
          notes: personalNotes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      toast({
        title: "Notes sauvegardées ! 📝",
        description: "Tes notes ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder tes notes.",
        variant: "destructive",
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const goldReward = 100;

      const { error: completionError } = await supabase
        .from('lesson_completions' as any)
        .upsert({
          user_id: user.id,
          lesson_slug: topicId,
          subject: 'arts',
          completed_at: new Date().toISOString(),
          score: 100
        }, {
          onConflict: 'user_id,lesson_slug,subject'
        });

      if (completionError) throw completionError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ gold_earned: (profile.gold_earned || 0) + goldReward })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setEarnedPoints(goldReward);
      setLessonCompleted(true);

      toast({
        title: "Leçon terminée ! 🎉",
        description: `Tu as gagné ${goldReward} pièces d'or !`,
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la leçon comme terminée.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-500/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-500/10 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Leçon non trouvée</h2>
          <Button onClick={() => navigate("/arts-course")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  const lessonIcon = topicId === 'introduction-arts-plastiques-haitiens' ? '🎨' : 
                     topicId === 'musique-traditionnelle-haitienne' ? '🎵' : '🇭🇹';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-500/10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate("/arts-course")} 
                variant="ghost" 
                size="sm"
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Arts</span>
              </Button>
              
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">7AF</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DownloadLessonButton 
                lessonData={{
                  title: lessonData.title,
                  objectif: lessonData.objectif,
                  introduction: lessonData.introduction,
                  contenu: lessonData.contenu,
                  exemples_exercices: lessonData.exemples_exercices,
                  youtube_url: lessonData.youtube_url,
                  grade_level: lessonData.grade_level,
                  lesson_number: lessonData.order_index
                }}
                personalNotes={personalNotes}
                subjectName="Arts 7AF"
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">{lessonIcon}</div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                {lessonData.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Arts & Culture
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Leçon {lessonData.order_index}
                </Badge>
              </div>
            </div>
          </div>

          {lessonData.objectif && (
            <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/20">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lessonData.objectif) }}
              />
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="introduction" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Introduction</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Contenu</span>
            </TabsTrigger>
            <TabsTrigger value="exercices" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Exercices</span>
            </TabsTrigger>
            <TabsTrigger value="activites" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Activités</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <NotebookPen className="w-4 h-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-6">
            <Card className="p-6">
              {lessonData.introduction ? (
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lessonData.introduction) }}
                />
              ) : (
                <p className="text-muted-foreground">Introduction en cours de rédaction...</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-6">
            <Card className="p-6">
              {lessonData.contenu ? (
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lessonData.contenu) }}
                />
              ) : (
                <p className="text-muted-foreground">Contenu en cours de rédaction...</p>
              )}
            </Card>

            <YouTubeVideoSection 
              lessonTitle={lessonData.title}
              objectives={lessonData.objectif || ''}
              gradeLevel="7AF"
              customYoutubeUrl={youtubeUrl || undefined}
              subject="arts"
            />
          </TabsContent>

          <TabsContent value="exercices" className="space-y-6">
            <Card className="p-6">
              {lessonData.exemples_exercices ? (
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lessonData.exemples_exercices) }}
                />
              ) : (
                <p className="text-muted-foreground">Exercices en cours de rédaction...</p>
              )}
            </Card>

            {!lessonCompleted && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleCompleteLesson}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                >
                  <Trophy className="w-5 h-5" />
                  Terminer la leçon
                </Button>
              </div>
            )}

            {lessonCompleted && (
              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Leçon terminée ! 🎉
                    </h3>
                    <p className="text-muted-foreground">
                      Tu as gagné {earnedPoints} pièces d'or !
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activites" className="space-y-6">
            {isLoadingActivities ? (
              <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                </div>
              </Card>
            ) : activitiesContent ? (
              <InteractiveActivitiesEnhanced 
                content={activitiesContent}
                isLoading={isLoadingActivities}
              />
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Aucune activité disponible</h3>
                  <p className="text-muted-foreground">
                    Les activités interactives n'ont pas encore été générées pour cette leçon.
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            {isLoadingQuiz ? (
              <Card className="p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                </div>
              </Card>
            ) : quizContent ? (
              <InteractiveQuiz 
                content={quizContent}
                isLoading={isLoadingQuiz}
              />
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Aucun quiz disponible</h3>
                  <p className="text-muted-foreground">
                    Le quiz final n'a pas encore été généré pour cette leçon.
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <NotebookPen className="w-5 h-5" />
                    Mes notes personnelles
                  </h3>
                  <Button 
                    onClick={savePersonalNotes}
                    disabled={isSavingNotes}
                    size="sm"
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingNotes ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
                <Textarea
                  placeholder="Écris tes notes ici... 📝"
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Tes notes sont privées et sauvegardées automatiquement.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
}
