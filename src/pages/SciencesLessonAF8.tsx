import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Target, Lightbulb, FileText, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InteractiveQuiz } from "@/components/InteractiveQuiz";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ericChairDesk from "@/assets/eric-chair-desk.png";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string | null;
  introduction: string | null;
  contenu: string | null;
  exemples_exercices: string | null;
  youtube_url: string | null;
  references: string[] | null;
  order_index: number;
  subject_id: string;
  grade_level: string;
}

const SciencesLessonAF8 = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (topicId) {
      fetchLesson();
      fetchAllLessons();
    }
  }, [topicId]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', topicId)
        .eq('grade_level', 'AF8')
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Erreur",
          description: "Leçon non trouvée",
          variant: "destructive",
        });
        navigate('/sciences-af8-course');
        return;
      }

      setLesson(data);
      
      // Load saved notes
      const { data: savedNotes } = await supabase
        .from('lesson_notes')
        .select('notes')
        .eq('lesson_id', data.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (savedNotes) {
        setNotes(savedNotes.notes || "");
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

  const fetchAllLessons = async () => {
    try {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'sciences-experimentales-8af')
        .eq('grade_level', 'AF8')
        .maybeSingle();

      if (!subject) return;

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subject.id)
        .eq('grade_level', 'AF8')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setAllLessons(data || []);
    } catch (error) {
      console.error('Error fetching all lessons:', error);
    }
  };

  const saveNotes = async () => {
    if (!lesson) return;

    try {
      const user = (await supabase.auth.getUser()).data.user;
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
          lesson_id: lesson.id,
          user_id: user.id,
          notes: notes,
        });

      if (error) throw error;

      toast({
        title: "Notes sauvegardées",
        description: "Vos notes ont été enregistrées avec succès",
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

  const navigateToLesson = (direction: 'prev' | 'next') => {
    if (!lesson || allLessons.length === 0) return;

    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < allLessons.length) {
      const targetLesson = allLessons[targetIndex];
      navigate(`/sciences-af8-lesson/${targetLesson.slug}`);
    }
  };

  const currentLessonIndex = allLessons.findIndex(l => lesson && l.id === lesson.id);
  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < allLessons.length - 1;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lesson) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/sciences-af8-course")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au cours
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Lesson Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
            <div className="hidden md:block flex-shrink-0">
              <img 
                src={ericChairDesk} 
                alt="Eric enseignant" 
                className="w-24 md:w-32 h-24 md:h-32 object-contain"
              />
            </div>
            <div className="flex-1 text-center md:text-left w-full">
              <Badge variant="secondary" className="mb-3">
                Leçon {lesson.order_index}
              </Badge>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{lesson.title}</h1>
              {lesson.objectif && (
                <div className="flex flex-col md:flex-row items-start gap-2 bg-white/10 rounded-lg p-4 backdrop-blur">
                  <Target className="h-5 w-5 flex-shrink-0 mt-0.5 mx-auto md:mx-0" />
                  <div className="text-center md:text-left">
                    <p className="font-semibold mb-1">Objectif de la leçon</p>
                    <p className="text-white/90">{lesson.objectif}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <Tabs defaultValue="introduction" className="w-full">
            <div className="border-b">
              <TabsList className="w-full h-auto rounded-none bg-transparent p-0 grid grid-cols-5">
                <TabsTrigger 
                  value="introduction" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
                >
                  <BookOpen className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Introduction</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="contenu"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
                >
                  <Lightbulb className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Contenu</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="exemples"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Exemples</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
                >
                  <FileText className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Mes Notes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="quiz"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent flex items-center justify-center"
                >
                  <CheckCircle2 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Quiz Final</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <CardContent className="p-6">
              <TabsContent value="introduction" className="mt-0">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {lesson.introduction ? (
                    <div dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
                  ) : (
                    <p className="text-muted-foreground">Introduction à venir...</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contenu" className="mt-0">
                <div className="space-y-6">
                  {lesson.youtube_url && (
                    <YouTubeVideoSection
                      lessonTitle={lesson.title}
                      objectives={lesson.objectif || ""}
                      gradeLevel="AF8"
                      customYoutubeUrl={lesson.youtube_url}
                      subject="sciences"
                    />
                  )}
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    {lesson.contenu ? (
                      <div dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
                    ) : (
                      <p className="text-muted-foreground">Contenu à venir...</p>
                    )}
                  </div>
                  {lesson.references && lesson.references.length > 0 && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-2">Références</h3>
                      <ul className="space-y-1">
                        {lesson.references.map((ref, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            {ref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="exemples" className="mt-0">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {lesson.exemples_exercices ? (
                    <div dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
                  ) : (
                    <p className="text-muted-foreground">Exemples et exercices à venir...</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Mes notes personnelles</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Prenez des notes pendant votre apprentissage. Elles seront sauvegardées automatiquement.
                    </p>
                  </div>
                  <Textarea
                    placeholder="Écrivez vos notes ici..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[300px]"
                  />
                  <Button onClick={saveNotes}>
                    Sauvegarder mes notes
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="quiz" className="mt-0">
                <InteractiveQuiz
                  content=""
                  isLoading={false}
                  lessonGoldReward={50}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => navigateToLesson('prev')}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Leçon précédente
          </Button>
          <Button
            onClick={() => navigateToLesson('next')}
            disabled={!hasNext}
          >
            Leçon suivante
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SciencesLessonAF8;