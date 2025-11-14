import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, BookOpen, FileText, ListChecks, StickyNote, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import DOMPurify from "dompurify";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  activites_interactives?: string;
  quiz_final?: string;
  youtube_url?: string;
}

const SciencesSocialesLessonAF8 = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const { stop } = useTTS();

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
          <div className="flex items-center gap-2">
            {lesson && (
              <DownloadLessonButton
                lessonData={lesson}
                personalNotes={personalNotes}
                subjectName="Sciences Sociales AF8"
                variant="outline"
                size="sm"
              />
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container py-8 max-w-4xl space-y-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Chargement de la leçon...</p>
          </div>
        ) : !lesson ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Leçon non trouvée</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {lesson.title}
              </h1>
          {lesson.objectif && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-primary">Objectif:</p>
                    <TextToSpeechButton text={lesson.objectif} sectionName="Objectif" size="sm" />
                  </div>
                  <div 
                    className="text-sm prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.objectif) }}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); stop(); }} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="introduction" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Introduction</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Contenu & Exemples</span>
            </TabsTrigger>
            <TabsTrigger value="activites" className="gap-2">
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline">Activités</span>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Introduction</h3>
                <TextToSpeechButton text={lesson.introduction} sectionName="Introduction" />
              </div>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert lesson-content"
                dangerouslySetInnerHTML={{ __html: lesson.introduction }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Contenu Principal</h3>
                <TextToSpeechButton text={lesson.contenu} sectionName="Contenu Principal" />
              </div>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert lesson-content"
                dangerouslySetInnerHTML={{ __html: lesson.contenu }}
              />
              
              {lesson.exemples_exercices && (
                <>
                  <div className="border-t my-8" />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Exemples et Exercices</h3>
                    <TextToSpeechButton text={lesson.exemples_exercices} sectionName="Exemples et Exercices" />
                  </div>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert lesson-content"
                    dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                  />
                </>
              )}
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

          <TabsContent value="activites" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Activités Interactives</h3>
              {lesson.activites_interactives ? (
                <InteractiveActivitiesEnhanced 
                  content={lesson.activites_interactives}
                  isLoading={false}
                />
              ) : (
                <p className="text-muted-foreground">Aucune activité disponible pour le moment.</p>
              )}
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
              <h3 className="text-xl font-semibold mb-4">Quiz Final</h3>
              {lesson.quiz_final ? (
                <HTMLQuizParser 
                  htmlContent={lesson.quiz_final}
                  lessonSlug={topicId || ''}
                  subject="sciences-sociales"
                />
              ) : (
                <p className="text-muted-foreground">Aucun quiz disponible pour le moment.</p>
              )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default SciencesSocialesLessonAF8;
