import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Lightbulb, CheckCircle2, Trophy, Bookmark } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ericChairDesk from "@/assets/eric-chair-desk.png";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  mois: string;
  grade_level: string;
  youtube_url: string | null;
  references: string[];
}

const MathLessonAF8 = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
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
      toast({
        title: "Erreur",
        description: "Impossible de charger la leçon",
        variant: "destructive",
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
        .from('lesson_notes')
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', topicId || '')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setPersonalNotes(data.notes || "");
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Non connecté",
          description: "Vous devez être connecté pour sauvegarder vos notes",
          variant: "destructive",
        });
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

      toast({
        title: "Notes sauvegardées",
        description: "Vos notes personnelles ont été enregistrées avec succès",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos notes",
        variant: "destructive",
      });
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground mb-4">Leçon non trouvée</p>
            <Button onClick={() => navigate("/math-af8-course")}>
              Retour au cours
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/math-af8-course")}
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
                subjectName="Mathématiques AF8"
                variant="outline"
                size="sm"
              />
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
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
            <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-2xl p-8 mb-8 border border-orange-500/20">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src={ericChairDesk} 
                    alt="Eric enseignant" 
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20">
                      Propriété physique de la matière
                    </Badge>
                    <Badge variant="secondary">Débutant</Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">{lesson.title}</h1>
              {lesson.objectif && (
                <div 
                  className="text-muted-foreground text-lg prose dark:prose-invert max-w-none lesson-content"
                  dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                />
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>2 semaines</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Content Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); stop(); }} className="w-full">
          <div className="border-b mb-8">
            <TabsList className="w-full h-auto rounded-none bg-transparent p-0 grid grid-cols-5">
              <TabsTrigger 
                value="introduction"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
              >
                <Lightbulb className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Introduction</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contenu"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
              >
                <BookOpen className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Contenu</span>
              </TabsTrigger>
              <TabsTrigger 
                value="exemples"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
              >
                <CheckCircle2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Exemples</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
              >
                <Bookmark className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Mes Notes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="quiz"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
              >
                <Trophy className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Quiz Final</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="introduction">
            <Card>
              <CardContent className="p-6">
                {lesson.introduction ? (
                  <div 
                    className="prose prose-sm lg:prose-base max-w-none dark:prose-invert lesson-content"
                    dangerouslySetInnerHTML={{ __html: lesson.introduction }}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Le contenu de l'introduction sera bientôt disponible</p>
                  </div>
                )}

                {lesson.objectif && (
                  <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h3 className="text-lg font-semibold text-primary mb-2 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Objectif de la leçon
                    </h3>
                    <div 
                      className="prose dark:prose-invert max-w-none lesson-content"
                      dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contenu">
            <Card>
              <CardContent className="p-6 space-y-6">
                {lesson.contenu ? (
                  <div 
                    className="prose prose-sm lg:prose-base max-w-none dark:prose-invert lesson-content"
                    dangerouslySetInnerHTML={{ __html: lesson.contenu }}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Le contenu principal sera bientôt disponible</p>
                  </div>
                )}

                {lesson.youtube_url && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">🎥 Vidéo explicative</h3>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={lesson.youtube_url.replace('watch?v=', 'embed/')}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {lesson.exemples_exercices && (
                  <>
                    <div className="border-t my-8" />
                    <h3 className="text-2xl font-bold mb-4">Exemples et Exercices</h3>
                    <div 
                      className="prose prose-sm lg:prose-base max-w-none dark:prose-invert lesson-content"
                      dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                    />
                  </>
                )}

                {lesson.references && lesson.references.length > 0 && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">📚 Références</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {lesson.references.map((ref, index) => (
                        <li key={index}>{ref}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Mes Notes Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Écrivez vos notes ici..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[300px]"
                />
                <Button onClick={savePersonalNotes} className="w-full">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Sauvegarder mes notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground mb-4">
                  Le quiz pour cette leçon sera bientôt disponible
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/math-af8-course")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au cours
          </Button>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MathLessonAF8;
