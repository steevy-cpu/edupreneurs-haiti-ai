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
import { creoleLessons7AF } from "@/data/creoleLessons";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";

const categoryColors = {
  "Lekti": "from-pink-500 to-pink-600",
  "Kominikasyon Oral": "from-purple-500 to-purple-600",
  "Gramè": "from-blue-500 to-blue-600",
  "Vokabilè": "from-green-500 to-green-600",
  "Òtograf": "from-orange-500 to-orange-600",
  "Pwodiksyon Ekri": "from-red-500 to-red-600"
};

export default function CreoleLesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  
  const lessonId = parseInt(topicId || "1");
  const lesson = creoleLessons7AF.find(l => l.id === lessonId);
  const currentIndex = creoleLessons7AF.findIndex(l => l.id === lessonId);
  
  const previousLesson = currentIndex > 0 ? creoleLessons7AF[currentIndex - 1] : null;
  const nextLesson = currentIndex < creoleLessons7AF.length - 1 ? creoleLessons7AF[currentIndex + 1] : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPersonalNotes();
    fetchYoutubeUrl();
  }, [topicId]);

  const fetchYoutubeUrl = async () => {
    try {
      // @ts-ignore - Avoiding deep type instantiation error
      const { data, error } = await supabase
        .from('lessons')
        .select('youtube_url')
        .eq('subject_id', 'kreyol')
        .eq('lesson_number', lessonId.toString())
        .maybeSingle();

      if (error) throw error;
      if (data?.youtube_url) {
        setYoutubeUrl(data.youtube_url);
      }
    } catch (error) {
      console.error('Error fetching YouTube URL:', error);
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
        .eq('lesson_id', `kreyol-${lessonId}`)
        .maybeSingle();

      if (error) throw error;
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
          lesson_id: `kreyol-${lessonId}`,
          notes: personalNotes,
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

  const colorClass = categoryColors[lesson.category];

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
          <ThemeToggle />
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Lesson Header */}
          <Card className="p-8 mb-8">
            <div className={`h-2 bg-gradient-to-r ${colorClass} rounded-full mb-6`} />
            
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="secondary" className="gap-2">
                <Users className="w-4 h-4" />
                {lesson.category}
              </Badge>
              <Badge variant="outline">{lesson.difficulty}</Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-4 h-4" />
                {lesson.duration}
              </Badge>
            </div>

            <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>
            <p className="text-xl text-muted-foreground">{lesson.description}</p>
          </Card>

          {/* Lesson Content with Tabs */}
          <Card className="p-8 mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="introduction" className="gap-2">
                  <Lightbulb className="w-4 h-4" />
                  <span className="hidden sm:inline">Entwodiksyon</span>
                </TabsTrigger>
                <TabsTrigger value="contenu" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Kontni & Egzanp</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2">
                  <NotebookPen className="w-4 h-4" />
                  <span className="hidden sm:inline">Nòt Mwen</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Quiz Final</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="introduction" className="space-y-6">
                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    Objektif Leson an
                  </h3>
                  <div 
                    className="text-muted-foreground prose dark:prose-invert max-w-none prose-sm"
                    dangerouslySetInnerHTML={{ __html: lesson.objectif }}
                  />
                </div>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {lesson.introduction && (
                    <div dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contenu" className="space-y-6">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  {lesson.contenu && (
                    <div dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
                  )}
                </div>
                {youtubeUrl && (
                  <div className="mt-8">
                    <YouTubeVideoSection 
                      lessonTitle={lesson.title}
                      objectives={lesson.objectif || lesson.description}
                      customYoutubeUrl={youtubeUrl}
                      subject="kreyol"
                    />
                  </div>
                )}
                
                {lesson.exemplesExercices && (
                  <>
                    <div className="border-t my-8" />
                    <h3 className="text-2xl font-bold mb-4">Egzanp ak Egzèsis</h3>
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: lesson.exemplesExercices }} />
                    </div>
                  </>
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
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-2xl font-bold mb-2">Quiz Final</h3>
                  <p className="text-muted-foreground mb-6">
                    Quiz la ap disponib byento pou leson sa a
                  </p>
                </div>
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

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-between">
            {previousLesson ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/creole-lesson/${previousLesson.id}`)}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Leson anvan an
              </Button>
            ) : (
              <div />
            )}
            
            {nextLesson ? (
              <Button
                onClick={() => navigate(`/creole-lesson/${nextLesson.id}`)}
                className="gap-2 ml-auto"
              >
                Pwochen leson
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/creole-course")}
                className="gap-2 ml-auto"
              >
                Retounen nan kou a
                <BookOpen className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
