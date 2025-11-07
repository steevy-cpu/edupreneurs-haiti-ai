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
  Languages,
  Trophy,
  NotebookPen,
  Save,
  Award
} from "lucide-react";
import { espagnolLessons7AF } from "@/data/espagnolLessons";
import {
  saludoPresentacionQuiz,
  saludoPresentacionMatching,
  saludosAgradecimientosQuiz,
  saludosAgradecimientosMatching,
  gustosQuiz,
  gustosMatching,
  aulaPatioQuiz,
  aulaPatioMatching,
  diasFechasQuiz,
  diasFechasMatching,
  laCasaQuiz,
  laCasaMatching,
  laFamiliaQuiz,
  laFamiliaMatching,
  losAlimentosQuiz,
  losAlimentosMatching,
  lasActividadesCotidianasQuiz,
  lasActividadesCotidianasMatching,
  invitacionQuiz,
  invitacionMatching,
  obligacionQuiz,
  obligacionMatching,
} from "@/data/espagnolActivities";
import { QuizGame } from "@/components/math-activities/QuizGame";
import { MatchingGame } from "@/components/math-activities/MatchingGame";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function EspagnolLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);

  const lessonsArray = Object.entries(espagnolLessons7AF).map(([id, data]) => ({ id, ...data }));
  const currentIndex = lessonsArray.findIndex((lesson) => lesson.id === topicId);
  const lesson = lessonsArray[currentIndex];

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPersonalNotes();
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

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', `espagnol-${topicId}`)
        .maybeSingle();

      if (!error && data) {
        setPersonalNotes((data as any)?.notes || "");
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
          lesson_id: `espagnol-${topicId}`,
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
  const quizMap: Record<string, { quiz: any; matching: any }> = {
    "saludo-presentacion": { quiz: saludoPresentacionQuiz, matching: saludoPresentacionMatching },
    "saludos-agradecimientos": { quiz: saludosAgradecimientosQuiz, matching: saludosAgradecimientosMatching },
    "gustos": { quiz: gustosQuiz, matching: gustosMatching },
    "aula-patio": { quiz: aulaPatioQuiz, matching: aulaPatioMatching },
    "dias-fechas": { quiz: diasFechasQuiz, matching: diasFechasMatching },
    "la-casa": { quiz: laCasaQuiz, matching: laCasaMatching },
    "la-familia": { quiz: laFamiliaQuiz, matching: laFamiliaMatching },
    "los-alimentos": { quiz: losAlimentosQuiz, matching: losAlimentosMatching },
    "las-actividades-cotidianas": { quiz: lasActividadesCotidianasQuiz, matching: lasActividadesCotidianasMatching },
    "invitacion": { quiz: invitacionQuiz, matching: invitacionMatching },
    "obligacion": { quiz: obligacionQuiz, matching: obligacionMatching },
  };
    return topicId ? quizMap[topicId] || null : null;
  };

  const quizData = getQuizData();

  const handleQuizComplete = (goldEarned: number) => {
    setEarnedPoints(prev => prev + goldEarned);
    setLessonCompleted(true);

    toast({
      title: "🎉 Bravo !",
      description: `Tu as gagné ${goldEarned} points !`,
    });
  };

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Leçon non trouvée</h2>
          <Button onClick={() => navigate("/espagnol-course")}>
            Retour au cours
          </Button>
        </div>
      </div>
    );
  }

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessonsArray.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      navigate(`/espagnol-lesson/${lessonsArray[currentIndex - 1].id}`);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      navigate(`/espagnol-lesson/${lessonsArray[currentIndex + 1].id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/espagnol-course")}
                className="gap-2 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-semibold">Retour au cours</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {lesson && (
                <DownloadLessonButton
                  lessonData={{
                    title: lesson.title,
                    objectif: lesson.objectif,
                    introduction: lesson.introduction,
                    contenu: lesson.contenu,
                    exemples_exercices: lesson.exemplesExercices,
                    youtube_url: youtubeUrl || undefined,
                  }}
                  personalNotes={personalNotes}
                  subjectName="Espagnol AF7"
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                />
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Lesson Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
              <Languages className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">Espagnol</Badge>
                <Badge variant="outline">Niveau 7AF</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 break-words">{lesson.title}</h1>
              <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  45 min
                </span>
                <span className="flex items-center gap-1">
                  📅 {lesson.mois}
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
        <Card className="p-4 md:p-6 mb-8 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 h-auto">
              <TabsTrigger value="introduction" className="gap-2 text-xs md:text-sm px-2 py-2">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Introduction</span>
              </TabsTrigger>
              <TabsTrigger value="contenu" className="gap-2 text-xs md:text-sm px-2 py-2">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Contenu & Exemples</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2 text-xs md:text-sm px-2 py-2">
                <NotebookPen className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Mes Notes</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2 text-xs md:text-sm px-2 py-2">
                <Trophy className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Quiz Final</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="introduction" className="space-y-6">
              <Card className="p-6 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20 dark:to-transparent">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">Objectif de la leçon</h2>
                    <div 
                      className="text-foreground leading-relaxed prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Introduction</h2>
                </div>
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none [&_p]:text-foreground [&_ul]:text-foreground [&_li]:text-foreground [&_strong]:text-purple-600 dark:[&_strong]:text-purple-400"
                  dangerouslySetInnerHTML={{ __html: lesson.introduction }}
                />
              </Card>
            </TabsContent>

            <TabsContent value="contenu" className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none
                    [&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:text-foreground [&_ul]:my-4
                    [&_li]:text-foreground [&_li]:mb-2
                    [&_strong]:text-purple-600 dark:[&_strong]:text-purple-400 [&_strong]:font-semibold
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-purple-600 dark:[&_h3]:text-purple-400 [&_h3]:mb-4 [&_h3]:mt-6
                    [&_section]:p-4 [&_section]:rounded-lg [&_section]:bg-card [&_section]:border [&_section]:border-purple-200/50 dark:[&_section]:border-purple-800/30 [&_section]:mb-6"
                  dangerouslySetInnerHTML={{ __html: lesson.contenu }}
                />
              </Card>
              
              {/* YouTube Video Section */}
              <div className="mt-8">
                <YouTubeVideoSection 
                  lessonTitle={lesson.title}
                  objectives={lesson.objectif || ""}
                  gradeLevel="7AF"
                  customYoutubeUrl={youtubeUrl || "https://www.youtube.com/watch?v=2z2G7y5s8n8"}
                  subject="Espagnol"
                />
              </div>

              {/* Additional Resources Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">💡 Le savais-tu ?</h3>
                    <p className="text-foreground">
                      L'espagnol est parlé par plus de 500 millions de personnes dans le monde ! C'est la langue officielle de 21 pays, dont notre voisin la République Dominicaine. Apprendre l'espagnol ouvre des portes pour voyager, étudier et travailler dans toute l'Amérique latine et l'Espagne.
                    </p>
                  </div>
                </div>
              </Card>
              
              {lesson.exemplesExercices && (
                <>
                  <div className="border-t my-8" />
                  <Card className="p-6 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Exemples et Exercices</h2>
                    </div>
                    <div 
                      className="prose prose-lg dark:prose-invert max-w-none
                        [&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-4
                        [&_ul]:text-foreground [&_ul]:my-4
                        [&_li]:text-foreground [&_li]:mb-2
                        [&_strong]:text-purple-600 dark:[&_strong]:text-purple-400 [&_strong]:font-semibold
                        [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-purple-600 dark:[&_h3]:text-purple-400 [&_h3]:mb-4 [&_h3]:mt-6
                        [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-purple-500 dark:[&_h4]:text-purple-300 [&_h4]:mb-3"
                      dangerouslySetInnerHTML={{ __html: lesson.exemplesExercices }}
                    />
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-background to-amber-50/30 dark:to-amber-950/10 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                    <NotebookPen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400">Mes Notes Personnelles</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Prends des notes pour t'aider à réviser cette leçon plus tard. Tes notes sont sauvegardées automatiquement.
                  </p>
                  <Textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Écris tes notes ici... (vocabulaire important, questions, idées, etc.)"
                    className="min-h-[300px] text-base"
                  />
                  <Button 
                    onClick={savePersonalNotes}
                    disabled={isSavingNotes}
                    className="w-full gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingNotes ? "Sauvegarde en cours..." : "Sauvegarder mes notes"}
                  </Button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-l-4 border-l-blue-500">
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Conseils pour prendre des notes efficaces</h3>
                  <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                    <li>• Note les mots de vocabulaire nouveaux avec leur traduction</li>
                    <li>• Écris des exemples de phrases pour mieux comprendre</li>
                    <li>• Résume les règles de grammaire dans tes propres mots</li>
                    <li>• Pose-toi des questions sur ce que tu ne comprends pas encore</li>
                    <li>• Relie les concepts à des situations de la vie quotidienne en Haïti</li>
                  </ul>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-6">
              {quizData ? (
                <>
                  <Card className="p-6 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10 border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Quiz de validation</h2>
                        <p className="text-sm text-muted-foreground">Teste tes connaissances et gagne des points !</p>
                      </div>
                    </div>
                    <QuizGame
                      topic={lesson.title}
                      questions={quizData.quiz.questions}
                      onComplete={handleQuizComplete}
                    />
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-background to-blue-50/30 dark:to-blue-950/10 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Jeu d'association</h2>
                        <p className="text-sm text-muted-foreground">Associe les mots espagnols à leur traduction</p>
                      </div>
                    </div>
                    <MatchingGame
                      pairs={quizData.matching.pairs}
                      onComplete={handleQuizComplete}
                    />
                  </Card>

                  {lessonCompleted && (
                    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-500">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-green-700 dark:text-green-300">🎉 Félicitations !</h3>
                          <p className="text-green-600 dark:text-green-400">Tu as complété cette leçon et gagné <strong>{earnedPoints} points d'or</strong> !</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="p-12 text-center border-dashed border-2">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Quiz bientôt disponible</h3>
                  <p className="text-muted-foreground">
                    Le quiz interactif pour cette leçon sera ajouté prochainement !
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between flex-wrap">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={!hasPrevious}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Leçon précédente
          </Button>
          <Button
            onClick={goToNext}
            disabled={!hasNext}
            className="gap-2"
          >
            Leçon suivante
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
