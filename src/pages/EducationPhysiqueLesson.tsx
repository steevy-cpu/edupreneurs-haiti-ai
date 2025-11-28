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
  Dumbbell,
  Award,
  Trophy,
  NotebookPen,
  Save,
  Gamepad2,
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

export default function EducationPhysiqueLesson() {
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
      // First get the Éducation Physique subject ID
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'education-physique')
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
        if (data.youtube_url) {
          setYoutubeUrl(data.youtube_url);
        }
      } else {
        toast({
          title: "Leçon non trouvée",
          description: "Cette leçon n'existe pas ou n'est pas encore publiée",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in fetchLessonData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivitiesContent = async () => {
    if (!topicId) return;
    
    setIsLoadingActivities(true);
    try {
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'education-physique')
        .eq('grade_level', '7AF')
        .single();

      if (!subjectData) return;

      const { data } = await supabase
        .from('lessons')
        .select('activites_interactives')
        .eq('slug', topicId)
        .eq('subject_id', subjectData.id)
        .eq('is_published', true)
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
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'education-physique')
        .eq('grade_level', '7AF')
        .single();

      if (!subjectData) return;

      const { data } = await supabase
        .from('lessons')
        .select('quiz_final')
        .eq('slug', topicId)
        .eq('subject_id', subjectData.id)
        .eq('is_published', true)
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !topicId) return;

    const { data } = await supabase
      .from('lesson_notes')
      .select('notes')
      .eq('user_id', user.id)
      .eq('lesson_id', topicId)
      .maybeSingle();

    if (data) {
      setPersonalNotes(data.notes || "");
    }
  };

  const savePersonalNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !topicId) return;

    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: topicId,
          notes: personalNotes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      toast({
        title: "Notes sauvegardées",
        description: "Vos notes personnelles ont été enregistrées avec succès",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos notes",
        variant: "destructive",
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleQuizCompletion = async (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    const goldEarned = Math.round(percentage);
    
    setEarnedPoints(goldEarned);
    setLessonCompleted(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !topicId) return;

    try {
      // Save lesson completion
      await supabase
        .from('lesson_completions')
        .upsert({
          user_id: user.id,
          lesson_slug: topicId,
          subject: 'education-physique',
          score: percentage,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_slug,subject'
        });

      // Update user's gold
      const { data: profile } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ gold_earned: (profile.gold_earned || 0) + goldEarned })
          .eq('user_id', user.id);
      }

      toast({
        title: "🎉 Félicitations!",
        description: `Vous avez gagné ${goldEarned} pièces d'or!`,
      });
    } catch (error) {
      console.error('Error saving completion:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement de la leçon...</p>
        </div>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-xl text-muted-foreground">Leçon non trouvée</p>
          <Button onClick={() => navigate('/education-physique-course')} className="mt-4">
            Retour au cours
          </Button>
        </div>
      </div>
    );
  }

  const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'div', 'span', 'img'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt']
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-500/10">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/education-physique-course')}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour au cours
            </Button>
            <div className="flex items-center gap-3">
              <DownloadLessonButton 
                lessonData={{
                  title: lessonData.title,
                  objectif: lessonData.objectif || '',
                  introduction: lessonData.introduction || '',
                  contenu: lessonData.contenu || '',
                  exemples_exercices: lessonData.exemples_exercices || '',
                  grade_level: '7AF'
                }}
                subjectName="Éducation Physique"
              />
              {lessonCompleted && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white gap-1">
                  <Trophy className="w-4 h-4" />
                  +{earnedPoints} Or
                </Badge>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-8 space-y-4">
          <Badge variant="secondary" className="mb-2">
            <Dumbbell className="w-4 h-4 mr-2" />
            Éducation Physique - 7AF
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent hyphens-auto">
            {lessonData.title}
          </h1>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto gap-2 bg-muted/30 p-2">
            <TabsTrigger value="introduction" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Introduction
            </TabsTrigger>
            <TabsTrigger value="objectifs" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Objectifs
            </TabsTrigger>
            <TabsTrigger value="contenu" className="gap-2">
              <Dumbbell className="w-4 h-4" />
              Contenu
            </TabsTrigger>
            <TabsTrigger value="exercices" className="gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Exercices
            </TabsTrigger>
            <TabsTrigger value="activites" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              Activités
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Award className="w-4 h-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Introduction</h2>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHTML(lessonData.introduction || '<p>Contenu à venir...</p>') 
                    }}
                  />
                </div>
              </div>
            </Card>

            <YouTubeVideoSection 
              lessonTitle={lessonData.title}
              objectives={lessonData.objectif || ''}
              gradeLevel="7AF"
              customYoutubeUrl={youtubeUrl || undefined}
              subject="education-physique"
            />
          </TabsContent>

          <TabsContent value="objectifs" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Lightbulb className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Objectifs d'Apprentissage</h2>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHTML(lessonData.objectif || '<p>Objectifs à venir...</p>') 
                    }}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Dumbbell className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Contenu Principal</h2>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHTML(lessonData.contenu || '<p>Contenu à venir...</p>') 
                    }}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="exercices" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <ClipboardCheck className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Exemples et Exercices</h2>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: sanitizeHTML(lessonData.exemples_exercices || '<p>Exercices à venir...</p>') 
                    }}
                  />
                </div>
              </div>

              {/* Personal Notes Section */}
              <div className="mt-8 pt-6 border-t border-border/40">
                <div className="flex items-center gap-2 mb-4">
                  <NotebookPen className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Notes Personnelles</h3>
                </div>
                <Textarea
                  placeholder="Écrivez vos notes ici..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[200px] mb-4"
                />
                <Button
                  onClick={savePersonalNotes}
                  disabled={isSavingNotes}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSavingNotes ? "Sauvegarde..." : "Sauvegarder les notes"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activites" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <Gamepad2 className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Activités Interactives</h2>
                  {isLoadingActivities ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    </div>
                  ) : activitiesContent ? (
                    <InteractiveActivitiesEnhanced content={activitiesContent} isLoading={false} />
                  ) : (
                    <p className="text-muted-foreground">Activités à venir...</p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <Card className="p-6">
              {isLoadingQuiz ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                </div>
              ) : quizContent ? (
                <InteractiveQuiz 
                  content={quizContent}
                  isLoading={false}
                  onGoldUpdate={() => {}}
                />
              ) : (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Award className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-4">Quiz Final</h2>
                    <p className="text-muted-foreground">Quiz à venir...</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
}
