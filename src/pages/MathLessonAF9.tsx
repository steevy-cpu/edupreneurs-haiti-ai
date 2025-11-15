import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, BookOpen, FileText, ListChecks, StickyNote, CheckCircle2, Target, Gamepad2, ArrowLeft, Lightbulb } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { supabase } from "@/integrations/supabase/client";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { EricChatbot } from "@/components/EricChatbot";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import ericChairDesk from "@/assets/eric-chair-desk.png";

interface Lesson {
  id: string;
  title: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  activites_interactives?: string;
  quiz_final?: string;
  youtube_url?: string | null;
}

const MathLessonAF9 = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("introduction");
  const [savingNotes, setSavingNotes] = useState(false);
  const { stop } = useTTS();

  useEffect(() => {
    fetchLesson();
    fetchNotes();
  }, [lessonSlug]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("slug", lessonSlug)
        .eq("grade_level", "AF9")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLesson(data);
      } else {
        toast.error("Leçon non trouvée");
        navigate("/mathematiques-af9");
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast.error("Erreur lors du chargement de la leçon");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("lesson_notes")
        .select("notes")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonSlug)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setNotes(data.notes || "");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour sauvegarder vos notes");
        return;
      }

      const { error } = await supabase
        .from("lesson_notes")
        .upsert({
          user_id: user.id,
          lesson_id: lessonSlug!,
          notes: notes,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Notes sauvegardées avec succès !");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Erreur lors de la sauvegarde des notes");
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/mathematiques-af9")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux leçons
          </Button>
          <div className="flex items-center gap-2">
            {lesson && (
              <DownloadLessonButton
                lessonData={lesson}
                personalNotes={notes}
                subjectName="Mathématiques AF9"
                variant="outline"
                size="sm"
              />
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 max-w-6xl mx-auto">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
                {lesson.title}
              </h1>
              <div 
                className="text-sm md:text-base lg:text-lg opacity-90 prose prose-invert prose-sm md:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.objectif }}
              />
            </div>
            <div className="flex-shrink-0">
              <img
                src={ericChairDesk}
                alt="Eric au bureau"
                className="w-32 md:w-40 lg:w-48 h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); stop(); }} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-4 md:mb-8 h-auto">
            <TabsTrigger value="introduction" className="gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Lightbulb className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Introduction</span>
              <span className="sm:hidden">Intro</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Contenu</span>
              <span className="sm:hidden">Cours</span>
            </TabsTrigger>
            <TabsTrigger value="exercices" className="gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <FileText className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Exercices</span>
              <span className="sm:hidden">Exer</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <Gamepad2 className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Activités</span>
              <span className="sm:hidden">Jeux</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
              <span>Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1 md:gap-2 py-2 md:py-2.5 text-xs md:text-sm">
              <StickyNote className="h-3 w-3 md:h-4 md:w-4" />
              <span>Notes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="mt-0">
            <Card className="border-orange-200 dark:border-orange-900">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                    Introduction
                  </h3>
                  <TextToSpeechButton text={lesson.introduction} sectionName="Introduction" size="sm" />
                </div>
                <div 
                  className="prose prose-sm md:prose prose-orange dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.introduction }}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="mt-0">
            <Card className="border-orange-200 dark:border-orange-900">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                    Contenu Principal
                  </h3>
                  <TextToSpeechButton text={lesson.contenu} sectionName="Contenu" size="sm" />
                </div>
                <div 
                  className="prose prose-sm md:prose prose-orange dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.contenu }}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="exercices" className="mt-0">
            <Card className="border-orange-200 dark:border-orange-900">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                    Exemples et Exercices
                  </h3>
                  <TextToSpeechButton text={lesson.exemples_exercices} sectionName="Exercices" size="sm" />
                </div>
                <div 
                  className="prose prose-sm md:prose prose-orange dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="mt-0">
            <Card className="border-orange-200 dark:border-orange-900">
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <Gamepad2 className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                  <h3 className="text-lg md:text-2xl font-bold">Activités Interactives</h3>
                </div>
                {lesson.activites_interactives ? (
                  <InteractiveActivitiesEnhanced 
                    content={lesson.activites_interactives} 
                    isLoading={false}
                  />
                ) : (
                  <p className="text-sm md:text-base text-muted-foreground">Aucune activité interactive disponible pour cette leçon.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="mt-0">
            <Card className="border-orange-200 dark:border-orange-900">
              <div className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4 md:mb-6">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                  <h3 className="text-lg md:text-2xl font-bold">Quiz Final</h3>
                </div>
                {lesson.quiz_final ? (
                  <HTMLQuizParser 
                    htmlContent={lesson.quiz_final}
                    lessonSlug={lessonSlug || ''}
                    subject="Mathématiques AF9"
                  />
                ) : (
                  <p className="text-sm md:text-base text-muted-foreground">Aucun quiz disponible pour cette leçon.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <Card className="border-orange-200 dark:border-orange-900">
              <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
                  <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                    <StickyNote className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                    Mes Notes
                  </h3>
                  <Button
                    onClick={saveNotes}
                    disabled={savingNotes}
                    size="sm"
                    className="gap-2 w-full sm:w-auto"
                  >
                    {savingNotes ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Écrivez vos notes personnelles ici..."
                  className="min-h-[250px] md:min-h-[300px] text-sm md:text-base"
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* YouTube Video Section */}
        {lesson.youtube_url && (
          <div className="mt-6 md:mt-8">
            <YouTubeVideoSection
              lessonTitle={lesson.title}
              subject="Mathématiques"
              gradeLevel="AF9"
              objectives={lesson.objectif}
              customYoutubeUrl={lesson.youtube_url}
            />
          </div>
        )}
      </div>

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
};

export default MathLessonAF9;
