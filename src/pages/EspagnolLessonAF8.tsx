import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, BookOpen, Target, FileText, Lightbulb } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ericChairDesk from "@/assets/eric-chair-desk.png";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  youtube_url?: string;
}

const EspagnolLessonAF8 = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [personalNotes, setPersonalNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (topicId) {
      fetchLesson();
      loadPersonalNotes();
    }
  }, [topicId]);

  const fetchLesson = async () => {
    try {
      const { data: subject } = await supabase
        .from('subjects')
        .select('id')
        .eq('slug', 'espagnol-8af')
        .eq('grade_level', 'AF8')
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
        .eq('grade_level', 'AF8')
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
          youtube_url: data.youtube_url
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
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header with Eric */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {lesson.title}
              </h1>
              {lesson.objectif && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border-l-4 border-purple-500">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Objectif</h3>
                    <div 
                      className="text-sm text-purple-800 dark:text-purple-200 prose dark:prose-invert max-w-none prose-sm"
                      dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Eric mascot - smaller on mobile */}
            <div className="flex-shrink-0">
              <img 
                src={ericChairDesk} 
                alt="Eric enseignant" 
                className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="introduction" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Introduction</span>
            </TabsTrigger>
            <TabsTrigger value="contenu" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Contenu</span>
            </TabsTrigger>
            <TabsTrigger value="exemples" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Exemples</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Mes Notes</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="introduction" className="mt-6">
            <Card className="p-6">
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.introduction }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="contenu" className="mt-6">
            <Card className="p-6">
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.contenu }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="exemples" className="mt-6">
            <Card className="p-6">
              <div 
                className="prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
              />
            </Card>
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
            <InteractiveActivitiesEnhanced
              content={`Leçon: ${lesson.title}`}
              isLoading={false}
              onRegenerate={() => {}}
              onGoldUpdate={() => {}}
            />
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
      </div>
    </div>
  );
};

export default EspagnolLessonAF8;
