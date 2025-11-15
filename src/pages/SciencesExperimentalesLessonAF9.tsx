import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { EricChatbot } from "@/components/EricChatbot";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import ericTeaching from "@/assets/eric-teaching.png";

interface Lesson {
  id: string;
  title: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url: string | null;
  activites_interactives: string | null;
  quiz_final: string | null;
}

export default function SciencesExpérimentalesLessonAF9() {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("introduction");
  const { stop } = useTTS();

  useEffect(() => {
    fetchLesson();
    fetchNotes();
  }, [lessonSlug]);

  const fetchLesson = async () => {
    try {
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("slug", "sciences-experimentales")
        .eq("grade_level", "AF9")
        .single();

      if (subjectError) throw subjectError;

      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, objectif, introduction, contenu, exemples_exercices, youtube_url, activites_interactives, quiz_final")
        .eq("subject_id", subjectData.id)
        .eq("slug", lessonSlug)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Leçon non trouvée");
        navigate("/sciences-experimentales-af9");
        return;
      }

      setLesson(data);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast.error("Erreur lors du chargement de la leçon");
      navigate("/sciences-experimentales-af9");
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
        .eq("lesson_id", lessonSlug || "")
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour sauvegarder des notes");
        return;
      }

      setIsSaving(true);

      const { error } = await supabase
        .from("lesson_notes")
        .upsert({
          user_id: user.id,
          lesson_id: lessonSlug || "",
          notes: notes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,lesson_id"
        });

      if (error) throw error;

      toast.success("Notes sauvegardées avec succès!");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Erreur lors de la sauvegarde des notes");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/sciences-experimentales-af9")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold">Retour aux leçons</span>
            </Button>
            <div className="flex items-center gap-2">
              {lesson && (
                <DownloadLessonButton
                  lessonData={lesson}
                  personalNotes={notes}
                  subjectName="Sciences Expérimentales AF9"
                  variant="outline"
                  size="sm"
                />
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-20 md:pt-24 pb-8 md:pb-12">
        {/* Lesson Header */}
        <Card className="p-4 md:p-8 mb-6 md:mb-8 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{lesson.title}</h1>
          <div className="flex items-start gap-2 md:gap-3">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2 gap-2">
                <p className="text-base md:text-lg font-semibold">Objectif de la leçon</p>
                <TextToSpeechButton 
                  text={lesson.objectif.replace(/<[^>]*>/g, '').replace(/🎯\s*Objectifs\.{3}/gi, '').trim()} 
                  sectionName="Objectif" 
                  size="sm" 
                />
              </div>
              <p className="text-sm md:text-lg text-muted-foreground">
                {lesson.objectif.replace(/<[^>]*>/g, '').replace(/🎯\s*Objectifs\.{3}/gi, '').trim()}
              </p>
            </div>
          </div>
        </Card>

        {/* Lesson Content */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); stop(); }} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 h-auto">
            <TabsTrigger value="introduction" className="text-xs md:text-sm px-2 md:px-4">
              <span className="hidden md:inline">Introduction</span>
              <span className="md:hidden">Intro</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="text-xs md:text-sm px-2 md:px-4">
              <span className="hidden md:inline">Contenu & Exercices</span>
              <span className="md:hidden">Exer</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs md:text-sm px-2 md:px-4">
              <span className="hidden md:inline">Mes Notes</span>
              <span className="md:hidden">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="text-xs md:text-sm px-2 md:px-4 col-span-3 md:col-span-1">
              <span className="hidden md:inline">Quiz Final</span>
              <span className="md:hidden">Quiz</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-4">
            <Card className="p-4 md:p-8">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-xl md:text-2xl font-bold">📖 Introduction</h2>
                <TextToSpeechButton text={lesson.introduction || ""} sectionName="Introduction" size="sm" />
              </div>
              <div 
                className="prose prose-sm md:prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.introduction || "<p>Introduction à venir...</p>" }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-4">
            <Card className="p-4 md:p-8 space-y-4 md:space-y-6">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-xl md:text-2xl font-bold">📚 Contenu du cours</h2>
                <TextToSpeechButton text={lesson.contenu || ""} sectionName="Contenu Principal" size="sm" />
              </div>
              <div 
                className="prose prose-sm md:prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.contenu || "<p>Contenu à venir...</p>" }}
              />
              
              {lesson.exemples_exercices && (
                <>
                  <div className="border-t my-6 md:my-8" />
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <h2 className="text-xl md:text-2xl font-bold">✏️ Exemples et Exercices</h2>
                    <TextToSpeechButton text={lesson.exemples_exercices} sectionName="Exemples et Exercices" size="sm" />
                  </div>
                  <div 
                    className="prose prose-sm md:prose prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                  />
                </>
              )}
            </Card>

            {lesson.activites_interactives && (
              <Card className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <h2 className="text-xl md:text-2xl font-bold">🎮 Activités Interactives</h2>
                  <img 
                    src={ericTeaching} 
                    alt="Eric" 
                    className="w-16 h-16 md:w-20 md:h-20 object-contain"
                  />
                </div>
                <InteractiveActivitiesEnhanced 
                  content={lesson.activites_interactives} 
                  isLoading={false}
                />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card className="p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">📝 Mes Notes Personnelles</h2>
              <Textarea
                placeholder="Écrivez vos notes ici..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px] md:min-h-[300px] mb-4 text-sm md:text-base"
              />
              <Button onClick={saveNotes} disabled={isSaving} size="sm" className="w-full md:w-auto">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  "Sauvegarder mes notes"
                )}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-4">
            <Card className="p-4 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">🎯 Quiz Final</h2>
              {lesson.quiz_final ? (
                <HTMLQuizParser 
                  htmlContent={lesson.quiz_final}
                  lessonSlug={lessonSlug || ""}
                  subject="sciences-experimentales"
                />
              ) : (
                <p className="text-muted-foreground">Quiz interactif à venir pour tester vos connaissances...</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* YouTube Video Section */}
        {lesson.youtube_url && (
          <div className="mt-6 md:mt-8">
            <YouTubeVideoSection
              lessonTitle={lesson.title}
              subject="Sciences Expérimentales"
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
}
