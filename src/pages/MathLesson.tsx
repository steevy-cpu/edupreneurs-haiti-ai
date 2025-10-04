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
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EricChatbot } from "@/components/EricChatbot";
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

  // Load cached notes on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes:math:${topicId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [topicId]);

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

  const saveNotes = () => {
    localStorage.setItem(`notes:math:${topicId}`, notes);
    setNotesSaved(true);
    toast({
      title: "Notes sauvegardées",
      description: "Tes notes ont été enregistrées localement",
    });
  };

  const clearNotes = () => {
    setNotes("");
    localStorage.removeItem(`notes:math:${topicId}`);
    setNotesSaved(true);
    toast({
      title: "Notes effacées",
      description: "Tes notes ont été supprimées",
    });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesSaved(false);
  };

  const handleActivityComplete = (activityName: string, gold: number) => {
    setEarnedGold(prev => prev + gold);
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
      {/* Eric Chatbot */}
      <EricChatbot />
      
      {/* Gradient Header */}
      <header className="lesson-topbar sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/math-course')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour — Cours
          </Button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/dashboard')}
            >
              Tableau de bord
            </Button>
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
          <Badge className="lesson-pill">Hors-ligne</Badge>
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
                {/* Dynamic Activities from AI */}
                <Card className="lesson-card border-none rounded-[20px] shadow-lg border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
                  <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-accent/20 to-primary/20 rounded-t-[20px]">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Zap className="text-primary shrink-0" size={22} />
                      🎯 Activités Pratiques — Génération IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-6">
                    {isLoadingActivites ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground text-center">Génération d'exercices personnalisés...</p>
                      </div>
                    ) : lessonData.activites ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-loose space-y-4">
                          {lessonData.activites}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Aucune activité disponible</p>
                    )}
                  </CardContent>
                </Card>

                {activeActivity === null ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="lesson-card p-6 hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => setActiveActivity('drag-drop')}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                            🎯
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Drag & Drop</h3>
                            <p className="text-sm text-muted-foreground">Ordonne les nombres</p>
                          </div>
                        </div>
                        <p className="text-sm">
                          Place les nombres entiers dans le bon ordre
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="gap-1">
                            <Trophy className="w-3 h-3" />
                            +30 gold
                          </Badge>
                          <Button size="sm">Jouer</Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="lesson-card p-6 hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => setActiveActivity('speed-calc')}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-2xl">
                            <Zap className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Calcul Rapide</h3>
                            <p className="text-sm text-muted-foreground">60 secondes chrono</p>
                          </div>
                        </div>
                        <p className="text-sm">
                          Résous un maximum d'opérations en 60 secondes!
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="gap-1">
                            <Trophy className="w-3 h-3" />
                            Score × 2 gold
                          </Badge>
                          <Button size="sm">Jouer</Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="lesson-card p-6 hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => setActiveActivity('matching')}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-2xl">
                            🔗
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Association</h3>
                            <p className="text-sm text-muted-foreground">Relie les paires</p>
                          </div>
                        </div>
                        <p className="text-sm">
                          Associe chaque opération à son résultat correct
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="gap-1">
                            <Trophy className="w-3 h-3" />
                            +40 gold
                          </Badge>
                          <Button size="sm">Jouer</Button>
                        </div>
                      </div>
                    </Card>

                    <Card className="lesson-card p-6 hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => setActiveActivity('quiz')}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-2xl">
                            🧠
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">Quiz</h3>
                            <p className="text-sm text-muted-foreground">Questions à choix</p>
                          </div>
                        </div>
                        <p className="text-sm">
                          Réponds correctement aux questions
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className="gap-1">
                            <Trophy className="w-3 h-3" />
                            +50 gold
                          </Badge>
                          <Button size="sm">Jouer</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Card className="lesson-card p-6">
                    <Button
                      variant="ghost"
                      onClick={() => setActiveActivity(null)}
                      className="mb-4"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour aux activités
                    </Button>

                    {activeActivity === 'quiz' && (
                      <QuizGame
                        topic={currentTopic.title}
                        questions={activityData.quiz}
                        onComplete={(score) => handleActivityComplete('quiz', score * 10)}
                      />
                    )}
                    {activeActivity === 'matching' && (
                      <MatchingGame
                        pairs={activityData.matching}
                        onComplete={(score) => handleActivityComplete('matching', 40)}
                      />
                    )}
                    {activeActivity === 'drag-drop' && (
                      <DragDropGame
                        numbers={activityData.dragDrop}
                        onComplete={(score) => handleActivityComplete('drag-drop', 30)}
                      />
                    )}
                    {activeActivity === 'speed-calc' && (
                      <SpeedCalcGame
                        onComplete={(score) => handleActivityComplete('speed-calc', score * 2)}
                      />
                    )}
                  </Card>
                )}
              </TabsContent>

              {/* QUIZ TAB */}
              <TabsContent value="quiz" className="space-y-4">
                <Card className="lesson-card border-none rounded-[20px] shadow-xl border-2 border-success/30 bg-gradient-to-br from-success/5 to-primary/5">
                  <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-success/20 to-primary/20 rounded-t-[20px]">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Trophy className="text-primary shrink-0" size={22} />
                        🏆 Quiz Final d'Évaluation
                      </CardTitle>
                      <Badge className="bg-success/20 text-success border-success/30">5 Questions</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-6">
                    {isLoadingQuiz ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-success" />
                        <p className="text-muted-foreground text-center">Génération du quiz d'évaluation...</p>
                      </div>
                    ) : lessonData.quiz ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-loose space-y-6 bg-white/50 dark:bg-gray-900/30 p-5 rounded-xl">
                          {lessonData.quiz}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Aucun quiz disponible</p>
                    )}
                  </CardContent>
                </Card>
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

