import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, CheckCircle2, Coins, ArrowLeft } from "lucide-react";
import { francaisLessons7AF } from "@/data/francaisLessons";
import { supabase } from "@/integrations/supabase/client";
import ericChairDesk from "@/assets/eric-chair-desk.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import DOMPurify from "dompurify";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  mois: string;
  order_index: number;
}

const FrancaisCourse = () => {
  const navigate = useNavigate();
  const [userGold, setUserGold] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Load user gold
        const { data: profileData } = await supabase
          .from('profiles')
          .select('gold_earned')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setUserGold(profileData.gold_earned || 0);
        }

        // Load completed lessons
        const { data: completionsData } = await supabase
          .from('lesson_completions')
          .select('lesson_slug')
          .eq('user_id', user.id)
          .eq('subject', 'francais');

        if (completionsData) {
          setCompletedLessons(completionsData.map(c => c.lesson_slug));
        }

        // Try to load lessons from database
        const { data: subjectData } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', 'francais')
          .eq('grade_level', '7AF')
          .maybeSingle();

        if (subjectData) {
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('id, title, slug, objectif, mois, order_index')
            .eq('subject_id', subjectData.id)
            .eq('is_published', true)
            .order('order_index');

          if (lessonsData && lessonsData.length > 0) {
            setLessons(lessonsData);
          } else {
            // Fallback to static data
            setLessons(francaisLessons7AF.map((lesson, index) => ({
              id: lesson.id,
              title: lesson.title,
              slug: lesson.id,
              objectif: lesson.objectif,
              mois: lesson.mois,
              order_index: index
            })));
          }
        } else {
          // Fallback to static data
          setLessons(francaisLessons7AF.map((lesson, index) => ({
            id: lesson.id,
            title: lesson.title,
            slug: lesson.id,
            objectif: lesson.objectif,
            mois: lesson.mois,
            order_index: index
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to static data on error
        setLessons(francaisLessons7AF.map((lesson, index) => ({
          id: lesson.id,
          title: lesson.title,
          slug: lesson.id,
          objectif: lesson.objectif,
          mois: lesson.mois,
          order_index: index
        })));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const completedCount = completedLessons.length;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-rose-600 to-pink-600 text-primary-foreground shadow-sm sticky top-0 z-50">
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
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Français</h1>
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
            <div className="md:w-1/3 bg-gradient-to-br from-rose-600 to-pink-600 p-8 flex items-center justify-center">
              <img src={ericChairDesk} alt="Eric enseignant" className="w-full h-auto object-contain rounded-lg" />
            </div>
            <CardContent className="md:w-2/3 p-6">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Aperçu du Cours</h2>
              <p className="text-muted-foreground mb-4">
                Bienvenue dans le cours de Français pour la 7ème année fondamentale ! 
                Ce cours couvre tous les aspects essentiels de la langue française : 
                compréhension orale et écrite, grammaire, conjugaison, et expression.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{totalLessons} leçons complètes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Activités interactives et quiz</span>
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">{lesson.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{lesson.mois}</p>
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
                        Activités
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
                        onClick={() => navigate(`/francais-lesson/${lesson.slug}`)}
                      >
                        {isCompleted ? 'Revoir' : 'Commencer'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card className="bg-gradient-to-r from-rose-600 to-pink-600 text-primary-foreground border-0">
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
                Continue comme ça ! Chaque leçon complétée te rapproche de la maîtrise du français.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FrancaisCourse;
