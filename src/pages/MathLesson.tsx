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
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { EricChatbot } from "@/components/EricChatbot";
import DOMPurify from "dompurify";

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
    setActiveTab("introduction");
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
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', topicId)
        .eq('grade_level', '7AF')
        .maybeSingle();

      if (data) {
        setLesson(data);
      } else {
        // Fallback to static data if not in database
        const mathLessons = await import('@/data/mathLessons');
        const staticLesson = mathLessons.mathLessons7AF[topicId];
        
        if (staticLesson) {
          // Get proper title from topicId
          const titleMap: Record<string, string> = {
            "ensembles": "Ensembles",
            "plans-droites": "Plans et Droites",
            "nombres-naturels": "Nombres Naturels",
            "numeration-binaire": "Numération Binaire",
            "polygones": "Les Polygones",
            "unites-mesures": "Unités de Mesures",
            "divisibilite": "Divisibilité",
            "decimaux": "Décimaux",
            "cercle-disque": "Cercle et Disque",
            "triangles": "Les Triangles",
            "aires-perimetres": "Aires et Périmètres",
            "proportionnalite": "Proportionnalité",
            "entiers-relatifs": "Entiers Relatifs",
            "volumes-solides": "Volumes de Solides",
            "fractions": "Les Fractions",
            "parallelogrammes": "Les Parallélogrammes",
            "reperage-quadrillage": "Repérage sur Quadrillage",
            "transformations": "Les Transformations",
            "statistiques": "Statistiques Élémentaires"
          };
          
          // Convert static lesson format to Lesson interface
          setLesson({
            id: topicId,
            title: titleMap[topicId] || topicId.charAt(0).toUpperCase() + topicId.slice(1),
            objectif: staticLesson.objectif,
            introduction: staticLesson.introduction,
            contenu: staticLesson.contenu,
            exemples_exercices: staticLesson.exemplesExercices || "",
            activites_interactives: "",
            quiz_final: "",
            youtube_url: ""
          });
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
      // Try static data as final fallback
      try {
        const mathLessons = await import('@/data/mathLessons');
        const staticLesson = mathLessons.mathLessons7AF[topicId];
        
        if (staticLesson) {
          const titleMap: Record<string, string> = {
            "ensembles": "Ensembles",
            "plans-droites": "Plans et Droites",
            "nombres-naturels": "Nombres Naturels",
            "numeration-binaire": "Numération Binaire",
            "polygones": "Les Polygones",
            "unites-mesures": "Unités de Mesures",
            "divisibilite": "Divisibilité",
            "decimaux": "Décimaux",
            "cercle-disque": "Cercle et Disque",
            "triangles": "Les Triangles",
            "aires-perimetres": "Aires et Périmètres",
            "proportionnalite": "Proportionnalité",
            "entiers-relatifs": "Entiers Relatifs",
            "volumes-solides": "Volumes de Solides",
            "fractions": "Les Fractions",
            "parallelogrammes": "Les Parallélogrammes",
            "reperage-quadrillage": "Repérage sur Quadrillage",
            "transformations": "Les Transformations",
            "statistiques": "Statistiques Élémentaires"
          };
          
          setLesson({
            id: topicId,
            title: titleMap[topicId] || topicId.charAt(0).toUpperCase() + topicId.slice(1),
            objectif: staticLesson.objectif,
            introduction: staticLesson.introduction,
            contenu: staticLesson.contenu,
            exemples_exercices: staticLesson.exemplesExercices || "",
            activites_interactives: "",
            quiz_final: "",
            youtube_url: ""
          });
        }
      } catch (fallbackError) {
        console.error('Error loading static lesson:', fallbackError);
        toast({
          title: "Erreur",
          description: "Impossible de charger la leçon",
          variant: "destructive"
        });
      }
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
        .eq('grade_level', '7AF')
        .maybeSingle();

      if (data?.activites_interactives) {
        setActivitiesContent(data.activites_interactives);
      }
      // If no activities in database, leave empty (will show "no activities available" message)
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

      // For static lessons, use the slug as the lesson_id
      const { data, error } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', topicId)
        .maybeSingle();

      if (data && !error) {
        setPersonalNotes(data.notes || "");
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    if (!topicId) return;
    
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

      // Use topicId as lesson_id for static lessons
      const { error } = await supabase
        .from('lesson_notes')
        .upsert({
          user_id: user.id,
          lesson_id: topicId,
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
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <div className="lesson-topbar fixed top-0 left-0 right-0 z-50 bg-primary">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => navigate('/math-course')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-primary-foreground font-semibold text-lg hidden sm:block truncate">
              {lesson.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DownloadLessonButton 
              lessonData={lesson}
              personalNotes={personalNotes}
              subjectName="Mathématiques"
              variant="ghost"
              className="text-primary-foreground hover:bg-primary-foreground/20 border border-primary-foreground/20"
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
              <h1 className="text-3xl font-bold mb-2 text-foreground">{lesson.title}</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Mathématiques
                </span>
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
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
            <Card className="border-border bg-card">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5 text-primary" />
                  Objectif de la leçon
                  <TextToSpeechButton text={lesson.objectif} sectionName="objectif" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div 
                  className="prose dark:prose-invert max-w-none lesson-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.objectif) }}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Introduction
                  <TextToSpeechButton text={lesson.introduction} sectionName="introduction" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div 
                  className="prose dark:prose-invert max-w-none lesson-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.introduction) }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contenu Tab */}
          <TabsContent value="contenu" className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Contenu de la leçon
                  <TextToSpeechButton text={lesson.contenu} sectionName="contenu" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div 
                  className="prose dark:prose-invert max-w-none lesson-content"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.contenu) }}
                />
              </CardContent>
            </Card>

            {lesson.exemples_exercices && (
              <Card className="border-border bg-card">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Exemples et Exercices
                    <TextToSpeechButton text={lesson.exemples_exercices} sectionName="exemples" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div 
                    className="prose dark:prose-invert max-w-none lesson-content"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.exemples_exercices) }}
                  />
                </CardContent>
              </Card>
            )}

            <YouTubeVideoSection
              lessonTitle={lesson.title}
              objectives={lesson.objectif}
              gradeLevel="7AF"
              customYoutubeUrl={lesson.youtube_url}
              subject="Mathématiques"
            />
          </TabsContent>

          {/* Activités Tab */}
          <TabsContent value="activites">
            {activitiesContent ? (
              <InteractiveActivitiesEnhanced 
                content={activitiesContent} 
                isLoading={isLoadingActivities}
              />
            ) : (
              <Card className="border-border bg-card">
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
            <Card className="border-border bg-card">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <StickyNote className="w-5 h-5 text-primary" />
                  Mes Notes Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <Textarea
                  placeholder="Écris tes notes ici..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[300px] bg-background text-foreground border-input"
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
              <Card className="border-border bg-card">
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

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
};

export default MathLesson;

