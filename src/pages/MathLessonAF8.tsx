import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Lightbulb, Trophy, Bookmark, Gamepad2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ericChairDesk from "@/assets/eric-chair-desk.png";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";

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
  activites_interactives?: string;
  quiz_final?: string;
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
        .eq('grade_level', '8AF')
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

  const getYouTubeEmbedUrl = (url: string): string | null => {
    try {
      // Extract video ID from various YouTube URL formats
      const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
        /(?:https?:\/\/)?youtu\.be\/([^?]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}`;
        }
      }
      
      return null;
    } catch {
      return null;
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
            <div className="bg-gradient-to-r from-orange-500/10 to-red-600/10 rounded-2xl p-4 md:p-8 mb-8 border border-orange-500/20">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                <div className="flex-shrink-0 hidden md:block">
                  <img 
                    src={ericChairDesk} 
                    alt="Eric enseignant" 
                    className="w-24 h-24 md:w-32 md:h-32 object-contain"
                  />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20 text-xs md:text-sm">
                      Propriété physique de la matière
                    </Badge>
                    <Badge variant="secondary" className="text-xs md:text-sm">Débutant</Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">{lesson.title}</h1>
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
          <div className="border-b mb-8 overflow-x-auto">
            <TabsList className="w-full h-auto rounded-none bg-transparent p-0 grid grid-cols-5 min-w-[500px] md:min-w-0">
              <TabsTrigger 
                value="introduction"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3"
              >
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs md:text-sm">Introduction</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contenu"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3"
              >
                <BookOpen className="h-4 w-4" />
                <span className="text-xs md:text-sm">Contenu</span>
              </TabsTrigger>
              <TabsTrigger 
                value="activites"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3"
              >
                <Gamepad2 className="h-4 w-4" />
                <span className="text-xs md:text-sm">Activités</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notes"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3"
              >
                <Bookmark className="h-4 w-4" />
                <span className="text-xs md:text-sm">Notes</span>
              </TabsTrigger>
              <TabsTrigger 
                value="quiz"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3"
              >
                <Trophy className="h-4 w-4" />
                <span className="text-xs md:text-sm">Quiz</span>
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
                  <div className="p-4 bg-muted/30 rounded-lg mt-8">
                    <h3 className="text-lg font-semibold mb-3">📚 Références</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {lesson.references.map((ref, index) => (
                        <li key={index}>{ref}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {lesson.youtube_url && getYouTubeEmbedUrl(lesson.youtube_url) && (
                  <div className="mt-8">
                    <div className="border-t mb-6" />
                    <h3 className="text-lg font-semibold mb-3">🎥 Vidéo explicative</h3>
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full rounded-lg"
                        src={getYouTubeEmbedUrl(lesson.youtube_url) || ''}
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activites" className="space-y-6">
            {lesson.activites_interactives && (
              <InteractiveActivitiesEnhanced
                content={lesson.activites_interactives}
                isLoading={false}
                onRegenerate={() => {}}
                onGoldUpdate={() => {}}
              />
            )}
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
              <CardHeader>
                <CardTitle>Quiz Final</CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.quiz_final ? (
                  <HTMLQuizParser 
                    htmlContent={lesson.quiz_final}
                    lessonSlug={lesson.slug}
                    subject="Mathématiques"
                  />
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">
                      Le quiz pour cette leçon sera bientôt disponible
                    </p>
                  </div>
                )}
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
