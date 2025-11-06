import { useState, useEffect } from "react";
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
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url?: string;
}

const SciencesSocialesLessonAF8 = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (topicId) {
      fetchLesson();
      loadPersonalNotes();
    }
  }, [topicId]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', topicId)
        .eq('grade_level', 'AF8')
        .single();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast.error("Erreur lors du chargement de la leçon");
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', topicId || '')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPersonalNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour sauvegarder vos notes");
        return;
      }

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: topicId || '',
          notes: personalNotes,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Notes sauvegardées avec succès!");
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error("Erreur lors de la sauvegarde des notes");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Leçon non trouvée</h2>
          <Button onClick={() => navigate("/sciences-sociales-af8-course")}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/sciences-sociales-af8-course")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au cours
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container py-8 max-w-4xl space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {lesson.title}
          </h1>
          {lesson.objectif && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm font-medium text-primary">Objectif:</p>
              <p className="text-sm">{lesson.objectif}</p>
            </Card>
          )}
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
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.introduction }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-6">
            <Card className="p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.contenu }}
              />
            </Card>

            {lesson.youtube_url && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Vidéo éducative</h3>
                <div className="aspect-video">
                  <iframe
                    src={lesson.youtube_url}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    title="Vidéo de la leçon"
                  />
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="exemples" className="space-y-6">
            <Card className="p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Mes notes personnelles</h3>
                <p className="text-sm text-muted-foreground">
                  Prenez des notes pour mieux retenir les concepts importants
                </p>
              </div>

              <Textarea
                placeholder="Écrivez vos notes ici..."
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                className="min-h-[300px] resize-none"
              />

              <Button onClick={savePersonalNotes} className="gap-2">
                <Save className="h-4 w-4" />
                Sauvegarder mes notes
              </Button>

              <div className="pt-4 border-t">
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

        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/sciences-sociales-af8-course")}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au cours
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SciencesSocialesLessonAF8;
