import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Lightbulb, FileText, Brain, StickyNote, Target, Gamepad2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ericChairDesk from "@/assets/eric-chair-desk.png";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { EnglishPracticeChat } from "@/components/EnglishPracticeChat";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  activites_interactives: string | null;
  quiz_final: string | null;
  mois: string;
  grade_level: string;
  youtube_url: string | null;
  references: string[];
}

const AnglaisLessonAF8 = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const { stop } = useTTS();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

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
            <Button onClick={() => navigate("/anglais-af8-course")}>
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
            onClick={() => navigate("/anglais-af8-course")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Retour au cours</span>
          </Button>
          <div className="flex items-center gap-2">
            {lesson && (
              <DownloadLessonButton
                lessonData={lesson}
                personalNotes={personalNotes}
                subjectName="Anglais AF8"
                variant="outline"
                size="sm"
              />
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Lesson Header - Mobile Optimized */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-2xl p-4 md:p-8 mb-6 md:mb-8 border border-cyan-500/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            {/* Eric mascot - smaller on mobile */}
            <div className="flex-shrink-0">
              <img 
                src={ericChairDesk} 
                alt="Eric enseignant" 
                className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20 mb-3">
                {lesson.mois}
              </Badge>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">{lesson.title}</h1>
            </div>
          </div>
        </div>

        {/* Lesson Content Tabs - Mobile Responsive */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); stop(); }} className="w-full">
          <TabsList className="grid w-full grid-cols-5 gap-1">
            <TabsTrigger value="introduction" className="flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:inline">Introduction</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Contenu & Exemples</span>
            </TabsTrigger>
            <TabsTrigger value="activites" className="flex items-center justify-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden md:inline">Activités</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex items-center justify-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center justify-center gap-2">
              <StickyNote className="h-4 w-4" />
              <span className="hidden md:inline">Notes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-6">
                {lesson.objectif && (
                  <div className="bg-gradient-to-r from-cyan-500/5 to-blue-600/5 rounded-lg p-4 md:p-6 border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        <h3 className="text-lg font-semibold">🎯 Objectif de la leçon</h3>
                      </div>
                      <TextToSpeechButton text={lesson.objectif} sectionName="Objectif" size="sm" />
                    </div>
                    <div 
                      className="prose prose-sm lg:prose-base max-w-none dark:prose-invert lesson-content"
                      dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                    />
                  </div>
                )}
                
                {lesson.introduction ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Introduction</h3>
                      <TextToSpeechButton text={lesson.introduction} sectionName="Introduction" />
                    </div>
                    <div 
                      className="prose prose-sm lg:prose-base max-w-none dark:prose-invert lesson-content"
                      dangerouslySetInnerHTML={{ __html: lesson.introduction }}
                    />
                  </>
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
              <CardContent className="p-4 md:p-6 space-y-6">
                {lesson.contenu ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">Contenu Principal</h3>
                      <TextToSpeechButton text={lesson.contenu} sectionName="Contenu Principal" />
                    </div>
                    <div 
                      className="prose prose-sm lg:prose-base max-w-none dark:prose-invert lesson-content"
                      dangerouslySetInnerHTML={{ __html: lesson.contenu }}
                    />
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>Le contenu principal sera bientôt disponible</p>
                  </div>
                )}

                {lesson.youtube_url && (
                  <div className="my-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      🎥 Vidéo explicative
                    </h3>
                    <div className="aspect-video rounded-lg overflow-hidden border border-border shadow-lg">
                      <iframe
                        className="w-full h-full"
                        src={lesson.youtube_url.includes('embed') 
                          ? lesson.youtube_url 
                          : lesson.youtube_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                        }
                        title="YouTube video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {lesson.exemples_exercices && (
                  <>
                    <div className="border-t my-8" />
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold">Exemples et Exercices</h3>
                      <TextToSpeechButton text={lesson.exemples_exercices} sectionName="Exemples et Exercices" />
                    </div>
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

          <TabsContent value="activites">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-6">
                {lesson.activites_interactives && (
                  <div className="mb-6">
                    <InteractiveActivitiesEnhanced 
                      content={lesson.activites_interactives}
                      isLoading={false}
                    />
                  </div>
                )}
                
                <EnglishPracticeChat
                  lessonTitle={lesson.title}
                  lessonObjective={lesson.objectif || ""}
                  lessonSlug={topicId || ""}
                  gradeLevel="AF8"
                  userNickname=""
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quiz">
            <Card>
              <CardContent className="p-4 md:p-6">
                {lesson.quiz_final ? (
                  <HTMLQuizParser 
                    htmlContent={lesson.quiz_final}
                    lessonSlug={topicId || ""}
                    subject="anglais"
                  />
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">
                      Le quiz pour cette leçon sera bientôt disponible
                    </p>
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
                  <StickyNote className="h-4 w-4 mr-2" />
                  Sauvegarder mes notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/anglais-af8-course")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au cours
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnglaisLessonAF8;
