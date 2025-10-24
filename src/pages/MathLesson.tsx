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
  nombresRelatifsQuiz,
  nombresRelatifsMatching,
  nombresRelatifsDragDrop,
  fractionsQuiz,
  fractionsMatching,
  equationsQuiz,
  equationsMatching,
  proportionnaliteQuiz,
  proportionnaliteMatching,
  statistiquesQuiz,
  statistiquesMatching,
  numerationBinaireQuiz,
  numerationBinaireMatching,
  polygonesQuiz,
  polygonesMatching,
  divisibiliteQuiz,
  divisibiliteMatching,
  ensemblesQuiz,
  ensemblesMatching,
  plansDroitesQuiz,
  plansDroitesMatching,
  nombresNaturelsQuiz,
  nombresNaturelsMatching
} from "@/data/mathActivities";
import { mathLessons } from "@/data/mathLessons";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
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
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [earnedGold, setEarnedGold] = useState(0);
  const [userGold, setUserGold] = useState(0);
  const [sessionStartGold, setSessionStartGold] = useState(0);
  
  // Check if we have static content for this topic
  const hasStaticContent = topicId ? topicId in mathLessons : false;

  const topicInfo: { [key: string]: { title: string; icon: string; goldReward: number } } = {
    "ensembles": { 
      title: "Ensembles", 
      icon: "🔢",
      goldReward: 80
    },
    "plans-droites": { 
      title: "Plans et Droites", 
      icon: "📐",
      goldReward: 90
    },
    "nombres-naturels": { 
      title: "Nombres Naturels", 
      icon: "🔢",
      goldReward: 80
    },
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
    loadUserGold(true); // Initial load - set baseline
    fetchYoutubeUrl();
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
        const currentGold = data.gold_earned || 0;
        setUserGold(currentGold);
        
        // Only set session start on initial load
        if (isInitialLoad) {
          setSessionStartGold(currentGold);
        }
      }
    } catch (error) {
      console.error('Error loading user gold:', error);
    }
  };

  // Track gold changes in real-time
  useEffect(() => {
    const goldEarnedThisSession = userGold - sessionStartGold;
    setEarnedGold(Math.max(0, goldEarnedThisSession));
  }, [userGold, sessionStartGold]);

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
    // Map topic IDs to their corresponding quiz data
    switch(topicId) {
      case "nombres-entiers":
      case "entiers-relatifs":
        return {
          quiz: nombresRelatifsQuiz,
          matching: nombresRelatifsMatching,
          dragDrop: nombresRelatifsDragDrop
        };
      case "fractions":
        return {
          quiz: fractionsQuiz,
          matching: fractionsMatching,
          dragDrop: [0.25, 0.5, 0.75, 1, 1.5, 2]
        };
      case "equations-second-degre":
        return {
          quiz: equationsQuiz,
          matching: equationsMatching,
          dragDrop: [-5, -2, 0, 3, 8]
        };
      case "proportionnalite":
        return {
          quiz: proportionnaliteQuiz,
          matching: proportionnaliteMatching,
          dragDrop: [10, 25, 50, 75, 100]
        };
      case "statistiques":
        return {
          quiz: statistiquesQuiz,
          matching: statistiquesMatching,
          dragDrop: [5, 10, 12, 15, 20]
        };
      case "numeration-binaire":
        return {
          quiz: numerationBinaireQuiz,
          matching: numerationBinaireMatching,
          dragDrop: [1, 10, 11, 100, 101, 110]
        };
      case "polygones":
        return {
          quiz: polygonesQuiz,
          matching: polygonesMatching,
          dragDrop: [3, 4, 5, 6, 8]
        };
      case "divisibilite":
        return {
          quiz: divisibiliteQuiz,
          matching: divisibiliteMatching,
          dragDrop: [2, 3, 5, 9, 10]
        };
      case "ensembles":
        return {
          quiz: ensemblesQuiz,
          matching: ensemblesMatching,
          dragDrop: [1, 2, 3, 4, 5]
        };
      case "plans-droites":
        return {
          quiz: plansDroitesQuiz,
          matching: plansDroitesMatching,
          dragDrop: [90, 180, 45, 60, 30]
        };
      case "nombres-naturels":
        return {
          quiz: nombresNaturelsQuiz,
          matching: nombresNaturelsMatching,
          dragDrop: [8, 16, 25, 50, 100]
        };
      default:
        // Default fallback
        return {
          quiz: nombresRelatifsQuiz,
          matching: nombresRelatifsMatching,
          dragDrop: nombresRelatifsDragDrop
        };
    }
  };

  const activityData = getActivityData();

  return (
    <div className="min-h-screen lesson-bg overflow-x-hidden">
      
      {/* Gradient Header */}
      <header className="lesson-topbar sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/math-course')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Coins className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-bold">{userGold}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl shrink-0">{currentTopic.icon}</span>
              <span className="truncate">Mathématiques — {currentTopic.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">AF7 — Aligné MENFP</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_350px] gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="space-y-3 sm:space-y-4 min-w-0">
            <Tabs defaultValue="lesson" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto">
                <TabsTrigger value="lesson" className="gap-1.5 sm:gap-2 py-2.5 sm:py-3">
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-medium">Leçon</span>
                </TabsTrigger>
                <TabsTrigger value="activities" className="gap-1.5 sm:gap-2 py-2.5 sm:py-3">
                  <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-medium">Activités</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="gap-1.5 sm:gap-2 py-2.5 sm:py-3">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-medium">Quiz Final</span>
                </TabsTrigger>
              </TabsList>

              {/* LESSON TAB */}
              <TabsContent value="lesson" className="space-y-3 sm:space-y-4 animate-fade-in">
                {/* Objectif */}
                <Card className="lesson-card border-none rounded-2xl sm:rounded-[20px] shadow-lg bg-gradient-to-br from-primary/5 via-success/5 to-primary/5 overflow-hidden">
                  <CardHeader className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-primary/10 to-success/10">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                      <Target className="text-primary shrink-0" size={18} />
                      <span className="text-lg sm:text-xl">🎯</span> Objectif de la leçon
                    </CardTitle>
                  </CardHeader>
                   <CardContent className="p-3 sm:p-4 md:p-6 pt-0 mt-3 sm:mt-4">
                    {lessonData.objectif ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed bg-background/50 p-3 sm:p-4 rounded-lg">
                          {lessonData.objectif}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Chargement...</p>
                    )}
                  </CardContent>
                </Card>

                {/* Introduction */}
                <Card className="lesson-card border-none rounded-2xl sm:rounded-[20px] shadow-lg bg-gradient-to-br from-accent/5 via-primary/5 to-accent/5 overflow-hidden">
                  <CardHeader className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-accent/10 to-primary/10">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                      <Lightbulb className="text-primary shrink-0" size={18} />
                      <span className="text-lg sm:text-xl">💡</span> Introduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:p-6 pt-0 mt-3 sm:mt-4">
                    {lessonData.introduction ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert lesson-content">
                        <div dangerouslySetInnerHTML={{ __html: lessonData.introduction }} />
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Chargement...</p>
                    )}
                  </CardContent>
                </Card>

                {/* Contenu de la leçon */}
                <Card className="lesson-card border-none rounded-2xl sm:rounded-[20px] shadow-xl overflow-hidden">
                  <CardHeader className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-primary/15 via-secondary/10 to-success/15 rounded-t-2xl sm:rounded-t-[20px]">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                      <BookOpen className="text-primary shrink-0" size={18} />
                      <span className="text-lg sm:text-xl">📚</span> Contenu de la leçon
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 md:p-6 pt-4 sm:pt-6 bg-gradient-to-br from-background via-primary/[0.02] to-background">
                    <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert lesson-content">
                      {lessonData.contenu ? (
                        <div dangerouslySetInnerHTML={{ __html: lessonData.contenu }} className="animate-fade-in" />
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
                          <p className="text-muted-foreground">Chargement du contenu...</p>
                        </div>
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
                    customYoutubeUrl={youtubeUrl || undefined}
                  />
                )}

                {/* Exemples d'exercices (Static) */}
                {hasStaticContent && mathLessons[topicId!]?.exemplesExercices && (
                  <Card className="lesson-card border-none rounded-2xl sm:rounded-[20px] shadow-lg border-2 border-primary/20 overflow-hidden">
                    <CardHeader className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-success/15 via-primary/10 to-success/15 rounded-t-2xl sm:rounded-t-[20px]">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
                        <Dumbbell className="text-primary shrink-0" size={18} />
                        <span className="text-lg sm:text-xl">✏️</span> Exemples d'exercices résolus
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 md:p-6 pt-4 sm:pt-6">
                      <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert lesson-content">
                        <div dangerouslySetInnerHTML={{ __html: mathLessons[topicId!].exemplesExercices }} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ACTIVITIES TAB */}
              <TabsContent value="activities" className="space-y-4">
                <InteractiveActivitiesEnhanced 
                  content={lessonData.activites} 
                  isLoading={isLoadingActivites}
                  onGoldUpdate={() => loadUserGold()}
                  onRegenerate={() => {
                    // Clear cache for activities and regenerate
                    if (topicId) {
                      const activitiesCacheKey = `lesson_activites_${topicId}`;
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
                  lessonGoldReward={currentTopic.goldReward}
                  onGoldUpdate={() => loadUserGold()}
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
          <div className="space-y-3 sm:space-y-4">
            {/* Gold Progress */}
            <Card className="lesson-card p-4 sm:p-6 bg-gradient-to-br from-[hsl(var(--accent))]/10 via-[hsl(var(--primary))]/5 to-[hsl(var(--accent))]/10 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm font-medium">Gold gagné</span>
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--accent))]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(25_100%_50%)] bg-clip-text text-transparent animate-scale-in">
                {earnedGold}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Cette leçon: jusqu'à {currentTopic.goldReward} gold</p>
            </Card>

            {/* Notes */}
            <Card className="lesson-card p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm sm:text-base font-semibold">📝 Mes Notes</h5>
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
                className="min-h-[150px] sm:min-h-[200px] mb-3 bg-background text-sm"
              />
              <div className="flex gap-2">
                <Button
                  onClick={saveNotes}
                  className="flex-1"
                  size="sm"
                  disabled={notesSaved}
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span className="text-xs sm:text-sm">Sauvegarder</span>
                </Button>
                <Button
                  onClick={clearNotes}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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

