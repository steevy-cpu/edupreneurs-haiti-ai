import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Save,
  Trash2,
  Brain,
  Gamepad2,
  Trophy,
  Zap,
  RefreshCw,
  BookOpen,
  Target,
  Lightbulb,
  Loader2,
  Dumbbell,
  CheckCircle,
  Coins
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";

import { QuizGame } from "@/components/math-activities/QuizGame";
import { DragDropGame } from "@/components/math-activities/DragDropGame";
import { SpeedCalcGame } from "@/components/math-activities/SpeedCalcGame";
import { MatchingGame } from "@/components/math-activities/MatchingGame";
import { 
  nombresEntiersQuiz, 
  nombresEntiersMatching, 
  nombresEntiersDragDrop,
  equationsQuiz,
  equationsMatching 
} from "@/data/mathActivities";
import { mathLessons } from "@/data/mathLessons";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivities } from "@/components/InteractiveActivities";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";

interface LessonData {
  objectif: string;
  introduction: string;
  contenu: string;
  activites: string;
  quiz: string;
}

const MathLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoadingActivites, setIsLoadingActivites] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [lessonData, setLessonData] = useState<LessonData>({
    objectif: "",
    introduction: "",
    contenu: "",
    activites: "",
    quiz: "",
  });
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [earnedGold, setEarnedGold] = useState(0);
  const [userGold, setUserGold] = useState(0);
  
  // Check if we have static content for this topic
  const hasStaticContent = topicId ? topicId in mathLessons : false;

  const topicInfo: { [key: string]: { title: string; icon: string; goldReward: number } } = {
    "numeration-binaire": { 
      title: "Numération Binaire", 
      icon: "💻",
      goldReward: 80
    },
    "polygones": { 
      title: "Les Polygones", 
      icon: "⬡",
      goldReward: 100
    },
    "unites-mesures": { 
      title: "Unités de Mesures", 
      icon: "📏",
      goldReward: 90
    },
    "divisibilite": { 
      title: "Divisibilité", 
      icon: "➗",
      goldReward: 100
    },
    "decimaux": { 
      title: "Décimaux", 
      icon: "🔢",
      goldReward: 120
    },
    "cercle-disque": { 
      title: "Cercle et Disque", 
      icon: "⭕",
      goldReward: 110
    },
    "triangles": { 
      title: "Les Triangles", 
      icon: "🔺",
      goldReward: 100
    },
    "aires-perimetres": { 
      title: "Aires et Périmètres", 
      icon: "📐",
      goldReward: 120
    },
    "proportionnalite": { 
      title: "Proportionnalité", 
      icon: "📊",
      goldReward: 130
    },
    "entiers-relatifs": { 
      title: "Entiers Relatifs", 
      icon: "➕➖",
      goldReward: 110
    },
    "volumes-solides": { 
      title: "Volumes de Solides", 
      icon: "📦",
      goldReward: 140
    },
    "fractions": { 
      title: "Les Fractions", 
      icon: "🍕",
      goldReward: 150
    },
    "parallelogrammes": { 
      title: "Les Parallélogrammes", 
      icon: "◇",
      goldReward: 100
    },
    "reperage-quadrillage": { 
      title: "Repérage sur Quadrillage", 
      icon: "🗺️",
      goldReward: 110
    },
    "transformations": { 
      title: "Les Transformations", 
      icon: "🔄",
      goldReward: 140
    },
    "statistiques": { 
      title: "Statistiques Élémentaires", 
      icon: "📈",
      goldReward: 150
    }
  };

  const currentTopic = topicInfo[topicId || ""] || topicInfo["numeration-binaire"];

  // Load notes and user gold from database on mount
  useEffect(() => {
    loadNotesFromDatabase();
    loadUserGold();
  }, [topicId]);

  const loadUserGold = async () => {
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
      }
    } catch (error) {
      console.error('Error loading user gold:', error);
    }
  };

  const loadNotesFromDatabase = async () => {
    if (!topicId) return;
    
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

  // Load lesson data from cache or fetch
  useEffect(() => {
    if (topicId && topicInfo[topicId]) {
      // Load static content immediately if available
      if (hasStaticContent) {
        const staticContent = mathLessons[topicId];
        setLessonData({
          objectif: staticContent.objectif,
          introduction: staticContent.introduction,
          contenu: staticContent.contenu,
          activites: "",
          quiz: ""
        });
      }
      
      // Load dynamic content (activities and quiz)
      loadLesson();
    }
  }, [topicId]);

  const loadLesson = async (forceRegenerate = false) => {
    if (!topicId || !topicInfo[topicId]) return;

    const activitiesCacheKey = `lesson_activites_${topicId}`;
    const quizCacheKey = `lesson_quiz_${topicId}`;
    
    const topic = topicInfo[topicId];

    try {
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
        const { data: activitesResponse, error: activitesError } = await supabase.functions.invoke('math-ai-tutor', {
          body: { 
            message: `Génère des exercices pratiques variés pour le sujet "${topic.title}" niveau AF7.`,
            lessonType: 'activites'
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
        const { data: quizResponse, error: quizError } = await supabase.functions.invoke('math-ai-tutor', {
          body: { 
            message: `Génère un quiz d'évaluation de 5 questions pour le sujet "${topic.title}" niveau AF7.`,
            lessonType: 'quiz'
          }
        });

        if (quizError) throw quizError;

        quizContent = quizResponse?.response || quizResponse || "";
        localStorage.setItem(quizCacheKey, quizContent);
        setIsLoadingQuiz(false);
      }

      // Update lesson data with dynamic content
      setLessonData(prev => ({
        ...prev,
        activites: activitiesContent,
        quiz: quizContent
      }));

      if (forceRegenerate) {
        toast({
          title: "Activités régénérées",
          description: "Les activités et le quiz ont été mis à jour",
        });
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les activités",
        variant: "destructive"
      });
      setIsLoadingActivites(false);
      setIsLoadingQuiz(false);
    }
  };

  const saveNotes = async () => {
    if (!topicId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour sauvegarder vos notes",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('notes')
        .upsert({
          user_id: user.id,
          lesson_topic: topicId,
          content: notes
        }, {
          onConflict: 'user_id,lesson_topic'
        });

      if (error) throw error;

      setNotesSaved(true);
      toast({
        title: "Notes sauvegardées",
        description: "Tes notes ont été enregistrées",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive"
      });
    }
  };

  const clearNotes = async () => {
    if (!topicId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', user.id)
        .eq('lesson_topic', topicId);

      if (error) throw error;

      setNotes("");
      setNotesSaved(true);
      toast({
        title: "Notes effacées",
        description: "Tes notes ont été supprimées",
      });
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les notes",
        variant: "destructive"
      });
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesSaved(false);
  };

  const handleActivityComplete = (activityName: string, gold: number) => {
    setEarnedGold(prev => prev + gold);
    setUserGold(prev => prev + gold);
    toast({
      title: "Bravo! 🎉",
      description: `Tu as gagné ${gold} gold!`,
    });
    setActiveActivity(null);
  };

  const getActivityData = () => {
    if (topicId === "nombres-entiers") {
      return {
        quiz: nombresEntiersQuiz,
        matching: nombresEntiersMatching,
        dragDrop: nombresEntiersDragDrop
      };
    } else if (topicId === "equations-second-degre") {
      return {
        quiz: equationsQuiz,
        matching: equationsMatching,
        dragDrop: [-5, -2, 0, 3, 8]
      };
    }
    return {
      quiz: nombresEntiersQuiz,
      matching: nombresEntiersMatching,
      dragDrop: nombresEntiersDragDrop
    };
  };

  const activityData = getActivityData();

  return (
    <div className="min-h-screen lesson-bg">
      
      {/* Gradient Header */}
      <header className="lesson-topbar sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/math-course')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold">{userGold}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <span className="text-3xl">{currentTopic.icon}</span>
              Mathématiques — {currentTopic.title}
            </h1>
            <p className="text-sm text-muted-foreground">AF7 — Aligné MENFP</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Content */}
          <div className="space-y-4">
            <Tabs defaultValue="lesson" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="lesson" className="gap-2">
                  <Brain className="w-4 h-4" />
                  Leçon
                </TabsTrigger>
                <TabsTrigger value="activities" className="gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Activités
                </TabsTrigger>
                <TabsTrigger value="quiz" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  Quiz Final
                </TabsTrigger>
              </TabsList>

              {/* LESSON TAB */}
              <TabsContent value="lesson" className="space-y-4">
                {/* Objectif */}
                <Card className="lesson-card border-none rounded-[20px] shadow-md bg-gradient-to-br from-primary/5 to-success/5">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Target className="text-primary shrink-0" size={20} />
                      🎯 Objectif de la leçon
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    {lessonData.objectif ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed bg-background/50 p-4 rounded-lg">
                          {lessonData.objectif}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Chargement...</p>
                    )}
                  </CardContent>
                </Card>

                {/* Introduction */}
                <Card className="lesson-card border-none rounded-[20px] shadow-md bg-gradient-to-br from-accent/5 to-primary/5">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Lightbulb className="text-primary shrink-0" size={20} />
                      💡 Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    {lessonData.introduction ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: lessonData.introduction }} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Chargement...</p>
                    )}
                  </CardContent>
                </Card>

                {/* Contenu de la leçon */}
                <Card className="lesson-card border-none rounded-[20px] shadow-md">
                  <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-success/10 rounded-t-[20px]">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <BookOpen className="text-primary shrink-0" size={20} />
                        📚 Contenu de la leçon
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadLesson(true)}
                        disabled={isLoadingActivites || isLoadingQuiz}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${(isLoadingActivites || isLoadingQuiz) ? 'animate-spin' : ''}`} />
                        Régénérer activités
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-6">
                    <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                      {lessonData.contenu ? (
                        <div dangerouslySetInnerHTML={{ __html: lessonData.contenu }} />
                      ) : (
                        <p className="text-muted-foreground">Chargement du contenu...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* YouTube Videos Section */}
                {lessonData.objectif && (
                  <YouTubeVideoSection 
                    lessonTitle={currentTopic.title}
                    objectives={lessonData.objectif}
                    gradeLevel="AF7"
                  />
                )}

                {/* Exemples d'exercices (Static) */}
                {hasStaticContent && mathLessons[topicId!]?.exemplesExercices && (
                  <Card className="lesson-card border-none rounded-[20px] shadow-md border-2 border-primary/20">
                    <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-success/10 to-primary/10 rounded-t-[20px]">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Dumbbell className="text-primary shrink-0" size={20} />
                        ✏️ Exemples d'exercices résolus
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-6">
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div dangerouslySetInnerHTML={{ __html: mathLessons[topicId!].exemplesExercices }} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ACTIVITIES TAB */}
              <TabsContent value="activities" className="space-y-4">
                <InteractiveActivities 
                  content={lessonData.activites} 
                  isLoading={isLoadingActivites}
                  onRegenerate={() => {
                    // Clear cache for activities and regenerate
                    if (topicId) {
                      const activitiesCacheKey = `lesson:${topicId}:activites`;
                      localStorage.removeItem(activitiesCacheKey);
                      loadLesson(true);
                    }
                  }}
                />
              </TabsContent>

              {/* QUIZ FINAL TAB */}
              <TabsContent value="quiz" className="space-y-4">
                <InteractiveQuiz 
                  content={lessonData.quiz} 
                  isLoading={isLoadingQuiz}
                  onRegenerate={() => {
                    // Clear cache for quiz and regenerate
                    if (topicId) {
                      const quizCacheKey = `lesson:${topicId}:quiz`;
                      localStorage.removeItem(quizCacheKey);
                      loadLesson(true);
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Gold Progress */}
            <Card className="lesson-card p-6 bg-gradient-to-br from-[hsl(var(--accent))]/10 to-[hsl(var(--primary))]/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Gold gagné</span>
                <Trophy className="w-5 h-5 text-[hsl(var(--accent))]" />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(25_100%_50%)] bg-clip-text text-transparent">
                {earnedGold}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cette leçon: jusqu'à {currentTopic.goldReward} gold</p>
            </Card>

            {/* Notes */}
            <Card className="lesson-card p-6">
              <div className="flex items-center justify-between mb-3">
                <h5 className="lesson-markdown-title">Mes Notes</h5>
                {!notesSaved && (
                  <Badge variant="outline" className="text-xs">
                    Non sauvegardé
                  </Badge>
                )}
              </div>
              <Textarea
                placeholder="Prends des notes ici..."
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                className="min-h-[200px] mb-3 bg-background"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveNotes}
                  className="flex-1"
                  size="sm"
                  disabled={notesSaved}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button
                  onClick={clearNotes}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathLesson;

