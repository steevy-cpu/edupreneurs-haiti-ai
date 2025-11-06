import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, BookOpen, FileText, ListChecks, StickyNote, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";

interface Lesson {
  id: string;
  title: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
}

const MathLessonAF9 = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("introduction");
  const [savingNotes, setSavingNotes] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/mathematiques-af9")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {lesson.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            <strong>Objectif:</strong> {lesson.objectif}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="introduction" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Introduction</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Contenu & Exemples</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <StickyNote className="h-4 w-4" />
              <span className="hidden sm:inline">Mes Notes</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz Final</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-6">
            <Card className="p-6">
              <div 
                className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.introduction }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div 
                className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.contenu }}
              />
              
              {lesson.exemples_exercices && (
                <>
                  <div className="border-t my-8" />
                  <h3 className="text-2xl font-bold mb-4">Exercices</h3>
                  <div 
                    className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                  />
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Mes Notes Personnelles</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Prenez des notes pour mieux retenir cette leçon
                </p>
              </div>
              
              <Textarea
                placeholder="Écrivez vos notes ici..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[300px] resize-none"
              />
              
              <Button 
                onClick={saveNotes} 
                disabled={savingNotes}
                className="w-full sm:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingNotes ? "Sauvegarde..." : "Sauvegarder mes notes"}
              </Button>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Astuce:</strong> Vos notes sont automatiquement sauvegardées et accessibles à tout moment.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <Card className="p-6">
              <InteractiveQuiz
                content=""
                isLoading={false}
                lessonGoldReward={50}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MathLessonAF9;
