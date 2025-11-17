import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Target, FileText, Lightbulb, Gamepad2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { useTTS } from "@/hooks/useTTS";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ericChairDesk from "@/assets/eric-chair-desk.png";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { SpanishPracticeChat } from "@/components/SpanishPracticeChat";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url?: string;
  grade_level: string;
  activites_interactives?: string;
  quiz_final?: string;
}

const EspagnolLessonAF8 = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [userNickname, setUserNickname] = useState("");
  const { stop } = useTTS();

  useEffect(() => {
    if (topicId) {
      fetchLesson();
      loadPersonalNotes();
      fetchUserProfile();
    }
  }, [topicId]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile?.nickname) {
        setUserNickname(profile.nickname);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchLesson = async () => {
    try {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'espagnol-8af')
        .eq('grade_level', '8AF')
        .maybeSingle();

      if (!subject) {
        toast({
          title: "Erreur",
          description: "Matière non trouvée",
        });
        return;
      }

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subject.id)
        .eq('slug', topicId)
        .eq('grade_level', '8AF')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLesson({
          id: data.id,
          title: data.title,
          slug: data.slug,
          objectif: data.objectif || '',
          introduction: data.introduction || '',
          contenu: data.contenu || '',
          exemples_exercices: data.exemples_exercices || '',
          youtube_url: data.youtube_url,
          grade_level: data.grade_level || '8AF',
          activites_interactives: data.activites_interactives || undefined,
          quiz_final: data.quiz_final || undefined
        });
      }
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
        .eq('lesson_id', topicId)
        .maybeSingle();

      if (error) throw error;
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
          lesson_id: topicId,
          notes: personalNotes,
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Vos notes ont été sauvegardées",
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
          <Button onClick={() => navigate("/espagnol-af8-course")}>
            Retour au cours
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/espagnol-af8-course")}
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
                subjectName="Espagnol AF8"
                variant="outline"
                size="sm"
              />
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
            {/* Header with Eric */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6">
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {lesson.title}
                  </h1>
                  {lesson.objectif && (
                    <Card className="p-4 bg-primary/5 border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-primary">Objectif:</p>
                        <TextToSpeechButton text={lesson.objectif} sectionName="Objectif" size="sm" />
                      </div>
                      <div className="prose dark:prose-invert max-w-none lesson-content text-left">
                        <div dangerouslySetInnerHTML={{ __html: lesson.objectif }} />
                      </div>
                    </Card>
                  )}
                </div>
                
                {/* Eric mascot - responsive sizing */}
                <div className="flex-shrink-0">
                  <img 
                    src={ericChairDesk} 
                    alt="Eric enseignant" 
                    className="w-24 h-24 md:w-32 md:h-32 object-contain"
                  />
                </div>
              </div>
            </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); stop(); }} className="w-full">
          <div className="border-b mb-8 overflow-x-auto">
            <TabsList className="w-full h-auto rounded-none bg-transparent p-0 grid grid-cols-5 min-w-[500px] md:min-w-0">
              <TabsTrigger value="introduction" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs md:text-sm">Introduction</span>
              </TabsTrigger>
              <TabsTrigger value="contenu" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs md:text-sm">Contenu</span>
              </TabsTrigger>
              <TabsTrigger value="activites" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3">
                <Gamepad2 className="h-4 w-4" />
                <span className="text-xs md:text-sm">Activités</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs md:text-sm">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex flex-col md:flex-row items-center justify-center gap-1 py-3">
                <Target className="h-4 w-4" />
                <span className="text-xs md:text-sm">Quiz</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="introduction" className="mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Introduction</h3>
                <TextToSpeechButton text={lesson.introduction} sectionName="Introduction" />
              </div>
              <div 
                className="prose dark:prose-invert max-w-none lesson-content"
                dangerouslySetInnerHTML={{ __html: lesson.introduction }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="mt-6">
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Contenu Principal</h3>
                <TextToSpeechButton text={lesson.contenu} sectionName="Contenu Principal" />
              </div>
              <div 
                className="prose dark:prose-invert max-w-none lesson-content"
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
                    className="prose dark:prose-invert max-w-none lesson-content"
                    dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                  />
                </>
              )}

              {/* Additional Resources Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 border-l-4 border-l-blue-500 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">💡 Le savais-tu ?</h3>
                    <p className="text-foreground">
                      L'espagnol est parlé par plus de 500 millions de personnes dans le monde ! C'est la langue officielle de 21 pays, dont notre voisin la République Dominicaine. Apprendre l'espagnol ouvre des portes pour voyager, étudier et travailler dans toute l'Amérique latine et l'Espagne.
                    </p>
                  </div>
                </div>
              </Card>

              {/* YouTube Video Section */}
              <div className="mt-6">
                <YouTubeVideoSection 
                  lessonTitle={lesson.title}
                  objectives={lesson.objectif || ""}
                  gradeLevel="AF8"
                  customYoutubeUrl={lesson.youtube_url}
                  subject="Espagnol"
                />
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activites" className="mt-6 space-y-6">
            {lesson.activites_interactives && (
              <InteractiveActivitiesEnhanced
                content={lesson.activites_interactives}
                isLoading={false}
                onRegenerate={() => {}}
                onGoldUpdate={() => {}}
              />
            )}
            
            <SpanishPracticeChat
              lessonTitle={lesson.title}
              lessonObjective={lesson.objectif}
              lessonSlug={lesson.slug}
              gradeLevel={lesson.grade_level}
              userNickname={userNickname}
            />
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Mes notes personnelles</h3>
              <p className="text-muted-foreground mb-4">
                Utilisez cet espace pour prendre des notes pendant que vous étudiez cette leçon.
              </p>
              <Textarea
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Tapez vos notes ici..."
                className="min-h-[300px] mb-4"
              />
              <Button onClick={savePersonalNotes}>
                Sauvegarder mes notes
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="quiz" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Quiz Final</h3>
              {lesson.quiz_final ? (
                <HTMLQuizParser 
                  htmlContent={lesson.quiz_final}
                  lessonSlug={lesson.slug}
                  subject="Espagnol"
                />
              ) : (
                <p className="text-muted-foreground">Le quiz pour cette leçon sera bientôt disponible.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/espagnol-af8-course")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au cours
          </Button>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EspagnolLessonAF8;
