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
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
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
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("lessonLanguage") || "fr";
  });

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

  // Update language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("lessonLanguage") || "fr";
    setLanguage(savedLanguage);
  }, []);

  // Load lesson data from cache or fetch
  useEffect(() => {
    if (topicId && topicInfo[topicId]) {
      const cacheKey = `lesson_full_${topicId}_${language}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        setLessonData(JSON.parse(cachedData));
      } else {
        loadLesson();
      }
    }
  }, [topicId, language]);

  const loadLesson = async (forceRegenerate = false) => {
    if (!topicId || !topicInfo[topicId]) return;

    const cacheKey = `lesson_full_${topicId}_${language}`;
    
    // If not forcing regenerate, check cache
    if (!forceRegenerate) {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setLessonData(JSON.parse(cachedData));
        return;
      }
    }

    const topic = topicInfo[topicId];
    const languageText = language === "fr" ? "français" : "créole haïtien";

    try {
      // First call: Objectif, Introduction, and Contenu
      setIsLoadingLesson(true);
      const { data: lessonResponse, error: lessonError } = await supabase.functions.invoke('math-ai-tutor', {
        body: { 
          message: `Génère le contenu de leçon pour le sujet "${topic.title}" niveau AF7.`,
          lessonType: 'lesson',
          language: language
        }
      });

      if (lessonError) throw lessonError;

      const newLessonData: LessonData = {
        objectif: lessonResponse?.objectif || "",
        introduction: lessonResponse?.introduction || "",
        contenu: lessonResponse?.contenu || "",
        activites: "",
        quiz: "",
      };

      setLessonData(newLessonData);
      setIsLoadingLesson(false);

      // Second call: Activités (exercises)
      setIsLoadingActivites(true);
      const { data: activitesResponse, error: activitesError } = await supabase.functions.invoke('math-ai-tutor', {
        body: { 
          message: `Génère des exemples d'exercices pratiques pour "${topic.title}" niveau AF7.`,
          lessonType: 'activites',
          language: language
        }
      });

      if (activitesError) throw activitesError;

      newLessonData.activites = activitesResponse?.response || "";
      setLessonData({...newLessonData});
      setIsLoadingActivites(false);

      // Third call: Quiz
      setIsLoadingQuiz(true);
      const { data: quizResponse, error: quizError } = await supabase.functions.invoke('math-ai-tutor', {
        body: { 
          message: `Génère un quiz final de 5 questions pour évaluer la compréhension de "${topic.title}" niveau AF7.`,
          lessonType: 'quiz',
          language: language
        }
      });

      if (quizError) throw quizError;

      newLessonData.quiz = quizResponse?.response || "";
      setLessonData({...newLessonData});
      setIsLoadingQuiz(false);

      // Cache the complete lesson data
      localStorage.setItem(cacheKey, JSON.stringify(newLessonData));

      if (forceRegenerate) {
        toast({
          title: "Leçon régénérée",
          description: "La leçon a été mise à jour avec du nouveau contenu",
        });
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la leçon",
        variant: "destructive"
      });
      setIsLoadingLesson(false);
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
                    {isLoadingLesson ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : lessonData.objectif ? (
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
                    {isLoadingLesson ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : lessonData.introduction ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed bg-background/50 p-4 rounded-lg">
                          {lessonData.introduction}
                        </div>
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
                        disabled={isLoadingLesson}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingLesson ? 'animate-spin' : ''}`} />
                        Régénérer
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-6">
                    {isLoadingLesson ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        {lessonData.contenu ? (
                          <div className="whitespace-pre-wrap text-sm sm:text-base leading-loose space-y-4">
                            {lessonData.contenu}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Chargement du contenu...</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Exemples d'exercices */}
                <Card className="lesson-card border-none rounded-[20px] shadow-md border-2 border-primary/20">
                  <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-success/10 to-primary/10 rounded-t-[20px]">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Dumbbell className="text-primary shrink-0" size={20} />
                      ✏️ Exemples d'exercices
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-6">
                    {isLoadingActivites ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : lessonData.activites ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-loose space-y-4 bg-muted/30 p-4 rounded-lg">
                          {lessonData.activites}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Chargement des exercices...</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ACTIVITIES TAB */}
              <TabsContent value="activities" className="space-y-4">
                
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
                <Card className="lesson-card border-none rounded-[20px] shadow-md border-2 border-success/30">
                  <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-success/10 to-accent/10 rounded-t-[20px]">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <CheckCircle className="text-primary shrink-0" size={20} />
                      ✅ Quiz Final
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-6">
                    {isLoadingQuiz ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : lessonData.quiz ? (
                      <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm sm:text-base leading-loose space-y-4 bg-success/5 p-4 rounded-lg">
                          {lessonData.quiz}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Quiz en cours de chargement...
                      </p>
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

