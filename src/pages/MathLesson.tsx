import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  BookOpen,
  Gamepad2,
  StickyNote,
  Trophy,
  Lightbulb,
  Target,
  Loader2
} from "lucide-react";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TextToSpeechButton } from "@/components/TextToSpeechButton";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";

interface Lesson {
  id: string;
  title: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  activites_interactives?: string;
  quiz_final?: string;
  youtube_url?: string;
}

const MathLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [activitiesContent, setActivitiesContent] = useState("");
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (topicId) {
      fetchLesson();
      loadPersonalNotes();
      fetchActivitiesContent();
    }
  }, [topicId]);

  const fetchLesson = async () => {
    if (!topicId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', topicId)
        .eq('grade_level', 'AF7')
        .single();

      if (error) throw error;
      
      if (data) {
        setLesson(data);
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la leçon",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivitiesContent = async () => {
    if (!topicId) return;
    
    setIsLoadingActivities(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('activites_interactives')
        .eq('slug', topicId)
        .eq('grade_level', 'AF7')
        .single();

      if (error) throw error;
      
      if (data?.activites_interactives) {
        setActivitiesContent(data.activites_interactives);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const loadPersonalNotes = async () => {
    if (!topicId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id')
        .eq('slug', topicId)
        .eq('grade_level', 'AF7')
        .single();

      if (!lessonData) return;

      const { data, error } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonData.id)
        .single();

      if (data && !error) {
        setPersonalNotes(data.notes || "");
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    if (!lesson) return;
    
    setIsSavingNotes(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour sauvegarder vos notes",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          notes: personalNotes
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      toast({
        title: "Notes sauvegardées",
        description: "Vos notes personnelles ont été enregistrées",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive"
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Leçon introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen lesson-bg">
      {/* Fixed Header */}
      <div className="lesson-topbar fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/math-course')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white font-semibold text-lg hidden sm:block truncate">
              {lesson.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DownloadLessonButton 
              lessonData={lesson}
              personalNotes={personalNotes}
              subjectName="Mathématiques"
            />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Lesson Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Mathématiques
                </span>
                <span className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm">
                  AF7
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="introduction" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Introduction</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Contenu</span>
            </TabsTrigger>
            <TabsTrigger value="activites" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Activités</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <StickyNote className="w-4 h-4" />
              <span className="hidden sm:inline">Mes Notes</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz Final</span>
            </TabsTrigger>
          </TabsList>

          {/* Introduction Tab */}
          <TabsContent value="introduction" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Objectif de la leçon
                  <TextToSpeechButton text={lesson.objectif} sectionName="objectif" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{lesson.objectif}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Introduction
                  <TextToSpeechButton text={lesson.introduction} sectionName="introduction" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.introduction }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contenu Tab */}
          <TabsContent value="contenu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Contenu de la leçon
                  <TextToSpeechButton text={lesson.contenu} sectionName="contenu" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.contenu }}
                />
              </CardContent>
            </Card>

            {lesson.exemples_exercices && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Exemples et Exercices
                    <TextToSpeechButton text={lesson.exemples_exercices} sectionName="exemples" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Activités Tab */}
          <TabsContent value="activites">
            {activitiesContent ? (
              <InteractiveActivitiesEnhanced 
                content={activitiesContent} 
                isLoading={isLoadingActivities}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aucune activité interactive disponible pour cette leçon.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-primary" />
                  Mes Notes Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Écris tes notes ici..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[300px]"
                />
                <Button 
                  onClick={savePersonalNotes} 
                  disabled={isSavingNotes}
                  className="w-full"
                >
                  {isSavingNotes ? "Sauvegarde..." : "Sauvegarder mes notes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quiz Tab */}
          <TabsContent value="quiz">
            {lesson.quiz_final ? (
              <InteractiveQuiz 
                content={lesson.quiz_final}
                isLoading={false}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Le quiz final sera bientôt disponible pour cette leçon.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Back to Course Button */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/math-course')}
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

export default MathLesson;

