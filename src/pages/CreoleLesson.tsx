import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Clock,
  CheckCircle2,
  Users,
  Lightbulb,
  NotebookPen,
  Save,
  Trophy
} from "lucide-react";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { EricChatbot } from "@/components/EricChatbot";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  activites_interactives: string;
  quiz_final: string;
  youtube_url?: string;
}

export default function CreoleLesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (topicId) {
      fetchLesson();
      loadPersonalNotes();
    }
  }, [topicId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', topicId)
        .eq('grade_level', '7AF')
        .single();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast({
        title: "Erè",
        description: "Pa t kapab chaje leson an",
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
      setIsSavingNotes(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erè",
          description: "Ou dwe konekte pou anrejistre nòt ou yo",
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
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      toast({
        title: "Nòt yo anrejistre!",
        description: "Nòt pèsonèl ou yo byen anrejistre.",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erè",
        description: "Pa t kapab anrejistre nòt yo",
        variant: "destructive",
      });
    } finally {
      setIsSavingNotes(false);
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
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Leson pa jwenn</h2>
          <Button onClick={() => navigate("/creole-course")}>
            Retounen nan kou a
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/creole-course")}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retounen nan kou a</span>
          </Button>
          <div className="flex items-center gap-2">
            <DownloadLessonButton
              lessonData={lesson}
              personalNotes={personalNotes}
              subjectName="Créole AF7"
              variant="outline"
              size="sm"
            />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Lesson Header */}
          <Card className="p-8 mb-8">
            <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full mb-6" />
            
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="secondary" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Kreyòl Ayisyen
              </Badge>
              <Badge variant="outline">7AF</Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4 hyphens-auto">{lesson.title}</h1>
          </Card>

          {/* Lesson Content with Tabs */}
          <Card className="p-8 mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="introduction" className="gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Entwodiksyon</span>
                </TabsTrigger>
                <TabsTrigger value="contenu" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Kontni</span>
                </TabsTrigger>
                <TabsTrigger value="activites" className="gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Aktivite</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2">
                  <NotebookPen className="w-4 h-4" />
                  <span className="hidden sm:inline">Nòt</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="introduction" className="space-y-6">
                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Objektif Leson an
                  </h3>
                  <div 
                    className="text-muted-foreground prose dark:prose-invert max-w-none prose-sm lesson-content"
                    dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                  />
                </div>
                <div className="prose prose-lg max-w-none dark:prose-invert lesson-content">
                  {lesson.introduction && (
                    <div dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contenu" className="space-y-6">
                <div className="prose prose-lg max-w-none dark:prose-invert lesson-content">
                  {lesson.contenu ? (
                    <div dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
                  ) : (
                    <p>Kontni ap vini byento...</p>
                  )}
                </div>

                <YouTubeVideoSection 
                  lessonTitle={lesson.title}
                  objectives={lesson.objectif || ''}
                  customYoutubeUrl={lesson.youtube_url}
                  subject="kreyol"
                  gradeLevel="7AF"
                />
                
                {lesson.exemples_exercices && (
                  <>
                    <div className="border-t my-8" />
                    <h3 className="text-2xl font-bold mb-4">Egzanp ak Egzèsis</h3>
                    <div className="prose prose-lg max-w-none dark:prose-invert lesson-content">
                      <div dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="activites" className="space-y-6">
                {lesson.activites_interactives ? (
                  <InteractiveActivitiesEnhanced
                    content={lesson.activites_interactives}
                    isLoading={false}
                    onRegenerate={() => fetchLesson()}
                    onGoldUpdate={() => {}}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-2xl font-bold mb-2">Aktivite Entèaktif</h3>
                    <p className="text-muted-foreground">
                      Aktivite yo ap disponib byento pou leson sa a
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <div className="bg-secondary/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <NotebookPen className="w-5 h-5" />
                    Nòt Pèsonèl Mwen
                  </h3>
                  <Textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Ekri nòt ou yo isit la..."
                    className="min-h-[300px] mb-4"
                  />
                  <Button 
                    onClick={savePersonalNotes}
                    disabled={isSavingNotes}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingNotes ? "Ap anrejistre..." : "Anrejistre Nòt yo"}
                  </Button>
                </div>
                <div className="bg-primary/5 p-6 rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Konsèy pou pran bon nòt:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Rezime pwen prensipal yo nan mo pa ou</li>
                    <li>• Ekri egzanp ki ede w konprann</li>
                    <li>• Make kesyon ou genyen pou w poze</li>
                    <li>• Konekte enfòmasyon yo ak sa w konnen deja</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="quiz" className="space-y-6">
                {lesson.quiz_final ? (
                  <HTMLQuizParser 
                    htmlContent={lesson.quiz_final}
                    lessonSlug={lesson.slug}
                    subject="kreyol"
                  />
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl font-bold mb-2">Quiz Final</h3>
                    <p className="text-muted-foreground mb-6">
                      Quiz la ap disponib byento pou leson sa a
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Completion Button */}
          <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Make leson sa a kòm konplete?</h3>
                <p className="text-sm text-muted-foreground">
                  Ou pral jwenn pwen pou tèrmine leson sa a
                </p>
              </div>
              <Button size="lg" className="gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Konplte leson an
              </Button>
            </div>
          </Card>

          {/* Navigation Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => navigate("/creole-course")}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Retounen nan kou a
            </Button>
          </div>
        </div>
      </div>

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
}
