import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Target } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { Users, Trophy } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  activites_interactives: string;
  quiz_final: string;
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
        .eq('grade_level', '8AF')
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
          <div className="flex items-center gap-2">
            {lesson && (
              <DownloadLessonButton
                lessonData={lesson}
                personalNotes={personalNotes}
                subjectName="Créole AF8"
                variant="outline"
                size="sm"
              />
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            {/* Lesson Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{lesson.title}</h1>
              <p className="text-sm text-muted-foreground">Kreyòl Ayisyen - AF8</p>
            </div>
          </div>

          {lesson.objectif && (
            <Card className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-teal-500/20">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Target className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Objektif Leson an</p>
                    <p className="text-sm text-muted-foreground">{lesson.objectif}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Lesson Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="introduction">Entwodiksyon</TabsTrigger>
            <TabsTrigger value="contenu">Kontni</TabsTrigger>
            <TabsTrigger value="activites">Aktivite</TabsTrigger>
            <TabsTrigger value="notes">Nòt</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="space-y-6">
            <Card>
              <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none lesson-content">
                <div dangerouslySetInnerHTML={{ __html: lesson.introduction || '<p>Introduction à venir...</p>' }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="space-y-6">
            <Card>
              <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none lesson-content space-y-6">
                <div dangerouslySetInnerHTML={{ __html: lesson.contenu || '<p>Kontni ap vini byento...</p>' }} />

                <YouTubeVideoSection 
                  lessonTitle={lesson.title}
                  objectives={lesson.objectif || ''}
                  customYoutubeUrl={lesson.youtube_url}
                  subject="kreyol"
                  gradeLevel="AF8"
                />
                
                {lesson.exemples_exercices && (
                  <>
                    <div className="border-t my-8" />
                    <h3 className="text-2xl font-bold mb-4">Egzanp ak Egzèsis</h3>
                    <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activites" className="space-y-6">
            {lesson.activites_interactives ? (
              <InteractiveActivitiesEnhanced
                content={lesson.activites_interactives}
                isLoading={false}
                onRegenerate={() => fetchLesson()}
                onGoldUpdate={() => {}}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-2xl font-bold mb-2">Aktivite Entèaktif</h3>
                    <p className="text-muted-foreground">
                      Aktivite yo ap disponib byento pou leson sa a
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
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
            {lesson.quiz_final ? (
              <HTMLQuizParser 
                htmlContent={lesson.quiz_final}
                lessonSlug={lesson.slug}
                subject="kreyol"
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl font-bold mb-2">Quiz Final</h3>
                    <p className="text-muted-foreground mb-6">
                      Quiz la ap disponib byento pou leson sa a
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
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
          </>
        )}
      </div>
    </div>
  );
};

export default CreoleLessonAF8;
