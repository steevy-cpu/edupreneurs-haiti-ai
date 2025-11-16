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
    try {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'espagnol-af9')
        .eq('grade_level', 'AF9')
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
        .eq('slug', lessonSlug)
        .eq('grade_level', 'AF9')
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
          grade_level: data.grade_level || 'AF9',
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
      console.error('Error saving personal notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos notes.",
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
      console.error('Error updating completion:', error);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || '';
    text = text.replace(/🎯\s*Objectifs\s*:?\s*/gi, '').trim();
    return text;
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <img src={ericChairDesk} alt="Eric" className="w-64 h-64 object-contain" />
        <h2 className="text-2xl font-bold">Leçon non trouvée</h2>
        <Button onClick={() => navigate("/espagnol-af9")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au cours
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => { stop(); navigate("/espagnol-af9"); }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au cours
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            {lesson.title}
          </h1>
          {lesson.objectif && (
            <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-lg mb-4 max-w-3xl mx-auto">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="font-semibold text-primary mb-1">Objectifs d'apprentissage</p>
                <p className="text-sm text-muted-foreground">{stripHtml(lesson.objectif)}</p>
              </div>
              <TextToSpeechButton text={stripHtml(lesson.objectif)} sectionName="objectif" />
            </div>
          )}
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

        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="introduction" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Introduction</span>
              </TabsTrigger>
              <TabsTrigger value="contenu" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Contenu</span>
              </TabsTrigger>
              <TabsTrigger value="activites" className="gap-2">
                <Gamepad2 className="h-4 w-4" />
                <span className="hidden sm:inline">Activités</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Mes Notes</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Quiz</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="introduction" className="space-y-6">
              {lesson.youtube_url && (
                <YouTubeVideoSection
                  lessonTitle={lesson.title}
                  objectives={stripHtml(lesson.objectif)}
                  gradeLevel="AF9"
                  customYoutubeUrl={lesson.youtube_url}
                  subject="espagnol"
                />
              )}
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
              </div>
            </TabsContent>

            <TabsContent value="contenu" className="space-y-6">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
              </div>
              {lesson.exemples_exercices && (
                <div className="mt-8 p-6 bg-secondary/20 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Exemples et Exercices
                  </h3>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activites" className="space-y-6">
              {lesson.activites_interactives ? (
                <InteractiveActivitiesEnhanced content={lesson.activites_interactives} isLoading={false} />
              ) : (
                <div className="text-center py-12">
                  <Gamepad2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Les activités interactives pour cette leçon sont en cours de préparation.
                  </p>
                </div>
              )}
              <SpanishPracticeChat
                lessonSlug={lesson.slug}
                lessonTitle={lesson.title}
                lessonObjective={stripHtml(lesson.objectif)}
                userNickname={userNickname}
                gradeLevel="AF9"
              />
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="bg-secondary/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Mes notes personnelles
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Prenez des notes pendant votre apprentissage. Elles seront sauvegardées automatiquement.
                </p>
                <Textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Écrivez vos notes ici..."
                  className="min-h-[300px]"
                />
                <Button onClick={savePersonalNotes} className="mt-4">
                  Sauvegarder mes notes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4">
              {lesson.quiz_final ? (
                <HTMLQuizParser
                  htmlContent={lesson.quiz_final}
                  lessonSlug={lesson.slug}
                  subject="espagnol-af9"
                />
              ) : (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Le quiz final pour cette leçon est en cours de préparation.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default EspagnolLessonAF9;
