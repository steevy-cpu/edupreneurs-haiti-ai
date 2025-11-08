import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  FileText, 
  Trophy,
  Loader2,
  Save,
  Volume2,
  Play,
  Pause,
  PenTool,
  Gamepad2
} from "lucide-react";
import { francaisLessons7AF } from "@/data/francaisLessons";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LessonData {
  objectif: string;
  introduction: string;
  contenu: string;
  activites: string;
  quiz: string;
}

const FrancaisLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoadingActivites, setIsLoadingActivites] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<LessonData>({
    objectif: "",
    introduction: "",
    contenu: "",
    activites: "",
    quiz: "",
  });
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);
  const [earnedGold, setEarnedGold] = useState(0);
  const [userGold, setUserGold] = useState(0);
  const [sessionStartGold, setSessionStartGold] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const lesson = francaisLessons7AF.find(l => l.id === topicId);
  const goldReward = lesson ? 100 + (francaisLessons7AF.findIndex(l => l.id === topicId) * 10) : 100;

  useEffect(() => {
    if (topicId && lesson) {
      loadNotesFromDatabase();
      loadUserGold(true);
      fetchYoutubeUrl();
      loadLesson();
    }
  }, [topicId]);

  const fetchYoutubeUrl = async () => {
    if (!topicId) return;
    
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('youtube_url')
        .eq('slug', topicId)
        .maybeSingle();

      if (data && !error) {
        setYoutubeUrl(data.youtube_url);
      }
    } catch (error) {
      console.error('Error fetching YouTube URL:', error);
    }
  };

  const loadUserGold = async (isInitialLoad = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setUserGold(data.gold_earned || 0);
        if (isInitialLoad) {
          setSessionStartGold(data.gold_earned || 0);
        }
      }
    } catch (error) {
      console.error('Error loading user gold:', error);
    }
  };

  const loadNotesFromDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('lesson_topic', topicId)
        .single();

      if (data && !error) {
        setNotes(data.content || "");
        setNotesSaved(true);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const loadLesson = async (forceRegenerate = false) => {
    if (!topicId || !lesson) return;

    const activitiesCacheKey = `lesson_activites_francais_${topicId}`;
    const quizCacheKey = `lesson_quiz_francais_${topicId}`;

    try {
      let activitiesContent = "";
      let quizContent = "";
      
      if (!forceRegenerate) {
        const cachedActivities = localStorage.getItem(activitiesCacheKey);
        const cachedQuiz = localStorage.getItem(quizCacheKey);
        
        if (cachedActivities) activitiesContent = cachedActivities;
        if (cachedQuiz) quizContent = cachedQuiz;
      }

      // Set static content from data file
      setLessonData({
        objectif: lesson.objectif,
        introduction: lesson.introduction,
        contenu: lesson.contenu,
        activites: "",
        quiz: ""
      });

      // Load activities if not cached or regenerating
      if (!activitiesContent || forceRegenerate) {
        setIsLoadingActivites(true);
        const { data: activitesResponse, error: activitesError } = await supabase.functions.invoke('francais-ai-tutor', {
          body: { 
            message: `Génère des exercices pratiques variés pour le sujet "${lesson.title}" niveau AF7.`,
            lessonType: 'activites',
            lessonTopic: lesson.title
          }
        });

        if (activitesError) throw activitesError;

        activitiesContent = activitesResponse?.response || activitesResponse || "";
        localStorage.setItem(activitiesCacheKey, activitiesContent);
        setIsLoadingActivites(false);
      }

      // Load quiz if not cached or regenerating
      if (!quizContent || forceRegenerate) {
        setIsLoadingQuiz(true);
        const { data: quizResponse, error: quizError } = await supabase.functions.invoke('francais-ai-tutor', {
          body: { 
            message: `Génère un quiz d'évaluation de 5 questions pour le sujet "${lesson.title}" niveau AF7.`,
            lessonType: 'quiz',
            lessonTopic: lesson.title
          }
        });

        if (quizError) throw quizError;

        quizContent = quizResponse?.response || quizResponse || "";
        localStorage.setItem(quizCacheKey, quizContent);
        setIsLoadingQuiz(false);
      }

      setLessonData(prev => ({
        ...prev,
        activites: activitiesContent,
        quiz: quizContent
      }));
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la leçon",
        variant: "destructive",
      });
      setIsLoadingActivites(false);
      setIsLoadingQuiz(false);
    }
  };

  const saveNotesToDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notes')
        .upsert({
          user_id: user.id,
          lesson_topic: topicId,
          content: notes,
        });

      if (error) throw error;

      setNotesSaved(true);
      toast({
        title: "Notes sauvegardées",
        description: "Tes notes ont été enregistrées avec succès!",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive",
      });
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesSaved(false);
  };

  const clearNotes = () => {
    setNotes("");
    setNotesSaved(false);
  };

  const handleGoldUpdate = () => {
    loadUserGold();
  };

  const handleRegenerateActivities = () => {
    loadLesson(true);
  };

  const handleTextToSpeech = async (text: string) => {
    // Simplified version - just show a message for now
    toast({
      title: "Fonctionnalité audio",
      description: "L'audio sera bientôt disponible pour cette leçon!",
    });
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Leçon non trouvée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Cette leçon n'existe pas ou n'est pas encore disponible.
            </p>
            <Button onClick={() => navigate("/francais-course")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au cours
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentIndex = francaisLessons7AF.findIndex(l => l.id === topicId);
  const previousLesson = currentIndex > 0 ? francaisLessons7AF[currentIndex - 1] : null;
  const nextLesson = currentIndex < francaisLessons7AF.length - 1 ? francaisLessons7AF[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/francais-course')} 
              className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 text-primary-foreground hover:bg-primary-foreground/20"
              aria-label="Retour au cours"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              {lesson && (
                <DownloadLessonButton
                  lessonData={{
                    title: lesson.title,
                    objectif: lesson.objectif,
                    introduction: lesson.introduction,
                    contenu: lesson.contenu,
                  }}
                  personalNotes={notes}
                  subjectName="Français AF7"
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-foreground/20 border border-primary-foreground/20"
                />
              )}
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 shrink-0">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                <span className="font-bold text-primary-foreground text-sm sm:text-base">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Lesson Header */}
            <Card className="border-l-4 border-l-purple-500 border border-border bg-card">
              <CardHeader className="bg-muted/50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                    {currentIndex + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl mb-2 text-foreground">{lesson.title}</CardTitle>
                    <p className="text-sm text-purple-600 dark:text-purple-400">📅 {lesson.mois}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="lecon" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="lecon"><BookOpen className="w-4 h-4 mr-2" />Leçon</TabsTrigger>
                <TabsTrigger value="activites"><FileText className="w-4 h-4 mr-2" />Activités</TabsTrigger>
                <TabsTrigger value="quiz"><Target className="w-4 h-4 mr-2" />Quiz</TabsTrigger>
              </TabsList>

              <TabsContent value="lecon" className="space-y-6">
                <Card className="border border-border bg-card">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Target className="text-purple-600" />🎯 Objectif
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose dark:prose-invert max-w-none text-foreground"
                      dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                    />
                    {lesson.id === "comprehension-production-orale-1" && (
                      <Button onClick={() => handleTextToSpeech(lesson.objectif)} className="mt-4 gap-2">
                        <Volume2 className="w-4 h-4" />Écouter</Button>)}
                  </CardContent>
                </Card>
                {lessonData.contenu !== "Contenu à venir..." && (
                  <div className="space-y-6">
                    {/* Parse and display content in beautiful sections */}
                    {lessonData.contenu.split(/(?=📖|📚|📊|💡|🎯|✨|📝|🔑)/).map((section, index) => {
                      const isIntro = section.includes('📖') || section.includes('INTRODUCTION');
                      const isDefinitions = section.includes('📚') || section.includes('CONTEXTE') || section.includes('DÉFINITIONS');
                      const isConcepts = section.includes('📊') || section.includes('CONCEPTS');
                      const isExamples = section.includes('💡') || section.includes('EXEMPLES PRATIQUES');
                      const isRules = section.includes('🎯') || section.includes('RÈGLES');
                      const isTips = section.includes('✨') || section.includes('ASTUCES');
                      const isNotes = section.includes('📝') || section.includes('EXERCICE MENTAL');
                      const isKeyPoints = section.includes('🔑') || section.includes('POINTS CLÉS');

                      let colorClasses = "border-purple-500 bg-purple-50 dark:bg-purple-950/20";
                      let iconBg = "bg-purple-500";
                      
                      if (isDefinitions) {
                        colorClasses = "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
                        iconBg = "bg-blue-500";
                      } else if (isConcepts) {
                        colorClasses = "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20";
                        iconBg = "bg-indigo-500";
                      } else if (isExamples) {
                        colorClasses = "border-amber-500 bg-amber-50 dark:bg-amber-950/20";
                        iconBg = "bg-amber-500";
                      } else if (isRules) {
                        colorClasses = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
                        iconBg = "bg-emerald-500";
                      } else if (isTips) {
                        colorClasses = "border-pink-500 bg-pink-50 dark:bg-pink-950/20";
                        iconBg = "bg-pink-500";
                      } else if (isKeyPoints) {
                        colorClasses = "border-orange-500 bg-orange-50 dark:bg-orange-950/20";
                        iconBg = "bg-orange-500";
                      }

                      if (!section.trim()) return null;

                      return (
                        <Card key={index} className={`border-l-8 ${colorClasses} shadow-lg hover:shadow-xl transition-all duration-300 border border-border bg-card`}>
                          <CardContent className="pt-6 pb-6 px-6">
                            <div className="prose prose-lg max-w-none dark:prose-invert">
                              <div 
                                className="space-y-4 leading-relaxed text-foreground"
                                style={{ fontSize: '1.05rem', lineHeight: '1.9' }}
                                dangerouslySetInnerHTML={{ 
                                  __html: section
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
                                    .replace(/\n\n/g, '</p><p class="mb-4 mt-4">')
                                    .replace(/\n/g, '<br/>')
                                    .replace(/(📖|📚|📊|💡|🎯|✨|📝|💬|🎭|✏️|🔍|✅|❌|💭|📌|🔎|⚠️|🔑)/g, '<span class="text-3xl mr-3 inline-block align-middle">$1</span>')
                                    .replace(/```([\s\S]*?)```/g, `<div class="my-4 p-6 rounded-xl ${iconBg} bg-opacity-10 border-2 border-current"><pre class="whitespace-pre-wrap font-mono text-sm">$1</pre></div>`)
                                }} 
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
                {lessonData.objectif && (
                  <YouTubeVideoSection lessonTitle={lesson.title} objectives={lessonData.objectif} gradeLevel="AF7" customYoutubeUrl={youtubeUrl || undefined} subject="francais" />)}
              </TabsContent>

              <TabsContent value="activites">
                <InteractiveActivitiesEnhanced content={lessonData.activites} isLoading={isLoadingActivites} onRegenerate={handleRegenerateActivities} onGoldUpdate={handleGoldUpdate} />
              </TabsContent>

              <TabsContent value="quiz">
                <InteractiveQuiz content={lessonData.quiz} isLoading={isLoadingQuiz} onRegenerate={handleRegenerateActivities} onGoldUpdate={handleGoldUpdate} lessonGoldReward={goldReward} />
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between">
              {previousLesson ? (<Button variant="outline" onClick={() => navigate(`/francais-lesson/${previousLesson.id}`)}><ArrowLeft className="mr-2 h-4 w-4" />Précédente</Button>) : <div />}
              {nextLesson && (<Button onClick={() => navigate(`/francais-lesson/${nextLesson.id}`)} className="bg-gradient-to-r from-purple-500 to-pink-500">Suivante<ArrowLeft className="ml-2 h-4 w-4 rotate-180" /></Button>)}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-accent/20 to-accent/10 border-accent/20 border border-border">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center justify-center gap-2 text-foreground">
                  <Trophy className="w-6 h-6 text-accent" />
                  <span className="text-accent font-bold">Or Total</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2">{userGold}</div>
                  <p className="text-sm text-muted-foreground">
                    +{userGold - sessionStartGold} dans cette session
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <PenTool className="w-5 h-5" />
                  Notes Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Écris tes notes ici..."
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className="min-h-[200px] resize-none bg-background text-foreground border-input"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={saveNotesToDatabase}
                    disabled={notesSaved}
                    className="flex-1"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {notesSaved ? 'Sauvegardé' : 'Sauvegarder'}
                  </Button>
                  <Button 
                    onClick={clearNotes}
                    variant="outline"
                    size="sm"
                  >
                    Effacer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrancaisLesson;
