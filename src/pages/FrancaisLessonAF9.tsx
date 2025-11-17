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

const FrancaisLessonAF9 = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const { stop } = useTTS();

  useEffect(() => {
    if (lessonSlug) {
      fetchLesson();
      loadPersonalNotes();
    }
  }, [lessonSlug]);

  const fetchLesson = async () => {
    // Normalize the slug to handle URL-encoded characters
    const normalizedSlug = normalizeToSlug(lessonSlug || "");
    try {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .ilike('slug', 'francais-9af')
        .eq('grade_level', '9AF')
        .maybeSingle();

      if (!subject) {
        // Try alternative slug
        const { data: altSubject } = await supabase
          .from('subjects')
          .select('id')
          .ilike('slug', 'français-9af')
          .eq('grade_level', '9AF')
          .maybeSingle();
        
        if (!altSubject) {
          toast({
            title: "Erreur",
            description: "Matière non trouvée",
          });
          return;
        }

        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('subject_id', altSubject.id)
          .eq('slug', normalizedSlug)
          .eq('grade_level', '9AF')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setLesson(data);
        }
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
        setLesson(data);
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

      if (error) throw error;
      if (data?.notes) {
        setPersonalNotes(data.notes);
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
          title: "Erreur",
          description: "Vous devez être connecté pour sauvegarder vos notes",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: lessonSlug || '',
          notes: personalNotes,
          updated_at: new Date().toISOString(),
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Leçon non trouvée</p>
            <Button onClick={() => navigate('/francais-af9')} className="mt-4 mx-auto block">
              Retour au cours
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/50">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 py-8 relative">
          <Button
            variant="ghost"
            onClick={() => {
              stop();
              navigate('/francais-af9');
            }}
            className="mb-6 hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au cours
          </Button>

          <div className="flex flex-col md:flex-row items-start gap-8 max-w-6xl mx-auto">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">9ème AF</Badge>
                <Badge variant="outline">Français</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {lesson.title}
              </h1>
              <div 
                className="text-muted-foreground lesson-content" 
                dangerouslySetInnerHTML={{ __html: lesson.objectif }}
              />
              <div className="flex gap-2">
                <TextToSpeechButton
                  text={`${lesson.title}. ${lesson.objectif}. ${lesson.introduction || ''}`}
                  sectionName="lesson-header"
                  className="flex-1 sm:flex-none"
                />
                <DownloadLessonButton 
                  subjectName="Français"
                  lessonData={{
                    title: lesson.title,
                    objectif: lesson.objectif,
                    introduction: lesson.introduction,
                    contenu: lesson.contenu,
                    exemples_exercices: lesson.exemples_exercices,
                    youtube_url: lesson.youtube_url,
                    grade_level: lesson.grade_level
                  }} 
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl" />
              <img
                src={ericTeaching}
                alt="Eric enseignant"
                className="relative w-48 h-48 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
                <TabsTrigger value="introduction" className="flex items-center gap-2 py-3">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Introduction</span>
                </TabsTrigger>
                <TabsTrigger value="contenu" className="flex items-center gap-2 py-3">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Contenu</span>
                </TabsTrigger>
                <TabsTrigger value="exemples" className="flex items-center gap-2 py-3">
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden sm:inline">Exemples</span>
                </TabsTrigger>
                <TabsTrigger value="activites" className="flex items-center gap-2 py-3">
                  <Gamepad2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Activités</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2 py-3">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Mes notes</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="introduction" className="space-y-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Introduction</h2>
                </div>
                <div 
                  className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert lesson-content"
                  dangerouslySetInnerHTML={{ __html: lesson.introduction }}
                />
                <YouTubeVideoSection
                  lessonTitle={lesson.title}
                  objectives={lesson.objectif}
                  gradeLevel={lesson.grade_level}
                  customYoutubeUrl={lesson.youtube_url}
                  subject="francais"
                />
              </TabsContent>

              <TabsContent value="contenu" className="space-y-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Contenu de la leçon</h2>
                </div>
                <div 
                  className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert lesson-content"
                  dangerouslySetInnerHTML={{ __html: lesson.contenu }}
                />
              </TabsContent>

              <TabsContent value="exemples" className="space-y-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Exemples et Exercices</h2>
                </div>
                <div 
                  className="prose prose-sm sm:prose lg:prose-lg max-w-none dark:prose-invert lesson-content"
                  dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                />
              </TabsContent>

              <TabsContent value="activites" className="space-y-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Gamepad2 className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Activités Interactives</h2>
                </div>
                
                {lesson.activites_interactives ? (
                  <InteractiveActivitiesEnhanced 
                    content={lesson.activites_interactives}
                    isLoading={false}
                  />
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="pt-6 text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Aucune activité interactive disponible pour cette leçon</p>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-yellow-500/10">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-bold">Quiz Final</h3>
                  </div>
                  {lesson.quiz_final ? (
                    <HTMLQuizParser
                      htmlContent={lesson.quiz_final}
                      lessonSlug={lesson.slug}
                      subject="francais"
                    />
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="pt-6 text-center">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Aucun quiz disponible pour cette leçon</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold">Mes notes personnelles</h2>
                </div>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Écrivez vos notes ici..."
                    className="min-h-[300px] resize-none"
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                  />
                  <Button onClick={savePersonalNotes} className="w-full sm:w-auto">
                    Sauvegarder mes notes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FrancaisLessonAF9;
