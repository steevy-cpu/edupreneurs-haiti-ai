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
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { EricChatbot } from "@/components/EricChatbot";

interface Lesson {
  id: string;
  title: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url: string | null;
  quiz_final: string | null;
  activites_interactives: string | null;
}

export default function SciencesExpérimentalesLesson7AF() {
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
        .eq("slug", "sciences-experimentales-7af")
        .eq("grade_level", "7AF")
        .single();

      if (subjectError) throw subjectError;

      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, objectif, introduction, contenu, exemples_exercices, youtube_url, quiz_final, activites_interactives")
        .eq("subject_id", subjectData.id)
        .eq("slug", lessonSlug)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Leçon non trouvée");
        navigate("/sciences-experimentales-7af");
        return;
      }

      setLesson(data);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast.error("Erreur lors du chargement de la leçon");
      navigate("/sciences-experimentales-7af");
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/sciences-experimentales-7af")}
              className="gap-1 sm:gap-2 px-2 sm:px-4"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold text-xs sm:text-sm">Retour aux leçons</span>
            </Button>
            <div className="flex items-center gap-1 sm:gap-2">
              {lesson && (
                <DownloadLessonButton
                  lessonData={lesson}
                  personalNotes={notes}
                  subjectName="Sciences Expérimentales 7AF"
                  variant="outline"
                  size="sm"
                />
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-12">
        {/* Lesson Header */}
        <Card className="p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border-cyan-500/20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 hyphens-auto">{lesson.title}</h1>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-1" />
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <p className="text-base sm:text-lg font-semibold">Objectif de la leçon</p>
                <TextToSpeechButton text={lesson.objectif} sectionName="Objectif" />
              </div>
              <div 
                className="lesson-content prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.objectif }}
              />
            </div>
          </div>
        </Card>

        {/* Lesson Content */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); stop(); }} className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-1 h-auto">
            <TabsTrigger value="introduction" className="text-xs sm:text-sm py-2">Introduction</TabsTrigger>
            <TabsTrigger value="contenu" className="text-xs sm:text-sm py-2">Contenu & Exercices</TabsTrigger>
            <TabsTrigger value="activites" className="text-xs sm:text-sm py-2">Activités</TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm py-2">Mes Notes</TabsTrigger>
            <TabsTrigger value="quiz" className="text-xs sm:text-sm py-2">Quiz Final</TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-4">
            <Card className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">📖 Introduction</h2>
                <TextToSpeechButton text={lesson.introduction || ""} sectionName="Introduction" />
              </div>
              <div 
                className="lesson-content prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.introduction || "<p>Introduction à venir...</p>" }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-4">
            <Card className="p-4 sm:p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">📚 Contenu du cours</h2>
                <TextToSpeechButton text={lesson.contenu || ""} sectionName="Contenu Principal" />
              </div>
              <div 
                className="lesson-content prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.contenu || "<p>Contenu à venir...</p>" }}
              />
              
              {lesson.exemples_exercices && (
                <>
                  <div className="border-t my-6 sm:my-8" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold">✏️ Exemples et Exercices</h2>
                    <TextToSpeechButton text={lesson.exemples_exercices} sectionName="Exemples et Exercices" />
                  </div>
                  <div 
                    className="lesson-content prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                  />
                </>
              )}
            </Card>

            {/* YouTube Video Section */}
            <YouTubeVideoSection
              lessonTitle={lesson.title}
              objectives={lesson.objectif}
              gradeLevel="7AF"
              customYoutubeUrl={lesson.youtube_url || undefined}
              subject="sciences"
            />
          </TabsContent>

          <TabsContent value="activites" className="space-y-4">
            <Card className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">🎮 Activités Interactives</h2>
                {lesson.activites_interactives && (
                  <TextToSpeechButton text={lesson.activites_interactives} sectionName="Activités" />
                )}
              </div>
              {lesson.activites_interactives ? (
                <InteractiveActivitiesEnhanced 
                  content={lesson.activites_interactives}
                  isLoading={false}
                />
              ) : (
                <p className="text-sm sm:text-base text-muted-foreground">Activités interactives à venir pour pratiquer vos connaissances...</p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">📝 Mes Notes Personnelles</h2>
              <Textarea
                placeholder="Écrivez vos notes ici..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px] sm:min-h-[300px] mb-4 text-sm sm:text-base"
              />
              <Button onClick={saveNotes} disabled={isSaving} className="w-full sm:w-auto">
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
            <Card className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">🎯 Quiz Final</h2>
              {lesson.quiz_final ? (
                <InteractiveQuiz 
                  content={lesson.quiz_final}
                  isLoading={false}
                />
              ) : (
                <p className="text-sm sm:text-base text-muted-foreground">Quiz interactif à venir pour tester vos connaissances...</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
}