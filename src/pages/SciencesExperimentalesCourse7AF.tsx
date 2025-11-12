import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, FlaskConical, BookOpen, Target, CheckCircle2, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import { toast } from "sonner";
import ericProfile from "@/assets/eric-new-profile.png";
import DOMPurify from "dompurify";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  mois: string | null;
  order_index: number;
  is_published: boolean;
}

export default function SciencesExpérimentalesCourse7AF() {
  console.log("🔍 SciencesExpérimentalesCourse7AF component mounting...");
  
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [userGold, setUserGold] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      console.log("Fetching Sciences Expérimentales 7AF lessons...");
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Load user gold
        const { data: profileData } = await supabase
          .from('profiles')
          .select('gold_earned')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileData) {
          setUserGold(profileData.gold_earned || 0);
        }

        // Load completed lessons
        const { data: completionsData } = await supabase
          .from('lesson_completions')
          .select('lesson_slug')
          .eq('user_id', user.id)
          .eq('subject', 'sciences-experimentales');

        if (completionsData) {
          setCompletedLessons(completionsData.map(c => c.lesson_slug));
        }
      }

      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("slug", "sciences-experimentales-7af")
        .eq("grade_level", "7AF")
        .maybeSingle();

      if (subjectError) {
        console.error("Subject error:", subjectError);
        toast.error("Erreur de chargement de la matière");
        setLoading(false);
        return;
      }

      if (!subjectData) {
        console.error("No subject found for sciences-experimentales-7af");
        toast.error("Matière non trouvée - veuillez contacter l'administrateur");
        setLoading(false);
        return;
      }

      console.log("Subject found:", subjectData.id);

      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, title, slug, objectif, mois, order_index, is_published")
        .eq("subject_id", subjectData.id)
        .order("order_index", { ascending: true });

      if (lessonsError) {
        console.error("Lessons error:", lessonsError);
        throw lessonsError;
      }

      console.log(`Found ${lessonsData?.length || 0} lessons`);
      setLessons(lessonsData || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Erreur lors du chargement des leçons");
    } finally {
      setLoading(false);
    }
  };

  const groupedByMonth = lessons.reduce((acc, lesson) => {
    const month = lesson.mois || "Non classé";
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  const monthOrder = [
    "Septembre",
    "Octobre", 
    "Novembre",
    "Décembre",
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin"
  ];

  const monthColors: Record<string, string> = {
    "Septembre": "from-amber-500 to-amber-600",
    "Octobre": "from-orange-500 to-orange-600",
    "Novembre": "from-brown-500 to-brown-600",
    "Décembre": "from-blue-500 to-blue-600",
    "Janvier": "from-purple-500 to-purple-600",
    "Février": "from-pink-500 to-pink-600",
    "Mars": "from-green-500 to-green-600",
    "Avril": "from-lime-500 to-lime-600",
    "Mai": "from-teal-500 to-teal-600",
    "Juin": "from-emerald-500 to-emerald-600"
  };

  const completedCount = completedLessons.length;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  console.log("🎨 Rendering with:", { totalLessons, completedCount, loading });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-purple-600 to-purple-700 text-primary-foreground shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/matieres')}
                className="shrink-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Sciences Expérimentales</h1>
                  <p className="text-sm text-primary-foreground/80">7ème Année Fondamentale</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
                <Coins className="w-5 h-5 text-primary-foreground" />
                <span className="font-bold text-primary-foreground">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Course Overview */}
        <Card className="mb-8 overflow-hidden border border-border bg-card">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-purple-600 to-purple-700 p-8 flex items-center justify-center">
              <img src={ericProfile} alt="Eric enseignant" className="w-full h-auto object-contain rounded-lg" />
            </div>
            <CardContent className="md:w-2/3 p-6">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Aperçu du Cours</h2>
              <p className="text-muted-foreground mb-4">
                Bienvenue dans le cours de Sciences Expérimentales pour la 7ème année fondamentale ! 
                Découvrez le vivant, la terre, l'environnement et les sciences naturelles à travers 
                des leçons interactives et des expériences fascinantes.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{totalLessons} leçons complètes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Expériences et activités interactives</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{completedCount} leçons complétées</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <MusicSelector />

        {/* Lessons Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Chargement des leçons...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.includes(lesson.slug);
                const goldReward = 100 + (index * 10);
                
                return (
                  <Card 
                    key={lesson.id} 
                    className={`transition-all duration-300 hover:shadow-xl border border-border bg-card ${
                      isCompleted ? 'border-2 border-green-500' : 'hover:scale-105'
                    }`}
                  >
                    <CardHeader className="bg-muted/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-primary-foreground font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <CardTitle className="text-lg text-foreground">{lesson.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{lesson.mois || 'Non classé'}</p>
                          </div>
                        </div>
                        {isCompleted && (
                          <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div 
                          className="text-sm text-muted-foreground line-clamp-2"
                          dangerouslySetInnerHTML={{ 
                            __html: DOMPurify.sanitize(lesson.objectif, { 
                              ALLOWED_TAGS: [], 
                              ALLOWED_ATTR: [] 
                            }) 
                          }}
                        />
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <BookOpen className="w-3 h-3 mr-1" />
                            Leçon
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Target className="w-3 h-3 mr-1" />
                            Expériences
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Quiz
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex items-center gap-1 text-accent">
                            <Coins className="w-4 h-4" />
                            <span className="font-bold">{goldReward}</span>
                          </div>
                          <Button 
                            onClick={() => {
                              if (lesson.is_published) {
                                navigate(`/sciences-experimentales-7af/${lesson.slug}`);
                              } else {
                                toast.info("Cette leçon sera bientôt disponible");
                              }
                            }}
                            disabled={!lesson.is_published}
                          >
                            {isCompleted ? 'Revoir' : lesson.is_published ? 'Commencer' : 'Bientôt'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Progress Summary */}
            <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-primary-foreground border-0">
              <CardHeader>
                <CardTitle className="text-2xl">Ton Progrès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Leçons complétées</span>
                      <span className="font-bold">{completedCount}/{totalLessons}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 bg-primary-foreground/30" />
                  </div>
                  <p className="text-sm opacity-90">
                    Continue comme ça ! Chaque leçon complétée te rapproche de la maîtrise des sciences expérimentales.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}