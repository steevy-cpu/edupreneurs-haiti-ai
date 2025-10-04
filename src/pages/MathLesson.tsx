import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Save,
  Trash2,
  Video,
  Brain,
  Gamepad2,
  Trophy,
  Zap,
  RefreshCw
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

const MathLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [lessonContent, setLessonContent] = useState("");
  const [exerciseExamples, setExerciseExamples] = useState("");
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [earnedGold, setEarnedGold] = useState(0);

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

  // Load cached notes and exercises on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes:math:${topicId}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
    const savedExercises = localStorage.getItem(`exercises:${topicId}`);
    if (savedExercises) {
      setExerciseExamples(savedExercises);
    }
  }, [topicId]);

  const loadLesson = async (forceRegenerate = false) => {
    // Check localStorage first (unless force regenerate)
    if (!forceRegenerate) {
      const cachedLesson = localStorage.getItem(`lesson:${topicId}`);
      if (cachedLesson) {
        setLessonContent(cachedLesson);
        return;
      }
    }

    setIsLoadingLesson(true);
    try {
      const { data, error } = await supabase.functions.invoke('math-ai-tutor', {
        body: {
          message: `Présente le chapitre "${currentTopic.title}" de manière complète et pédagogique pour un élève du cycle secondaire en Haïti (niveau AF7). N'oublie pas d'inclure des exemples d'exercices avec leurs solutions.`,
          lessonType: 'lesson',
          chatHistory: []
        }
      });

      if (error) throw error;
      
      // Split content into lesson and exercises if marker exists
      const fullContent = data.response;
      const exerciseMarker = "## Exemples d'exercices";
      
      if (fullContent.includes(exerciseMarker)) {
        const [mainContent, exercises] = fullContent.split(exerciseMarker);
        setLessonContent(mainContent.trim());
        setExerciseExamples(exerciseMarker + "\n" + exercises.trim());
        localStorage.setItem(`lesson:${topicId}`, mainContent.trim());
        localStorage.setItem(`exercises:${topicId}`, exerciseMarker + "\n" + exercises.trim());
      } else {
        setLessonContent(fullContent);
        localStorage.setItem(`lesson:${topicId}`, fullContent);
      }
      
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
    } finally {
      setIsLoadingLesson(false);
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

  if (!lessonContent && !isLoadingLesson) {
    loadLesson();
  }

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
                {isLoadingLesson ? (
                  <Card className="lesson-card p-8">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-muted-foreground">Chargement de la leçon...</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <>
                    {/* Objectifs */}
                    <Card className="lesson-card">
                      <div className="p-6 lesson-markdown">
                        <h2>Objectifs</h2>
                        <p>Comprendre, lire, comparer, ordonner et utiliser les nombres entiers naturels dans des situations variées; maîtriser la valeur de position et les critères de divisibilité principaux afin de renforcer le calcul mental et la justification écrite.</p>
                      </div>
                    </Card>

                    {/* Introduction */}
                    <Card className="lesson-card">
                      <div className="p-6 lesson-markdown">
                        <h2>Introduction</h2>
                        <p>Les <strong>nombres entiers naturels</strong> (0,1,2,3,...) sont la base de presque toute activité mathématique au cycle fondamental. Savoir les manipuler structure le raisonnement : compter, mesurer, coder, ordonner, estimer. Cette leçon consolide la compréhension de la structure décimale (valeur de position), des écritures, des comparaisons et amorce les critères de divisibilité utilisés plus tard pour les fractions et le calcul algébrique élémentaire.</p>
                      </div>
                    </Card>

                    {/* AI Generated Content */}
                    <Card className="lesson-card">
                      <div className="p-6 lesson-markdown">
                        <div className="flex items-center justify-between mb-4">
                          <h2>Contenu de la Leçon</h2>
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
                        <div className="whitespace-pre-wrap text-base leading-relaxed">
                          {lessonContent}
                        </div>
                      </div>
                    </Card>

                    {/* Examples d'exercices */}
                    {exerciseExamples && (
                      <Card className="lesson-card">
                        <div className="p-6 lesson-markdown">
                          <div className="whitespace-pre-wrap text-base leading-relaxed">
                            {exerciseExamples}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Video Placeholder */}
                    <Card className="lesson-card">
                      <div className="p-6">
                        <h5 className="lesson-markdown-title mb-3">Vidéo de cours</h5>
                        <div className="video-placeholder">
                          <Video className="w-6 h-6 mr-2" />
                          Vidéo à venir — {currentTopic.title.toLowerCase()}
                        </div>
                      </div>
                    </Card>
                  </>
                )}
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
                            +25 gold
                          </Badge>
                          <Button size="sm">Jouer</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div>
                    <Button 
                      variant="ghost" 
                      className="mb-4"
                      onClick={() => setActiveActivity(null)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour aux activités
                    </Button>
                    
                    {activeActivity === 'drag-drop' && (
                      <DragDropGame 
                        numbers={activityData.dragDrop}
                        onComplete={(gold) => handleActivityComplete('drag-drop', gold)}
                      />
                    )}
                    {activeActivity === 'speed-calc' && (
                      <SpeedCalcGame 
                        onComplete={(score, gold) => handleActivityComplete('speed-calc', gold)}
                      />
                    )}
                    {activeActivity === 'matching' && (
                      <MatchingGame 
                        pairs={activityData.matching}
                        onComplete={(gold) => handleActivityComplete('matching', gold)}
                      />
                    )}
                  </div>
                )}
              </TabsContent>

              {/* QUIZ TAB */}
              <TabsContent value="quiz">
                <QuizGame 
                  topic={currentTopic.title}
                  questions={activityData.quiz}
                  onComplete={(score, gold) => {
                    handleActivityComplete('quiz', gold);
                    toast({
                      title: "Félicitations! 🏆",
                      description: `Tu as complété le chapitre "${currentTopic.title}"!`,
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Gold Display */}
            <Card className="lesson-card bg-gradient-to-br from-accent/10 to-yellow-500/10 border-accent/20">
              <div className="p-6 text-center">
                <Trophy className="w-12 h-12 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">Gold gagné</p>
                <p className="text-3xl font-bold gold-text">+{earnedGold}</p>
              </div>
            </Card>

            {/* Personal Notes */}
            <Card className="lesson-card">
              <div className="p-6">
                <h5 className="lesson-markdown-title mb-3">Notes personnelles</h5>
                <Textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Idées, stratégies, critères…"
                  className="min-h-[200px] resize-y mb-3"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {notesSaved ? "Sauvegardé" : "Non sauvegardé"}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveNotes}>
                      <Save className="w-4 h-4 mr-1" />
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearNotes}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tip Card */}
            <Card className="lesson-card bg-success/5 border-success/20">
              <div className="p-4">
                <h6 className="font-semibold mb-2 text-sm">Conseil</h6>
                <p className="text-sm text-muted-foreground">
                  Avant de vérifier 9 ou 3, additionne les chiffres une seule fois.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathLesson;
