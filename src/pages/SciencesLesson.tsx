import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  BookOpen,
  Lightbulb,
  ClipboardCheck,
  Beaker,
  Award,
  Trophy,
  NotebookPen,
  Save
} from "lucide-react";
import { sciencesLessons7AF, sciencesTopics } from "@/data/sciencesLessons";
import { 
  structureTerreQuiz, 
  volcansQuiz, 
  structureTerreMatching, 
  volcansMatching 
} from "@/data/sciencesActivities";
import { QuizGame } from "@/components/math-activities/QuizGame";
import { MatchingGame } from "@/components/math-activities/MatchingGame";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LessonMusicPlayer } from "@/components/LessonMusicPlayer";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SciencesLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const lessonContent = topicId ? sciencesLessons7AF[topicId] : null;
  const topicInfo = sciencesTopics.find(topic => topic.id === topicId);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPersonalNotes();
  }, [topicId]);

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', `sciences-${topicId}`)
        .maybeSingle();

      if (data && !error) {
        setPersonalNotes(data.notes || "");
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      setIsSavingNotes(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Tu dois être connecté pour sauvegarder tes notes",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('lesson_notes' as any)
        .upsert({
          user_id: user.id,
          lesson_id: `sciences-${topicId}`,
          notes: personalNotes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      toast({
        title: "✅ Notes sauvegardées !",
        description: "Tes notes personnelles ont été enregistrées",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive"
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getQuizData = () => {
    switch (topicId) {
      case "structure-terre":
        return { quiz: structureTerreQuiz, matching: structureTerreMatching };
      case "volcans":
        return { quiz: volcansQuiz, matching: volcansMatching };
      default:
        return null;
    }
  };

  const quizData = getQuizData();

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100;
    const points = Math.round(percentage * 2);
    
    setEarnedPoints(points);
    setLessonCompleted(true);

    toast({
      title: "🎉 Quiz terminé !",
      description: `Excellent travail ! Score: ${score}/${totalQuestions}`,
    });
  };

  if (!lessonContent || !topicInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Leçon non trouvée</h2>
          <Button onClick={() => navigate("/sciences-course")}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/sciences-course")}
                className="gap-2 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-semibold">Retour au cours</span>
              </Button>
              <LessonMusicPlayer />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Lesson Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Beaker className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{topicInfo.category}</Badge>
                <Badge variant="outline">{topicInfo.difficulty}</Badge>
              </div>
              <h1 className="text-4xl font-bold mb-3">{topicInfo.title}</h1>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {topicInfo.duration}
                </span>
                {lessonCompleted && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <Award className="w-4 h-4" />
                    +{earnedPoints} points gagnés
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Lesson Content Tabs */}
        <Card className="p-6 mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="introduction" className="gap-2">
                <Lightbulb className="w-4 h-4" />
                Introduction
              </TabsTrigger>
              <TabsTrigger value="contenu" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Contenu
              </TabsTrigger>
              <TabsTrigger value="exemples" className="gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Exemples
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <NotebookPen className="w-4 h-4" />
                Mes Notes
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2">
                <Trophy className="w-4 h-4" />
                Quiz Final
              </TabsTrigger>
            </TabsList>

            <TabsContent value="introduction" className="space-y-6">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonContent.introduction }}
              />
            </TabsContent>

            <TabsContent value="contenu" className="space-y-6">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonContent.contenu }}
              />
            </TabsContent>

            <TabsContent value="exemples" className="space-y-6">
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lessonContent.exemplesExercices }}
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <NotebookPen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Notes Personnelles</h2>
                  <p className="text-muted-foreground">Prends des notes pour mieux retenir la leçon</p>
                </div>
              </div>
              
              <Card className="p-6">
                <Textarea
                  placeholder="Écris tes notes ici... Ce que tu as appris, les points importants à retenir, tes questions..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[400px] text-base resize-none"
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={savePersonalNotes}
                    disabled={isSavingNotes}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingNotes ? "Sauvegarde..." : "Sauvegarder mes notes"}
                  </Button>
                </div>
              </Card>
              
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  Conseils pour prendre des notes efficaces
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Note les définitions importantes et les formules</li>
                  <li>• Écris avec tes propres mots pour mieux comprendre</li>
                  <li>• Dessine des schémas si ça t'aide à visualiser</li>
                  <li>• Note les questions que tu as pour les réviser plus tard</li>
                  <li>• Relis tes notes régulièrement pour mieux mémoriser</li>
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-6">
              {quizData ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Quiz Final</h2>
                      <p className="text-muted-foreground">Teste tes connaissances sur cette leçon</p>
                    </div>
                  </div>

                  <Tabs defaultValue="quiz" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="quiz">Quiz</TabsTrigger>
                      <TabsTrigger value="matching">Associer les termes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="quiz">
                      <QuizGame 
                        key={`quiz-${quizKey}`}
                        topic={topicInfo.title}
                        questions={quizData.quiz} 
                        onComplete={(score, goldEarned) => {
                          setEarnedPoints(goldEarned);
                          setLessonCompleted(true);
                          toast({
                            title: "🎉 Quiz terminé !",
                            description: `Excellent travail ! Score: ${score}/${quizData.quiz.length}`,
                          });
                        }}
                        onRegenerate={() => setQuizKey(prev => prev + 1)}
                      />
                    </TabsContent>

                    <TabsContent value="matching">
                      <MatchingGame 
                        key={`matching-${quizKey}`}
                        pairs={quizData.matching}
                        onComplete={(goldEarned) => {
                          setEarnedPoints(goldEarned);
                          setLessonCompleted(true);
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Quiz à venir pour cette leçon</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/sciences-course")}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour au cours
          </Button>
          <Button 
            onClick={() => {
              const currentIndex = sciencesTopics.findIndex(t => t.id === topicId);
              const nextTopic = sciencesTopics[currentIndex + 1];
              if (nextTopic) {
                navigate(`/sciences-lesson/${nextTopic.id}`);
              } else {
                toast({
                  title: "🎉 Félicitations !",
                  description: "Tu as terminé tous les cours de Sciences Expérimentales !",
                });
              }
            }}
            className="flex-1"
            disabled={!sciencesTopics[sciencesTopics.findIndex(t => t.id === topicId) + 1]}
          >
            Leçon suivante
            <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}