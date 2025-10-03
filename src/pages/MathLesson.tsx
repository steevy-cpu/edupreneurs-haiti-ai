import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  Gamepad2,
  CheckCircle,
  Trophy,
  Brain,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MathLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("lesson");
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [lessonContent, setLessonContent] = useState("");
  const [earnedGold, setEarnedGold] = useState(0);

  const topicInfo: { [key: string]: { title: string; icon: string; goldReward: number } } = {
    "nombres-entiers": { 
      title: "Les Nombres Entiers", 
      icon: "🔢",
      goldReward: 100
    },
    "equations-second-degre": { 
      title: "Équations du Second Degré", 
      icon: "📈",
      goldReward: 150
    }
  };

  const currentTopic = topicInfo[topicId || ""] || topicInfo["nombres-entiers"];

  const loadLesson = async () => {
    setIsLoadingLesson(true);
    try {
      const { data, error } = await supabase.functions.invoke('math-ai-tutor', {
        body: {
          message: `Explique-moi de manière simple et amusante le chapitre "${currentTopic.title}" pour un élève de Terminale. Utilise des exemples concrets et du créole haïtien quand c'est nécessaire pour mieux faire comprendre.`,
          lessonType: 'lesson',
          chatHistory: []
        }
      });

      if (error) throw error;
      setLessonContent(data.response);
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

  const completeActivity = (activityType: string, goldEarned: number) => {
    setEarnedGold(prev => prev + goldEarned);
    toast({
      title: "Bravo! 🎉",
      description: `Tu as gagné ${goldEarned} gold!`,
    });
  };

  if (!lessonContent && !isLoadingLesson) {
    loadLesson();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/math-course')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{currentTopic.icon}</div>
                <div>
                  <h1 className="text-xl font-bold">{currentTopic.title}</h1>
                  <p className="text-sm text-muted-foreground">Apprends en t'amusant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="font-bold gold-text">+{earnedGold}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lesson" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Leçon
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              Activités
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Brain className="w-4 h-4" />
              Quiz
            </TabsTrigger>
          </TabsList>

          {/* Lesson Tab */}
          <TabsContent value="lesson" className="space-y-6">
            <Card className="p-8">
              {isLoadingLesson ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Chargement de la leçon...</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-base leading-relaxed">
                    {lessonContent}
                  </div>
                </div>
              )}
            </Card>

            <div className="flex justify-end gap-4">
              <Button 
                size="lg"
                onClick={() => {
                  completeActivity('lesson', 20);
                  setActiveTab('activities');
                }}
              >
                Passer aux Activités
                <Zap className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Drag & Drop</h3>
                      <p className="text-sm text-muted-foreground">Glisse les nombres</p>
                    </div>
                  </div>
                  <p className="text-sm">
                    Place les nombres entiers dans le bon ordre sur la droite numérique
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="w-3 h-3" />
                      +30 gold
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => completeActivity('drag-drop', 30)}
                    >
                      Jouer
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <span className="text-2xl">🎮</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Calcul Rapide</h3>
                      <p className="text-sm text-muted-foreground">Rapidité et précision</p>
                    </div>
                  </div>
                  <p className="text-sm">
                    Résous un maximum d'opérations en 60 secondes!
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="w-3 h-3" />
                      +40 gold
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => completeActivity('speed-calc', 40)}
                    >
                      Jouer
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                      <span className="text-2xl">🔗</span>
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
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="w-3 h-3" />
                      +25 gold
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => completeActivity('matching', 25)}
                    >
                      Jouer
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <span className="text-2xl">✍️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Complète</h3>
                      <p className="text-sm text-muted-foreground">Remplis les blancs</p>
                    </div>
                  </div>
                  <p className="text-sm">
                    Complete les équations avec les bons nombres
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="w-3 h-3" />
                      +35 gold
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => completeActivity('fill-blank', 35)}
                    >
                      Jouer
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button 
                size="lg"
                onClick={() => setActiveTab('quiz')}
              >
                Passer au Quiz Final
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz" className="space-y-6">
            <Card className="p-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Quiz Final</h2>
                  <p className="text-muted-foreground">
                    Teste tes connaissances et gagne jusqu'à 100 gold!
                  </p>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <Card className="p-4 bg-primary/10 border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Questions</p>
                    <p className="text-2xl font-bold">10</p>
                  </Card>
                  <Card className="p-4 bg-secondary/10 border-secondary/20">
                    <p className="text-sm text-muted-foreground mb-1">Temps</p>
                    <p className="text-2xl font-bold">5 min</p>
                  </Card>
                  <Card className="p-4 bg-accent/10 border-accent/20">
                    <p className="text-sm text-muted-foreground mb-1">Gold</p>
                    <p className="text-2xl font-bold gold-text">100</p>
                  </Card>
                </div>

                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary"
                  onClick={() => {
                    completeActivity('quiz', 100);
                    toast({
                      title: "Félicitations! 🏆",
                      description: `Tu as complété le chapitre "${currentTopic.title}"!`,
                    });
                    setTimeout(() => navigate('/math-course'), 2000);
                  }}
                >
                  Commencer le Quiz
                  <Trophy className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MathLesson;
