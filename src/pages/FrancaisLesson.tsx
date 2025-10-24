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
  PenTool
} from "lucide-react";
import { francaisLessons7AF } from "@/data/francaisLessons";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      // Set static content
      setLessonData({
        objectif: lesson.objectif,
        introduction: lesson.introduction,
        contenu: lesson.contenu,
        activites: "",
        quiz: ""
      });

      // Check cache for activities
      let activitiesContent = "";
      let quizContent = "";
      
      if (!forceRegenerate) {
        const cachedActivities = localStorage.getItem(activitiesCacheKey);
        const cachedQuiz = localStorage.getItem(quizCacheKey);
        
        if (cachedActivities) activitiesContent = cachedActivities;
        if (cachedQuiz) quizContent = cachedQuiz;
      }

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

  const handleGoldUpdate = (goldAmount: number) => {
    setEarnedGold(prev => prev + goldAmount);
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
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/francais-course')} className="shrink-0">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 border border-accent/20">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              <span className="font-bold gold-text text-sm sm:text-base">{userGold}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Lesson Header */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                    {currentIndex + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl sm:text-2xl mb-2">{lesson.title}</CardTitle>
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
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Target className="text-purple-600" />🎯 Objectif</CardTitle></CardHeader>
                  <CardContent>
                    <p>{lesson.objectif}</p>
                    {lesson.id === "comprehension-production-orale-1" && (
                      <Button onClick={() => handleTextToSpeech(lesson.objectif)} className="mt-4 gap-2">
                        <Volume2 className="w-4 h-4" />Écouter</Button>)}
                  </CardContent>
                </Card>
                {lesson.contenu !== "Contenu à venir..." && (
                  <Card><CardHeader><CardTitle>📚 Contenu</CardTitle></CardHeader>
                    <CardContent><div className="whitespace-pre-wrap">{lesson.contenu}</div></CardContent>
                  </Card>)}
                {lessonData.objectif && (
                  <YouTubeVideoSection lessonTitle={lesson.title} objectives={lessonData.objectif} gradeLevel="AF7" customYoutubeUrl={youtubeUrl || undefined} subject="francais" />)}
              </TabsContent>

              <TabsContent value="activites">
                <InteractiveActivitiesEnhanced content={lessonData.activites} isLoading={isLoadingActivites} onRegenerate={handleRegenerateActivities} onGoldUpdate={handleGoldUpdate} />
              </TabsContent>

              <TabsContent value="quiz">
                <InteractiveQuiz content={lessonData.quiz} isLoading={isLoadingQuiz} onRegenerate={handleRegenerateActivities} onGoldUpdate={handleGoldUpdate} lessonSlug={topicId || ""} subject="francais" />
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
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Trophy className="w-5 h-5 text-accent" />Gold</CardTitle></CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-3xl font-bold gold-text">{userGold}</p>
                {earnedGold > 0 && (<p className="text-sm font-semibold text-success">+{earnedGold} cette session</p>)}
                <p className="text-xs text-muted-foreground">Complète pour +{goldReward} gold!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">📝 Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Prends des notes..." value={notes} onChange={(e) => handleNotesChange(e.target.value)} className="min-h-[200px]" />
                <div className="flex gap-2">
                  <Button onClick={saveNotesToDatabase} disabled={notesSaved} size="sm" className="flex-1"><Save className="w-4 h-4 mr-2" />{notesSaved ? "Sauvegardé" : "Sauvegarder"}</Button>
                  <Button onClick={clearNotes} variant="outline" size="sm">Effacer</Button>
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
