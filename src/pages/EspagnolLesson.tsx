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
  Award,
  Gamepad2
} from "lucide-react";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import { SpanishPracticeChat } from "@/components/SpanishPracticeChat";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url: string | null;
  activites_interactives: string | null;
  quiz_final: string | null;
  mois: string | null;
  grade_level: string;
}

export default function EspagnolLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [userNickname, setUserNickname] = useState("");
  const { stop } = useTTS();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLesson();
    fetchUserProfile();
  }, [topicId]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.nickname) {
        setUserNickname(profile.nickname);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchLesson = async () => {
    if (!topicId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', topicId)
        .eq('subject_id', '188811d2-c1e8-47a5-954c-7f2187824b1f') // Espagnol subject
        .eq('grade_level', '7AF')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setLesson(data as Lesson);
        loadPersonalNotes();
      } else {
        toast({
          title: "Leçon non trouvée",
          description: "Cette leçon n'existe pas ou n'est pas encore disponible.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la leçon",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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


  const handleQuizComplete = (goldEarned: number) => {
    setEarnedPoints(prev => prev + goldEarned);
    setLessonCompleted(true);

    toast({
      title: "🎉 Bravo !",
      description: `Tu as gagné ${goldEarned} points !`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Languages className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-600" />
          <p className="text-lg text-muted-foreground">Chargement de la leçon...</p>
        </div>
      </div>
    );
  }

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
                    exemples_exercices: lesson.exemples_exercices,
                    youtube_url: lesson.youtube_url || undefined,
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
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); stop(); }} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 h-auto">
              <TabsTrigger value="introduction" className="gap-2 text-xs md:text-sm px-2 py-2">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Introduction</span>
              </TabsTrigger>
              <TabsTrigger value="contenu" className="gap-2 text-xs md:text-sm px-2 py-2">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Contenu & Exemples</span>
              </TabsTrigger>
              <TabsTrigger value="activites" className="gap-2 text-xs md:text-sm px-2 py-2">
                <Gamepad2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Activités</span>
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
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Objectif de la leçon</h2>
                      <TextToSpeechButton text={lesson.objectif} sectionName="Objectif" />
                    </div>
                    <div 
                      className="text-foreground leading-relaxed prose dark:prose-invert max-w-none lesson-content"
                      dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Introduction</h2>
                  </div>
                  <TextToSpeechButton text={lesson.introduction} sectionName="Introduction" />
                </div>
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none lesson-content [&_p]:text-foreground [&_ul]:text-foreground [&_li]:text-foreground [&_strong]:text-purple-600 dark:[&_strong]:text-purple-400"
                  dangerouslySetInnerHTML={{ __html: lesson.introduction }}
                />
              </Card>
            </TabsContent>

            <TabsContent value="contenu" className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Contenu Principal</h3>
                  <TextToSpeechButton text={lesson.contenu} sectionName="Contenu Principal" />
                </div>
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none lesson-content
                    [&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:text-foreground [&_ul]:my-4
                    [&_li]:text-foreground [&_li]:mb-2
                    [&_strong]:text-purple-600 dark:[&_strong]:text-purple-400 [&_strong]:font-semibold
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-purple-600 dark:[&_h3]:text-purple-400 [&_h3]:mb-4 [&_h3]:mt-6
                    [&_section]:p-4 [&_section]:rounded-lg [&_section]:bg-card [&_section]:border [&_section]:border-purple-200/50 dark:[&_section]:border-purple-800/30 [&_section]:mb-6"
                  dangerouslySetInnerHTML={{ __html: lesson.contenu }}
                />
              </Card>
              
              {lesson.exemples_exercices && (
                <>
                  <div className="border-t my-8" />
                  <Card className="p-6 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <ClipboardCheck className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Exemples et Exercices</h2>
                      </div>
                      <TextToSpeechButton text={lesson.exemples_exercices} sectionName="Exemples et Exercices" />
                    </div>
                    <div 
                      className="prose prose-lg dark:prose-invert max-w-none lesson-content
                        [&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-4
                        [&_ul]:text-foreground [&_ul]:my-4
                        [&_li]:text-foreground [&_li]:mb-2
                        [&_strong]:text-purple-600 dark:[&_strong]:text-purple-400 [&_strong]:font-semibold
                        [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-purple-600 dark:[&_h3]:text-purple-400 [&_h3]:mb-4 [&_h3]:mt-6
                        [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-purple-500 dark:[&_h4]:text-purple-300 [&_h4]:mb-3"
                      dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                    />
                  </Card>
                </>
              )}

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

              {/* YouTube Video Section */}
              <div className="mt-6">
                <YouTubeVideoSection 
                  lessonTitle={lesson.title}
                  objectives={lesson.objectif || ""}
                  gradeLevel="7AF"
                  customYoutubeUrl={lesson.youtube_url || undefined}
                  subject="Espagnol"
                />
              </div>
            </TabsContent>

            <TabsContent value="activites" className="space-y-6">
              {/* Spanish Practice Chat */}
              <SpanishPracticeChat
                lessonTitle={lesson.title}
                lessonObjective={lesson.objectif}
                lessonSlug={lesson.slug}
                gradeLevel={lesson.grade_level || "7AF"}
                userNickname={userNickname}
              />

              {/* Interactive Activities */}
              {lesson.activites_interactives ? (
                <InteractiveActivitiesEnhanced 
                  content={lesson.activites_interactives}
                  isLoading={false}
                />
              ) : (
                <Card className="p-8 text-center border-dashed border-2">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucune activité interactive disponible pour cette leçon.</p>
                </Card>
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
              {lesson.quiz_final ? (
                <div>
                  {/* Check if content is in markdown format or HTML */}
                  {lesson.quiz_final.includes('###') && lesson.quiz_final.includes('**TYPE:') ? (
                    <Card className="p-6 bg-gradient-to-br from-background to-purple-50/30 dark:to-purple-950/10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Quiz Final</h2>
                      </div>
                      <InteractiveActivitiesEnhanced 
                        content={lesson.quiz_final}
                        isLoading={false}
                      />
                    </Card>
                  ) : (
                    <HTMLQuizParser 
                      htmlContent={lesson.quiz_final}
                      lessonSlug={lesson.slug}
                      subject="espagnol"
                    />
                  )}
                </div>
              ) : (
                <Card className="p-8 text-center border-dashed border-2">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Quiz final bientôt disponible pour cette leçon !</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </Card>

      </div>
    </div>
  );
}
