import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Target } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

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

const CreoleLessonAF8 = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      fetchLesson();
      loadPersonalNotes();
    }
  }, [topicId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
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
      console.error('Error loading personal notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour sauvegarder des notes");
        return;
      }

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: topicId || '',
          notes: personalNotes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
      toast.success("Notes sauvegardées avec succès");
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error("Erreur lors de la sauvegarde des notes");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-xl text-muted-foreground">Leçon non trouvée</p>
        <Button onClick={() => navigate("/creole-af8-course")}>
          Retour au cours
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/creole-af8-course")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au cours
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-500">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{lesson.title}</h1>
              <p className="text-sm text-muted-foreground">Créole - AF8</p>
            </div>
          </div>

          {lesson.objectif && (
            <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Target className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Objectif de la leçon</p>
                    <p className="text-sm text-muted-foreground">{lesson.objectif}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lesson Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="introduction">Introduction</TabsTrigger>
            <TabsTrigger value="contenu">Contenu & Exemples</TabsTrigger>
            <TabsTrigger value="notes">Mes Notes</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-6">
            <Card>
              <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.introduction || '<p>Introduction à venir...</p>' }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-6">
            <Card>
              <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none space-y-6">
                <div dangerouslySetInnerHTML={{ __html: lesson.contenu || '<p>Contenu à venir...</p>' }} />

                {lesson.youtube_url && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-4">Vidéo explicative</h3>
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          src={lesson.youtube_url}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {lesson.exemples_exercices && (
                  <>
                    <div className="border-t my-8" />
                    <h3 className="text-2xl font-bold mb-4">Exemples et Exercices</h3>
                    <div dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mes notes personnelles</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Prenez des notes pour mieux retenir cette leçon
                  </p>
                </div>
                <Textarea
                  placeholder="Écrivez vos notes ici..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <Button onClick={savePersonalNotes} className="w-full">
                  Sauvegarder mes notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="space-y-6">
            <InteractiveActivitiesEnhanced
              content={`Leçon: ${lesson.title}`}
              isLoading={false}
              onRegenerate={() => {}}
              onGoldUpdate={() => {}}
            />
          </TabsContent>
        </Tabs>

        {/* Navigation Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate("/creole-af8-course")}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au cours
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreoleLessonAF8;
