import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BookOpen, FileText, Gamepad2, Target, Lightbulb, ArrowLeft, Sparkles, Trophy, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import { SpanishPracticeChat } from "@/components/SpanishPracticeChat";
import { useTTS } from "@/hooks/useTTS";
import { normalizeToSlug } from "@/lib/slugNormalization";
import ericTeaching from "@/assets/eric-teaching.png";

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

const EspagnolLessonAF9 = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [userNickname, setUserNickname] = useState("");
  const { stop } = useTTS();

  useEffect(() => {
    if (lessonSlug) {
      fetchLesson();
      loadPersonalNotes();
      fetchUserProfile();
    }
  }, [lessonSlug]);

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
    const normalizedSlug = normalizeToSlug(lessonSlug || "");
    try {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'espagnol-af9')
        .eq('grade_level', '9AF')
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
        .eq('slug', normalizedSlug)
        .eq('grade_level', '9AF')
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
          grade_level: data.grade_level || '9AF',
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
        .eq('lesson_id', lessonSlug || '')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setPersonalNotes(data.notes || '');
    } catch (error) {
      console.error('Error loading personal notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: lessonSlug || '',
          notes: personalNotes,
        });

      if (error) throw error;

      toast({
        title: "Notes enregistrées",
        description: "Vos notes personnelles ont été sauvegardées.",
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

  const handleQuizComplete = async (score: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase.from('profiles').update({
          gold_earned: (profile.gold_earned || 0) + 10
        }).eq('user_id', user.id);
      }

      await supabase.from('lesson_completions').upsert({
        user_id: user.id,
        lesson_slug: lessonSlug || '',
        subject: 'espagnol-af9',
        score: score
      });

      toast({
        title: "🎉 Quiz terminé !",
        description: `Score: ${score}%. Vous avez gagné 10 pièces d'or !`,
      });
    } catch (error) {
      console.error('Error completing quiz:', error);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';
    text = text.replace(/🎯\s*Objectifs\s*:?\s*/gi, '').trim();
    return text;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-secondary/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la leçon...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 md:gap-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-secondary/20 p-4">
        <img src={ericTeaching} alt="Eric" className="w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 object-contain animate-fade-in" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold">Leçon non trouvée</h2>
          <p className="text-sm sm:text-base text-muted-foreground px-4">Cette leçon n'existe pas ou n'est pas encore disponible.</p>
        </div>
        <Button onClick={() => navigate("/espagnol-af9")} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour au cours
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-background dark:via-background dark:to-secondary/20">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => { stop(); navigate("/espagnol-af9"); }}
            className="gap-1 sm:gap-2 hover:bg-orange-100 dark:hover:bg-orange-950 text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Retour</span>
            <span className="hidden sm:inline">au cours</span>
          </Button>
          <div className="flex items-center gap-1 sm:gap-2">
            <Badge variant="secondary" className="gap-1 text-xs px-1.5 sm:px-2">
              <GraduationCap className="h-3 w-3" />
              <span>AF9</span>
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section with Eric */}
        <Card className="mb-6 md:mb-8 overflow-hidden border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 animate-fade-in">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] gap-0 md:gap-6 items-center">
              {/* Eric Image */}
              <div className="relative bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-900 dark:to-amber-900 p-4 md:p-6 flex items-center justify-center">
                <img 
                  src={ericTeaching} 
                  alt="Eric - Assistant d'apprentissage" 
                  className="w-full max-w-[200px] md:max-w-none h-48 md:h-64 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 md:top-4 md:right-4">
                  <Badge className="bg-orange-500 text-white gap-1 shadow-lg text-xs">
                    <Sparkles className="h-3 w-3" />
                    Espagnol
                  </Badge>
                </div>
              </div>

              {/* Lesson Title and Info */}
              <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent leading-tight">
                    {lesson.title}
                  </h1>
                  {lesson.objectif && (
                    <div className="flex items-start gap-2 md:gap-3 bg-white/50 dark:bg-black/20 backdrop-blur-sm p-3 md:p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                      <Target className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-sm md:text-base text-orange-600 dark:text-orange-400 flex items-center gap-2">
                          <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                          Objectifs d'apprentissage
                        </p>
                        <p className="text-xs md:text-sm text-foreground/80">{stripHtml(lesson.objectif)}</p>
                      </div>
                      <div className="hidden sm:block">
                        <TextToSpeechButton text={stripHtml(lesson.objectif)} sectionName="objectif" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <DownloadLessonButton
                    lessonData={{
                      title: lesson.title,
                      objectif: lesson.objectif,
                      introduction: lesson.introduction,
                      contenu: lesson.contenu,
                      exemples_exercices: lesson.exemples_exercices,
                      youtube_url: lesson.youtube_url,
                      grade_level: lesson.grade_level,
                    }}
                    personalNotes={personalNotes}
                    subjectName="Espagnol AF9"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Card className="shadow-xl border-2 border-orange-100 dark:border-orange-900/50">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6 md:mb-8 h-auto p-1 md:p-2 bg-orange-50 dark:bg-orange-950/50 gap-1">
                <TabsTrigger 
                  value="introduction" 
                  className="gap-1 md:gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white flex-col py-2 md:py-3 text-xs"
                >
                  <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline text-[10px] sm:text-xs">Intro</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contenu" 
                  className="gap-1 md:gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white flex-col py-2 md:py-3 text-xs"
                >
                  <FileText className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline text-[10px] sm:text-xs">Contenu</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="activites" 
                  className="gap-1 md:gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white flex-col py-2 md:py-3 text-xs"
                >
                  <Gamepad2 className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline text-[10px] sm:text-xs">Activités</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notes" 
                  className="gap-1 md:gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white flex-col py-2 md:py-3 text-xs"
                >
                  <Lightbulb className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline text-[10px] sm:text-xs">Notes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="quiz" 
                  className="gap-1 md:gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white flex-col py-2 md:py-3 text-xs"
                >
                  <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden xs:inline text-[10px] sm:text-xs">Quiz</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="introduction" className="space-y-4 md:space-y-6 animate-fade-in">
                {lesson.youtube_url && (
                  <YouTubeVideoSection
                    lessonTitle={lesson.title}
                    objectives={stripHtml(lesson.objectif)}
                    gradeLevel="AF9"
                    customYoutubeUrl={lesson.youtube_url}
                    subject="espagnol"
                  />
                )}
                <div className="prose prose-sm sm:prose-base md:prose-lg prose-slate dark:prose-invert max-w-none prose-headings:text-orange-600 dark:prose-headings:text-orange-400 prose-a:text-orange-600 dark:prose-a:text-orange-400">
                  <div dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
                </div>
              </TabsContent>

              <TabsContent value="contenu" className="space-y-4 md:space-y-6 animate-fade-in">
                <div className="prose prose-sm sm:prose-base md:prose-lg prose-slate dark:prose-invert max-w-none prose-headings:text-orange-600 dark:prose-headings:text-orange-400 prose-a:text-orange-600 dark:prose-a:text-orange-400">
                  <div dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
                </div>
                {lesson.exemples_exercices && (
                  <Card className="mt-6 md:mt-8 border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <Lightbulb className="h-5 w-5 md:h-6 md:w-6" />
                        Exemples et Exercices
                      </h3>
                      <div className="prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activites" className="space-y-4 md:space-y-6 animate-fade-in">
                {lesson.activites_interactives ? (
                  <InteractiveActivitiesEnhanced content={lesson.activites_interactives} isLoading={false} />
                ) : (
                  <Card className="text-center py-12 md:py-16 border-2 border-dashed border-orange-300 dark:border-orange-800">
                    <CardContent>
                      <Gamepad2 className="h-16 w-16 md:h-20 md:w-20 mx-auto text-orange-400 mb-4 md:mb-6 opacity-50" />
                      <h3 className="text-lg md:text-xl font-semibold mb-2">Activités en préparation</h3>
                      <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto px-4">
                        Les activités interactives pour cette leçon sont en cours de préparation et seront bientôt disponibles.
                      </p>
                    </CardContent>
                  </Card>
                )}
                <SpanishPracticeChat
                  lessonSlug={lesson.slug}
                  lessonTitle={lesson.title}
                  lessonObjective={stripHtml(lesson.objectif)}
                  userNickname={userNickname}
                  gradeLevel="AF9"
                />
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 animate-fade-in">
                <Card className="border-2 border-orange-200 dark:border-orange-900 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 md:gap-3 mb-4">
                      <div className="p-2 md:p-3 bg-orange-500 text-white rounded-lg">
                        <Lightbulb className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold">Mes notes personnelles</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Prenez des notes pendant votre apprentissage
                        </p>
                      </div>
                    </div>
                    <Textarea
                      value={personalNotes}
                      onChange={(e) => setPersonalNotes(e.target.value)}
                      placeholder="Écrivez vos notes ici... 📝"
                      className="min-h-[250px] md:min-h-[350px] text-sm md:text-base border-2 border-orange-200 dark:border-orange-900 focus:border-orange-500"
                    />
                    <Button 
                      onClick={savePersonalNotes} 
                      className="mt-4 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white text-sm md:text-base"
                      size="lg"
                    >
                      💾 Sauvegarder mes notes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quiz" className="space-y-4 animate-fade-in">
                {lesson.quiz_final ? (
                  <HTMLQuizParser
                    htmlContent={lesson.quiz_final}
                    lessonSlug={lesson.slug}
                    subject="espagnol-af9"
                  />
                ) : (
                  <Card className="text-center py-12 md:py-16 border-2 border-dashed border-orange-300 dark:border-orange-800">
                    <CardContent>
                      <Trophy className="h-16 w-16 md:h-20 md:w-20 mx-auto text-orange-400 mb-4 md:mb-6 opacity-50" />
                      <h3 className="text-lg md:text-xl font-semibold mb-2">Quiz en préparation</h3>
                      <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto px-4">
                        Le quiz final pour cette leçon sera bientôt disponible. Continuez votre apprentissage !
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EspagnolLessonAF9;
